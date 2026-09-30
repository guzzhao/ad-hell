import type { CloseOutcome, CloseVariant } from '@/types/ad'

/**
 * 虚假关闭键误触后追加的弹窗数量区间（闭区间）。
 * 误触必须付出代价，否则"假关闭键"只是个无痛的小玩笑。
 */
export const MISCLICK_EXTRA_ADS_MIN = 2
export const MISCLICK_EXTRA_ADS_MAX = 4

/**
 * 一次误触要付出多少弹窗的代价。
 *
 * @param roll [0, 1) 的随机数。越界值（负数 / NaN / ≥1）会被夹回合法区间，
 *             保证返回值恒在 `[MISCLICK_EXTRA_ADS_MIN, MISCLICK_EXTRA_ADS_MAX]` 内。
 */
export function misclickPenalty(roll: number): number {
  const span = MISCLICK_EXTRA_ADS_MAX - MISCLICK_EXTRA_ADS_MIN + 1
  const safeRoll = Number.isFinite(roll) ? Math.min(1 - Number.EPSILON, Math.max(0, roll)) : 0
  return MISCLICK_EXTRA_ADS_MIN + Math.min(span - 1, Math.floor(safeRoll * span))
}

/**
 * 判定一次关闭尝试的结果。
 *
 * @param variant 该弹窗的关闭键形态
 * @param hit     点击是否落在**有效关闭区**内。微型与角落变体的有效区很小，
 *                由组件按实际渲染尺寸判断后传入。
 * @param roll    [0, 1) 的随机数，仅用于决定误触惩罚的弹窗个数，保证函数仍是纯函数。
 *
 * 注意 `deceptive`：那个"关闭键"是假的，命中它也只会触发跳转。
 */
export function resolveClose(variant: CloseVariant, hit: boolean, roll: number): CloseOutcome {
  if (variant === 'none') return { kind: 'dodged' }
  if (!hit) return { kind: 'dodged' }
  if (variant === 'deceptive') {
    return { kind: 'misclick', extraAds: misclickPenalty(roll) }
  }
  return { kind: 'closed' }
}

/** 该形态是否**允许**被真正关闭。 */
export function isClosable(variant: CloseVariant): boolean {
  return variant !== 'none'
}
