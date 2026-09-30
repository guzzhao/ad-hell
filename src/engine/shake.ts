import type { AdInstance, AdTrigger } from '@/types/ad'

/**
 * 摇一摇的判定参数。
 *
 * 整个判定建立在一个统一的量纲上：**一次"甩动节拍"记 0.5 能量**，
 * 阈值就是"1 秒窗口内要凑够几次节拍"。传感器和指针两条采集路径都折算到这个量纲，
 * 于是阈值、防抖、冷却这些最容易出错的边界可以脱离真机单测。
 */
export const SHAKE = {
  /** 能量累积窗口（ms）。窗口内的样本算作**一次**摇动。 */
  windowMs: 1000,
  /** 窗口内最多保留的样本数，防止高频设备事件把数组撑大。 */
  maxSamples: 64,
  /** 一次甩动节拍的能量。 */
  beatEnergy: 0.5,
} as const

/**
 * 一次完整摇动的能量。
 *
 * 兜底按钮（桌面没有传感器、或 iOS 拒绝授权）直接产生这么多能量，
 * 因此它**必须**不小于任何素材的 `trigger.threshold`，否则按钮按下去没反应。
 * `creatives.spec.ts` 有一条测试守着这个关系。
 */
export const FULL_SHAKE_ENERGY = 1

export interface ShakeSample {
  /** 采样时刻（ms），必须单调不减。 */
  atMs: number
  /** 归一化能量，约定 ≥ 0。 */
  energy: number
}

/**
 * 压入一个样本，并丢掉窗口外的旧样本。纯函数，返回新数组。
 *
 * @param samples 既有样本，按 `atMs` 升序
 */
export function pushShakeSample(
  samples: readonly ShakeSample[],
  sample: ShakeSample,
  windowMs: number = SHAKE.windowMs,
): ShakeSample[] {
  const kept = samples.filter((s) => sample.atMs - s.atMs < windowMs)
  kept.push(sample)
  return kept.slice(-SHAKE.maxSamples)
}

/** 窗口内的总能量。负能量会被当作 0，避免脏输入把阈值抹平。 */
export function shakeEnergy(samples: readonly ShakeSample[]): number {
  return samples.reduce((sum, s) => sum + Math.max(0, s.energy), 0)
}

/** 窗口内能量是否越过阈值。 */
export function isShakeTriggered(samples: readonly ShakeSample[], threshold: number): boolean {
  return shakeEnergy(samples) >= threshold
}

/**
 * 每种触发方式的冷却时长。
 *
 * 用映射类型而不是简单查表：`AdTrigger` 加一种新触发方式时，
 * 这个 Record 会缺一个键，`npm run type-check` 直接报错；
 * 而每个处理函数拿到的 `trigger` 也被正确收窄到对应分支。
 *
 * 注意：这里**不能**用 `switch` + `assertNever` 那套。`assertNever` 的穷尽性依赖
 * 被判断的值是一个**多成员联合**，而当前 `AdTrigger` 只有一个成员，
 * 在 `default` 分支里它不会被收窄成 `never`。用 Record 才在任意成员数下都成立。
 */
type TriggerCooldown = {
  [K in AdTrigger['kind']]: (trigger: Extract<AdTrigger, { kind: K }>) => number
}

const COOLDOWN_MS: TriggerCooldown = {
  shake: (trigger) => trigger.cooldownMs,
}

export function triggerCooldownMs(trigger: AdTrigger): number {
  return COOLDOWN_MS[trigger.kind](trigger)
}

/**
 * 判定这次摇动是否应当触发，并返回该响应的广告实例 id；不该触发就返回 null。
 *
 * @param ads            屏上的实例
 * @param resolveTrigger 按素材 id 取触发配置；没有配置的素材不响应摇动
 * @param samples        当前窗口内的能量样本
 * @param nextAllowedAt  每个实例的下次允许触发时刻（冷却记账）
 * @param nowMs          当前风暴时刻
 *
 * 关键是**绑定素材**而不是全局劫持：只有屏上确实存在带该能力的广告时才可能返回非空。
 * 阈值是全局的——这一次摇得够不够劲，与是哪条广告无关；但"谁响应"由素材决定。
 */
export function resolveShake(
  ads: readonly AdInstance[],
  resolveTrigger: (creativeId: string) => AdTrigger | undefined,
  samples: readonly ShakeSample[],
  nextAllowedAt: ReadonlyMap<number, number>,
  nowMs: number,
): number | null {
  for (const ad of ads) {
    const trigger = resolveTrigger(ad.creativeId)
    if (trigger === undefined) continue
    if (nowMs < (nextAllowedAt.get(ad.id) ?? 0)) continue
    return isShakeTriggered(samples, trigger.threshold) ? ad.id : null
  }
  return null
}
