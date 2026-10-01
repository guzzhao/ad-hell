<script setup lang="ts">
import { computed, type Component, type CSSProperties } from 'vue'
import { storeToRefs } from 'pinia'
import type { AdCreative } from '@/types/ad'
import { useStormStore } from '@/stores/storm'
import { findCreative } from '@/data/creatives'
import CloseButton from './CloseButton.vue'
import { LAYOUTS } from './layouts'

/**
 * 全屏接管层。
 *
 * 与弹窗层（`AdLayer`）分成两层不是审美选择：
 * 接管广告必须盖住**所有**弹窗，而页面上那枚「结束体验」出口必须始终在它之上。
 * 分成两层后，这个优先级由 CSS 的 `z-index` 静态保证，不需要运行期算层级。
 *
 * z-index 预算：App 内容 40 < 弹窗层 100 < **接管层 700** < 假落地页 900 < 页面控件 1000。
 *
 * 它与弹窗层共用同一个 `layouts.ts` 注册表——这正是扩展缝的意义：
 * 加一种版式，两层同时就能渲染它，不必改两处。
 */
const storm = useStormStore()
const { ads } = storeToRefs(storm)

/** 渲染所需的全部信息都在这里算好，模板里不做查找，也就不需要非空断言。 */
interface TakeoverView {
  id: number
  layout: Component
  creative: AdCreative
  style: CSSProperties
}

const views = computed<TakeoverView[]>(() => {
  const result: TakeoverView[] = []
  for (const ad of ads.value) {
    if (ad.surface !== 'takeover') continue
    const creative = findCreative(ad.creativeId)
    if (!creative) continue
    result.push({
      id: ad.id,
      layout: LAYOUTS[creative.layout],
      creative,
      // 调色板通过 CSS 自定义属性下传，版式组件不必各自接一套 props（与 AdPopup 一致）
      style: {
        zIndex: ad.z,
        '--ad-bg': creative.palette.bg,
        '--ad-fg': creative.palette.fg,
        '--ad-accent': creative.palette.accent,
      },
    })
  }
  return result
})

function onClose(id: number): void {
  // 与弹窗层一致：点关闭键只是一个"尝试"，到底关不关得掉由引擎按 closeVariant 判定。
  storm.attemptClose(id, true)
}
</script>

<template>
  <div class="takeover-layer absolute inset-0 z-[700] pointer-events-none">
    <TransitionGroup name="takeover">
      <!-- 点主体同样是误触跳转，真实广告就是这样 -->
      <div
        v-for="view in views"
        :key="view.id"
        class="absolute inset-0 pointer-events-auto cursor-pointer"
        :style="view.style"
        @click="storm.tapAdBody()"
      >
        <component :is="view.layout" :creative="view.creative" />
        <CloseButton :variant="view.creative.closeVariant" @hit="onClose(view.id)" />
      </div>
    </TransitionGroup>
  </div>
</template>
