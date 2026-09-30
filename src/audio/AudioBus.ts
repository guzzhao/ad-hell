import type { SynthPreset } from '@/types/ad'
import {
  buildPlan,
  noiseSamples,
  type EnvelopePoint,
  type NoiseSpec,
  type SynthPlan,
  type ToneSpec,
} from './synth'

/**
 * 音频总线的状态。
 * - `idle`：这个环境没有 `AudioContext`（jsdom、老浏览器）——全程静默降级
 * - `locked`：有 context 但处于 suspended，还没拿到用户手势
 * - `ready`：可以出声
 */
export type AudioState = 'idle' | 'locked' | 'ready'

interface PendingPlay {
  preset: SynthPreset
  durationMs: number
}

/** 只在支持的环境里返回构造函数。jsdom 里 `AudioContext` 是 undefined。 */
function getAudioContextCtor(): (new () => AudioContext) | null {
  if (typeof globalThis.AudioContext === 'function') return globalThis.AudioContext
  return null
}

/**
 * 程序合成音频总线。
 *
 * **不 import vue**：它是命令式对象，生命周期由 `useCallAudio` 这个组合式函数驱动。
 *
 * 浏览器不允许在用户交互前播放声音，所以这里有一个"记着但不放"的待播槽：
 * `play()` 在还没解锁时只记下要放什么，等 `unlock()` 拿到手势后再补上。
 * 这样调用方不需要关心解锁时序，也不必 await 任何东西。
 */
export class AudioBus {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private active: AudioScheduledSourceNode[] = []
  private pending: PendingPlay | null = null
  private muted = false

  /**
   * 拿到音频权限、可以出声时回调一次。
   * 界面靠它收掉「点击任意处开启声音」的提示。
   */
  onReady: (() => void) | null = null

  get state(): AudioState {
    if (!this.context) return 'idle'
    return this.context.state === 'running' ? 'ready' : 'locked'
  }

  /**
   * 在用户手势里调用。
   *
   * 环境不支持时静默返回——**绝不抛错**：音频能力缺失不该让页面崩掉（AC17）。
   */
  unlock(): void {
    const ctor = getAudioContextCtor()
    if (ctor === null) return

    if (this.context === null) {
      this.context = new ctor()
      this.master = this.context.createGain()
      this.master.gain.value = this.muted ? 0 : 1
      this.master.connect(this.context.destination)
    }

    if (this.context.state === 'suspended') {
      // resume 是异步的，先记着待播的东西，恢复成功后再补上
      this.context.resume().then(
        () => this.startPending(),
        () => undefined,
      )
      return
    }

    this.startPending()
  }

  /** 请求播放一个预设。环境不支持或还没解锁时，只是记下来。 */
  play(preset: SynthPreset, durationMs: number): void {
    this.pending = { preset, durationMs }
    this.startPending()
  }

  /** 停掉当前所有声音，并丢弃待播（例如用户关掉了广告）。 */
  stopAll(): void {
    this.pending = null
    for (const node of this.active) {
      node.stop()
      node.disconnect()
    }
    this.active = []
  }

  /**
   * 静音开关。
   *
   * 用一个总增益节点而不是逐条停声：总增益能**立即**生效，
   * 而且解静音时正在通话的声音会自然接续，不会从头重放。
   */
  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.master) this.master.gain.value = muted ? 0 : 1
  }

  /** 释放声卡。组件卸载时调用。 */
  dispose(): void {
    this.stopAll()
    const context = this.context
    this.context = null
    this.master = null
    if (!context) return
    context.close().then(
      () => undefined,
      () => undefined,
    )
  }

  private startPending(): void {
    // 单一切入口：无论从 play / unlock / resume 哪条路进来，都先在这里通报状态
    if (this.state === 'ready') this.onReady?.()

    if (this.pending === null) return
    // 还没解锁就先留着，等解锁后再补——这是"绝不提前出声"的落点
    if (this.state !== 'ready') return

    const { preset, durationMs } = this.pending
    this.pending = null
    this.start(buildPlan(preset, durationMs))
  }

  private start(plan: SynthPlan): void {
    const context = this.context
    const master = this.master
    if (!context || !master) return

    this.stopAll()

    const startedAt = context.currentTime
    const endsAt = startedAt + plan.durationMs / 1000

    for (const voice of plan.voices) {
      const gain = context.createGain()
      gain.gain.value = 0
      gain.connect(master)
      applyEnvelope(gain.gain, voice.envelope, startedAt)

      const sources =
        voice.kind === 'tone'
          ? buildTone(context, voice, gain)
          : buildNoise(context, voice, gain, plan.durationMs)

      // 一条声部可能对应多个节点：和弦就是每个频率一个振荡器
      for (const source of sources) {
        source.start(startedAt)
        source.stop(endsAt)
        this.active.push(source)
      }
    }
  }
}

/** 把包络关键点排到音频时钟上。 */
function applyEnvelope(
  param: AudioParam,
  points: readonly EnvelopePoint[],
  startedAt: number,
): void {
  for (const point of points) {
    const at = startedAt + point.atMs / 1000
    if (point.rampMs <= 0) param.setValueAtTime(point.gain, at)
    else param.linearRampToValueAtTime(point.gain, at)
  }
}

/** 一个和弦：每个频率一个振荡器，共用同一个包络。 */
function buildTone(
  context: AudioContext,
  spec: ToneSpec,
  destination: AudioNode,
): OscillatorNode[] {
  const nodes: OscillatorNode[] = []

  for (const freq of spec.freqs) {
    const osc = context.createOscillator()
    osc.type = spec.wave
    osc.frequency.value = freq
    osc.connect(destination)
    nodes.push(osc)
  }

  return nodes
}

/**
 * 带通白噪声。缓冲循环使用，长度固定 2 秒——不必为了几秒的声音生成几秒的样本。
 */
function buildNoise(
  context: AudioContext,
  spec: NoiseSpec,
  destination: AudioNode,
  durationMs: number,
): AudioBufferSourceNode[] {
  const seconds = Math.min(2, Math.max(0.5, durationMs / 1000))
  const buffer = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * seconds),
    context.sampleRate,
  )
  const channel = buffer.getChannelData(0)
  channel.set(noiseSamples(channel.length))

  const source = context.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = spec.bandHz
  filter.Q.value = spec.q

  source.connect(filter)
  filter.connect(destination)
  return [source]
}
