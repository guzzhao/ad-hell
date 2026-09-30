import type { SynthPreset } from '@/types/ad'
import { mulberry32 } from '@/engine/rng'

/**
 * 音频的**参数计划**。
 *
 * 这个模块刻意不碰 Web Audio：它只算出"要发什么声"，由 `AudioBus` 负责"怎么发声"。
 * 分开的理由是可测性——频率、包络、滤波截止这些都是纯数据，可以直接断言；
 * 而真正建节点、开声卡的那一层在单测环境里根本跑不起来。
 */

/**
 * 振铃时长（ms）。
 *
 * ⚠️ 必须与 `AdCallPage.vue` 里"来电中 → 通话中"的切换点一致：
 * 声音从振铃切到人声的那一刻，画面也应当从"来电中"切到"通话中"。
 */
export const RING_MS = 3000

/** 包络关键点：在 `atMs` 时刻增益到达 `gain`。 */
export interface EnvelopePoint {
  atMs: number
  gain: number
  /** 从上一个关键点线性过渡到本点所需的时长（ms）。第一个点必须为 0。 */
  rampMs: number
}

export interface ToneSpec {
  kind: 'tone'
  wave: OscillatorType
  /** 同时发声的频率。两个频率就是和弦——440 + 480 正是经典的振铃音。 */
  freqs: number[]
  envelope: EnvelopePoint[]
}

export interface NoiseSpec {
  kind: 'noise'
  /** 带通中心频率。人声的能量集中在这一带，所以白噪声经此滤波后"像有人在说话"。 */
  bandHz: number
  q: number
  /** 音节开合周期（ms）：模拟说话的抑扬顿挫，而不是一条均匀的嘶声。 */
  syllableMs: number
  envelope: EnvelopePoint[]
}

export type VoiceSpec = ToneSpec | NoiseSpec

export interface SynthPlan {
  durationMs: number
  voices: VoiceSpec[]
}

/** 振铃包络：响 1 秒、停 0.5 秒，共 `rings` 次。 */
function ringEnvelope(rings: number): EnvelopePoint[] {
  /**
   * 每轮振铃的周期。
   *
   * ⚠️ `rings * period` 必须小于 `RING_MS`，否则振铃的余音会拖进人声阶段，
   * 两者叠在一起就不像电话了。`synth.spec.ts` 有一条测试专门守这个关系。
   */
  const period = 1500
  const points: EnvelopePoint[] = [{ atMs: 0, gain: 0, rampMs: 0 }]

  for (let i = 0; i < rings; i++) {
    const start = i * period
    points.push({ atMs: start + 40, gain: 0.5, rampMs: 40 })
    points.push({ atMs: start + 1000, gain: 0.5, rampMs: 960 })
    points.push({ atMs: start + 1300, gain: 0, rampMs: 300 })
  }

  return points
}

/**
 * 人声包络：把噪声按音节开合，做出"有人在说话"的节奏。
 *
 * 每个音节一个重音加一个轻音，比单纯的方波门更接近自然语言的重音分布。
 */
function speechEnvelope(fromMs: number, toMs: number, syllableMs: number): EnvelopePoint[] {
  const points: EnvelopePoint[] = [{ atMs: fromMs, gain: 0, rampMs: 0 }]

  for (let t = fromMs; t < toMs - syllableMs; t += syllableMs) {
    const peakAt = t + syllableMs * 0.25
    points.push({ atMs: peakAt, gain: 0.24, rampMs: peakAt - t })
    const softAt = t + syllableMs * 0.78
    points.push({ atMs: softAt, gain: 0.07, rampMs: softAt - peakAt })
  }

  points.push({ atMs: toMs, gain: 0, rampMs: 140 })
  return points
}

/**
 * 预设 → 构造器。用 `Record<SynthPreset, …>` 而不是 switch：
 * 加了新预设却忘了在这里实现，`npm run type-check` 会直接报错。
 */
const BUILDERS: Record<SynthPreset, (durationMs: number) => SynthPlan> = {
  callSession: (durationMs) => ({
    durationMs,
    voices: [
      // 振铃：440 + 480 双音，响两次
      { kind: 'tone', wave: 'sine', freqs: [440, 480], envelope: ringEnvelope(2) },
      // 接通后的人声：带通白噪声按音节开合
      {
        kind: 'noise',
        bandHz: 620,
        q: 1.1,
        syllableMs: 260,
        envelope: speechEnvelope(RING_MS, durationMs, 260),
      },
    ],
  }),
}

export function buildPlan(preset: SynthPreset, durationMs: number): SynthPlan {
  return BUILDERS[preset](durationMs)
}

/**
 * 确定性的白噪声样本。
 *
 * 用固定种子而不是 `Math.random()`：同一段声音每次都能复现，
 * 调试"这次听起来不对"时才有意义。
 */
export function noiseSamples(count: number, seed = 20_260_928): Float32Array {
  const rng = mulberry32(seed)
  const out = new Float32Array(count)
  for (let i = 0; i < count; i++) out[i] = rng() * 2 - 1
  return out
}
