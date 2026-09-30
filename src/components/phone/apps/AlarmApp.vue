<script setup lang="ts">
import InAppAdSlot from '../InAppAdSlot.vue'

const alarms = [
  { time: '06:30', label: '起床', days: '周一至周五', on: true },
  { time: '12:40', label: '午休', days: '每天', on: true },
  { time: '21:00', label: '吃药提醒', days: '每天', on: false },
]
</script>

<template>
  <div class="alarm">
    <ul class="alarm__list">
      <li v-for="(alarm, index) in alarms" :key="alarm.time" class="alarm__item">
        <div class="alarm__time">{{ alarm.time }}</div>
        <div class="alarm__meta">
          <strong>{{ alarm.label }}</strong>
          <small>{{ alarm.days }}</small>
        </div>
        <span class="alarm__switch" :class="{ 'is-on': alarm.on }" aria-hidden="true" />
        <!-- 第二条闹钟后面插一个原生广告位：闹钟列表本身也被卖了 -->
        <InAppAdSlot v-if="index === 1" class="alarm__ad" creative-id="health-bp" />
      </li>
    </ul>

    <p class="alarm__caption">闹钟响了，先看一条广告才响第二遍。</p>
  </div>
</template>

<style scoped>
.alarm__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.alarm__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-wrap: wrap;
}

.alarm__time {
  font-size: 25px;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}

.alarm__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alarm__meta strong {
  font-size: 12.5px;
  font-weight: 600;
}

.alarm__meta small {
  font-size: 11px;
  color: rgba(242, 244, 248, 0.45);
}

.alarm__switch {
  margin-left: auto;
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  position: relative;
}

.alarm__switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s ease;
}

.alarm__switch.is-on {
  background: #4ade80;
}

.alarm__switch.is-on::after {
  transform: translateX(16px);
}

.alarm__ad {
  flex: 0 0 100%;
  margin: 12px 0 0;
}

.alarm__caption {
  margin: 16px 0 0;
  font-size: 11.5px;
  line-height: 1.65;
  color: rgba(242, 244, 248, 0.5);
}
</style>
