<script setup lang="ts">
import { onMounted, ref } from 'vue'

/**
 * 违法成本对比。
 *
 * 罚款上限 3 万元 ÷ 月收益 150 万元 ≈ 2%。
 * 这个比例是本页最想让人记住的一件事，所以用长度直接画出来。
 */
const shown = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    shown.value = true
  })
})
</script>

<template>
  <div class="penalty">
    <div class="penalty__row">
      <div class="penalty__head flex items-baseline justify-between gap-3 mb-2">
        <span class="text-[13px] text-[#98a0b0]">一个月能挣</span>
        <b class="font-mono text-[17px] font-bold text-white">150 万元以上</b>
      </div>
      <div class="penalty__track h-3.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          class="penalty__fill penalty__fill--gain h-full rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e23b2e] transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
          :style="{ width: shown ? '100%' : '0%' }"
        />
      </div>
    </div>

    <div class="penalty__row mt-5">
      <div class="penalty__head flex items-baseline justify-between gap-3 mb-2">
        <span class="text-[13px] text-[#98a0b0]">罚款上限</span>
        <b class="font-mono text-[17px] font-bold text-white">3 万元</b>
      </div>
      <div class="penalty__track h-3.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          class="penalty__fill penalty__fill--fine h-full rounded-full bg-green-400 min-w-[6px] transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
          :style="{ width: shown ? '2%' : '0%' }"
        />
      </div>
    </div>

    <p class="penalty__verdict mt-[22px] text-[15px] leading-relaxed">
      罚款上限大约是月收益的 <b class="font-mono text-[#ffd54a] text-lg font-bold">2%</b>。
      <span class="penalty__plain text-[#98a0b0]">换句话说，违法成本远低于收益。</span>
    </p>

    <ul class="penalty__facts mt-[18px] pl-5 text-[13px] leading-[1.9] text-[#98a0b0] list-disc">
      <li>
        违反广告管理办法的罚款，一般为
        <b class="text-[#e8eaef] font-semibold">5000 元以上、3 万元以下</b>。
      </li>
      <li>
        专家建议：对以弹窗广告为主要营业目标的主体，罚款可设为违法所得或经营数额的
        <b class="text-[#e8eaef] font-semibold">1 至 2 倍</b>，并给用户便捷的投诉举报渠道。
      </li>
    </ul>
  </div>
</template>
