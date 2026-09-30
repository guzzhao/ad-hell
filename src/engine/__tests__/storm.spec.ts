import { describe, expect, it } from 'vitest'
import {
  HUMAN_CLOSE_CLICKS_PER_SEC,
  STORM,
  coverageEstimate,
  eligibleCreatives,
  isCollapsed,
  pickCreative,
  samplePosition,
  spawnInterval,
  spawnRatePerSec,
  stormProgress,
  targetConcurrent,
} from '../storm'
import { mulberry32 } from '../rng'
import type { AdInstance } from '@/types/ad'
import { CREATIVES } from '@/data/creatives'

function makeAd(x: number, y: number, w: number, h: number, id = 1): AdInstance {
  return { id, creativeId: 'test', x, y, w, h, z: id, bornAt: 0 }
}

describe('风暴曲线', () => {
  it('生成间隔单调不增', () => {
    let prev = Number.POSITIVE_INFINITY
    for (let t = 0; t <= STORM.durationMs; t += 250) {
      const current = spawnInterval(t)
      expect(current).toBeLessThanOrEqual(prev)
      prev = current
    }
  })

  it('目标并发数单调不减', () => {
    let prev = 0
    for (let t = 0; t <= STORM.durationMs; t += 250) {
      const current = targetConcurrent(t)
      expect(current).toBeGreaterThanOrEqual(prev)
      prev = current
    }
  })

  it('终局生成速度超过人类极限点击速度', () => {
    // 这是"关不完"的核心保证：手再快也追不上生成速度
    expect(spawnRatePerSec(STORM.durationMs)).toBeGreaterThan(HUMAN_CLOSE_CLICKS_PER_SEC)
  })

  it('终局目标并发数足以覆盖屏幕', () => {
    expect(targetConcurrent(STORM.durationMs)).toBe(STORM.concurrentEnd)
    expect(STORM.concurrentEnd).toBeGreaterThanOrEqual(STORM.collapseMinAds)
  })

  it('进度被夹在 0..1 之间', () => {
    expect(stormProgress(-5000)).toBe(0)
    expect(stormProgress(0)).toBe(0)
    expect(stormProgress(STORM.durationMs * 2)).toBe(1)
  })
})

describe('覆盖面积估算', () => {
  it('空数组为 0', () => {
    expect(coverageEstimate([])).toBe(0)
  })

  it('单个全屏弹窗覆盖整屏', () => {
    expect(coverageEstimate([makeAd(0, 0, 100, 100)])).toBeCloseTo(1, 5)
  })

  it('重叠区域不被重复计算', () => {
    const one = coverageEstimate([makeAd(0, 0, 50, 50, 1)])
    const twoSame = coverageEstimate([makeAd(0, 0, 50, 50, 1), makeAd(0, 0, 50, 50, 2)])
    // 面积求和会得到 2 倍，网格法必须与单个完全相同
    expect(twoSame).toBeCloseTo(one, 5)
  })

  it('结果落在 0..1 之间', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 40; i++) {
      const ads = Array.from({ length: 20 }, (_, k) =>
        makeAd(rng() * 100, rng() * 100, 20, 20, k),
      )
      const c = coverageEstimate(ads)
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(1)
    }
  })
})

describe('崩塌判定', () => {
  it('弹窗太少时不崩塌，即使已被全屏覆盖', () => {
    const ads = Array.from({ length: STORM.collapseMinAds - 1 }, (_, i) =>
      makeAd(0, 0, 100, 100, i),
    )
    expect(coverageEstimate(ads)).toBeGreaterThanOrEqual(STORM.collapseCoverage)
    expect(isCollapsed(ads)).toBe(false)
  })

  it('数量够但覆盖不够时不崩塌', () => {
    const ads = Array.from({ length: STORM.collapseMinAds + 20 }, (_, i) =>
      makeAd(0, 0, 4, 4, i),
    )
    expect(isCollapsed(ads)).toBe(false)
  })

  it('覆盖够且数量够时崩塌', () => {
    const ads = Array.from({ length: STORM.collapseMinAds }, (_, i) =>
      makeAd(0, 0, 100, 100, i),
    )
    expect(isCollapsed(ads)).toBe(true)
  })
})

describe('位置采样', () => {
  it('任何进度与尺寸下都完全落在视口内', () => {
    const rng = mulberry32(99)
    const sizes = [
      { w: 100, h: 11 },
      { w: 82, h: 33 },
      { w: 70, h: 19 },
      { w: 100, h: 100 },
    ]
    for (const size of sizes) {
      for (let i = 0; i <= 20; i++) {
        const { x, y } = samplePosition(i / 20, size, rng)
        expect(x).toBeGreaterThanOrEqual(0)
        expect(y).toBeGreaterThanOrEqual(0)
        // 浮点误差容差
        expect(x).toBeLessThanOrEqual(100 - size.w + 1e-9)
        expect(y).toBeLessThanOrEqual(100 - size.h + 1e-9)
      }
    }
  })

  it('全屏尺寸下位置只能是原点', () => {
    const rng = mulberry32(3)
    for (let i = 0; i < 10; i++) {
      expect(samplePosition(0.5, { w: 100, h: 100 }, rng)).toEqual({ x: 0, y: 0 })
    }
  })
})

describe('素材抽取', () => {
  it('开场不会抽到全屏素材', () => {
    const rng = mulberry32(11)
    for (let i = 0; i < 200; i++) {
      const c = pickCreative(CREATIVES, 0, rng)
      expect(c).toBeDefined()
      expect(c?.size.h).toBeLessThan(100)
    }
  })

  it('终局能抽到全屏素材', () => {
    const pool = eligibleCreatives(CREATIVES, 1)
    expect(pool.some((c) => c.size.h === 100)).toBe(true)
  })

  it('素材池为空时返回 undefined 而不是抛错', () => {
    expect(pickCreative([], 0.5, mulberry32(1))).toBeUndefined()
  })

  it('五种关闭变体在素材库里都至少出现两次', () => {
    const counts = new Map<string, number>()
    for (const c of CREATIVES) {
      counts.set(c.closeVariant, (counts.get(c.closeVariant) ?? 0) + 1)
    }
    for (const variant of ['honest', 'tiny', 'corner', 'deceptive', 'none']) {
      expect(counts.get(variant) ?? 0).toBeGreaterThanOrEqual(2)
    }
  })
})
