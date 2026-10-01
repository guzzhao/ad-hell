<script setup lang="ts">
import { ref } from 'vue'
import InAppAdSlot from '../InAppAdSlot.vue'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()

const alarms = ref([
  { time: '06:30', label: '工作日闹钟', days: '周一至周五', on: true },
  { time: '08:00', label: '早会准备', days: '周一', on: true },
  { time: '12:40', label: '午休提醒', days: '每天', on: false },
  { time: '21:00', label: '晚间阅读', days: '每天', on: true },
])

function toggleAlarm(index: number): void {
  const item = alarms.value[index]
  if (item) item.on = !item.on
}
</script>

<template>
  <div class="alarm">
    <!-- 顶部操作栏 -->
    <div class="alarm__header flex items-center justify-between px-1 pt-1.5 pb-3.5">
      <span class="alarm__header-title text-2xl font-bold text-white">时钟</span>
      <button
        type="button"
        class="alarm__add-btn grid place-items-center w-8 h-8 rounded-full bg-white/10 text-xl text-amber-500 cursor-pointer"
        aria-label="添加闹钟"
      >
        +
      </button>
    </div>

    <ul class="alarm__list list-none m-0 p-0">
      <li
        v-for="(alarm, index) in alarms"
        :key="alarm.time"
        class="alarm__item flex items-center justify-between gap-3 py-3.5 px-1 border-b border-white/[0.08] flex-wrap cursor-pointer"
        @click="toggleAlarm(index)"
      >
        <div class="alarm__main-info flex items-baseline gap-3.5">
          <div
            class="alarm__time text-[32px] font-light tabular-nums tracking-tight transition-colors duration-150"
            :class="alarm.on ? 'text-white' : 'text-white/35 is-off'"
          >
            {{ alarm.time }}
          </div>
          <div class="alarm__meta flex flex-col gap-0.5">
            <strong class="text-[13px] font-medium text-[rgba(242,244,248,0.9)]">{{
              alarm.label
            }}</strong>
            <small class="text-[11px] text-[rgba(242,244,248,0.45)]">{{ alarm.days }}</small>
          </div>
        </div>
        <button
          type="button"
          class="alarm__switch relative w-11 h-[26px] rounded-full border-none cursor-pointer transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:transition-transform after:duration-180"
          :class="alarm.on ? 'is-on bg-[#4ade80] after:translate-x-4' : 'bg-white/[0.14]'"
          :aria-label="alarm.on ? '关闭闹钟' : '开启闹钟'"
          @click.stop="toggleAlarm(index)"
        >
          <span class="alarm__switch-thumb" />
        </button>

        <!-- 原生广告位（保留组件，当前阶段打磨原生界面，由 adsEnabled 控制显示） -->
        <InAppAdSlot
          v-if="storm.adsEnabled && index === 1"
          class="alarm__ad basis-full mt-3"
          creative-id="health-bp"
        />
      </li>
    </ul>

    <p
      v-if="storm.adsEnabled"
      class="alarm__caption mt-4 text-[11.5px] leading-relaxed text-[rgba(242,244,248,0.5)]"
    >
      闹钟广告位（已保留，待启用）
    </p>
  </div>
</template>
