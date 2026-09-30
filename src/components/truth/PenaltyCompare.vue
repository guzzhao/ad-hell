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
      <div class="penalty__head">
        <span>一个月能挣</span>
        <b>150 万元以上</b>
      </div>
      <div class="penalty__track">
        <div class="penalty__fill penalty__fill--gain" :style="{ width: shown ? '100%' : '0%' }" />
      </div>
    </div>

    <div class="penalty__row">
      <div class="penalty__head">
        <span>罚款上限</span>
        <b>3 万元</b>
      </div>
      <div class="penalty__track">
        <div class="penalty__fill penalty__fill--fine" :style="{ width: shown ? '2%' : '0%' }" />
      </div>
    </div>

    <p class="penalty__verdict">
      罚款上限大约是月收益的 <b>2%</b>。
      <span class="penalty__plain">换句话说，违法成本远低于收益。</span>
    </p>

    <ul class="penalty__facts">
      <li>违反广告管理办法的罚款，一般为 <b>5000 元以上、3 万元以下</b>。</li>
      <li>
        专家建议：对以弹窗广告为主要营业目标的主体，罚款可设为违法所得或经营数额的
        <b>1 至 2 倍</b>，并给用户便捷的投诉举报渠道。
      </li>
    </ul>
  </div>
</template>

<style scoped>
.penalty__row + .penalty__row {
  margin-top: 20px;
}

.penalty__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.penalty__head span {
  font-size: 13px;
  color: var(--ink-dim);
}

.penalty__head b {
  font-family: var(--font-num);
  font-size: 17px;
  font-weight: 700;
}

.penalty__track {
  height: 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.penalty__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}

.penalty__fill--gain {
  background: linear-gradient(90deg, #ff8a3d 0%, #e23b2e 100%);
}

.penalty__fill--fine {
  background: #4ade80;
  /* 2% 的宽度太窄，给个最小可见宽度，避免看起来像"没有罚款" */
  min-width: 6px;
}

.penalty__verdict {
  margin: 22px 0 0;
  font-size: 15px;
  line-height: 1.8;
}

.penalty__verdict b {
  font-family: var(--font-num);
  color: #ffd54a;
  font-size: 18px;
}

.penalty__plain {
  color: var(--ink-dim);
}

.penalty__facts {
  margin: 18px 0 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--ink-dim);
}

.penalty__facts b {
  color: var(--ink);
  font-weight: 600;
}
</style>
