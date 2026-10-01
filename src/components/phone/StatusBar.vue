<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{ title: string }>()

// 进页面时取一次真实时间即可，不需要跟着走秒——手机状态栏的注意力不该被抢走。
const clock = ref('')
onMounted(() => {
  const now = new Date()
  clock.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})
</script>

<template>
  <div
    class="status-bar relative z-40 flex items-center justify-between gap-2 shrink-0 pt-3.5 px-[22px] pb-1.5 text-[13px] font-semibold tracking-wide text-[#f2f4f8]/90 pointer-events-none"
  >
    <span class="status-bar__clock tabular-nums">{{ clock }}</span>
    <span class="status-bar__title text-xs font-medium text-[#f2f4f8]/55">{{ title }}</span>
    <span class="status-bar__icons inline-flex items-center gap-1.5" aria-hidden="true">
      <span class="status-bar__net text-[10.5px] font-bold tracking-tighter opacity-90 -mr-px"
        >5G</span
      >
      <!-- 信号格 -->
      <svg
        class="status-bar__icon h-[11px] w-auto block opacity-85"
        viewBox="0 0 16 12"
        fill="currentColor"
      >
        <rect x="0" y="8.5" width="2.6" height="3.5" rx="0.8" />
        <rect x="4.2" y="6" width="2.6" height="6" rx="0.8" />
        <rect x="8.4" y="3.5" width="2.6" height="8.5" rx="0.8" />
        <rect x="12.6" y="1" width="2.6" height="11" rx="0.8" />
      </svg>
      <!-- WiFi 图标 -->
      <svg
        class="status-bar__icon h-[11px] w-auto block opacity-85"
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
        class="status-bar__icon status-bar__battery h-[10.5px] w-auto block opacity-85"
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
