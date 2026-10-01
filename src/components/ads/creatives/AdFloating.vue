<script setup lang="ts">
import { computed } from 'vue'
import type { AdCreative } from '@/types/ad'

const props = defineProps<{ creative: AdCreative }>()

const isDating = computed(() => props.creative.category === '同城交友')
const isLoan = computed(() => props.creative.category === '网贷')
</script>

<template>
  <div
    class="relative flex items-center h-full px-3 py-2 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-md shadow-[0_8px_20px_-4px_rgba(0,0,0,0.45)] text-white overflow-hidden"
  >
    <!-- 1. 同城交友：克制小巧的社交消息入口 -->
    <template v-if="isDating">
      <div class="flex items-center gap-2.5 w-full">
        <div
          class="grid place-items-center w-8 h-8 rounded-lg shrink-0 bg-rose-500/15 text-rose-400"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-[18px] h-[18px]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>
        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-slate-400">{{ creative.brand }}</span>
            <span
              v-if="creative.badge"
              class="text-[8.5px] px-1 py-px rounded bg-white/10 text-slate-300"
              >{{ creative.badge }}</span
            >
          </div>
          <strong class="text-[11.5px] font-semibold text-white truncate">{{
            creative.headline
          }}</strong>
        </div>
        <button
          type="button"
          class="shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-blue-600 text-white border-none whitespace-nowrap cursor-pointer"
          tabindex="-1"
        >
          {{ creative.cta }} ›
        </button>
      </div>
    </template>

    <!-- 2. 金融信贷：克制信贷额度入口 -->
    <template v-else-if="isLoan">
      <div class="flex items-center gap-2.5 w-full">
        <div
          class="grid place-items-center w-8 h-8 rounded-lg shrink-0 bg-sky-500/15 text-sky-400"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="w-[18px] h-[18px]"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-slate-400">{{ creative.brand }}</span>
            <span
              v-if="creative.badge"
              class="text-[8.5px] px-1 py-px rounded bg-white/10 text-slate-300"
              >{{ creative.badge }}</span
            >
          </div>
          <strong class="text-[11.5px] font-semibold text-white truncate">{{
            creative.headline
          }}</strong>
        </div>
        <button
          type="button"
          class="shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-blue-600 text-white border-none whitespace-nowrap cursor-pointer"
          tabindex="-1"
        >
          {{ creative.cta }} ›
        </button>
      </div>
    </template>

    <!-- 通用浮窗 -->
    <template v-else>
      <div class="flex items-center gap-2.5 w-full">
        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-slate-400">{{ creative.brand }}</span>
            <span
              v-if="creative.badge"
              class="text-[8.5px] px-1 py-px rounded bg-white/10 text-slate-300"
              >{{ creative.badge }}</span
            >
          </div>
          <strong class="text-[11.5px] font-semibold text-white truncate">{{
            creative.headline
          }}</strong>
        </div>
        <button
          type="button"
          class="shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-blue-600 text-white border-none whitespace-nowrap cursor-pointer"
          tabindex="-1"
        >
          {{ creative.cta }} ›
        </button>
      </div>
    </template>

    <span
      class="absolute bottom-0.5 right-1.5 text-[7px] text-white/35 border border-white/20 rounded px-0.5 leading-tight pointer-events-none"
      aria-hidden="true"
      >广告</span
    >
  </div>
</template>
