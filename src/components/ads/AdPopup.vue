<script setup lang="ts">
import { computed, type Component, type CSSProperties } from 'vue'
import type { AdCreative, AdInstance } from '@/types/ad'
import { findCreative } from '@/data/creatives'
import CloseButton from './CloseButton.vue'
import AdBanner from './creatives/AdBanner.vue'
import AdFloating from './creatives/AdFloating.vue'
import AdInterstitial from './creatives/AdInterstitial.vue'
import AdSplash from './creatives/AdSplash.vue'
import AdFakeCall from './creatives/AdFakeCall.vue'

const props = defineProps<{ ad: AdInstance }>()
const emit = defineEmits<{ close: [id: number]; tap: [] }>()

const LAYOUTS: Record<AdCreative['layout'], Component> = {
  banner: AdBanner,
  floating: AdFloating,
  interstitial: AdInterstitial,
  splash: AdSplash,
  fakeCall: AdFakeCall,
}

const creative = computed(() => findCreative(props.ad.creativeId))

const layout = computed<Component | null>(() => {
  const current = creative.value
  if (!current) return null
  return LAYOUTS[current.layout] ?? null
})

/**
 * 位置与尺寸都用**相对手机视口的百分比**，因此同一份广告数据在
 * "移动端全屏"和"桌面样机"两种形态下都成立。
 * 调色板通过 CSS 自定义属性下传，版式组件不必各自接一套 props。
 */
const boxStyle = computed<CSSProperties>(() => {
  const current = creative.value
  return {
    left: `${props.ad.x}%`,
    top: `${props.ad.y}%`,
    width: `${props.ad.w}%`,
    height: `${props.ad.h}%`,
    zIndex: props.ad.z,
    ...(current
      ? {
          '--ad-bg': current.palette.bg,
          '--ad-fg': current.palette.fg,
          '--ad-accent': current.palette.accent,
        }
      : {}),
  }
})
</script>

<template>
  <!-- 点弹窗主体 = 误触跳转，与点假关闭键同罪。真实广告就是这样。 -->
  <div v-if="creative && layout" class="ad-popup" :style="boxStyle" @click="emit('tap')">
    <component :is="layout" :creative="creative" />
    <CloseButton :variant="creative.closeVariant" @hit="emit('close', ad.id)" />
  </div>
</template>

<style scoped>
.ad-popup {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
}
</style>
