<script setup lang="ts">
import { computed, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import type { AdCreative } from '@/types/ad'
import { RING_MS } from '@/audio/synth'

/**
 * 全屏来电接听页。
 *
 * 这是广告**伪装成系统来电**的形态——报道里那条"不停弹出伪装成『女儿来电』的广告视频"。
 * 与前作 `AdFakeCall.vue` 的区别是它是**全屏接管**（`surface: 'takeover'`）：
 * 它盖住手机上的一切，包括正在弹出的那些弹窗。
 *
 * 计时器不是装饰：一个停在 00:00 的来电页一眼就是假的，
 * 而"它真的在计时"正是这类广告最让人心里发毛的地方。
 *
 * 前 `RING_MS` 是振铃，之后转成通话并开始计时——与 `synth.ts` 里声音从振铃切到
 * 人声用的是**同一个常量**。画面和声音必须同时切换，否则一眼就露馅。
 */
defineProps<{ creative: AdCreative }>()

const elapsedMs = ref(0)

// useIntervalFn 跟着 effect scope 清理，不需要手写 onBeforeUnmount。
useIntervalFn(() => {
  elapsedMs.value += 1000
}, 1000)

/** 还在响铃，还是已经接通。 */
const ringing = computed(() => elapsedMs.value < RING_MS)

/** 通话计时，形如 00:07。振铃阶段不计时。 */
const duration = computed(() => {
  const total = Math.max(0, Math.floor((elapsedMs.value - RING_MS) / 1000))
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return `${mm}:${ss}`
})
</script>

<template>
  <div class="call-page">
    <header class="call-page__top">
      <span class="call-page__state">{{ ringing ? '来电中…' : '通话中' }}</span>
      <span v-if="!ringing" class="call-page__timer" aria-hidden="true">{{ duration }}</span>
    </header>

    <div class="call-page__center">
      <div class="call-page__avatar-wrap">
        <!-- 两圈错开的扩散环，模拟"正在响铃" -->
        <span class="call-page__ring call-page__ring--inner" aria-hidden="true" />
        <span class="call-page__ring call-page__ring--outer" aria-hidden="true" />
        <span class="call-page__avatar" aria-hidden="true">{{ creative.brand.slice(0, 1) }}</span>
      </div>

      <strong class="call-page__name">{{ creative.brand }}</strong>
      <span class="call-page__category">{{ creative.category }}</span>

      <p class="call-page__pitch">{{ creative.headline }}</p>
      <p class="call-page__sub">{{ creative.subline }}</p>
    </div>

    <div class="call-page__actions" aria-hidden="true">
      <span class="call-page__btn call-page__btn--decline">✕</span>
      <span class="call-page__btn call-page__btn--accept">✆</span>
    </div>

    <footer class="call-page__foot">广告 · {{ creative.category }} · 本页所有品牌均为虚构</footer>
  </div>
</template>

<style scoped>
.call-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 68px 26px 32px;
  /* 真实来电页是深色的：深色背景更省电，也更"系统" */
  background:
    radial-gradient(
      120% 60% at 50% 22%,
      color-mix(in srgb, var(--ad-bg) 62%, transparent),
      transparent 70%
    ),
    linear-gradient(180deg, #131a24 0%, #0a0e14 62%, #05070a 100%);
  color: #f4f6fa;
  overflow: hidden;
}

.call-page__top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.call-page__state {
  font-size: 13px;
  letter-spacing: 0.16em;
  opacity: 0.62;
}

.call-page__timer {
  font-family: var(--font-num);
  font-size: 13px;
  letter-spacing: 0.06em;
  opacity: 0.82;
}

.call-page__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  text-align: center;
}

.call-page__avatar-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: 148px;
  height: 148px;
}

.call-page__avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: linear-gradient(
    160deg,
    var(--ad-accent) 0%,
    color-mix(in srgb, var(--ad-accent) 55%, #000) 100%
  );
  color: #12161c;
  font-size: 44px;
  font-weight: 800;
  box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.95);
}

.call-page__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--ad-accent) 55%, transparent);
  animation: call-ring 2600ms ease-out infinite;
}

.call-page__ring--inner {
  width: 104px;
  height: 104px;
}

.call-page__ring--outer {
  width: 104px;
  height: 104px;
  animation-delay: 1300ms;
}

@keyframes call-ring {
  from {
    transform: scale(1);
    opacity: 0.7;
  }
  to {
    transform: scale(1.42);
    opacity: 0;
  }
}

.call-page__name {
  margin-top: 22px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.call-page__category {
  margin-top: 7px;
  padding: 2px 9px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  font-size: 10px;
  opacity: 0.72;
}

.call-page__pitch {
  margin: 26px 0 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--ad-accent);
}

.call-page__sub {
  margin: 7px 0 0;
  font-size: 12.5px;
  line-height: 1.6;
  opacity: 0.68;
}

.call-page__actions {
  display: flex;
  gap: 64px;
  /* 推到底部，和真实来电页的按键位置一致 */
  margin-top: auto;
  padding-bottom: 26px;
}

.call-page__btn {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  font-size: 24px;
  box-shadow: 0 14px 30px -14px rgba(0, 0, 0, 0.95);
}

.call-page__btn--decline {
  background: #e5484d;
  color: #fff;
}

.call-page__btn--accept {
  background: #2fa84f;
  color: #fff;
}

.call-page__foot {
  font-size: 9.5px;
  letter-spacing: 0.02em;
  opacity: 0.4;
}

/* 扩散环属于"大幅位移/缩放"类动效，降低动效偏好下必须停掉（v1 R9 / AC8） */
@media (prefers-reduced-motion: reduce) {
  .call-page__ring {
    animation: none;
    opacity: 0.28;
  }
}
</style>
