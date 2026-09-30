<script setup lang="ts">
import { findCreative } from '@/data/creatives'

const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+']
const ad = findCreative('game-legend')
</script>

<template>
  <div class="calc">
    <div class="calc__display">
      <span class="calc__expr">128 × 47</span>
      <span class="calc__result">6 016</span>
    </div>

    <div class="calc__pad">
      <button
        v-for="key in keys"
        :key="key"
        type="button"
        class="calc__key"
        :class="{ 'is-op': '÷×−+='.includes(key) }"
      >
        {{ key }}
      </button>

      <!-- 键盘下半部分被广告盖住：按不到的地方，正好是最常用的数字键 -->
      <div
        v-if="ad"
        class="calc__ad"
        :style="{
          '--ad-bg': ad.palette.bg,
          '--ad-fg': ad.palette.fg,
          '--ad-accent': ad.palette.accent,
        }"
      >
        <span class="calc__ad-tag">广告</span>
        <strong>{{ ad.headline }}</strong>
        <span class="calc__ad-cta">{{ ad.cta }}</span>
      </div>
    </div>

    <p class="calc__caption">
      计算器也要看广告。想按 0，先关掉它——可它的关闭键在右上角，只有 9px 高。
    </p>
  </div>
</template>

<style scoped>
.calc__display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  padding: 18px 6px 20px;
}

.calc__expr {
  font-size: 13px;
  color: rgba(242, 244, 248, 0.4);
  font-variant-numeric: tabular-nums;
}

.calc__result {
  font-size: 38px;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
}

.calc__pad {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
}

.calc__key {
  height: 52px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 18px;
  font-weight: 400;
  color: #eef1f6;
}

.calc__key.is-op {
  background: rgba(255, 213, 74, 0.14);
  color: #ffd54a;
}

.calc__ad {
  position: absolute;
  left: -6px;
  right: -6px;
  bottom: -6px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 13px;
  border-radius: 14px;
  background: var(--ad-bg);
  color: var(--ad-fg);
  box-shadow: 0 14px 30px -14px rgba(0, 0, 0, 0.85);
}

.calc__ad-tag {
  flex: none;
  padding: 1px 5px;
  border: 1px solid currentColor;
  border-radius: 4px;
  font-size: 9px;
  opacity: 0.75;
}

.calc__ad strong {
  font-size: 13px;
  font-weight: 700;
}

.calc__ad-cta {
  margin-left: auto;
  padding: 6px 11px;
  border-radius: 999px;
  background: var(--ad-accent);
  color: #14161a;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.calc__caption {
  margin: 24px 0 0;
  font-size: 11.5px;
  line-height: 1.65;
  color: rgba(242, 244, 248, 0.5);
}
</style>
