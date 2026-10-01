<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEventListener } from '@vueuse/core'
import { useStormStore } from '@/stores/storm'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useStormLoop } from '@/composables/useStormLoop'
import { useCallAudio } from '@/composables/useCallAudio'
import { useShakeSource } from '@/composables/useShakeSource'
import DeviceShell from '@/components/shell/DeviceShell.vue'
import EscapeHatch from '@/components/chrome/EscapeHatch.vue'
import AudioControls from '@/components/chrome/AudioControls.vue'
import ShakeHint from '@/components/chrome/ShakeHint.vue'
import TruthPanel from '@/components/truth/TruthPanel.vue'

const storm = useStormStore()
const { phase } = storeToRefs(storm)

useReducedMotion()
useStormLoop()
useCallAudio()
// 采集层在这里挂载一次；提示控件只是它的一个表现面
const { needsPermission, requestMotionPermission, simulate } = useShakeSource()

/**
 * Esc 等效于"结束体验"。
 * 一个故意骚扰用户的页面如果把人困住，它本身就成了它要批判的东西。
 *
 * 用 `useEventListener` 而不是手写 add/removeEventListener：清理跟着 effect scope 走，
 * 不会因为漏写 onBeforeUnmount 而在热更新后累积监听器。
 */
useEventListener(window, 'keydown', (event) => {
  if (event.key === 'Escape') {
    if (storm.landingOpen) {
      storm.closeLanding()
    } else {
      storm.enterTruth()
    }
  }
})
</script>

<template>
  <div class="app-root">
    <DeviceShell v-if="phase !== 'truth'" />
    <TruthPanel v-else />
    <EscapeHatch v-if="phase === 'storm' || phase === 'collapsed'" />
    <AudioControls v-if="phase === 'storm' || phase === 'collapsed'" />
    <!-- 摇一摇只在风暴阶段生效，所以提示也只在风暴阶段出现 -->
    <ShakeHint
      v-if="phase === 'storm'"
      :needs-permission="needsPermission"
      @request="requestMotionPermission()"
      @simulate="simulate()"
    />
  </div>
</template>

<style scoped>
.app-root {
  position: fixed;
  inset: 0;
}
</style>
