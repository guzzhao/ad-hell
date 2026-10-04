<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'
import AdPopup from './AdPopup.vue'

const storm = useStormStore()
const { ads } = storeToRefs(storm)

/** 只有 popup 呈现面的广告才由弹窗层渲染；takeover 呈现面由 TakeoverLayer 专属渲染 */
const popups = computed(() => ads.value.filter((ad) => ad.surface === 'popup'))

function onClose(id: number): void {
  // 关闭键被点中了。至于到底关不关得掉，由引擎按 closeVariant 判定。
  storm.attemptClose(id, true)
}

function onTap(creativeId?: string): void {
  storm.tapAdBody(creativeId)
}
</script>

<template>
  <div class="ad-layer absolute inset-0 z-[100] pointer-events-none">
    <TransitionGroup name="ad">
      <AdPopup v-for="ad in popups" :key="ad.id" :ad="ad" @close="onClose" @tap="onTap" />
    </TransitionGroup>
  </div>
</template>
