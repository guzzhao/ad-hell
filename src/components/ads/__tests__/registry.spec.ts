import { describe, expect, it } from 'vitest'
import { CREATIVES } from '@/data/creatives'
import { findMedia } from '@/data/media'
import { SURFACES, SURFACE_ORDER } from '@/components/ads/surfaces'

/**
 * 注册表契约测试。
 *
 * 刻意**不**测"LAYOUTS 是否覆盖全部 AdLayout"或"SURFACES 是否覆盖全部 AdSurface"——
 * 那两件事由 `Record<AdLayout, Component>` 的穷尽性在编译期保证，
 * 再用运行期测试写一遍只是自我安慰。
 *
 * 这里测的是编译器管不到的那些：字符串键（媒体清单）、数组（挂载顺序）、
 * 以及数据自身的不变量（id 唯一、接管素材必须真的是全屏）。
 */
describe('媒体清单', () => {
  it('每条素材引用的媒体都能解析到', () => {
    const unresolved = CREATIVES.filter(
      (c) => c.mediaId !== undefined && findMedia(c.mediaId) === undefined,
    ).map((c) => c.id)

    expect(unresolved).toEqual([])
  })

  // 刻意**不**断言"清单里没有无人引用的条目"。
  // 那个不变量听起来严谨，实际上是个反扩展的约束：它逼着人"加素材"和"加媒体"必须同时发生，
  // 于是没法先把将来几条来电广告共用的一段铃声登记进清单。
  // 而且它抓不住真正的错误——媒体 id 写错由上面那条测试负责。
})

describe('呈现面注册表', () => {
  it('挂载顺序覆盖注册表的全部键，且没有多余的项', () => {
    const registered = Object.keys(SURFACES)

    // 用 Set 比较而不是排序后比数组：既不受插入顺序影响，也避开 no-array-sort。
    expect(new Set(SURFACE_ORDER)).toEqual(new Set(registered))
    expect(SURFACE_ORDER).toHaveLength(registered.length)
  })
})

describe('素材数据不变量', () => {
  it('id 唯一', () => {
    const ids = CREATIVES.map((c) => c.id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)

    expect(duplicates).toEqual([])
  })

  it('接管素材必须是真正的全屏 —— 否则「全屏接管」名不副实', () => {
    const wrongSize = CREATIVES.filter(
      (c) => c.surface === 'takeover' && (c.size.w !== 100 || c.size.h !== 100),
    ).map((c) => c.id)

    expect(wrongSize).toEqual([])
  })
})
