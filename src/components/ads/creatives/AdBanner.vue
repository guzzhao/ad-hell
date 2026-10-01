<script setup lang="ts">
import { computed } from 'vue'
import type { AdCreative } from '@/types/ad'

const props = defineProps<{ creative: AdCreative }>()

const isSystem = computed(() => props.creative.category === '伪装系统提示')
const isShop = computed(() => props.creative.category === '9.9 包邮')
const isGame = computed(() => props.creative.category === '传奇游戏')

const ctaBgClass = computed(() => {
  if (isSystem.value) return 'bg-emerald-600'
  if (isShop.value) return 'bg-orange-600'
  if (isGame.value) return 'bg-indigo-600'
  return 'bg-blue-600'
})
</script>

<template>
  <div
    class="ad-banner relative flex items-center h-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-[0_6px_20px_-4px_rgba(0,0,0,0.4)] text-white overflow-hidden"
    :class="`ad-banner--${creative.category}`"
  >
    <!-- 真实通知横幅 / 顶部卡片 -->
    <div class="banner-body flex items-center gap-2.5 w-full">
      <!-- 适度的图标 -->
      <div
        class="banner-icon-box grid place-items-center w-9 h-9 rounded-[9px] bg-white/[0.08] shrink-0"
        aria-hidden="true"
      >
        <!-- 系统提示 -->
        <template v-if="isSystem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="banner-svg w-5 h-5 text-amber-500"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="3" />
          </svg>
        </template>
        <!-- 电商优选 -->
        <template v-else-if="isShop">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="banner-svg w-5 h-5 text-orange-500"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
          </svg>
        </template>
        <!-- 游戏 -->
        <template v-else-if="isGame">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="banner-svg w-5 h-5 text-indigo-400"
          >
            <path d="m14.5 17.5 3 3L22 16l-3-3" />
            <path d="M5 19 19 5" />
            <path d="m2 22 3-3" />
          </svg>
        </template>
        <!-- 默认 -->
        <template v-else>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="banner-svg w-5 h-5 text-sky-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="3" />
          </svg>
        </template>
      </div>

      <!-- 文字内容 -->
      <div class="banner-text flex flex-col gap-px flex-1 min-w-0">
        <div class="banner-meta flex items-center gap-1.5 text-[10px] text-slate-400">
          <span class="banner-brand font-medium text-slate-200">{{ creative.brand }}</span>
          <span class="banner-dot">·</span>
          <span class="banner-time">刚刚</span>
          <span
            v-if="creative.badge"
            class="banner-badge px-1 py-px rounded bg-red-500/15 text-red-400 text-[8px]"
            >{{ creative.badge }}</span
          >
        </div>
        <strong class="banner-title text-xs font-semibold text-white truncate leading-tight">{{
          creative.headline
        }}</strong>
        <p class="banner-sub m-0 text-[10.5px] text-slate-400 truncate">{{ creative.subline }}</p>
      </div>

      <!-- 右侧行动按钮 -->
      <div class="banner-action shrink-0 ml-1">
        <button
          type="button"
          class="banner-cta-btn px-2.5 py-1 rounded-full text-[11px] font-semibold text-white whitespace-nowrap border-none"
          :class="ctaBgClass"
          tabindex="-1"
        >
          {{ creative.cta }}
        </button>
      </div>
    </div>

    <!-- 规范的广告提示标 -->
    <span
      class="banner-tag absolute bottom-0.5 right-1.5 text-[7px] text-white/35 border border-white/20 rounded px-0.5 leading-tight pointer-events-none"
      aria-hidden="true"
      >广告</span
    >
  </div>
</template>
