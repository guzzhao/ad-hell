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

function onTap(creativeId?: string): void {
  storm.tapAdBody(creativeId)
}
</script>

<template>
  <div class="ad-layer absolute inset-0 z-[100] pointer-events-none">
    <TransitionGroup name="ad">
      <AdPopup v-for="ad in ads" :key="ad.id" :ad="ad" @close="onClose" @tap="onTap" />
    </TransitionGroup>
  </div>
</template>
