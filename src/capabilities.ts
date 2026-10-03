/**
 * 浏览器能力探测。
 *
 * 写成"接受注入 env 的纯函数"，每个分支都能直接单测，不必去伪造全局对象——
 * 而伪造 `DeviceMotionEvent` 这类全局对象恰恰是最容易把测试写成自欺欺人的地方。
 */

export interface CapabilityEnv {
  /** 这个环境有没有 `DeviceMotionEvent`。 */
  hasDeviceMotion: boolean
  /** 有 `DeviceMotionEvent`，但它的 `requestPermission` 存在——即必须显式授权（iOS 13+）。 */
  needsMotionPermission: boolean
  hasAudioContext: boolean
  /** 传感器与音频都要求安全上下文（https / localhost）。 */
  isSecureContext: boolean
}

export interface Capabilities {
  /** 真实传感器可用，不需要再要权限。 */
  motionReady: boolean
  /** 需要用户点一下「允许访问运动与方向」才能用真实传感器。 */
  motionNeedsPermission: boolean
  /** 完全拿不到真实传感器：桌面、老浏览器，或非安全上下文。 */
  motionUnavailable: boolean
  /** 是否走指针降级 —— 只要真实传感器不可用就该走。 */
  usePointerFallback: boolean
  hasAudio: boolean
}

export function detectCapabilities(env: CapabilityEnv): Capabilities {
  // 非安全上下文下浏览器根本不会投递 devicemotion，等同于没有这个 API
  const apiUsable = env.hasDeviceMotion && env.isSecureContext
  const motionReady = apiUsable && !env.needsMotionPermission

  return {
    motionReady,
    motionNeedsPermission: apiUsable && env.needsMotionPermission,
    motionUnavailable: !apiUsable,
    usePointerFallback: !motionReady,
    hasAudio: env.hasAudioContext,
  }
}

/** iOS 13+ 的授权入口。TS 的 lib.dom 里还没有它，所以自己描述一份。 */
interface MotionPermissionApi {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

function getMotionPermissionApi(): MotionPermissionApi | undefined {
  const dme: unknown = globalThis.DeviceMotionEvent
  if (
    (typeof dme === 'function' || typeof dme === 'object') &&
    dme !== null &&
    'requestPermission' in dme
  ) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return dme as MotionPermissionApi
  }
  return undefined
}

/** 从真实浏览器读一份 env。这是本模块唯一碰全局对象的地方。 */
export function readCapabilityEnv(): CapabilityEnv {
  const hasDeviceMotion = typeof globalThis.DeviceMotionEvent === 'function'
  const api = getMotionPermissionApi()

  return {
    hasDeviceMotion,
    needsMotionPermission: hasDeviceMotion && typeof api?.requestPermission === 'function',
    hasAudioContext: typeof globalThis.AudioContext === 'function',
    isSecureContext: globalThis.isSecureContext,
  }
}

/** 在用户手势里请求传感器授权。环境不支持或用户拒绝都返回 false，绝不抛错。 */
export async function requestMotionPermission(): Promise<boolean> {
  const api = getMotionPermissionApi()
  const request = api?.requestPermission
  if (typeof request !== 'function' || !api) return false

  try {
    return (await request.call(api)) === 'granted'
  } catch {
    // 不在用户手势里调用、或用户直接关掉弹窗，都会走到这里
    return false
  }
}
