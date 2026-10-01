<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { AppMeta } from '@/types/ad'
import CameraApp from './apps/CameraApp.vue'
import AlarmApp from './apps/AlarmApp.vue'
import CalculatorApp from './apps/CalculatorApp.vue'
import MessagesApp from './apps/MessagesApp.vue'
import DialerApp from './apps/DialerApp.vue'
import SettingsApp from './apps/SettingsApp.vue'
import ShortVideoApp from './apps/ShortVideoApp.vue'
import ShopApp from './apps/ShopApp.vue'
import GalleryApp from './apps/GalleryApp.vue'
import AlipayApp from './apps/AlipayApp.vue'
import MusicApp from './apps/MusicApp.vue'
import BankApp from './apps/BankApp.vue'

const props = defineProps<{ app: AppMeta }>()
const emit = defineEmits<{ back: [] }>()

/** appId → 视图组件。找不到时回退到占位文案，而不是抛错。 */
const VIEWS: Record<string, Component> = {
  camera: CameraApp,
  gallery: GalleryApp,
  alarm: AlarmApp,
  calculator: CalculatorApp,
  messages: MessagesApp,
  dialer: DialerApp,
  settings: SettingsApp,
  video: ShortVideoApp,
  shop: ShopApp,
  alipay: AlipayApp,
  music: MusicApp,
  bank: BankApp,
}

const view = computed<Component | null>(() => VIEWS[props.app.id] ?? null)
const isImmersiveApp = computed(() => ['video', 'camera'].includes(props.app.id))
const isBleedApp = computed(() =>
  ['shop', 'gallery', 'alipay', 'music', 'bank'].includes(props.app.id),
)
</script>

<template>
  <div class="relative flex flex-col h-full">
    <header
      v-if="app.id !== 'video'"
      class="flex items-center justify-between flex-none gap-2 px-3.5 pt-0.5 pb-2 z-30"
    >
      <button
        type="button"
        class="inline-flex items-center gap-[3px] min-h-[40px] px-1.5 text-[13px] font-medium text-[rgba(242,244,248,0.85)] cursor-pointer"
        @click="emit('back')"
      >
        <span aria-hidden="true">‹</span> 主屏
      </button>
      <span class="text-[14px] font-semibold text-white">{{ app.name }}</span>
      <span class="w-[52px]" aria-hidden="true" />
    </header>

    <div
      class="flex-1 min-h-0 px-[18px] pb-[80px]"
      :class="{
        '!p-0 flex flex-col overflow-hidden': isImmersiveApp,
        '!p-0 flex flex-col': isBleedApp,
        'phone-scroll': !isImmersiveApp && !isBleedApp,
      }"
    >
      <component :is="view" v-if="view" @back="emit('back')" />
      <p v-else class="mt-10 text-center text-[13px] text-[rgba(242,244,248,0.5)]">
        这个应用还没做。
      </p>
    </div>
  </div>
</template>
