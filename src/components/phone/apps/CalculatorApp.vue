<script setup lang="ts">
import { ref } from 'vue'
import { findCreative } from '@/data/creatives'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()
const ad = findCreative('game-legend')
const showResultLoanAd = ref(false)

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
      display.value = String(Number(res.toFixed(8)))
      prevVal.value = null
      curOp.value = null
      resetNext.value = true
      showResultLoanAd.value = true
    }
    return
  }

  // 数字与小数点
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
  <div>
    <div class="flex flex-col items-end gap-1 px-1.5 pt-[18px] pb-3">
      <span class="text-[13px] text-[#f2f4f8]/40 tabular-nums">{{ expr }}</span>
      <span class="text-[38px] font-light tabular-nums text-white">{{ display }}</span>
    </div>

    <!-- 点击等号运算完成后：测算可借额度插屏卡片 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="storm.adsEnabled && showResultLoanAd"
        class="mb-3 px-3 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-lg flex items-center justify-between cursor-pointer border border-yellow-300/30"
        @click="storm.tapAdBody('loan-fast')"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xl shrink-0">💰</span>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-bold truncate">智能测算：您最高可借 200,000 元</span>
            <span class="text-[10px] text-yellow-100 opacity-90 truncate"
              >3分钟极速放款 · 日息低至 0.02%</span
            >
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 ml-2">
          <span
            class="px-2.5 py-1 rounded-full bg-yellow-300 text-red-950 font-black text-[11px] shadow-xs"
          >
            查额度
          </span>
          <button
            type="button"
            class="w-5 h-5 rounded-full bg-black/30 text-[10px] text-white/70 grid place-items-center cursor-pointer"
            aria-label="关闭"
            @click.stop="showResultLoanAd = false"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>

    <div class="relative flex flex-col gap-2.5">
      <div v-for="(row, rIdx) in keyRows" :key="rIdx" class="flex gap-2.5">
        <button
          v-for="key in row"
          :key="key"
          type="button"
          class="h-14 rounded-full text-xl font-medium text-white grid place-items-center transition-all select-none cursor-pointer active:scale-95 border-none"
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
        class="absolute -left-1.5 -right-1.5 -bottom-1.5 flex items-center gap-2 px-3 py-3 rounded-2xl shadow-[0_14px_30px_-14px_rgba(0,0,0,0.85)] bg-[var(--ad-bg)] text-[var(--ad-fg)] cursor-pointer"
        :style="{
          '--ad-bg': ad.palette.bg,
          '--ad-fg': ad.palette.fg,
          '--ad-accent': ad.palette.accent,
        }"
        @click="storm.tapAdBody(ad.id)"
      >
        <span class="shrink-0 px-1 py-px border border-current rounded text-[9px] opacity-75"
          >广告</span
        >
        <strong class="text-[13px] font-bold">{{ ad.headline }}</strong>
        <span
          class="ml-auto px-3 py-1.5 rounded-full bg-[var(--ad-accent)] text-[#14161a] text-[11px] font-bold whitespace-nowrap"
          >{{ ad.cta }}</span
        >
      </div>
    </div>
  </div>
</template>
