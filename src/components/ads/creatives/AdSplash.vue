<script setup lang="ts">
import type { AdCreative } from '@/types/ad'

defineProps<{ creative: AdCreative }>()
</script>

<template>
  <div class="ad-splash">
    <!-- 视觉上的"跳过"倒计时。它是装饰，不是可点控件：真正的关闭键由 CloseButton 决定 -->
    <span class="ad-splash__skip" aria-hidden="true">跳过 5s ›</span>

    <div class="ad-splash__center">
      <span class="ad-splash__mark">{{ creative.brand.slice(0, 1) }}</span>
      <span class="ad-splash__brand">{{ creative.brand }}</span>
      <strong>{{ creative.headline }}</strong>
      <small>{{ creative.subline }}</small>
      <span class="ad-splash__cta">{{ creative.cta }}</span>
    </div>

    <span class="ad-splash__foot">广告 · {{ creative.category }} · 本页所有品牌均为虚构</span>
  </div>
</template>

<style scoped>
.ad-splash {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 40px 26px 30px;
  background: var(--ad-bg);
  color: var(--ad-fg);
  overflow: hidden;
}

.ad-splash::after {
  content: '';
  position: absolute;
  inset: -30% -30% auto auto;
  width: 78%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, var(--ad-accent) 0%, transparent 68%);
  opacity: 0.35;
}

.ad-splash__skip {
  position: absolute;
  top: 16px;
  right: 14px;
  z-index: 2;
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.32);
  font-size: 11px;
}

.ad-splash__center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.ad-splash__mark {
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border-radius: 21px;
  background: var(--ad-accent);
  color: #14161a;
  font-size: 38px;
  font-weight: 800;
}

.ad-splash__brand {
  margin-top: 14px;
  font-size: 13px;
  letter-spacing: 0.16em;
  opacity: 0.85;
}

.ad-splash__center strong {
  margin-top: 10px;
  font-size: 27px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.ad-splash__center small {
  margin-top: 8px;
  font-size: 13px;
  opacity: 0.85;
}

.ad-splash__cta {
  margin-top: 22px;
  padding: 12px 34px;
  border-radius: 999px;
  background: var(--ad-accent);
  color: #14161a;
  font-size: 15px;
  font-weight: 800;
}

.ad-splash__foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  z-index: 1;
  text-align: center;
  font-size: 9.5px;
  opacity: 0.5;
}
</style>
