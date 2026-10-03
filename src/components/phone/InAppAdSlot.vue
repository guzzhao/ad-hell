<script setup lang="ts">
import { computed } from 'vue'
import { findCreative } from '@/data/creatives'
import { useStormStore } from '@/stores/storm'

/**
 * App 内部的原生广告位（保留组件，当前阶段打磨原生界面，由 adsEnabled 控制显示）。
 */
const props = defineProps<{ creativeId: string; caption?: string }>()
const storm = useStormStore()

const creative = computed(() => findCreative(props.creativeId))
</script>

<template>
  <figure v-if="storm.adsEnabled && creative" class="my-4">
    <div
      class="flex items-center gap-2.5 px-3 py-[11px] rounded-[13px] shadow-[0_8px_22px_-12px_rgba(0,0,0,0.7)] bg-[var(--ad-bg)] text-[var(--ad-fg)] cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
      :style="{
        '--ad-bg': creative.palette.bg,
        '--ad-fg': creative.palette.fg,
        '--ad-accent': creative.palette.accent,
      }"
      @click="storm.tapAdBody(creative)"
    >
      <span
        class="shrink-0 self-start px-[5px] py-px border border-current rounded text-[9px] opacity-75"
        >广告</span
      >
      <div class="flex flex-col gap-0.5 min-w-0">
        <strong class="text-[12.5px] font-bold leading-snug">{{ creative.headline }}</strong>
        <small class="text-[10.5px] opacity-80">{{ creative.subline }}</small>
      </div>
      <span
        class="shrink-0 ml-auto px-[11px] py-1.5 rounded-full bg-[var(--ad-accent)] text-[#14161a] text-[11px] font-bold whitespace-nowrap"
        >{{ creative.cta }}</span
      >
    </div>
    <figcaption
      v-if="caption"
      class="mt-[7px] mx-0.5 text-[11px] leading-relaxed text-[#f2f4f8]/50"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
