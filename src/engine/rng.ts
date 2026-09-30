/**
 * 确定性伪随机数发生器。
 *
 * 用固定种子而非 `Math.random()`，是为了让弹窗序列可复现：
 * 同一个种子必然产生同一场风暴，便于调试、单测与验收。
 */

/** mulberry32：小而快，分布够用。返回 [0, 1) 的浮点数。 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
