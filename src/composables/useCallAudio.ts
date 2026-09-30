import { onScopeDispose, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useEventListener } from '@vueuse/core'
import type { AdInstance, SynthPreset } from '@/types/ad'
import { AudioBus } from '@/audio/AudioBus'
import { findCreative } from '@/data/creatives'
import { findMedia } from '@/data/media'
import { STORM } from '@/engine/storm'
import { useStormStore } from '@/stores/storm'

/**
 * 屏上正在播放的那个音频预设。没有就返回 null。
 *
 * 只看 `takeover`：音频是来电接听页的能力，弹窗不出声。
 */
function activeAudioPreset(ads: readonly AdInstance[]): SynthPreset | null {
  for (const ad of ads) {
    if (ad.surface !== 'takeover') continue
    const creative = findCreative(ad.creativeId)
    if (!creative?.mediaId) continue
    const media = findMedia(creative.mediaId)
    if (media?.kind === 'synth') return media.preset
  }
  return null
}

/**
 * 把 store 的状态桥接到 `AudioBus`。
 *
 * 这一层只做翻译，不自己做任何发声决定：判断"该不该响"看的是
 * "屏上有没有带音频的接管广告"，而不是任何定时器。
 */
export function useCallAudio(): void {
  const storm = useStormStore()
  const { ads, muted, phase } = storeToRefs(storm)
  const bus = new AudioBus()

  function sync(): void {
    const preset = activeAudioPreset(ads.value)

    if (preset === null || phase.value !== 'storm') {
      bus.stopAll()
      storm.setAudioBlocked(false)
      return
    }

    bus.play(preset, STORM.takeoverMaxMs)
    // 有声音要放、但还没拿到用户手势时，让界面给个提示而不是默默无声
    storm.setAudioBlocked(bus.state !== 'ready')
  }

  // 解锁后收掉提示。待播的内容由 AudioBus 自己补上，这里不必再 sync 一次。
  bus.onReady = () => storm.setAudioBlocked(false)

  // 页面里任意一次交互都算"用户手势"，用它解锁音频。
  // 绝不为了"保证出声"而在交互之前强行播放（R16）。
  useEventListener(window, ['pointerdown', 'keydown'], () => bus.unlock())

  watch(muted, (value) => bus.setMuted(value), { immediate: true })
  watch([() => activeAudioPreset(ads.value), phase], sync, { immediate: true })

  onScopeDispose(() => bus.dispose())
}
