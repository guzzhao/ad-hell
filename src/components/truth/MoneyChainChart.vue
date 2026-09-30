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
    <div class="chain__units">
      <div v-for="item in unitPrices" :key="item.label" class="chain__unit">
        <span class="chain__unit-label">{{ item.label }}</span>
        <span class="chain__unit-value">
          {{ item.value }}<small>{{ item.unit }}</small>
        </span>
      </div>
    </div>

    <p class="chain__derive">
      日活 <b>100 万</b> 的应用，每天触发 <b>3 次</b>弹窗
      <span aria-hidden="true">→</span>
      <b class="chain__result">月收益可达 150 万元以上</b>
    </p>

    <div class="chain__bar">
      <div class="chain__bar-fill" :style="{ width: shown ? '100%' : '0%' }">
        <span class="chain__bar-label">150 万元 / 月</span>
      </div>
    </div>

    <p class="chain__source">数据引自央视新闻相关报道，为报道中引述的行业数字。</p>
  </div>
</template>

<style scoped>
.chain__units {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.chain__unit {
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.chain__unit-label {
  display: block;
  font-size: 12px;
  color: var(--ink-dim);
}

.chain__unit-value {
  display: block;
  margin-top: 6px;
  font-family: var(--font-num);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.chain__unit-value small {
  margin-left: 3px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-dim);
}

.chain__derive {
  margin: 24px 0 0;
  font-size: 14px;
  line-height: 1.9;
  color: var(--ink-dim);
}

.chain__derive b {
  color: var(--ink);
  font-weight: 600;
}

.chain__result {
  color: #ffd54a !important;
}

.chain__bar {
  margin-top: 14px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.chain__bar-fill {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding-right: 12px;
  border-radius: 10px;
  background: linear-gradient(90deg, #ff8a3d 0%, #e23b2e 100%);
  transition: width 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}

.chain__bar-label {
  font-family: var(--font-num);
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.chain__source {
  margin: 14px 0 0;
  font-size: 11.5px;
  color: var(--ink-faint);
}
</style>
