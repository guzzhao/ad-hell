<script setup lang="ts">
import { ref } from 'vue'
import InAppAdSlot from '../InAppAdSlot.vue'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()
const showWakeupModal = ref(false)

const alarms = ref([
  { time: '06:30', label: '工作日闹钟', days: '周一至周五', on: true },
  { time: '08:00', label: '早会准备', days: '周一', on: true },
  { time: '12:40', label: '午休提醒', days: '每天', on: false },
  { time: '21:00', label: '晚间阅读', days: '每天', on: true },
])

function toggleAlarm(index: number): void {
  const item = alarms.value[index]
  if (item) {
    const wasOn = item.on
    item.on = !item.on
    if (wasOn && storm.adsEnabled) {
      showWakeupModal.value = true
    }
  }
}
</script>

<template>
  <div>
    <!-- 顶部操作栏 -->
    <div class="flex items-center justify-between px-1 pt-1.5 pb-3.5">
      <span class="text-2xl font-bold text-white">时钟</span>
      <button
        type="button"
        class="grid place-items-center w-8 h-8 rounded-full bg-white/10 text-xl text-amber-500 cursor-pointer"
        aria-label="添加闹钟"
      >
        +
      </button>
    </div>

    <ul class="list-none m-0 p-0">
      <li
        v-for="(alarm, index) in alarms"
        :key="alarm.time"
        class="flex items-center justify-between gap-3 py-3.5 px-1 border-b border-white/[0.08] flex-wrap cursor-pointer"
        @click="toggleAlarm(index)"
      >
        <div class="flex items-baseline gap-3.5">
          <div
            class="text-[32px] font-light tabular-nums tracking-tight transition-colors duration-150"
            :class="alarm.on ? 'text-white' : 'text-white/35'"
          >
            {{ alarm.time }}
          </div>
          <div class="flex flex-col gap-0.5">
            <strong class="text-[13px] font-medium text-[rgba(242,244,248,0.9)]">{{
              alarm.label
            }}</strong>
            <small class="text-[11px] text-[rgba(242,244,248,0.45)]">{{ alarm.days }}</small>
          </div>
        </div>
        <button
          type="button"
          class="relative w-11 h-[26px] rounded-full border-none cursor-pointer transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:transition-transform after:duration-180"
          :class="alarm.on ? 'bg-[#4ade80] after:translate-x-4' : 'bg-white/[0.14]'"
          :aria-label="alarm.on ? '关闭闹钟' : '开启闹钟'"
          @click.stop="toggleAlarm(index)"
        />

        <!-- 原生广告位（保留组件，当前阶段打磨原生界面，由 adsEnabled 控制显示） -->
        <InAppAdSlot
          v-if="storm.adsEnabled && index === 1"
          class="basis-full mt-3"
          creative-id="health-bp"
        />
      </li>
    </ul>

    <!-- 关闹钟触发：早起打卡瓜分金币诱导弹窗 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-90"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="storm.adsEnabled && showWakeupModal"
        class="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs flex items-center justify-center p-5 select-none"
        @click.self="showWakeupModal = false"
      >
        <div
          class="relative w-full max-w-[280px] rounded-3xl bg-gradient-to-b from-amber-500 via-orange-600 to-red-600 p-5 text-white text-center shadow-2xl border border-yellow-300/40"
        >
          <!-- 极小假关闭键 -->
          <button
            type="button"
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 text-[10px] text-white/60 hover:text-white grid place-items-center cursor-pointer"
            aria-label="关闭"
            @click="showWakeupModal = false"
          >
            ✕
          </button>

          <span class="text-4xl block my-1">☀️</span>
          <h3 class="text-base font-extrabold text-yellow-100">早起打卡成功！</h3>
          <p class="text-xs text-yellow-200/90 mt-1">恭喜获得今日早鸟瓜分资格</p>

          <div class="my-3 py-2.5 px-3 rounded-2xl bg-black/25 border border-yellow-300/20">
            <span class="text-[10px] text-yellow-200/80 block">最高可瓜分现金</span>
            <span class="text-2xl font-black text-yellow-300 tracking-tight">¥ 88.88</span>
          </div>

          <button
            type="button"
            class="w-full py-2.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 text-red-950 font-black text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            @click="storm.tapAdBody('alarm-reward')"
          >
            立即开箱提现 ›
          </button>
          <span class="block mt-2 text-[9px] text-white/50">广告 · 点击将打开赞助商活动页面</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
