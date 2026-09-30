import type { AdMedia } from '@/types/ad'

/**
 * 媒体清单。
 *
 * 素材通过 `mediaId` 引用这里，而播放 / 渲染层只认清单、不认素材——
 * 于是换掉来电广告的铃声只需要改这张表的一行，不必碰素材数据或组件。
 *
 * ⚠️ 现状要说清楚：v2 的清单里**只有音频**，且全部由 Web Audio 程序合成（零二进制资源）。
 * 广告的**观感**目前仍由各版式组件的 CSS 承担，尚未清单化——所以"换成真实广告图"
 * 不是改一行就能完成的事，那需要 `AdMedia` 加分支、渲染层补分支。这里不提前假装支持。
 */
export const MEDIA: Record<string, AdMedia> = {
  'call-default': { kind: 'synth', preset: 'callSession' },
}

/** 按 id 取媒体。找不到返回 undefined，由调用方决定如何降级。 */
export function findMedia(id: string): AdMedia | undefined {
  return MEDIA[id]
}
