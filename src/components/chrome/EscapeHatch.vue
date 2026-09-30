<script setup lang="ts">
import { useStormStore } from '@/stores/storm'

/**
 * 常驻的逃生通道。
 *
 * 这个页面是**故意**让人烦躁的，所以爱好者必须随时能出去：
 * 一个把用户困住的"反广告"页面，本身就成了它要批判的那种东西。
 *
 * 它刻意做成"网页控件"的样子（深色胶囊 + 明确文字），而不是模仿手机 UI，
 * 以免和弹窗的关闭键混在一起 —— 那会变成另一种误导。
 */
const storm = useStormStore()
</script>

<template>
  <div class="escape">
    <button type="button" class="escape__btn" @click="storm.enterTruth()">
      <span class="escape__label">结束体验</span>
      <kbd class="escape__kbd" aria-hidden="true">Esc</kbd>
    </button>
  </div>
</template>

<style scoped>
.escape {
  position: fixed;
  top: calc(10px + env(safe-area-inset-top, 0px));
  right: calc(10px + env(safe-area-inset-right, 0px));
  /* 高于弹窗层（100）与页内假落地页（900） */
  z-index: 1000;
}

.escape__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  /* 触控目标下限 44px */
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(12, 15, 20, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #eef1f6;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.9);
}

.escape__btn:active {
  background: rgba(30, 36, 46, 0.92);
}

.escape__kbd {
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.12);
  font-family: var(--font-num);
  font-size: 10px;
  letter-spacing: 0.04em;
  opacity: 0.75;
}
</style>
