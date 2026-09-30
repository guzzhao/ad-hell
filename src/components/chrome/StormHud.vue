<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'

/**
 * 克制的战况显示：让用户看见自己正在输，而不是只感到烦。
 * 数字本身就是论点——"关掉 3 个，又来了 27 个"。
 */
const storm = useStormStore()
const { closedCount, spawnedCount, elapsedSeconds, coverage, phase } = storeToRefs(storm)

const coveredPercent = computed(() => Math.round(coverage.value * 100))
const stopped = computed(() => phase.value === 'collapsed')
</script>

<template>
  <div class="hud" :class="{ 'is-stopped': stopped }">
    <p class="hud__line">
      <template v-if="!stopped">
        已坚持 <b>{{ elapsedSeconds }}s</b>
        <span class="hud__sep" aria-hidden="true">·</span>
        关掉 <b>{{ closedCount }}</b> 个
        <span class="hud__sep" aria-hidden="true">·</span>
        又来了 <b class="hud__bad">{{ spawnedCount }}</b> 个
      </template>
      <template v-else>
        屏幕已被占满
        <span class="hud__sep" aria-hidden="true">·</span>
        关掉 <b>{{ closedCount }}</b> 个，来了 <b class="hud__bad">{{ spawnedCount }}</b> 个
      </template>
    </p>
    <div class="hud__bar" aria-hidden="true">
      <i :style="{ width: `${coveredPercent}%` }" />
    </div>
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  /* 高于弹窗层：战况要一直看得见，否则用户不知道自己在输 */
  z-index: 800;
  padding: 26px 18px calc(12px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, transparent 0%, rgba(6, 8, 12, 0.86) 62%);
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.hud__line {
  margin: 0;
  font-size: 11.5px;
  letter-spacing: 0.01em;
  color: rgba(242, 244, 248, 0.78);
}

.hud__line b {
  font-family: var(--font-num);
  font-size: 12.5px;
  font-weight: 700;
  color: #ffffff;
}

.hud__bad {
  color: #ff8f7f !important;
}

.hud__sep {
  margin: 0 5px;
  opacity: 0.35;
}

.hud__bar {
  margin-top: 7px;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  overflow: hidden;
}

.hud__bar i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #ffd54a 0%, #ff6b3d 60%, #e23b2e 100%);
  transition: width 0.35s ease;
}

.hud.is-stopped .hud__line {
  color: #ff9c8f;
}
</style>
