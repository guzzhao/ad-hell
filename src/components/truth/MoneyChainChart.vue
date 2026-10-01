<script setup lang="ts">
import { onMounted, ref } from 'vue'

/**
 * 变现链条。数字全部来自报道，不做任何自行推算或夸大（prd.md R6 / AC9）。
 */
const unitPrices = [
  { label: '千次展示', value: '≈ 30', unit: '元' },
  { label: '单次点击', value: '≈ 2.5', unit: '元' },
]

// 挂载后再展开进度条，让"150 万"这个数字有落地的动作
const shown = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    shown.value = true
  })
})
</script>

<template>
  <div class="chain">
    <div class="chain__units grid grid-cols-2 gap-3">
      <div
        v-for="item in unitPrices"
        :key="item.label"
        class="chain__unit p-4 sm:p-[18px] rounded-[14px] bg-white/[0.05] border border-white/[0.08]"
      >
        <span class="chain__unit-label block text-xs text-[#98a0b0]">{{ item.label }}</span>
        <span
          class="chain__unit-value block mt-1.5 font-mono text-3xl font-bold tracking-tight text-white"
        >
          {{ item.value
          }}<small class="ml-1 text-sm font-medium text-[#98a0b0]">{{ item.unit }}</small>
        </span>
      </div>
    </div>

    <p class="chain__derive mt-6 text-sm leading-[1.9] text-[#98a0b0]">
      日活 <b class="text-[#e8eaef] font-semibold">100 万</b> 的应用，每天触发
      <b class="text-[#e8eaef] font-semibold">3 次</b>弹窗
      <span aria-hidden="true">→</span>
      <b class="chain__result font-semibold text-[#ffd54a]">月收益可达 150 万元以上</b>
    </p>

    <div class="chain__bar mt-3.5 h-[34px] rounded-[10px] bg-white/[0.06] overflow-hidden">
      <div
        class="chain__bar-fill flex items-center justify-end h-full pr-3 rounded-[10px] bg-gradient-to-r from-[#ff8a3d] to-[#e23b2e] transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
        :style="{ width: shown ? '100%' : '0%' }"
      >
        <span class="chain__bar-label font-mono text-[13px] font-bold text-white whitespace-nowrap"
          >150 万元 / 月</span
        >
      </div>
    </div>

    <p class="chain__source mt-3.5 text-[11.5px] text-[#5d6675]">
      数据引自央视新闻相关报道，为报道中引述的行业数字。
    </p>
  </div>
</template>
