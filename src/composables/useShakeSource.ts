import { computed, ref, type ComputedRef } from 'vue'
import { useEventListener } from '@vueuse/core'
import {
  detectCapabilities,
  readCapabilityEnv,
  requestMotionPermission,
  type Capabilities,
} from '@/capabilities'
import { FULL_SHAKE_ENERGY, SHAKE } from '@/engine/shake'
import { useStormStore } from '@/stores/storm'

/** 指针降级：判定为一次甩动所需的最小横向位移（px）。更小的是手抖与触控板噪声。 */
const MIN_POINTER_STEP_PX = 12

/** 标准重力（m/s²）。 */
const GRAVITY = 9.81

/** 加速度偏离重力多少才算一次甩动节拍（m/s²）。 */
const MOTION_BEAT_DEVIATION = 4

export interface ShakeSource {
  capabilities: Capabilities
  /** 是否该显示「允许访问运动与方向」。授权成功后收起来。 */
  needsPermission: ComputedRef<boolean>
  /** 在用户手势里请求传感器授权。 */
  requestMotionPermission: () => void
  /** 兜底入口：一次按压 = 一次完整摇动。 */
  simulate: () => void
}

/**
 * 摇一摇的采集层。
 *
 * 职责边界很清楚：这里只把三种采集源（真机传感器 / 指针甩动 / 兜底按钮）
 * **归一化成同一个能量量纲**，然后交给 store；判定、防抖、冷却全在引擎与 store 里。
 *
 * 这样"阈值、窗口、一次摇动只算一次"这些最容易出错的规则可以脱离真机单测，
 * 剩下真正需要真机核对的只有"采集得准不准"这一层。
 */
export function useShakeSource(): ShakeSource {
  const storm = useStormStore()
  const capabilities = detectCapabilities(readCapabilityEnv())

  const granted = ref(false)
  const needsPermission = computed(() => capabilities.motionNeedsPermission && !granted.value)
  /** 真实传感器是否正在工作。没有它就得靠指针降级。 */
  const motionActive = computed(() => capabilities.motionReady || granted.value)

  // ── 指针降级 ──────────────────────────────────────────
  let lastPointerX: number | null = null
  let lastPointerDirection = 0

  function onPointerMove(event: PointerEvent): void {
    // 真实传感器可用时指针不算数：否则在手机上滑动页面就会被当成摇一摇
    if (motionActive.value) return

    if (lastPointerX === null) {
      lastPointerX = event.clientX
      return
    }

    const step = event.clientX - lastPointerX
    lastPointerX = event.clientX
    if (Math.abs(step) < MIN_POINTER_STEP_PX) return

    const direction = Math.sign(step)
    // 只有**方向反转**才算一次甩动。一直朝一个方向拖过去，那不是摇。
    if (lastPointerDirection !== 0 && direction !== lastPointerDirection) {
      storm.handleShake(SHAKE.beatEnergy)
    }
    lastPointerDirection = direction
  }

  // ── 真机传感器 ────────────────────────────────────────
  let aboveMotionBar = false

  function onDeviceMotion(event: DeviceMotionEvent): void {
    if (!motionActive.value) return

    const acceleration = event.accelerationIncludingGravity
    const magnitude = Math.hypot(acceleration?.x ?? 0, acceleration?.y ?? 0, acceleration?.z ?? 0)
    const above = Math.abs(magnitude - GRAVITY) >= MOTION_BEAT_DEVIATION

    // 只数"从静止抬起来"的那一次。否则一次甩动里的几十个事件会瞬间把阈值冲爆，
    // 到时候轻轻碰一下手机就会跳转。
    if (above && !aboveMotionBar) storm.handleShake(SHAKE.beatEnergy)
    aboveMotionBar = above
  }

  useEventListener(window, 'pointermove', onPointerMove)
  useEventListener(window, 'devicemotion', onDeviceMotion)

  function requestPermission(): void {
    // 必须在用户手势里调用，否则 iOS 会直接拒绝
    requestMotionPermission().then(
      (ok) => {
        granted.value = ok
      },
      () => {
        granted.value = false
      },
    )
  }

  function simulate(): void {
    // 一次按压 = 一次完整摇动。用 FULL_SHAKE_ENERGY 而不是单次节拍能量，
    // 保证跨过任何素材的阈值（creatives.spec.ts 有一条测试守着这个关系）。
    // 冷却照常生效——"一次摇动只算一次"对按钮同样成立。
    storm.handleShake(FULL_SHAKE_ENERGY)
  }

  return { capabilities, needsPermission, requestMotionPermission: requestPermission, simulate }
}
