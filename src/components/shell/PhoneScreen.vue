<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { APPS } from '@/data/apps'
import { useStormStore } from '@/stores/storm'
import StatusBar from '@/components/phone/StatusBar.vue'
import HomeGrid from '@/components/phone/HomeGrid.vue'
import AppHost from '@/components/phone/AppHost.vue'
import { SURFACES, SURFACE_ORDER } from '@/components/ads/surfaces'
import LandingOverlay from '@/components/ads/LandingOverlay.vue'
import StormHud from '@/components/chrome/StormHud.vue'

const storm = useStormStore()
const { phase } = storeToRefs(storm)

/**
 * 当前打开的 App。属于纯展示状态，不必进 store。
 * 重新体验时 DeviceShell 会整体卸载重建，因此这里自然回到主屏。
 */
const openAppId = ref<string | null>(null)

const openApp = computed(() => APPS.find((a) => a.id === openAppId.value) ?? null)
const statusTitle = computed(() =>
  phase.value === 'collapsed' ? '已停止响应' : (openApp.value?.name ?? ''),
)
</script>

<template>
  <div class="phone-screen">
    <StatusBar :title="statusTitle" />

    <div class="phone-screen__body">
      <HomeGrid v-if="!openApp" @open="openAppId = $event" />
      <AppHost v-else :app="openApp" @back="openAppId = null" />
    </div>

    <!--
      所有呈现面都由注册表驱动，宿主不认识任何具体的层。
      新增一种呈现面只需在 surfaces.ts 登记，这个模板不用改。
    -->
    <component :is="SURFACES[surface]" v-for="surface in SURFACE_ORDER" :key="surface" />
    <StormHud />
    <LandingOverlay />
  </div>
</template>
