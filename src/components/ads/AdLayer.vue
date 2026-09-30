<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'
import AdPopup from './AdPopup.vue'

const storm = useStormStore()
const { ads } = storeToRefs(storm)

function onClose(id: number): void {
  // 关闭键被点中了。至于到底关不关得掉，由引擎按 closeVariant 判定。
  storm.attemptClose(id, true)
}

function onTap(): void {
  storm.tapAdBody()
}
</script>

<template>
  <div class="ad-layer">
    <TransitionGroup name="ad">
      <AdPopup v-for="ad in ads" :key="ad.id" :ad="ad" @close="onClose" @tap="onTap" />
    </TransitionGroup>
  </div>
</template>

<!--
  这里刻意不用 scoped：过渡类名由 TransitionGroup 加到**子组件根元素**上，
  全局样式最稳妥，不受 scoped 属性选择器的影响。

  z-index 100 让弹窗层盖住手机内的一切（状态栏 40、App 内容），
  但仍低于「结束体验」出口（1000）与页内假落地页（900）。
-->
<style>
.ad-layer {
  position: absolute;
  inset: 0;
  z-index: 100;
  pointer-events: none;
}

.ad-enter-active {
  animation: ad-pop-in 240ms cubic-bezier(0.2, 1.35, 0.4, 1) both;
}

.ad-leave-active {
  animation: ad-pop-out 150ms ease-in both;
}

@keyframes ad-pop-in {
  from {
    opacity: 0;
    transform: scale(0.82);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes ad-pop-out {
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>
