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
  <div class="status-bar">
    <span class="status-bar__clock">{{ clock }}</span>
    <span class="status-bar__title">{{ title }}</span>
    <span class="status-bar__icons" aria-hidden="true">
      <svg viewBox="0 0 18 12" fill="currentColor">
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="4.5" y="6" width="3" height="6" rx="1" />
        <rect x="9" y="3.5" width="3" height="8.5" rx="1" />
        <rect x="13.5" y="1" width="3" height="11" rx="1" />
      </svg>
      <svg viewBox="0 0 26 12" fill="none" stroke="currentColor" stroke-width="1.4">
        <rect x="0.7" y="0.7" width="20" height="10.6" rx="3" />
        <rect x="2.4" y="2.4" width="12" height="7.2" rx="1.6" fill="currentColor" stroke="none" />
        <path d="M22.6 4.2v3.6" stroke-linecap="round" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.status-bar {
  position: relative;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex: none;
  padding: 14px 22px 6px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(242, 244, 248, 0.92);
  pointer-events: none;
}

.status-bar__clock {
  font-variant-numeric: tabular-nums;
}

.status-bar__title {
  font-size: 12px;
  font-weight: 500;
  color: rgba(242, 244, 248, 0.55);
}

.status-bar__icons {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.status-bar__icons svg {
  height: 11px;
  width: auto;
  display: block;
  opacity: 0.8;
}
</style>
