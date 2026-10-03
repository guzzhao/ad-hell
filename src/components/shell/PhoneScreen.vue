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
import FloatingButton from '@/components/phone/FloatingButton.vue'

const storm = useStormStore()
const { phase, activeAppId } = storeToRefs(storm)

const openApp = computed(() => APPS.find((a) => a.id === activeAppId.value) ?? null)
const statusTitle = computed(() =>
  phase.value === 'collapsed' ? '已停止响应' : (openApp.value?.name ?? ''),
)

function handleOpenApp(appId: string) {
  storm.openApp(appId)
}

function handleBack() {
  storm.closeApp()
}
</script>

<template>
  <div class="phone-screen">
    <StatusBar :title="statusTitle" />

    <div class="phone-screen__body">
      <HomeGrid v-if="!openApp" @open="handleOpenApp" />
      <AppHost v-else :app="openApp" @back="handleBack" />
    </div>

    <!-- 悬浮辅助按钮：短按返回，长按移动位置/上调下调/返回桌面 -->
    <FloatingButton :open-app="openApp !== null" @back="handleBack" @home="handleBack" />

    <!--
      所有呈现面都由注册表驱动，宿主不认识任何具体的层。
      新增一种呈现面只需在 surfaces.ts 登记，这个模板不用改。
    -->
    <component :is="SURFACES[surface]" v-for="surface in SURFACE_ORDER" :key="surface" />
    <StormHud />
    <LandingOverlay />

    <!-- 真实手机底部 Home 手势指示条 -->
    <div
      class="absolute bottom-1.5 inset-x-0 z-35 flex justify-center items-center h-5 select-none pointer-events-auto"
      :class="{ 'cursor-pointer': openApp }"
      :title="openApp ? '轻触返回主屏' : undefined"
      @click="openApp ? handleBack() : undefined"
    >
      <span
        class="w-32 h-[4px] rounded-full bg-white/40 hover:bg-white/70 active:scale-95 transition-all shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
      />
    </div>
  </div>
</template>
