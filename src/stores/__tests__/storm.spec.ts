import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { DEFAULT_SEED, useStormStore } from '../storm'
import { STORM } from '@/engine/storm'
import { findCreative } from '@/data/creatives'
import { BEATS } from '@/data/beats'
import type { AdInstance, CloseVariant } from '@/types/ad'

type Store = ReturnType<typeof useStormStore>

/** 以 100ms 为步长推进，模拟主循环。 */
function advanceFor(store: Store, ms: number): void {
  const steps = Math.ceil(ms / 100)
  for (let i = 0; i < steps; i++) store.advance(100)
}

/** 推进到崩塌发生的那一刻。 */
function advanceUntilCollapsed(store: Store): void {
  let guard = 0
  while (store.phase === 'storm' && guard < 2000) {
    store.advance(100)
    guard++
  }
}

/**
 * 往 store 里塞一个指定素材的弹窗。
 *
 * 直接推入而不是等随机生成，是为了让"每种关闭变体各测一次"变成确定性的用例，
 * 不必依赖种子恰好抽到哪条素材。
 */
function seedAd(store: Store, creativeId: string): AdInstance {
  const ad: AdInstance = {
    id: 900000 + store.ads.length,
    creativeId,
    // 从素材取呈现面，而不是写死 'popup'——这样将来要塞一个接管实例进 store 也能用同一个帮手。
    surface: findCreative(creativeId)?.surface ?? 'popup',
    x: 0,
    y: 0,
    w: 50,
    h: 20,
    z: 100,
    bornAt: 0,
  }
  store.ads.push(ad)
  return ad
}

// 每条素材的关闭变体见 src/data/creatives.ts
const HONEST = 'loan-fast'
const TINY = 'loan-quota'
const CORNER = 'game-legend'
const DECEPTIVE = 'slim-seven'
const NONE = 'fake-call'

/** 引擎对每种关闭变体的预期结果。 */
const EXPECTED_KIND: Record<CloseVariant, string> = {
  honest: 'closed',
  tiny: 'closed',
  corner: 'closed',
  deceptive: 'misclick',
  none: 'dodged',
}

describe('风暴 store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始处于 boot，start 后进入 storm', () => {
    const store = useStormStore()
    expect(store.phase).toBe('boot')
    store.start()
    expect(store.phase).toBe('storm')
    expect(store.running).toBe(true)
  })

  it('随时间推进会真的生成弹窗', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, 6000)
    expect(store.spawnedCount).toBeGreaterThan(0)
    expect(store.ads.length).toBeGreaterThan(0)
    expect(store.elapsedMs).toBeGreaterThanOrEqual(6000)
  })

  it('目标并发数随时间增长，弹窗越来越多', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, 8000)
    const early = store.spawnedCount
    advanceFor(store, 30000)
    expect(store.spawnedCount).toBeGreaterThan(early)
  })

  it('到点必然收场：不会永远停在 storm（兜底保证）', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, STORM.durationMs + 2000)
    expect(store.phase).not.toBe('storm')
  })

  it('进入 collapsed 后会自行切到 truth', () => {
    const store = useStormStore()
    store.start()
    advanceUntilCollapsed(store)
    expect(store.phase).toBe('collapsed')

    // 崩塌演出期间不应立刻跳走
    store.advance(STORM.collapseSettleMs - 500)
    expect(store.phase).toBe('collapsed')

    // 演出结束后自动进入真相环节
    store.advance(1000)
    expect(store.phase).toBe('truth')
  })

  it('崩塌发生在合理的时间窗口内：既不是秒崩，也不会拖到超时', () => {
    const store = useStormStore()
    store.start()
    advanceUntilCollapsed(store)

    // 太快崩塌 = 用户还没体会到"越关越多"；拖到 durationMs = 覆盖判定没起作用
    expect(store.elapsedMs).toBeGreaterThan(15_000)
    expect(store.elapsedMs).toBeLessThanOrEqual(STORM.durationMs)
  })

  it('测试夹具的关闭变体与预期表一致（防止素材漂移）', () => {
    expect(findCreative(HONEST)?.closeVariant).toBe('honest')
    expect(findCreative(TINY)?.closeVariant).toBe('tiny')
    expect(findCreative(CORNER)?.closeVariant).toBe('corner')
    expect(findCreative(DECEPTIVE)?.closeVariant).toBe('deceptive')
    expect(findCreative(NONE)?.closeVariant).toBe('none')
  })

  it('正常关闭键命中即真的关掉', () => {
    const store = useStormStore()
    store.start()
    const ad = seedAd(store, HONEST)
    const before = store.ads.length

    const outcome = store.attemptClose(ad.id, true)

    expect(outcome.kind).toBe('closed')
    expect(store.ads.length).toBe(before - 1)
    expect(store.closedCount).toBe(1)
  })

  it('微型与角落关闭键：命中同样能关掉（难在命中，不难在判定）', () => {
    const store = useStormStore()
    store.start()
    const targets = [TINY, CORNER].map((id) => seedAd(store, id))
    const before = store.ads.length

    const kinds = targets.map((ad) => store.attemptClose(ad.id, true).kind)

    expect(kinds).toEqual(['closed', 'closed'])
    expect(store.ads.length).toBe(before - 2)
    expect(store.closedCount).toBe(2)
  })

  it('虚假关闭键命中不是关闭，而是跳转加罚', () => {
    const store = useStormStore()
    store.start()
    const ad = seedAd(store, DECEPTIVE)
    const before = store.ads.length

    const outcome = store.attemptClose(ad.id, true)

    expect(outcome.kind).toBe('misclick')
    expect(store.landingOpen).toBe(true)
    expect(store.misclickCount).toBe(1)
    expect(store.ads.length).toBeGreaterThan(before)
    expect(store.closedCount).toBe(0)
  })

  it('无关闭键的弹窗：点了也没有任何效果', () => {
    const store = useStormStore()
    store.start()
    const ad = seedAd(store, NONE)
    const before = store.ads.length

    const outcome = store.attemptClose(ad.id, true)

    expect(outcome.kind).toBe('dodged')
    expect(store.ads.length).toBe(before)
    expect(store.closedCount).toBe(0)
  })

  it('真实生成的弹窗，关闭结果与素材声明的变体一致', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, 6000)

    const snapshot = [...store.ads]
    expect(snapshot.length).toBeGreaterThan(0)

    for (const ad of snapshot) {
      const variant = findCreative(ad.creativeId)?.closeVariant ?? 'honest'
      const outcome = store.attemptClose(ad.id, true)
      expect(outcome.kind).toBe(EXPECTED_KIND[variant])
    }
  })

  it('对不存在的弹窗 id 调用 attemptClose 不会抛错', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, 3000)
    expect(() => store.attemptClose(999999, true)).not.toThrow()
    expect(store.attemptClose(999999, true).kind).toBe('dodged')
  })

  it('误触弹窗主体会打开假落地页并追加弹窗', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, 6000)

    const before = store.ads.length
    store.tapAdBody()

    expect(store.landingOpen).toBe(true)
    expect(store.misclickCount).toBe(1)
    expect(store.ads.length).toBeGreaterThan(before)
  })

  it('closeLanding 会关掉假落地页', () => {
    const store = useStormStore()
    store.start()
    store.tapAdBody()
    expect(store.landingOpen).toBe(true)
    store.closeLanding()
    expect(store.landingOpen).toBe(false)
  })

  it('enterTruth 直接从 storm 跳到 truth', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, 2000)
    store.enterTruth()
    expect(store.phase).toBe('truth')
  })

  it('restart 会清空计数、弹窗与计时', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, 20000)
    expect(store.spawnedCount).toBeGreaterThan(0)

    store.restart()

    expect(store.phase).toBe('storm')
    expect(store.spawnedCount).toBe(0)
    expect(store.closedCount).toBe(0)
    expect(store.misclickCount).toBe(0)
    expect(store.ads.length).toBe(0)
    expect(store.elapsedMs).toBe(0)
  })

  it('同一颗种子产生完全相同的风暴序列（可复现）', () => {
    const first = useStormStore()
    first.start(DEFAULT_SEED)
    const sequenceA: string[] = []
    for (let i = 0; i < 200; i++) {
      first.advance(100)
      sequenceA.push(
        first.ads.map((a) => `${a.creativeId}@${a.x.toFixed(3)},${a.y.toFixed(3)}`).join('|'),
      )
    }

    // 换一个全新的 pinia，重新跑同一个种子
    setActivePinia(createPinia())
    const second = useStormStore()
    second.start(DEFAULT_SEED)
    const sequenceB: string[] = []
    for (let i = 0; i < 200; i++) {
      second.advance(100)
      sequenceB.push(
        second.ads.map((a) => `${a.creativeId}@${a.x.toFixed(3)},${a.y.toFixed(3)}`).join('|'),
      )
    }

    expect(sequenceA).toEqual(sequenceB)
  })
})

describe('全屏接管广告（剧本节拍）', () => {
  const firstBeat = BEATS[0]

  it('到点上演，且素材正是节拍表指定的那一条', () => {
    const store = useStormStore()
    store.start()
    expect(store.ads.some((a) => a.surface === 'takeover')).toBe(false)

    advanceFor(store, firstBeat?.atMs ?? 0)

    const takeovers = store.ads.filter((a) => a.surface === 'takeover')
    expect(takeovers).toHaveLength(1)
    expect(takeovers[0]?.creativeId).toBe(firstBeat?.creativeId)
  })

  it('到点自动挂断，不会把用户永久困住', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, (firstBeat?.atMs ?? 0) + STORM.takeoverMaxMs - 100)
    // 差 100ms 还没到点，应该还在
    expect(store.ads.some((a) => a.surface === 'takeover')).toBe(true)

    advanceFor(store, 100)
    expect(store.ads.some((a) => a.surface === 'takeover')).toBe(false)
  })

  it('自动挂断不算作用户关闭', () => {
    const store = useStormStore()
    store.start()
    advanceFor(store, (firstBeat?.atMs ?? 0) + STORM.takeoverMaxMs)

    expect(store.closedCount).toBe(0)
  })

  // 这条测的是"接管广告不占弹窗名额"。改动前 advance 用的是 ads.length，
  // 那个长度里包含接管实例，于是它会顶掉一个弹窗名额——洪水被稀释。
  it('接管实例不占用弹窗的数量目标', () => {
    const store = useStormStore()
    store.start()
    // 塞一个接管实例进去，让它从头就在场（bornAt 为 0，不会中途超龄）
    seedAd(store, 'call-loan-service')
    expect(store.ads.some((a) => a.surface === 'takeover')).toBe(true)

    advanceFor(store, 6000)

    // 6 秒时 targetConcurrent 仍是 2；弹窗应当被补满 2 个，接管实例不算在内
    expect(store.popupCount).toBe(store.target)
  })

  it('接管广告不计入覆盖率，也不会顶起崩塌判定', () => {
    const store = useStormStore()
    store.start()
    seedAd(store, 'call-loan-service')

    expect(store.coverage).toBe(0)
  })
})
