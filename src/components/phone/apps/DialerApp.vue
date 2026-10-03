<script setup lang="ts">
import { ref } from 'vue'
import { findCreative } from '@/data/creatives'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()
const ad = findCreative('splash-mall')
const showCallEndAd = ref(false)

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
  showCallEndAd.value = false
  setTimeout(() => {
    if (calling.value) {
      handleHangUp()
    }
  }, 4000)
}

function handleHangUp(): void {
  calling.value = false
  if (storm.adsEnabled) {
    showCallEndAd.value = true
  }
}
</script>

<template>
  <div>
    <!-- 黄页企业推广广告条 -->
    <div
      v-if="storm.adsEnabled"
      class="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-400/25 text-blue-200 text-xs mb-2 cursor-pointer hover:bg-blue-500/20 transition-all"
      @click="storm.tapAdBody('loan-quota')"
    >
      <div class="flex items-center gap-1.5 truncate">
        <span class="text-sm">💼</span>
        <span class="truncate">黄页精选：钱多多金融 · 额度随借随还</span>
      </div>
      <span class="text-[10px] text-blue-300 font-bold shrink-0 underline ml-2">查额度 ›</span>
    </div>

    <!-- 呼叫状态或输入号码显示 -->
    <div class="flex flex-col items-center justify-center h-[70px] mb-2">
      <p
        class="text-[11px] min-h-[16px] font-medium"
        :class="calling ? 'text-[#22c55e] font-semibold' : 'text-[#3b82f6]'"
      >
        {{ calling ? '正在呼叫…' : number ? '添加号码' : '' }}
      </p>
      <p
        class="mt-0.5 text-center text-[32px] font-light tracking-[0.04em] tabular-nums min-h-[38px]"
      >
        {{ number || ' ' }}
      </p>
    </div>

    <!-- 真实九宫格按键 -->
    <div class="grid grid-cols-3 gap-x-4 gap-y-3">
      <button
        v-for="key in pad"
        :key="key"
        type="button"
        class="flex flex-col items-center justify-center gap-px h-[60px] rounded-full bg-white/[0.09] cursor-pointer transition-all duration-120 active:bg-white/25 active:scale-[0.94]"
        @click="handleInput(key)"
      >
        <span class="text-[22px] leading-none font-normal">{{ key }}</span>
        <span class="text-[8.5px] tracking-[0.12em] text-[rgba(242,244,248,0.45)] min-h-[10px]">{{
          letters[key] ?? ''
        }}</span>
      </button>
    </div>

    <!-- 拨打与删除动作行 -->
    <div class="relative mt-[18px] flex items-center justify-center gap-5">
      <div class="w-12" />
      <button
        type="button"
        class="w-[62px] h-[62px] rounded-full text-2xl grid place-items-center cursor-pointer transition-all duration-150 active:scale-[0.94]"
        :class="calling ? 'bg-[#ef4444] rotate-[135deg]' : 'bg-[#22c55e] active:bg-[#16a34a]'"
        :aria-label="calling ? '挂断' : '拨打'"
        @click="calling ? handleHangUp() : handleCall()"
      >
        📞
      </button>
      <button
        v-if="number"
        type="button"
        class="w-12 h-12 rounded-full grid place-items-center text-xl text-white/65 cursor-pointer active:text-white"
        aria-label="删除"
        @click="handleBackspace"
      >
        ⌫
      </button>
      <div v-else class="w-12" />

      <!-- 广告覆盖位（保留组件，当前阶段打磨原生界面，由 adsEnabled 控制显示） -->
      <div
        v-if="storm.adsEnabled && ad"
        class="absolute -left-2 -right-2 -top-3.5 flex flex-col gap-0.75 px-[15px] py-4 rounded-[15px] shadow-[0_16px_34px_-14px_rgba(0,0,0,0.85)] cursor-pointer"
        :style="{
          background: ad.palette.bg,
          color: ad.palette.fg,
        }"
        @click="storm.tapAdBody(ad.id)"
      >
        <span class="self-end text-[9px] text-white/55">跳过 5s</span>
        <strong class="text-base font-extrabold">{{ ad.headline }}</strong>
        <small class="text-[11px] opacity-85">{{ ad.subline }}</small>
        <span
          class="self-start mt-1.5 px-[13px] py-1.5 rounded-full text-[#14161a] text-[11.5px] font-bold"
          :style="{ background: ad.palette.accent }"
          >{{ ad.cta }}</span
        >
      </div>
    </div>

    <div
      class="mt-[62px] mx-auto w-full py-[11px] text-center rounded-full border border-[rgba(226,59,46,0.5)] text-[#ff9c8f] text-[13px] font-semibold"
      aria-hidden="true"
    >
      紧急呼叫
    </div>

    <!-- 挂断电话触发：通话满意度有礼 / 理财推广弹窗 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-90"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="storm.adsEnabled && showCallEndAd"
        class="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-5 select-none"
        @click.self="showCallEndAd = false"
      >
        <div
          class="relative w-full max-w-[270px] rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 p-4 text-white text-center shadow-2xl border border-indigo-400/30"
        >
          <button
            type="button"
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 text-white/60 text-xs grid place-items-center cursor-pointer"
            aria-label="关闭"
            @click="showCallEndAd = false"
          >
            ✕
          </button>
          <span class="text-3xl block my-1">📞</span>
          <h4 class="text-sm font-bold text-white">通话已结束</h4>
          <p class="text-[11px] text-indigo-200/80 mt-1">感谢使用！参与通话满意度评价</p>
          <div class="my-2.5 p-2 rounded-xl bg-white/10 border border-white/10">
            <span class="text-[11px] text-amber-300 font-bold">送 20 元无门槛话费充值券</span>
          </div>
          <button
            type="button"
            class="w-full py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-extrabold text-xs shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all"
            @click="storm.tapAdBody('dialer-finance')"
          >
            立即领取礼券 ›
          </button>
          <span class="block mt-1.5 text-[8.5px] text-white/40">赞助商推广 · 点击将唤起领券页</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
