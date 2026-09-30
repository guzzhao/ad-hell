<script setup lang="ts">
import type { AdCreative } from '@/types/ad'

defineProps<{ creative: AdCreative }>()
</script>

<template>
  <div class="ad-banner">
    <span class="ad-banner__tag">广告</span>
    <span class="ad-banner__mark" aria-hidden="true">{{ creative.brand.slice(0, 1) }}</span>
    <div class="ad-banner__text">
      <strong>{{ creative.headline }}</strong>
      <small>{{ creative.subline }}</small>
      <span v-if="creative.badge" class="creative-badge ad-banner__badge">
        {{ creative.badge }}
      </span>
    </div>
    <span class="ad-banner__cta">{{ creative.cta }}</span>
  </div>
</template>

<style scoped>
.ad-banner {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 100%;
  padding: 0 13px;
  /* 不再是纯色块：上提亮、下压暗，色块才有"材质"而不是一块色板 */
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--ad-bg) 88%, #ffffff) 0%,
    var(--ad-bg) 44%,
    color-mix(in srgb, var(--ad-bg) 80%, #000000) 100%
  );
  color: var(--ad-fg);
}

.ad-banner__tag {
  flex: none;
  align-self: flex-start;
  margin-top: 7px;
  padding: 0 4px;
  border: 1px solid currentColor;
  border-radius: 3px;
  font-size: 8px;
  opacity: 0.7;
}

.ad-banner__mark {
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--ad-accent);
  color: #14161a;
  font-size: 17px;
  font-weight: 800;
}

.ad-banner__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.ad-banner__text strong {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ad-banner__text small {
  font-size: 10px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ad-banner__badge {
  align-self: flex-start;
  margin-top: 3px;
}

.ad-banner__cta {
  flex: none;
  margin-left: auto;
  padding: 6px 11px;
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
  white-space: nowrap;
  box-shadow: 0 4px 10px -4px rgba(0, 0, 0, 0.55);
}
</style>
