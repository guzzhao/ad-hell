<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'

/**
 * 音频相关的页面级控件。
 *
 * 与「结束体验」同属**页面控件层**（z-index 1000），因此永远盖在接管广告之上：
 * 这个页面是故意吵的，那就必须随手能把它按停——否则它本身就成了它要批判的东西。
 *
 * 它也刻意做成"网页控件"的样子，不模仿手机 UI，免得和广告的按钮混在一起。
 */
const storm = useStormStore()
const { muted, audioBlocked } = storeToRefs(storm)
</script>

<template>
  <div class="audio-controls">
    <button
      type="button"
      class="audio-controls__btn"
      :aria-pressed="muted"
      :aria-label="muted ? '取消静音' : '静音'"
      @click="storm.toggleMuted()"
    >
      <span class="audio-controls__icon" aria-hidden="true">{{ muted ? '🔇' : '🔊' }}</span>
      <span class="audio-controls__label">{{ muted ? '已静音' : '声音开' }}</span>
    </button>

    <!--
      浏览器不允许在用户交互前出声。这时如实告诉用户需要点一下，
      而不是让来电广告静悄悄地出现、让人以为页面坏了。
      不需要专门点这个提示：页面上任意一次点击都会解锁音频。
    -->
    <p v-if="audioBlocked" class="audio-controls__hint">点击页面任意处开启声音</p>
  </div>
</template>

<style scoped>
.audio-controls {
  position: fixed;
  top: calc(10px + env(safe-area-inset-top, 0px));
  left: calc(10px + env(safe-area-inset-left, 0px));
  /* 高于弹窗层（100）、接管层（700）与页内假落地页（900） */
  z-index: 1000;
}

.audio-controls__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  /* 触控目标下限 44px */
  min-height: 44px;
  padding: 0 13px;
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

.audio-controls__btn:active {
  background: rgba(30, 36, 46, 0.92);
}

.audio-controls__icon {
  font-size: 14px;
}

.audio-controls__hint {
  max-width: 200px;
  margin: 7px 0 0;
  padding: 5px 10px;
  border-radius: 9px;
  background: rgba(12, 15, 20, 0.82);
  color: #ffd54a;
  font-size: 11.5px;
  line-height: 1.5;
}
</style>
