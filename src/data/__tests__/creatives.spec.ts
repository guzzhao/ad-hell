import { describe, expect, it } from 'vitest'
import { CREATIVES, findCreative } from '../creatives'
import { APPS, appsByCategory } from '../apps'

/**
 * 真实企业名 / 商标黑名单。
 * 只要它们出现在素材文案里，就说明有人不小心把真实品牌写进了虚构素材。
 */
const REAL_BRANDS = [
  '淘宝',
  '天猫',
  '京东',
  '拼多多',
  '抖音',
  '快手',
  '微信',
  '腾讯',
  '阿里',
  '支付宝',
  '百度',
  '字节',
  '美团',
  '大众点评',
  '滴滴',
  '小米',
  '华为',
  '荣耀',
  '苹果',
  'OPPO',
  'vivo',
  '三星',
  '爱奇艺',
  '优酷',
  '芒果',
  '哔哩哔哩',
  'bilibili',
  '陌陌',
  '探探',
  '网易',
  '新浪',
  '微博',
  '金山',
  '360',
  '携程',
  '去哪儿',
  '饿了么',
  '唯品会',
  '苏宁',
]

describe('广告素材合规', () => {
  it('不出现任何真实企业名或商标', () => {
    const haystack = CREATIVES.map((c) =>
      [c.brand, c.headline, c.subline, c.cta, c.category].join(' '),
    ).join(' | ')

    const hits = REAL_BRANDS.filter((brand) => haystack.includes(brand))
    expect(hits).toEqual([])
  })

  it('每条素材的 id 唯一', () => {
    const ids = CREATIVES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每条素材的尺寸都能放进手机视口', () => {
    for (const c of CREATIVES) {
      expect(c.size.w).toBeGreaterThan(0)
      expect(c.size.h).toBeGreaterThan(0)
      expect(c.size.w).toBeLessThanOrEqual(100)
      expect(c.size.h).toBeLessThanOrEqual(100)
    }
  })

  it('minProgress 取值合法', () => {
    for (const c of CREATIVES) {
      const p = c.minProgress ?? 0
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
  })

  it('findCreative 对未知 id 返回 undefined 而不是抛错', () => {
    expect(findCreative('does-not-exist')).toBeUndefined()
  })
})

describe('反转对照的两个分区', () => {
  it('A 类（现实中无广告）有 6 个系统功能', () => {
    const system = appsByCategory('system')
    expect(system.length).toBe(6)
    // 用 Set 而不是排序后比较：这里断言的是"就是这几个 id"，与顺序无关。
    // 顺带避开 Array#sort 的原地修改，以及 toSorted 需要 es2023 lib 的问题。
    expect(new Set(system.map((a) => a.id))).toEqual(
      new Set(['alarm', 'calculator', 'camera', 'dialer', 'messages', 'settings']),
    )
  })

  it('B 类（现实中广告泛滥）至少 2 个，且每个都带点题说明', () => {
    const commercial = appsByCategory('commercial')
    expect(commercial.length).toBeGreaterThanOrEqual(2)
    for (const app of commercial) {
      expect(app.note).toBeTruthy()
      expect(app.note).toContain('一个广告都没有')
    }
  })

  it('A 类 App 不带"干净"说明——它们是被广告攻陷的那一类', () => {
    for (const app of appsByCategory('system')) {
      expect(app.note).toBeUndefined()
    }
  })

  it('App id 唯一', () => {
    const ids = APPS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
