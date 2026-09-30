<script setup lang="ts">
import type { AdCreative } from '@/types/ad'

defineProps<{ creative: AdCreative }>()
</script>

<template>
  <div class="ad-float">
    <span class="ad-float__tag">广告</span>
    <strong>{{ creative.headline }}</strong>
    <small>{{ creative.subline }}</small>
    <span class="ad-float__cta">{{ creative.cta }}</span>
  </div>
</template>

<style scoped>
.ad-float {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 13px 14px 12px;
  background: var(--ad-bg);
  color: var(--ad-fg);
  border-radius: 14px;
}

.ad-float__tag {
  align-self: flex-start;
  padding: 0 4px;
  border: 1px solid currentColor;
  border-radius: 3px;
  font-size: 8px;
  opacity: 0.7;
}

.ad-float strong {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
}

.ad-float small {
  margin-top: 3px;
  font-size: 10.5px;
  opacity: 0.85;
}

.ad-float__cta {
  align-self: flex-start;
  margin-top: auto;
  padding: 6px 13px;
  border-radius: 999px;
  background: var(--ad-accent);
  color: #14161a;
  font-size: 11px;
  font-weight: 700;
}
</style>
