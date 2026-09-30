<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEventListener } from '@vueuse/core'
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
 *
 * 用 `useEventListener` 而不是手写 add/removeEventListener：清理跟着 effect scope 走，
 * 不会因为漏写 onBeforeUnmount 而在热更新后累积监听器。
 */
useEventListener(window, 'keydown', (event) => {
  if (event.key === 'Escape') storm.enterTruth()
})
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
