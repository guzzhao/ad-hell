import { describe, expect, it } from 'vite-plus/test'
import { RING_MS, buildPlan, noiseSamples, type SynthPlan, type VoiceSpec } from '../synth'
import { STORM } from '@/engine/storm'

/**
 * 这一层测的是"要发什么声"——频率、包络、滤波参数。
 * 真正建节点、开声卡的那一层（AudioBus）在 jsdom 里跑不起来，
 * 所以参数与发声分离，正是为了能在这里把声音的形状钉死。
 */
function voiceAt(plan: SynthPlan, index: number): VoiceSpec {
  const voice = plan.voices[index]
  if (!voice) throw new Error(`计划里缺少第 ${index} 条声部`)
  return voice
}

describe('通话预设的声音形状', () => {
  const plan = buildPlan('callSession', STORM.takeoverMaxMs)

  it('时长与接管广告的生命周期一致，声音不会比广告活得久', () => {
    expect(plan.durationMs).toBe(STORM.takeoverMaxMs)
  })

  it('两条声部：先振铃，后人声', () => {
    expect(plan.voices).toHaveLength(2)
    expect(voiceAt(plan, 0).kind).toBe('tone')
    expect(voiceAt(plan, 1).kind).toBe('noise')
  })

  it('振铃是 440 + 480 双音——这是经典的振铃音', () => {
    const tone = voiceAt(plan, 0)
    if (tone.kind !== 'tone') throw new Error('第 0 条声部应当是振铃')

    expect(tone.freqs).toEqual([440, 480])
  })

  it('振铃响两次', () => {
    const tone = voiceAt(plan, 0)
    if (tone.kind !== 'tone') throw new Error('第 0 条声部应当是振铃')

    // 数"从静音抬起来"的次数，而不是数某个具体增益值出现几次——
    // 后者会被包络的分段写法左右，改一下平台就失效。
    const onsets = tone.envelope.filter(
      (p, i) => p.gain > 0 && (tone.envelope[i - 1]?.gain ?? 0) === 0,
    )
    expect(onsets).toHaveLength(2)
  })

  it('时长为 0 的边界不会把包络算崩', () => {
    const empty = buildPlan('callSession', 0)
    expect(empty.durationMs).toBe(0)
    expect(empty.voices.length).toBeGreaterThan(0)
  })
})

describe('人声与振铃的交接', () => {
  const plan = buildPlan('callSession', STORM.takeoverMaxMs)

  it('人声恰好在 RING_MS 处从 0 起——之前一个字都不说', () => {
    const noise = voiceAt(plan, 1)
    if (noise.kind !== 'noise') throw new Error('第 1 条声部应当是人声')

    expect(noise.envelope[0]?.atMs).toBe(RING_MS)
    expect(noise.envelope[0]?.gain).toBe(0)
    expect(noise.envelope.every((p) => p.atMs >= RING_MS || p.gain === 0)).toBe(true)
  })

  it('振铃在交接之前就已经彻底静下来，不会和说话声叠在一起', () => {
    const tone = voiceAt(plan, 0)
    if (tone.kind !== 'tone') throw new Error('第 0 条声部应当是振铃')

    // 断言的是"最后一个包络点"，不是"最后一个非零增益点"：
    // 余音是一段 300ms 的衰减，衰减没走完就切人声，照样会叠在一起。
    // 这条把振铃周期与 RING_MS 的关系钉死，改任一个常数都会在这里报错。
    const lastPoint = tone.envelope[tone.envelope.length - 1]
    expect(lastPoint?.atMs).toBeLessThanOrEqual(RING_MS)
    expect(lastPoint?.gain).toBe(0)
  })

  it('两条声部的包络最终都归零，不会留下持续噪声', () => {
    for (const voice of plan.voices) {
      const gains = voice.envelope.map((p) => p.gain)
      expect(gains[gains.length - 1]).toBe(0)
    }
  })

  it('包络的时间戳单调不减，且首点不依赖前一段', () => {
    for (const voice of plan.voices) {
      const times = voice.envelope.map((p) => p.atMs)
      const disordered = times.filter((t, i) => i > 0 && t < (times[i - 1] ?? 0))
      expect(disordered).toEqual([])
      expect(voice.envelope[0]?.rampMs).toBe(0)
    }
  })

  it('人声按音节开合，不是一条均匀的嘶声', () => {
    const noise = voiceAt(plan, 1)
    if (noise.kind !== 'noise') throw new Error('第 1 条声部应当是人声')

    const levels = new Set(noise.envelope.map((p) => p.gain))
    // 至少要有"重音 / 轻音 / 静音"三档，才谈得上说话的感觉
    expect(levels.size).toBeGreaterThanOrEqual(3)
    expect(noise.bandHz).toBeGreaterThan(200)
    expect(noise.bandHz).toBeLessThan(2000)
  })
})

describe('噪声样本', () => {
  it('同一个种子给同样的样本——"这次听起来不对"必须可复现', () => {
    const a = noiseSamples(256)
    const b = noiseSamples(256)

    expect(Array.from(a)).toEqual(Array.from(b))
  })

  it('落在 [-1, 1] 内，而且不是一条直线', () => {
    const samples = Array.from(noiseSamples(512))

    expect(Math.min(...samples)).toBeGreaterThanOrEqual(-1)
    expect(Math.max(...samples)).toBeLessThanOrEqual(1)
    expect(new Set(samples).size).toBeGreaterThan(100)
  })

  it('长度为 0 时不抛错', () => {
    expect(noiseSamples(0)).toHaveLength(0)
  })
})
