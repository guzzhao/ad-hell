<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineProps<{ title: string }>()

const clock = ref('')
let timer: number | null = null

function updateClock(): void {
  const now = new Date()
  clock.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  updateClock()
  timer = window.setInterval(updateClock, 10000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div
    class="relative z-40 flex items-center justify-between gap-2 shrink-0 pt-3.5 px-[22px] pb-1.5 text-[13px] font-semibold tracking-wide text-[#f2f4f8]/90 pointer-events-none"
  >
    <!-- 左侧时间与崩溃警示 -->
    <div class="flex items-center gap-2">
      <span class="tabular-nums font-semibold">{{ clock }}</span>
      <span
        v-if="title === '已停止响应'"
        class="px-1.5 py-0.5 rounded-full bg-red-500/25 border border-red-500/40 text-red-400 text-[9.5px] font-bold animate-pulse leading-none"
      >
        已停止响应
      </span>
    </div>

    <!-- 移动端或无刘海屏显示副标题，桌面端保留灵动岛避让区 -->
    <span
      v-if="title && title !== '已停止响应'"
      class="max-md:block hidden text-xs font-medium text-[#f2f4f8]/60 truncate max-w-[120px]"
    >
      {{ title }}
    </span>
    <span v-else class="w-16" aria-hidden="true" />

    <!-- 右侧网络与电量图标 -->
    <span class="inline-flex items-center gap-1.5" aria-hidden="true">
      <span class="text-[10px] font-bold tracking-tighter opacity-90 -mr-px">5G</span>
      <!-- 4格满格信号 -->
      <svg class="h-[11px] w-auto block opacity-85" viewBox="0 0 16 12" fill="currentColor">
        <rect x="0" y="8.5" width="2.6" height="3.5" rx="0.8" />
        <rect x="4.2" y="6" width="2.6" height="6" rx="0.8" />
        <rect x="8.4" y="3.5" width="2.6" height="8.5" rx="0.8" />
        <rect x="12.6" y="1" width="2.6" height="11" rx="0.8" />
      </svg>
      <!-- WiFi 曲线 -->
      <svg
        class="h-[11px] w-auto block opacity-85"
        viewBox="0 0 16 12"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      >
        <path d="M1.5 3.2C5.5 -0.5 10.5 -0.5 14.5 3.2" />
        <path d="M4 6.2C6.5 4 9.5 4 12 6.2" />
        <circle cx="8" cy="9.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
      <!-- 电池图标 -->
      <svg
        class="h-[10.5px] w-auto block opacity-85"
        viewBox="0 0 25 12"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
      >
        <rect x="0.7" y="0.7" width="20" height="10.6" rx="3.2" />
        <rect x="2.5" y="2.5" width="13" height="7" rx="1.8" fill="currentColor" stroke="none" />
        <path d="M22.8 4.2v3.6" stroke-linecap="round" />
      </svg>
    </span>
  </div>
</template>
