<script setup lang="ts">
import { computed } from 'vue'
import { findCreative } from '@/data/creatives'

/**
 * App 内部的"原生广告位"。
 *
 * 风暴弹窗（AdLayer）是覆盖在全屏之上的独立图层；这个组件是**长在 App 界面里**的
 * 广告位。两者一起构成"这个 App 本身已经被广告占领"的观感——
 * 只有 A 类（现实中本该无广告的）App 会用到它。
 */
const props = defineProps<{ creativeId: string; caption?: string }>()

const creative = computed(() => findCreative(props.creativeId))
</script>

<template>
  <figure v-if="creative" class="in-app-ad">
    <div
      class="in-app-ad__card"
      :style="{
        '--ad-bg': creative.palette.bg,
        '--ad-fg': creative.palette.fg,
        '--ad-accent': creative.palette.accent,
      }"
    >
      <span class="in-app-ad__tag">广告</span>
      <div class="in-app-ad__text">
        <strong>{{ creative.headline }}</strong>
        <small>{{ creative.subline }}</small>
      </div>
      <span class="in-app-ad__cta">{{ creative.cta }}</span>
    </div>
    <figcaption v-if="caption" class="in-app-ad__caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.in-app-ad {
  margin: 16px 0;
}

.in-app-ad__card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 13px;
  background: var(--ad-bg);
  color: var(--ad-fg);
  box-shadow: 0 8px 22px -12px rgba(0, 0, 0, 0.7);
}

.in-app-ad__tag {
  flex: none;
  align-self: flex-start;
  padding: 1px 5px;
  border: 1px solid currentColor;
  border-radius: 4px;
  font-size: 9px;
  opacity: 0.75;
}

.in-app-ad__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.in-app-ad__text strong {
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.3;
}

.in-app-ad__text small {
  font-size: 10.5px;
  opacity: 0.82;
}

.in-app-ad__cta {
  flex: none;
  margin-left: auto;
  padding: 6px 11px;
  border-radius: 999px;
  background: var(--ad-accent);
  color: #14161a;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.in-app-ad__caption {
  margin: 7px 2px 0;
  font-size: 11px;
  line-height: 1.6;
  color: rgba(242, 244, 248, 0.5);
}
</style>
