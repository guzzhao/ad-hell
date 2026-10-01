<script setup lang="ts">
import { computed, type Component, type CSSProperties } from 'vue'
import type { AdInstance } from '@/types/ad'
import { findCreative } from '@/data/creatives'
import CloseButton from './CloseButton.vue'
import { LAYOUTS } from './layouts'

const props = defineProps<{ ad: AdInstance }>()
const emit = defineEmits<{ close: [id: number]; tap: [] }>()

const creative = computed(() => findCreative(props.ad.creativeId))

/**
 * 版式到组件的分派交给 `layouts.ts` 的注册表。
 * 这里不再需要"找不到就回退"的分支——`Record<AdLayout, Component>` 是穷尽的，
 * `LAYOUTS[current.layout]` 不可能为 undefined。
 */
const layout = computed<Component | null>(() => {
  const current = creative.value
  if (!current) return null
  return LAYOUTS[current.layout]
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
  <div
    v-if="creative && layout"
    class="ad-popup absolute pointer-events-auto cursor-pointer"
    :style="boxStyle"
    @click="emit('tap')"
  >
    <component :is="layout" :creative="creative" />
    <CloseButton :variant="creative.closeVariant" @hit="emit('close', ad.id)" />
  </div>
</template>
