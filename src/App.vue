<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useStormLoop } from '@/composables/useStormLoop'
import DeviceShell from '@/components/shell/DeviceShell.vue'
import EscapeHatch from '@/components/chrome/EscapeHatch.vue'
import TruthPanel from '@/components/truth/TruthPanel.vue'

const storm = useStormStore()
const { phase } = storeToRefs(storm)

useReducedMotion()
useStormLoop()

/**
 * Esc 等效于"结束体验"。
 * 一个故意骚扰用户的页面如果把人困住，它本身就成了它要批判的东西。
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') storm.enterTruth()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="app-root">
    <DeviceShell v-if="phase !== 'truth'" />
    <TruthPanel v-else />
    <EscapeHatch v-if="phase === 'storm' || phase === 'collapsed'" />
  </div>
</template>

<style scoped>
.app-root {
  position: fixed;
  inset: 0;
}
</style>
