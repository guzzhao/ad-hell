<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { AdCreative } from '@/types/ad'
import { useStormStore } from '@/stores/storm'

const props = defineProps<{ creative: AdCreative }>()
const storm = useStormStore()

const hasShake = computed(() => props.creative.trigger !== undefined)
const countdown = ref(5)
let timer: number | null = null

function handleSkip(e: MouseEvent): void {
  e.stopPropagation()
  storm.closeAllAds()
}

onMounted(() => {
  timer = window.setInterval(() => {
    if (countdown.value > 1) {
      countdown.value -= 1
    } else {
      if (timer) clearInterval(timer)
      storm.closeAllAds()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const bgGradientClass = computed(() =>
  props.creative.id === 'splash-video'
    ? 'bg-gradient-to-b from-[#134e4a] via-[#0f172a] to-[#020617]'
    : 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950',
)
</script>

<template>
  <div
    class="ad-splash relative flex flex-col justify-between h-full px-6 pt-[50px] pb-7 text-white overflow-hidden"
    :class="[`ad-splash--${creative.id}`, bgGradientClass]"
  >
    <!-- 顶部跳过按钮：可点击且倒计时自动关闭 -->
    <div class="ad-splash__skip-wrap absolute top-[18px] right-[18px] z-10">
      <button
        type="button"
        class="ad-splash__skip inline-flex items-center gap-[5px] pl-2 pr-3 py-1.5 rounded-full bg-black/45 border border-white/20 backdrop-blur-md text-[11.5px] text-white cursor-pointer transition-all active:scale-95 active:bg-black/65"
        aria-label="跳过广告"
        @click="handleSkip"
      >
        <svg viewBox="0 0 20 20" class="ad-splash__skip-ring w-3.5 h-3.5">
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            stroke-width="2"
          />
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="#60a5fa"
            stroke-width="2"
            stroke-dasharray="50"
            :stroke-dashoffset="10 * (5 - countdown)"
          />
        </svg>
        跳过 {{ countdown }}s ›
      </button>
    </div>

    <!-- 中部主画面：克制优雅的品牌活动海报 -->
    <div class="ad-splash__center relative z-[2] flex flex-col items-center text-center mt-[50px]">
      <span
        v-if="creative.badge"
        class="ad-splash__badge px-2 py-0.5 rounded-full bg-white/15 text-blue-300 text-[11px] font-semibold"
        >{{ creative.badge }}</span
      >

      <h1 class="ad-splash__headline m-0 mt-4 text-[26px] font-bold leading-tight text-white">
        {{ creative.headline }}
      </h1>
      <p class="ad-splash__subline m-0 mt-2 text-[13.5px] text-slate-300">{{ creative.subline }}</p>

      <!-- 摇一摇交互区 -->
      <div
        v-if="hasShake"
        class="ad-splash__shake-box flex items-center gap-3 w-full max-w-[290px] mt-12 px-4 py-2.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md"
        aria-hidden="true"
      >
        <div
          class="ad-splash__shake-icon grid place-items-center w-7 h-7 rounded-full bg-sky-400/20 text-sky-400 shrink-0"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="splash-shake-svg w-[18px] h-[18px]"
          >
            <rect x="5" y="2" width="14" height="20" rx="3" />
            <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5" />
          </svg>
        </div>
        <div class="ad-splash__shake-text flex flex-col text-left">
          <strong class="text-xs text-slate-200">晃动手机 或 点击进入活动</strong>
          <small class="text-[9.5px] text-slate-400">微小晃动即可进入详情</small>
        </div>
      </div>

      <!-- 常规行动按钮 -->
      <button
        v-else
        type="button"
        class="ad-splash__cta w-full max-w-[290px] mt-12 py-[11px] rounded-full bg-blue-600 text-white text-sm font-semibold border-none cursor-pointer"
        tabindex="-1"
      >
        {{ creative.cta }} ›
      </button>
    </div>

    <!-- 底部品牌背书 -->
    <div class="ad-splash__foot-brand relative z-[2] flex items-center justify-center gap-2.5">
      <div
        class="ad-splash__logo-icon grid place-items-center w-8 h-8 rounded-lg bg-white/10 text-white p-1.5"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
      <div class="ad-splash__logo-info flex flex-col text-left">
        <strong class="ad-splash__brand-name text-[12.5px] font-semibold text-white">{{
          creative.brand
        }}</strong>
        <span class="ad-splash__brand-slogan text-[9.5px] text-slate-400">精选品质 · 极速送达</span>
      </div>
    </div>

    <!-- 广告角标 -->
    <span
      class="ad-splash__tag absolute bottom-2 right-3 text-[8px] text-white/35 border border-white/20 rounded px-[3px] pointer-events-none"
      aria-hidden="true"
      >广告</span
    >
  </div>
</template>

<style scoped>
.splash-shake-svg {
  animation: phone-shake-tilt 1.4s ease-in-out infinite;
  transform-origin: bottom center;
}

@keyframes phone-shake-tilt {
  0%,
  100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(-18deg);
  }
  40% {
    transform: rotate(18deg);
  }
  60% {
    transform: rotate(-12deg);
  }
  80% {
    transform: rotate(12deg);
  }
}
</style>
