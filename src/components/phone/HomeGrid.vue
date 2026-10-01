<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { APPS } from '@/data/apps'
import AppIcon from './AppIcon.vue'

const emit = defineEmits<{ open: [id: string] }>()

const clockTime = ref('20:48')
const dateStr = ref('9月30日 星期三')

onMounted(() => {
  const now = new Date()
  clockTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  dateStr.value = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()] ?? '星期三'}`
})

// 底部 Dock 栏常驻 4 个核心应用
const dockApps: { id: string; name: string }[] = [
  { id: 'dialer', name: '电话' },
  { id: 'messages', name: '信息' },
  { id: 'video', name: '短视频' },
  { id: 'camera', name: '相机' },
]

const APP_GRADIENTS: Record<string, string> = {
  camera: 'from-[#3f4756] to-[#1e232d]',
  alarm: 'from-orange-500 to-orange-600',
  calculator: 'from-slate-600 to-slate-800',
  messages: 'from-emerald-500 to-emerald-600',
  dialer: 'from-green-500 to-green-700',
  settings: 'from-slate-400 to-slate-500',
  video: 'from-pink-500 to-purple-500',
  shop: 'from-[#ff5722] to-[#d32f2f]',
  gallery: 'from-sky-400 to-blue-600',
  alipay: 'from-[#1677ff] to-[#0958d9]',
  music: 'from-rose-500 to-rose-700',
  bank: 'from-red-700 to-red-900',
}
</script>

<template>
  <div class="phone-scroll relative flex flex-col px-[18px] pt-2 pb-[90px]">
    <!-- 桌面顶部微件：时钟、日期与天气 -->
    <div
      class="flex flex-col items-center my-3 mb-5 [text-shadow:0_2px_10px_rgba(0,0,0,0.4)]"
      aria-hidden="true"
    >
      <div class="font-sans text-[52px] font-light tracking-tighter leading-none text-white">
        {{ clockTime }}
      </div>
      <div class="mt-1 text-[13px] font-normal text-[#f2f4f8]/85 tracking-wide">
        {{ dateStr }} · 晴 26℃ 空气优
      </div>
      <div
        class="flex items-center gap-2 w-full max-w-[320px] mt-[18px] px-3.5 py-2 rounded-full bg-white/12 border border-white/[0.18] backdrop-blur-md text-[#f2f4f8]/65 text-xs"
      >
        <span class="text-[11px] opacity-80">🔍</span>
        <span>搜索应用或网页…</span>
      </div>
    </div>

    <!-- 真实手机桌面应用网格 -->
    <div class="flex-1 flex flex-col justify-start mt-2.5">
      <div class="grid grid-cols-4 gap-x-2.5 gap-y-5 py-1">
        <button
          v-for="app in APPS"
          :key="app.id"
          type="button"
          class="flex flex-col items-center gap-1.5 p-0 cursor-pointer"
          @click="emit('open', app.id)"
        >
          <span
            class="grid place-items-center w-[54px] h-[54px] p-3 rounded-2xl bg-gradient-to-br shadow-[0_4px_14px_-3px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.15)] text-white transition-transform duration-150 ease-out active:scale-90"
            :class="APP_GRADIENTS[app.id] ?? 'from-slate-700 to-slate-900'"
          >
            <AppIcon :name="app.id" />
          </span>
          <span
            class="text-[11px] font-medium text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.7)] tracking-wide"
            >{{ app.name }}</span
          >
        </button>
      </div>

      <!-- 桌面分页指示 -->
      <div class="flex justify-center items-center gap-1.5 mt-6" aria-hidden="true">
        <span class="w-3.5 h-1.5 rounded-full bg-white/90" />
        <span class="w-1.5 h-1.5 rounded-full bg-white/35" />
        <span class="w-1.5 h-1.5 rounded-full bg-white/35" />
      </div>
    </div>

    <!-- 真实手机底部 Dock 栏 -->
    <div
      class="flex justify-around items-center mt-[26px] py-2.5 px-3 rounded-[28px] bg-white/[0.14] border border-white/[0.22] backdrop-blur-[24px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)]"
      aria-label="快捷应用栏"
    >
      <button
        v-for="app in dockApps"
        :key="`dock-${app.id}`"
        type="button"
        class="flex flex-col items-center gap-1 cursor-pointer"
        @click="emit('open', app.id)"
      >
        <span
          class="grid place-items-center w-[50px] h-[50px] p-[11px] rounded-2xl bg-gradient-to-br shadow-[0_4px_14px_-3px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.15)] text-white transition-transform duration-150 ease-out active:scale-90"
          :class="APP_GRADIENTS[app.id] ?? 'from-slate-700 to-slate-900'"
        >
          <AppIcon :name="app.id" />
        </span>
        <span class="text-[10px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{{
          app.name
        }}</span>
      </button>
    </div>
  </div>
</template>
