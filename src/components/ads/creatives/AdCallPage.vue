<script setup lang="ts">
import { computed, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import type { AdCreative } from '@/types/ad'
import { RING_MS } from '@/audio/synth'

defineProps<{ creative: AdCreative }>()

const elapsedMs = ref(0)

useIntervalFn(() => {
  elapsedMs.value += 1000
}, 1000)

const ringing = computed(() => elapsedMs.value < RING_MS)

const duration = computed(() => {
  const total = Math.max(0, Math.floor((elapsedMs.value - RING_MS) / 1000))
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return `${mm}:${ss}`
})
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-between h-full px-6 pt-14 pb-[38px] bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden"
  >
    <!-- 顶部状态栏 -->
    <header class="flex flex-col items-center gap-1.5 w-full">
      <span class="text-[11px] text-slate-500">中国移动 5G</span>
      <span class="mt-2.5 text-sm font-medium text-slate-400 tracking-wider">{{
        ringing ? '来电中…' : '通话中'
      }}</span>
      <span v-if="!ringing" class="font-mono text-[13px] text-sky-400">{{ duration }}</span>
    </header>

    <!-- 来电人基本信息 -->
    <div class="flex flex-col items-center text-center -mt-2.5">
      <div class="relative grid place-items-center w-[90px] h-[90px] mb-4">
        <span
          class="animate-[call-pulse_2.2s_cubic-bezier(0.2,0.8,0.2,1)_infinite] absolute -inset-2.5 rounded-full border border-sky-400/30"
          aria-hidden="true"
        />
        <span
          class="animate-[call-pulse_2.2s_cubic-bezier(0.2,0.8,0.2,1)_infinite] [animation-delay:0.6s] absolute -inset-5 rounded-full border border-sky-400/30 opacity-40"
          aria-hidden="true"
        />

        <div
          class="grid place-items-center w-[90px] h-[90px] rounded-full bg-slate-800 border-2 border-white/15 text-slate-500"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-[52px] h-[52px]">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
            />
          </svg>
        </div>
      </div>

      <strong class="text-[22px] font-semibold text-white">{{ creative.brand }}</strong>
      <span class="mt-1 text-[12.5px] text-slate-500">95017 官方服务专线</span>
      <p class="m-0 mt-2.5 text-[11.5px] text-slate-400">
        {{ creative.headline }}
      </p>

      <!-- 接通后的音频波形动态 -->
      <div v-if="!ringing" class="flex items-center gap-1 h-5 mt-4" aria-hidden="true">
        <span
          class="animate-[wave-bounce_1s_ease-in-out_infinite] [animation-delay:0.1s] w-[3px] bg-sky-400 rounded-full h-2"
        />
        <span
          class="animate-[wave-bounce_1s_ease-in-out_infinite] [animation-delay:0.3s] w-[3px] bg-sky-400 rounded-full h-4"
        />
        <span
          class="animate-[wave-bounce_1s_ease-in-out_infinite] [animation-delay:0.5s] w-[3px] bg-sky-400 rounded-full h-5"
        />
        <span
          class="animate-[wave-bounce_1s_ease-in-out_infinite] [animation-delay:0.2s] w-[3px] bg-sky-400 rounded-full h-3"
        />
        <span
          class="animate-[wave-bounce_1s_ease-in-out_infinite] [animation-delay:0.4s] w-[3px] bg-sky-400 rounded-full h-1.5"
        />
      </div>
    </div>

    <!-- 通话按键面板 -->
    <div class="grid grid-cols-4 gap-4 w-full max-w-[290px]" aria-hidden="true">
      <div class="flex flex-col items-center gap-1.5">
        <span
          class="grid place-items-center w-[46px] h-[46px] rounded-full bg-white/[0.08] text-[17px]"
          >⏰</span
        >
        <span class="text-[10px] text-slate-500">稍后提醒</span>
      </div>
      <div class="flex flex-col items-center gap-1.5">
        <span
          class="grid place-items-center w-[46px] h-[46px] rounded-full bg-white/[0.08] text-[17px]"
          >💬</span
        >
        <span class="text-[10px] text-slate-500">信息回复</span>
      </div>
      <div class="flex flex-col items-center gap-1.5">
        <span
          class="grid place-items-center w-[46px] h-[46px] rounded-full bg-white/[0.08] text-[17px]"
          >🔊</span
        >
        <span class="text-[10px] text-slate-500">免提</span>
      </div>
      <div class="flex flex-col items-center gap-1.5">
        <span
          class="grid place-items-center w-[46px] h-[46px] rounded-full bg-white/[0.08] text-[17px]"
          >🔇</span
        >
        <span class="text-[10px] text-slate-500">静音</span>
      </div>
    </div>

    <!-- 接听与挂断按键 -->
    <div class="flex justify-around w-full max-w-[270px]" aria-hidden="true">
      <div class="flex flex-col items-center gap-2">
        <span class="grid place-items-center w-16 h-16 rounded-full bg-red-600 text-white">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
            <path
              d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 0 1 0-1.41C3.28 8.64 7.42 7 12 7s8.72 1.64 11.71 4.67c.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29s-.52-.11-.7-.28c-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"
            />
          </svg>
        </span>
        <span class="text-[11.5px] text-slate-400">拒绝</span>
      </div>

      <div v-if="ringing" class="flex flex-col items-center gap-2">
        <span
          class="animate-[accept-pulse_1.8s_ease-in-out_infinite] grid place-items-center w-16 h-16 rounded-full bg-green-600 text-white"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
            <path
              d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1.01A11.36 11.36 0 0 1 8.5 3.93c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.55c0-.55-.45-1-.99-1z"
            />
          </svg>
        </span>
        <span class="text-[11.5px] text-slate-400">接听</span>
      </div>
    </div>
  </div>
</template>
