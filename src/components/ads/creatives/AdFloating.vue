<script setup lang="ts">
import type { AdCreative } from '@/types/ad'

defineProps<{ creative: AdCreative }>()
</script>

<template>
  <div class="ad-float">
    <span class="ad-float__tag">广告</span>
    <strong>{{ creative.headline }}</strong>
    <small>{{ creative.subline }}</small>
    <span v-if="creative.badge" class="creative-badge ad-float__badge">
      {{ creative.badge }}
    </span>
    <span class="ad-float__cta">{{ creative.cta }}</span>
  </div>
</template>

<style scoped>
.ad-float {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 13px 14px 12px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--ad-bg) 88%, #ffffff) 0%,
    var(--ad-bg) 46%,
    color-mix(in srgb, var(--ad-bg) 80%, #000000) 100%
  );
  color: var(--ad-fg);
  border-radius: 14px;
  box-shadow: 0 14px 30px -16px rgba(0, 0, 0, 0.85);
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

.ad-float__badge {
  align-self: flex-start;
  margin-top: 7px;
}

.ad-float__cta {
  align-self: flex-start;
  margin-top: auto;
  padding: 6px 13px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--ad-accent) 78%, #ffffff) 0%,
    var(--ad-accent) 52%,
    color-mix(in srgb, var(--ad-accent) 84%, #000000) 100%
  );
  color: #14161a;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 4px 10px -4px rgba(0, 0, 0, 0.55);
}
</style>
