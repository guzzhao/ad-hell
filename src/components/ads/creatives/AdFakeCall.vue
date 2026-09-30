<script setup lang="ts">
import type { AdCreative } from '@/types/ad'

defineProps<{ creative: AdCreative }>()
</script>

<template>
  <!--
    伪装来电。对应报道里"不停弹出伪装成『女儿来电』的广告视频，且无法关闭"。
    这条素材的关闭变体是 none —— 屏幕上根本没有关闭键，只能等它被后来的弹窗盖住。
  -->
  <div class="ad-call">
    <span class="ad-call__state">来电中…</span>

    <div class="ad-call__center">
      <span class="ad-call__avatar" aria-hidden="true">{{ creative.brand.slice(0, 1) }}</span>
      <strong class="ad-call__name">{{ creative.brand }}</strong>
      <small class="ad-call__headline">{{ creative.headline }}</small>
    </div>

    <div class="ad-call__actions" aria-hidden="true">
      <span class="ad-call__btn ad-call__btn--decline">✕</span>
      <span class="ad-call__btn ad-call__btn--accept">✆</span>
    </div>

    <span class="ad-call__foot">广告 · {{ creative.category }} · 本页所有品牌均为虚构</span>
  </div>
</template>

<style scoped>
.ad-call {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 76px 26px 34px;
  background: linear-gradient(180deg, #16202c 0%, var(--ad-bg) 55%, #05080c 100%);
  color: var(--ad-fg);
}

.ad-call__state {
  font-size: 13px;
  letter-spacing: 0.1em;
  opacity: 0.66;
}

.ad-call__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 34px;
}

.ad-call__avatar {
  display: grid;
  place-items: center;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: var(--ad-accent);
  color: #14161a;
  font-size: 46px;
  font-weight: 800;
  box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.05);
}

.ad-call__name {
  margin-top: 20px;
  font-size: 28px;
  font-weight: 700;
}

.ad-call__headline {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.7;
}

.ad-call__actions {
  display: flex;
  gap: 62px;
  margin-top: auto;
}

.ad-call__btn {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  font-size: 24px;
}

.ad-call__btn--decline {
  background: #e23b2e;
  color: #fff;
}

.ad-call__btn--accept {
  background: #2fa84f;
  color: #fff;
}

.ad-call__foot {
  margin-top: 22px;
  font-size: 9.5px;
  opacity: 0.42;
}
</style>
