import { describe, expect, it } from 'vitest'
import {
  SHAKE,
  isShakeTriggered,
  pushShakeSample,
  resolveShake,
  shakeEnergy,
  triggerCooldownMs,
  type ShakeSample,
} from '../shake'
import type { AdInstance, AdTrigger } from '@/types/ad'

const SHAKY_TRIGGER: AdTrigger = { kind: 'shake', threshold: 1, cooldownMs: 1500 }

function makeAd(id: number, creativeId: string): AdInstance {
  return { id, creativeId, surface: 'popup', x: 0, y: 0, w: 50, h: 20, z: id, bornAt: 0 }
}

/** 只有 `shaky` 这条素材带摇一摇能力。 */
function resolveTrigger(creativeId: string): AdTrigger | undefined {
  return creativeId === 'shaky' ? SHAKY_TRIGGER : undefined
}

const NO_COOLDOWN: ReadonlyMap<number, number> = new Map()

describe('能量窗口', () => {
  it('丢掉窗口外的旧样本', () => {
    const samples: ShakeSample[] = [{ atMs: 0, energy: SHAKE.beatEnergy }]
    const kept = pushShakeSample(samples, { atMs: SHAKE.windowMs, energy: SHAKE.beatEnergy })

    expect(kept).toHaveLength(1)
    expect(kept[0]?.atMs).toBe(SHAKE.windowMs)
  })

  it('窗口内的样本全部保留', () => {
    let samples: ShakeSample[] = []
    for (let i = 0; i < 4; i++) {
      samples = pushShakeSample(samples, { atMs: i * 100, energy: SHAKE.beatEnergy })
    }

    expect(samples).toHaveLength(4)
    expect(shakeEnergy(samples)).toBeCloseTo(4 * SHAKE.beatEnergy, 6)
  })

  it('样本数量有上限，高频事件不会把数组撑大', () => {
    let samples: ShakeSample[] = []
    for (let i = 0; i < SHAKE.maxSamples * 3; i++) {
      samples = pushShakeSample(samples, { atMs: i * 5, energy: SHAKE.beatEnergy })
    }

    expect(samples).toHaveLength(SHAKE.maxSamples)
  })

  it('不修改传入的数组', () => {
    const original: ShakeSample[] = [{ atMs: 0, energy: 0.1 }]
    pushShakeSample(original, { atMs: 10, energy: 0.1 })

    expect(original).toHaveLength(1)
  })

  it('负能量按 0 计，脏输入不会把阈值抹平', () => {
    expect(shakeEnergy([{ atMs: 0, energy: -5 }])).toBe(0)
  })
})

describe('阈值判定', () => {
  it('恰好等于阈值就算触发', () => {
    expect(isShakeTriggered([{ atMs: 0, energy: 1 }], 1)).toBe(true)
  })

  it('差一点点就不算', () => {
    expect(isShakeTriggered([{ atMs: 0, energy: 0.99 }], 1)).toBe(false)
  })

  it('默认阈值要两拍才够', () => {
    const one = [{ atMs: 0, energy: SHAKE.beatEnergy }]
    const two = [...one, { atMs: 100, energy: SHAKE.beatEnergy }]

    expect(isShakeTriggered(one, 1)).toBe(false)
    expect(isShakeTriggered(two, 1)).toBe(true)
  })
})

describe('响应者判定', () => {
  const ads = [makeAd(1, 'quiet'), makeAd(2, 'shaky'), makeAd(3, 'shaky')]

  it('屏上没有带该能力的素材时返回 null——这是"绑定素材"的核心', () => {
    const quietOnly = [makeAd(1, 'quiet')]
    expect(resolveShake(quietOnly, resolveTrigger, [], NO_COOLDOWN, 0)).toBeNull()
  })

  it('能量不够时返回 null', () => {
    const samples = [{ atMs: 0, energy: SHAKE.beatEnergy }]
    expect(resolveShake(ads, resolveTrigger, samples, NO_COOLDOWN, 0)).toBeNull()
  })

  it('能量够了就返回那条素材的实例 id', () => {
    const samples = [{ atMs: 0, energy: 1 }]
    expect(resolveShake(ads, resolveTrigger, samples, NO_COOLDOWN, 0)).toBe(2)
  })

  it('冷却未过时跳过该实例', () => {
    const samples = [{ atMs: 0, energy: 1 }]
    const cooldowns = new Map([[2, 1500]])

    // 实例 2 在冷却里，但实例 3 同样带能力，于是由它来响应
    expect(resolveShake(ads, resolveTrigger, samples, cooldowns, 1000)).toBe(3)
  })

  it('全部实例都在冷却里时返回 null', () => {
    const samples = [{ atMs: 0, energy: 1 }]
    const cooldowns = new Map([
      [2, 1500],
      [3, 1500],
    ])

    expect(resolveShake(ads, resolveTrigger, samples, cooldowns, 1000)).toBeNull()
  })

  it('冷却刚好到点就重新可用', () => {
    const samples = [{ atMs: 0, energy: 1 }]
    const cooldowns = new Map([
      [2, 1500],
      [3, 1500],
    ])

    expect(resolveShake(ads, resolveTrigger, samples, cooldowns, 1500)).toBe(2)
  })
})

describe('触发配置', () => {
  it('冷却时长取自素材自身的配置', () => {
    expect(triggerCooldownMs(SHAKY_TRIGGER)).toBe(1500)
  })
})
