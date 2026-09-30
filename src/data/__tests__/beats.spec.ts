import { describe, expect, it } from 'vitest'
import { BEATS } from '../beats'
import { findCreative } from '../creatives'

/**
 * 剧本节拍是**数据**，编译器管不到它的两条不变量，所以在这里守。
 */
describe('风暴剧本', () => {
  // dueBeats 用"已上演条数"当游标，遇到第一条未到点的节拍就停。
  // 一旦表是乱序的，排在后面的节拍会被前面的卡住，永远不上演——而且是静默的。
  it('按时间升序排列', () => {
    const times = BEATS.map((b) => b.atMs)
    const outOfOrder = times.filter((t, i) => i > 0 && t < (times[i - 1] ?? 0))

    expect(outOfOrder).toEqual([])
  })

  it('每条节拍都指向一条真实存在、且确实以接管形态出现的素材', () => {
    const broken = BEATS.filter((b) => findCreative(b.creativeId)?.surface !== 'takeover').map(
      (b) => b.creativeId,
    )

    expect(broken).toEqual([])
  })
})
