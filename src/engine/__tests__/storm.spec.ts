import { describe, expect, it } from 'vite-plus/test'
import {
  HUMAN_CLOSE_CLICKS_PER_SEC,
  STORM,
  coverageEstimate,
  dueBeats,
  eligibleCreatives,
  isCollapsed,
  isTakeoverExpired,
  pickCreative,
  samplePosition,
  spawnInterval,
  spawnRatePerSec,
  stormProgress,
  targetConcurrent,
} from '../storm'
import { mulberry32 } from '../rng'
import type { AdInstance, AdSurface, StormBeat } from '@/types/ad'
import { CREATIVES } from '@/data/creatives'

function makeAd(
  x: number,
  y: number,
  w: number,
  h: number,
  id = 1,
  surface: AdSurface = 'popup',
): AdInstance {
  return { id, creativeId: 'test', surface, x, y, w, h, z: id, bornAt: 0 }
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
      const ads = Array.from({ length: 20 }, (_, k) => makeAd(rng() * 100, rng() * 100, 20, 20, k))
      const c = coverageEstimate(ads)
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(1)
    }
  })

  it('接管实例完全不参与覆盖率', () => {
    const takeover = makeAd(0, 0, 100, 100, 1, 'takeover')
    expect(coverageEstimate([takeover])).toBe(0)
  })

  it('弹窗与接管混在一起时，只算弹窗那部分', () => {
    const popups = [makeAd(0, 0, 50, 50, 1), makeAd(50, 50, 50, 50, 2)]
    const takeover = makeAd(0, 0, 100, 100, 3, 'takeover')

    expect(coverageEstimate([...popups, takeover])).toBeCloseTo(coverageEstimate(popups), 5)
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
    const ads = Array.from({ length: STORM.collapseMinAds + 20 }, (_, i) => makeAd(0, 0, 4, 4, i))
    expect(isCollapsed(ads)).toBe(false)
  })

  it('覆盖够且数量够时崩塌', () => {
    const ads = Array.from({ length: STORM.collapseMinAds }, (_, i) => makeAd(0, 0, 100, 100, i))
    expect(isCollapsed(ads)).toBe(true)
  })

  // 这条是 B1 改动的护栏：在 coverageEstimate 排除 takeover 之前，它会失败。
  // 一个全屏接管实例贡献 100% 覆盖率，足以让"弹窗数够了"的瞬间被误判为崩塌。
  it('全屏接管实例不能代替洪水把屏幕判定为崩塌', () => {
    const popups = Array.from({ length: STORM.collapseMinAds + 10 }, (_, i) =>
      makeAd(0, 0, 4, 4, i),
    )
    const takeover = makeAd(0, 0, 100, 100, 999, 'takeover')

    expect(isCollapsed([...popups, takeover])).toBe(false)
  })

  // 上一条测试里弹窗本来就够多，所以漏掉这一条就漏掉了一半的 bug：
  // collapseMinAds 的**数量**条件同样必须排除接管实例，否则守卫照样被绕开。
  //
  // 这里必须让弹窗本身就够覆盖：否则 coverageEstimate 自己的过滤会把测试救回来，
  // 这条测试就变成了空跑（第一次写的时候正是踩了这个坑）。
  it('接管实例也不算进崩塌所需的弹窗数量', () => {
    const popups = Array.from({ length: STORM.collapseMinAds - 1 }, (_, i) =>
      makeAd(0, 0, 100, 100, i),
    )
    const takeover = makeAd(0, 0, 100, 100, 999, 'takeover')

    expect(coverageEstimate(popups)).toBeGreaterThanOrEqual(STORM.collapseCoverage)
    expect(isCollapsed([...popups, takeover])).toBe(false)
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

  // 接管广告只走剧本节拍，不参与随机抽签。混进池子里的后果很隐蔽：
  // 它会被当成普通弹窗撒在屏幕上，还会顶掉真正的节拍（spawnTakeover 会让位）。
  it('抽签池里不会出现接管素材', () => {
    const pool = eligibleCreatives(CREATIVES, 1)

    expect(pool.length).toBeGreaterThan(0)
    expect(pool.some((c) => c.surface === 'takeover')).toBe(false)
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

describe('剧本节拍调度', () => {
  const beats: StormBeat[] = [
    { atMs: 1000, creativeId: 'a' },
    { atMs: 2000, creativeId: 'b' },
  ]

  it('未到点不返回任何节拍', () => {
    expect(dueBeats(beats, 0, 999)).toEqual([])
  })

  it('刚好到点即返回', () => {
    expect(dueBeats(beats, 0, 1000)).toHaveLength(1)
  })

  it('已经上演过的不会重演', () => {
    expect(dueBeats(beats, 1, 1000)).toEqual([])
  })

  // 这条是"用条数当游标"而不是"用上次时刻"的理由：
  // 一帧跨过多个节拍时（切标签页回来、卡顿），中间那些必须一条都不漏。
  it('一帧跨过多个节拍时全部返回，不漏掉中间那些', () => {
    expect(dueBeats(beats, 0, 5000)).toHaveLength(2)
  })

  it('全部上演过后不再返回', () => {
    expect(dueBeats(beats, beats.length, 999_999)).toEqual([])
  })
})

describe('接管实例超龄', () => {
  it('弹窗永远不会超龄——它本来就该待在屏幕上等人来关', () => {
    const popup = makeAd(0, 0, 50, 50, 1, 'popup')
    expect(isTakeoverExpired(popup, STORM.takeoverMaxMs)).toBe(false)
    expect(isTakeoverExpired(popup, 999_999)).toBe(false)
  })

  it('接管实例到点超龄，差 1ms 都不算', () => {
    const takeover = makeAd(0, 0, 100, 100, 1, 'takeover')
    expect(isTakeoverExpired(takeover, STORM.takeoverMaxMs - 1)).toBe(false)
    expect(isTakeoverExpired(takeover, STORM.takeoverMaxMs)).toBe(true)
  })

  it('超龄是相对出生时刻算的，不是相对风暴开始时刻', () => {
    const late: AdInstance = { ...makeAd(0, 0, 100, 100, 1, 'takeover'), bornAt: 9000 }
    // 风暴走到 15s 时，这个 9s 才出生的接管只活了 6s，不该超龄
    expect(isTakeoverExpired(late, 15_000)).toBe(false)
    expect(isTakeoverExpired(late, 9000 + STORM.takeoverMaxMs)).toBe(true)
  })
})
