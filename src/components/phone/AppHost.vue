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

const props = defineProps<{ app: AppMeta }>()
const emit = defineEmits<{ back: [] }>()

/** appId → 视图组件。找不到时回退到占位文案，而不是抛错。 */
const VIEWS: Record<string, Component> = {
  camera: CameraApp,
  alarm: AlarmApp,
  calculator: CalculatorApp,
  messages: MessagesApp,
  dialer: DialerApp,
  settings: SettingsApp,
  video: ShortVideoApp,
  shop: ShopApp,
}

const view = computed<Component | null>(() => VIEWS[props.app.id] ?? null)
</script>

<template>
  <div class="app-host">
    <header class="app-host__bar">
      <button type="button" class="app-host__back" @click="emit('back')">
        <span aria-hidden="true">‹</span> 主屏
      </button>
      <span class="app-host__title">{{ app.name }}</span>
      <span class="app-host__spacer" aria-hidden="true" />
    </header>

    <div class="phone-scroll app-host__body">
      <component :is="view" v-if="view" />
      <p v-else class="app-host__missing">这个应用还没做。</p>
    </div>
  </div>
</template>

<style scoped>
.app-host {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-host__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: none;
  gap: 8px;
  padding: 2px 14px 10px;
}

.app-host__back {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  /* 这是页面自己的返回控件，不是广告的关闭键，所以要给足可点面积 */
  min-height: 44px;
  padding: 0 6px;
  font-size: 13px;
  color: rgba(242, 244, 248, 0.78);
}

.app-host__title {
  font-size: 13.5px;
  font-weight: 600;
}

.app-host__spacer {
  width: 52px;
}

.app-host__body {
  padding: 0 18px 80px;
}

.app-host__missing {
  margin-top: 40px;
  text-align: center;
  font-size: 13px;
  color: rgba(242, 244, 248, 0.5);
}
</style>
