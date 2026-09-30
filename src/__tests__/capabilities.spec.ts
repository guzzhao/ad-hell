import { describe, expect, it } from 'vitest'
import { detectCapabilities, type CapabilityEnv } from '../capabilities'

/**
 * 能力探测写成"接受注入 env 的纯函数"，就是为了能在这里把每个分支都走一遍，
 * 而不必去伪造 `DeviceMotionEvent` 这种全局对象——那才是最容易写成自欺欺人的地方。
 */
function env(overrides: Partial<CapabilityEnv> = {}): CapabilityEnv {
  return {
    hasDeviceMotion: false,
    needsMotionPermission: false,
    hasAudioContext: false,
    isSecureContext: true,
    ...overrides,
  }
}

describe('传感器能力', () => {
  it('有 API、不需授权 → 真实传感器直接可用，不走指针降级', () => {
    const caps = detectCapabilities(env({ hasDeviceMotion: true }))

    expect(caps.motionReady).toBe(true)
    expect(caps.motionNeedsPermission).toBe(false)
    expect(caps.motionUnavailable).toBe(false)
    expect(caps.usePointerFallback).toBe(false)
  })

  it('有 API 但要授权（iOS 13+）→ 先要权限，同时立刻就有指针降级可用', () => {
    const caps = detectCapabilities(env({ hasDeviceMotion: true, needsMotionPermission: true }))

    expect(caps.motionReady).toBe(false)
    expect(caps.motionNeedsPermission).toBe(true)
    expect(caps.motionUnavailable).toBe(false)
    // 关键：等用户点授权的那段时间里，功能不能是死的
    expect(caps.usePointerFallback).toBe(true)
  })

  it('没有 API（桌面）→ 完全拿不到传感器，只能走指针降级', () => {
    const caps = detectCapabilities(env())

    expect(caps.motionReady).toBe(false)
    expect(caps.motionNeedsPermission).toBe(false)
    expect(caps.motionUnavailable).toBe(true)
    expect(caps.usePointerFallback).toBe(true)
  })

  it('非安全上下文下等同于没有传感器——浏览器根本不会投递事件', () => {
    const caps = detectCapabilities(env({ hasDeviceMotion: true, isSecureContext: false }))

    expect(caps.motionReady).toBe(false)
    expect(caps.motionNeedsPermission).toBe(false)
    expect(caps.motionUnavailable).toBe(true)
    expect(caps.usePointerFallback).toBe(true)
  })
})

describe('音频能力', () => {
  it('如实反映有没有 AudioContext', () => {
    expect(detectCapabilities(env({ hasAudioContext: true })).hasAudio).toBe(true)
    expect(detectCapabilities(env()).hasAudio).toBe(false)
  })

  it('音频能力不影响摇一摇的判定', () => {
    const withAudio = detectCapabilities(env({ hasDeviceMotion: true, hasAudioContext: true }))
    const without = detectCapabilities(env({ hasDeviceMotion: true }))

    expect(withAudio.motionReady).toBe(without.motionReady)
  })
})
