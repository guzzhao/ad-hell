import { describe, expect, it } from 'vite-plus/test'
import { LANDING_TARGETS, resolveLandingTarget } from '../landing'
import { CREATIVES } from '../creatives'

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

describe('落地页合规与逻辑映射', () => {
  it('落地页文案中不出现真实企业商标', () => {
    const textCorpus = Object.values(LANDING_TARGETS)
      .map((t) =>
        [
          t.brand,
          t.category,
          t.tagline,
          t.heroCard?.title,
          t.heroCard?.highlight,
          t.heroCard?.subtext,
          ...t.features.map((f) => `${f.title} ${f.desc}`),
        ].join(' '),
      )
      .join(' | ')

    const hits = REAL_BRANDS.filter((brand) => textCorpus.includes(brand))
    expect(hits).toEqual([])
  })

  it('网贷广告跳转至借贷类落地页，绝不跳转至拼一拼优选', () => {
    const loanTarget = resolveLandingTarget('loan-fast')
    expect(loanTarget.brand).toBe('速银花')
    expect(loanTarget.category).toBe('网贷')
    expect(loanTarget.heroCard?.highlight).toContain('200,000')

    const quotaTarget = resolveLandingTarget('loan-quota')
    expect(quotaTarget.brand).toBe('钱多多')
    expect(quotaTarget.category).toBe('网贷')
  })

  it('传奇游戏广告跳转至游戏新服微端落地页', () => {
    const gameTarget = resolveLandingTarget('game-legend')
    expect(gameTarget.brand).toBe('龙渊传奇')
    expect(gameTarget.category).toBe('传奇游戏')
    expect(gameTarget.heroCard?.highlight).toContain('一刀 9999 级')
  })

  it('老人健康广告跳转至免费申领血压仪落地页', () => {
    const healthTarget = resolveLandingTarget('health-bp')
    expect(healthTarget.brand).toBe('康寿堂')
    expect(healthTarget.heroCard?.title).toContain('血压仪')
    expect(healthTarget.heroCard?.highlight).toContain('0 元全国免费申领')
  })

  it('系统清理广告跳转至极速清理管家', () => {
    const cleanTarget = resolveLandingTarget('quick-clean')
    expect(cleanTarget.brand).toBe('极速清理管家')
    expect(cleanTarget.heroCard?.highlight).toContain('14.8GB')
  })

  it('同城交友广告跳转至近邻缘', () => {
    const datingTarget = resolveLandingTarget('dating-nearby')
    expect(datingTarget.brand).toBe('近邻缘')
    expect(datingTarget.category).toBe('同城交友')
  })

  it('减肥广告跳转至轻盈日记', () => {
    const slimTarget = resolveLandingTarget('slim-seven')
    expect(slimTarget.brand).toBe('轻盈日记')
    expect(slimTarget.category).toBe('减肥')
  })

  it('电商广告精准跳转至对应的特定电商平台', () => {
    const pyp = resolveLandingTarget('shop-99')
    expect(pyp.brand).toBe('拼一拼优选')

    const jd = resolveLandingTarget('shop-speed')
    expect(jd.brand).toBe('京选速达')

    const tdl = resolveLandingTarget('shop-factory')
    expect(tdl.brand).toBe('淘得乐工厂店')

    const wx = resolveLandingTarget('shop-luxury')
    expect(wx.brand).toBe('唯享名牌特卖')
  })

  it('所有内置 CREATIVES 均能解析出对应品类的落地页', () => {
    for (const creative of CREATIVES) {
      const target = resolveLandingTarget(creative)
      expect(target).toBeDefined()
      expect(target.brand).toBeTruthy()
      expect(target.heroCard).toBeDefined()
    }
  })
})
