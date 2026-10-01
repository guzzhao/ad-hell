<script setup lang="ts">
import { ref } from 'vue'
import { findCreative } from '@/data/creatives'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()
const ad = findCreative('game-legend')

const display = ref('0')
const expr = ref('')
const prevVal = ref<number | null>(null)
const curOp = ref<string | null>(null)
const resetNext = ref(false)

function handleKey(key: string): void {
  if (key === 'C') {
    display.value = '0'
    expr.value = ''
    prevVal.value = null
    curOp.value = null
    resetNext.value = false
    return
  }

  if (key === '±') {
    if (display.value !== '0') {
      display.value = display.value.startsWith('-') ? display.value.slice(1) : `-${display.value}`
    }
    return
  }

  if (key === '%') {
    const num = parseFloat(display.value)
    display.value = String(num / 100)
    return
  }

  if ('÷×−+'.includes(key)) {
    prevVal.value = parseFloat(display.value)
    curOp.value = key
    expr.value = `${display.value} ${key}`
    resetNext.value = true
    return
  }

  if (key === '=') {
    if (prevVal.value !== null && curOp.value !== null) {
      const current = parseFloat(display.value)
      expr.value = `${prevVal.value} ${curOp.value} ${current} =`
      let res = 0
      switch (curOp.value) {
        case '+':
          res = prevVal.value + current
          break
        case '−':
          res = prevVal.value - current
          break
        case '×':
          res = prevVal.value * current
          break
        case '÷':
          res = current === 0 ? 0 : prevVal.value / current
          break
      }
      display.value = String(Math.round(res * 1e8) / 1e8)
      prevVal.value = null
      curOp.value = null
      resetNext.value = true
    }
    return
  }

  if (key === '.') {
    if (resetNext.value) {
      display.value = '0.'
      resetNext.value = false
      return
    }
    if (!display.value.includes('.')) {
      display.value += '.'
    }
    return
  }

  // 数字 0-9
  if (resetNext.value) {
    display.value = key
    resetNext.value = false
  } else {
    display.value = display.value === '0' ? key : display.value + key
  }
}

const keyRows = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]
</script>

<template>
  <div class="calc">
    <div class="calc__display flex flex-col items-end gap-1 px-1.5 pt-[18px] pb-5">
      <span class="calc__expr text-[13px] text-[#f2f4f8]/40 tabular-nums">{{ expr }}</span>
      <span class="calc__result text-[38px] font-light tabular-nums text-white">{{ display }}</span>
    </div>

    <div class="calc__pad relative flex flex-col gap-2.5">
      <div v-for="(row, rIdx) in keyRows" :key="rIdx" class="calc__row flex gap-2.5">
        <button
          v-for="key in row"
          :key="key"
          type="button"
          class="calc__key h-14 rounded-full text-xl font-medium text-white grid place-items-center transition-all select-none cursor-pointer active:scale-95 border-none"
          :class="[
            key === '0' ? 'flex-[2.15] pl-6 justify-start' : 'flex-1',
            '÷×−+='.includes(key)
              ? 'bg-amber-500 font-semibold active:bg-amber-600'
              : 'C±%'.includes(key)
                ? 'bg-white/20 font-semibold active:bg-white/30'
                : 'bg-white/10 active:bg-white/25',
          ]"
          @click="handleKey(key)"
        >
          {{ key }}
        </button>
      </div>

      <!-- 键盘下半部分广告位（保留组件，当前阶段打磨原生界面，由 adsEnabled 控制显示） -->
      <div
        v-if="storm.adsEnabled && ad"
        class="calc__ad absolute -left-1.5 -right-1.5 -bottom-1.5 flex items-center gap-2 px-3 py-3 rounded-2xl shadow-[0_14px_30px_-14px_rgba(0,0,0,0.85)] bg-[var(--ad-bg)] text-[var(--ad-fg)]"
        :style="{
          '--ad-bg': ad.palette.bg,
          '--ad-fg': ad.palette.fg,
          '--ad-accent': ad.palette.accent,
        }"
      >
        <span
          class="calc__ad-tag shrink-0 px-1 py-px border border-current rounded text-[9px] opacity-75"
          >广告</span
        >
        <strong class="text-[13px] font-bold">{{ ad.headline }}</strong>
        <span
          class="calc__ad-cta ml-auto px-3 py-1.5 rounded-full bg-[var(--ad-accent)] text-[#14161a] text-[11px] font-bold whitespace-nowrap"
          >{{ ad.cta }}</span
        >
      </div>
    </div>

    <p
      v-if="storm.adsEnabled"
      class="calc__caption mt-6 text-[11.5px] leading-relaxed text-[#f2f4f8]/50"
    >
      计算器广告位（已保留，待启用）
    </p>
  </div>
</template>
