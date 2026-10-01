<script setup lang="ts">
import { ref } from 'vue'
import { findCreative } from '@/data/creatives'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()
const ad = findCreative('splash-mall')

const number = ref('120')
const calling = ref(false)

const pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']
const letters: Record<string, string> = {
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
}

function handleInput(digit: string): void {
  if (calling.value) return
  if (number.value.length < 16) {
    number.value += digit
  }
}

function handleBackspace(): void {
  if (number.value.length > 0) {
    number.value = number.value.slice(0, -1)
  }
}

function handleCall(): void {
  if (!number.value) return
  calling.value = true
  setTimeout(() => {
    calling.value = false
  }, 3000)
}
</script>

<template>
  <div class="dialer">
    <!-- 呼叫状态或输入号码显示 -->
    <div class="dialer__display flex flex-col items-center justify-center h-[70px] mb-2">
      <p
        class="dialer__status text-[11px] min-h-[16px] font-medium"
        :class="calling ? 'is-active text-[#22c55e] font-semibold' : 'text-[#3b82f6]'"
      >
        {{ calling ? '正在呼叫…' : number ? '添加号码' : '' }}
      </p>
      <p
        class="dialer__number mt-0.5 text-center text-[32px] font-light tracking-[0.04em] tabular-nums min-h-[38px]"
      >
        {{ number || ' ' }}
      </p>
    </div>

    <!-- 真实九宫格按键 -->
    <div class="dialer__pad grid grid-cols-3 gap-x-4 gap-y-3">
      <button
        v-for="key in pad"
        :key="key"
        type="button"
        class="dialer__key flex flex-col items-center justify-center gap-px h-[60px] rounded-full bg-white/[0.09] cursor-pointer transition-all duration-120 active:bg-white/25 active:scale-[0.94]"
        @click="handleInput(key)"
      >
        <span class="dialer__digit text-[22px] leading-none font-normal">{{ key }}</span>
        <span
          class="dialer__letters text-[8.5px] tracking-[0.12em] text-[rgba(242,244,248,0.45)] min-h-[10px]"
          >{{ letters[key] ?? '' }}</span
        >
      </button>
    </div>

    <!-- 拨打与删除动作行 -->
    <div class="dialer__actions relative mt-[18px] flex items-center justify-center gap-5">
      <div class="dialer__action-spacer w-12" />
      <button
        type="button"
        class="dialer__call w-[62px] h-[62px] rounded-full text-2xl grid place-items-center cursor-pointer transition-all duration-150 active:scale-[0.94]"
        :class="
          calling ? 'is-calling bg-[#ef4444] rotate-[135deg]' : 'bg-[#22c55e] active:bg-[#16a34a]'
        "
        :aria-label="calling ? '挂断' : '拨打'"
        @click="calling ? (calling = false) : handleCall()"
      >
        📞
      </button>
      <button
        v-if="number"
        type="button"
        class="dialer__delete w-12 h-12 rounded-full grid place-items-center text-xl text-white/65 cursor-pointer active:text-white"
        aria-label="删除"
        @click="handleBackspace"
      >
        ⌫
      </button>
      <div v-else class="dialer__action-spacer w-12" />

      <!-- 广告覆盖位（保留组件，当前阶段打磨原生界面，由 adsEnabled 控制显示） -->
      <div
        v-if="storm.adsEnabled && ad"
        class="dialer__ad absolute -left-2 -right-2 -top-3.5 flex flex-col gap-0.75 px-[15px] py-4 rounded-[15px] shadow-[0_16px_34px_-14px_rgba(0,0,0,0.85)]"
        :style="{
          background: ad.palette.bg,
          color: ad.palette.fg,
        }"
      >
        <span class="dialer__ad-skip self-end text-[9px] text-white/55">跳过 5s</span>
        <strong class="text-base font-extrabold">{{ ad.headline }}</strong>
        <small class="text-[11px] opacity-85">{{ ad.subline }}</small>
        <span
          class="dialer__ad-cta self-start mt-1.5 px-[13px] py-1.5 rounded-full text-[#14161a] text-[11.5px] font-bold"
          :style="{ background: ad.palette.accent }"
          >{{ ad.cta }}</span
        >
      </div>
    </div>

    <div
      class="dialer__emergency mt-[62px] mx-auto w-full py-[11px] text-center rounded-full border border-[rgba(226,59,46,0.5)] text-[#ff9c8f] text-[13px] font-semibold"
      aria-hidden="true"
    >
      紧急呼叫
    </div>

    <p
      v-if="storm.adsEnabled"
      class="dialer__caption mt-4 text-[11.5px] leading-[1.7] text-[rgba(242,244,248,0.5)]"
    >
      拨号广告位（已保留，待启用）
    </p>
  </div>
</template>
