import { describe, expect, it } from 'vitest'
import { MISCLICK_EXTRA_ADS_MAX, MISCLICK_EXTRA_ADS_MIN, isClosable, resolveClose } from '../close'
import type { CloseOutcome, CloseVariant } from '@/types/ad'

/**
 * 取出误触惩罚值，顺便断言这确实是一次误触。
 *
 * 用抛错而不是 `if (kind === 'misclick') { expect(...) }`，是因为条件式 expect
 * 在分支不成立时会静默跳过，测试就变成了永远通过。这里让类型错误直接失败。
 */
function extraAdsOf(outcome: CloseOutcome): number {
  if (outcome.kind !== 'misclick') {
    throw new Error(`预期 misclick，实际是 ${outcome.kind}`)
  }
  return outcome.extraAds
}

describe('关闭判定', () => {
  it('正常关闭键命中即关闭', () => {
    expect(resolveClose('honest', true, 0)).toEqual({ kind: 'closed' })
  })

  it('正常关闭键点空则无事发生', () => {
    expect(resolveClose('honest', false, 0)).toEqual({ kind: 'dodged' })
  })

  it('微型与角落变体：只有真正命中才算关闭', () => {
    for (const variant of ['tiny', 'corner'] as const) {
      expect(resolveClose(variant, true, 0)).toEqual({ kind: 'closed' })
      expect(resolveClose(variant, false, 0)).toEqual({ kind: 'dodged' })
    }
  })

  it('虚假关闭键命中反而触发跳转', () => {
    const outcome = resolveClose('deceptive', true, 0)
    expect(outcome.kind).toBe('misclick')
  })

  it('虚假关闭键点空则无事发生', () => {
    expect(resolveClose('deceptive', false, 0)).toEqual({ kind: 'dodged' })
  })

  it('无关闭键：无论怎么点都关不掉', () => {
    expect(resolveClose('none', true, 0)).toEqual({ kind: 'dodged' })
    expect(resolveClose('none', false, 0.99)).toEqual({ kind: 'dodged' })
  })

  it('误触惩罚的弹窗个数始终落在声明区间内', () => {
    // roll 覆盖 [0,1) 全域，含上边界附近的极值
    const extras = [0, 0.25, 0.5, 0.75, 0.999999].map((roll) =>
      extraAdsOf(resolveClose('deceptive', true, roll)),
    )
    expect(extras).toHaveLength(5)
    for (const extra of extras) {
      expect(extra).toBeGreaterThanOrEqual(MISCLICK_EXTRA_ADS_MIN)
      expect(extra).toBeLessThanOrEqual(MISCLICK_EXTRA_ADS_MAX)
    }
  })

  it('roll 越界时不会抛出，仍落在区间内', () => {
    const extras = [-1, 1, 5, Number.NaN].map((roll) =>
      extraAdsOf(resolveClose('deceptive', true, roll)),
    )
    expect(extras).toHaveLength(4)
    for (const extra of extras) {
      expect(extra).toBeGreaterThanOrEqual(MISCLICK_EXTRA_ADS_MIN)
      expect(extra).toBeLessThanOrEqual(MISCLICK_EXTRA_ADS_MAX)
    }
  })

  it('只有 none 变体不可关闭', () => {
    const variants: CloseVariant[] = ['honest', 'tiny', 'corner', 'deceptive', 'none']
    expect(variants.filter(isClosable)).toEqual(['honest', 'tiny', 'corner', 'deceptive'])
    expect(isClosable('none')).toBe(false)
  })

  it('穷举：五个变体 × 命中/未命中都不会抛错', () => {
    const variants: CloseVariant[] = ['honest', 'tiny', 'corner', 'deceptive', 'none']
    for (const v of variants) {
      for (const hit of [true, false]) {
        expect(() => resolveClose(v, hit, 0.5)).not.toThrow()
      }
    }
  })
})
