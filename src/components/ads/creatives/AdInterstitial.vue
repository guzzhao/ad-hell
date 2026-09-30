<script setup lang="ts">
import type { AdCreative } from '@/types/ad'

defineProps<{ creative: AdCreative }>()
</script>

<template>
  <div class="ad-inter">
    <div class="ad-inter__hero" aria-hidden="true">
      <span class="ad-inter__mark">{{ creative.brand.slice(0, 1) }}</span>
    </div>
    <div class="ad-inter__body">
      <span class="ad-inter__tag">广告 · {{ creative.category }}</span>
      <strong>{{ creative.headline }}</strong>
      <small>{{ creative.subline }}</small>
      <span class="ad-inter__cta">{{ creative.cta }}</span>
    </div>
  </div>
</template>

<style scoped>
.ad-inter {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--ad-bg);
  color: var(--ad-fg);
  border-radius: 16px;
  overflow: hidden;
}

.ad-inter__hero {
  display: grid;
  place-items: center;
  flex: 0 0 38%;
  background: linear-gradient(150deg, var(--ad-accent) 0%, transparent 130%);
}

.ad-inter__mark {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 15px;
  background: var(--ad-bg);
  font-size: 26px;
  font-weight: 800;
}

.ad-inter__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 14px 13px;
}

.ad-inter__tag {
  align-self: flex-start;
  padding: 1px 5px;
  border: 1px solid currentColor;
  border-radius: 4px;
  font-size: 8.5px;
  opacity: 0.72;
}

.ad-inter__body strong {
  margin-top: 7px;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
}

.ad-inter__body small {
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.85;
  line-height: 1.5;
}

.ad-inter__cta {
  margin-top: auto;
  padding: 9px 0;
  text-align: center;
  border-radius: 999px;
  background: var(--ad-accent);
  color: #14161a;
  font-size: 13px;
  font-weight: 800;
}
</style>
