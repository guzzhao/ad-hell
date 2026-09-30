<script setup lang="ts">
import { findCreative } from '@/data/creatives'

const pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']
const letters: Record<string, string> = {
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
}
const ad = findCreative('splash-mall')
</script>

<template>
  <div class="dialer">
    <p class="dialer__number">120</p>

    <div class="dialer__pad">
      <button v-for="key in pad" :key="key" type="button" class="dialer__key">
        <span class="dialer__digit">{{ key }}</span>
        <span class="dialer__letters">{{ letters[key] ?? '' }}</span>
      </button>
    </div>

    <div class="dialer__actions">
      <button type="button" class="dialer__call" aria-label="拨打">📞</button>

      <!-- 紧急呼叫键正好被开屏广告盖住 -->
      <div
        v-if="ad"
        class="dialer__ad"
        :style="{
          '--ad-bg': ad.palette.bg,
          '--ad-fg': ad.palette.fg,
          '--ad-accent': ad.palette.accent,
        }"
      >
        <span class="dialer__ad-skip">跳过 5s</span>
        <strong>{{ ad.headline }}</strong>
        <small>{{ ad.subline }}</small>
        <span class="dialer__ad-cta">{{ ad.cta }}</span>
      </div>
    </div>

    <div class="dialer__emergency" aria-hidden="true">紧急呼叫</div>

    <p class="dialer__caption">
      报道里最要紧的一句提醒：真要打求救电话却被弹窗挡住时，大部分手机可以
      <strong>连按侧边键 5 次</strong>启动应急模式。
    </p>
  </div>
</template>

<style scoped>
.dialer__number {
  margin: 6px 0 14px;
  text-align: center;
  font-size: 30px;
  font-weight: 300;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
}

.dialer__pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 14px;
}

.dialer__key {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.dialer__digit {
  font-size: 20px;
  line-height: 1;
}

.dialer__letters {
  font-size: 8px;
  letter-spacing: 0.1em;
  color: rgba(242, 244, 248, 0.45);
  min-height: 10px;
}

.dialer__actions {
  position: relative;
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.dialer__call {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #2fa84f;
  font-size: 22px;
}

.dialer__ad {
  position: absolute;
  left: -8px;
  right: -8px;
  top: -14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 16px 15px;
  border-radius: 15px;
  background: var(--ad-bg);
  color: var(--ad-fg);
  box-shadow: 0 16px 34px -14px rgba(0, 0, 0, 0.85);
}

.dialer__ad-skip {
  align-self: flex-end;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.55);
}

.dialer__ad strong {
  font-size: 16px;
  font-weight: 800;
}

.dialer__ad small {
  font-size: 11px;
  opacity: 0.85;
}

.dialer__ad-cta {
  align-self: flex-start;
  margin-top: 6px;
  padding: 6px 13px;
  border-radius: 999px;
  background: var(--ad-accent);
  color: #14161a;
  font-size: 11.5px;
  font-weight: 700;
}

.dialer__emergency {
  margin: 62px auto 0;
  width: 100%;
  padding: 11px 0;
  text-align: center;
  border-radius: 999px;
  border: 1px solid rgba(226, 59, 46, 0.5);
  color: #ff9c8f;
  font-size: 13px;
  font-weight: 600;
}

.dialer__caption {
  margin: 16px 0 0;
  font-size: 11.5px;
  line-height: 1.7;
  color: rgba(242, 244, 248, 0.5);
}

.dialer__caption strong {
  color: #ffd54a;
}
</style>
