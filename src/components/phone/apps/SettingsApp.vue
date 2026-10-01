<script setup lang="ts">
import InAppAdSlot from '../InAppAdSlot.vue'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()

const commRows = [
  { icon: '📶', label: 'WLAN', value: 'Office_WiFi_5G' },
  { icon: 'ᛒ', label: '蓝牙', value: '已开启' },
  { icon: '📡', label: '蜂窝网络', value: '中国联通 5G' },
]

const generalRows = [
  { icon: '🔔', label: '通知与状态栏', value: '' },
  { icon: '🔊', label: '声音与振动', value: '' },
  { icon: '☀️', label: '显示与亮度', value: '原彩显示' },
  { icon: '🔋', label: '电池', value: '85% · 正常' },
]

const systemRows = [
  { icon: '⚙️', label: '通用设置', value: '' },
  { icon: '🛡️', label: '隐私与安全', value: '' },
  { icon: 'ℹ️', label: '关于手机', value: '旗舰OS 18.2 ›' },
]
</script>

<template>
  <div>
    <!-- 顶部搜索 -->
    <div
      class="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-white/[0.08] text-[11.5px] text-[rgba(242,244,248,0.5)] mb-3"
    >
      <span>🔍 搜索设置选项…</span>
    </div>

    <!-- 用户卡片 -->
    <div
      class="flex items-center gap-3 px-3.5 py-3 rounded-[14px] bg-white/[0.07] mb-3.5 cursor-pointer"
    >
      <div class="grid place-items-center w-11 h-11 rounded-full bg-white/15 text-[22px]">👤</div>
      <div class="flex-1 flex flex-col gap-0.5">
        <strong class="text-[13.5px] text-white">我的账号</strong>
        <small class="text-[10.5px] text-[rgba(242,244,248,0.45)]">云空间、设备与家庭共享</small>
      </div>
      <span class="text-[14px] text-[rgba(242,244,248,0.35)]">›</span>
    </div>

    <!-- 网络组 -->
    <div class="rounded-[14px] bg-white/[0.055] overflow-hidden mb-3 divide-y divide-white/[0.06]">
      <div
        v-for="row in commRows"
        :key="row.label"
        class="flex items-center justify-between gap-3 px-3.5 py-[13px] cursor-pointer active:bg-white/[0.04]"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-[15px] w-5 grid place-items-center">{{ row.icon }}</span>
          <span class="text-[13px] font-medium">{{ row.label }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[12px] text-[rgba(242,244,248,0.5)]">{{ row.value }}</span>
          <span class="text-[14px] text-[rgba(242,244,248,0.35)]">›</span>
        </div>
      </div>
    </div>

    <!-- 偏好组 -->
    <div class="rounded-[14px] bg-white/[0.055] overflow-hidden mb-3 divide-y divide-white/[0.06]">
      <div
        v-for="row in generalRows"
        :key="row.label"
        class="flex items-center justify-between gap-3 px-3.5 py-[13px] cursor-pointer active:bg-white/[0.04]"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-[15px] w-5 grid place-items-center">{{ row.icon }}</span>
          <span class="text-[13px] font-medium">{{ row.label }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[12px] text-[rgba(242,244,248,0.5)]">{{ row.value }}</span>
          <span class="text-[14px] text-[rgba(242,244,248,0.35)]">›</span>
        </div>
      </div>
    </div>

    <!-- 系统组 -->
    <div class="rounded-[14px] bg-white/[0.055] overflow-hidden mb-3 divide-y divide-white/[0.06]">
      <div
        v-for="row in systemRows"
        :key="row.label"
        class="flex items-center justify-between gap-3 px-3.5 py-[13px] cursor-pointer active:bg-white/[0.04]"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-[15px] w-5 grid place-items-center">{{ row.icon }}</span>
          <span class="text-[13px] font-medium">{{ row.label }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[12px] text-[rgba(242,244,248,0.5)]">{{ row.value }}</span>
          <span class="text-[14px] text-[rgba(242,244,248,0.35)]">›</span>
        </div>
      </div>
    </div>

    <!-- 适老化警示位（保留组件，当前阶段打磨原生界面，由 adsEnabled 控制显示） -->
    <div
      v-if="storm.adsEnabled"
      class="rounded-[14px] overflow-hidden mb-3 border border-[rgba(226,59,46,0.4)] bg-[rgba(226,59,46,0.08)]"
    >
      <div
        class="flex items-center justify-between gap-3 px-3.5 py-[13px] cursor-pointer active:bg-white/[0.04]"
      >
        <span class="text-[13px] font-medium">适老化模式</span>
        <span class="text-[12px] text-[#4ade80] font-semibold">已开启</span>
      </div>
      <p class="m-0 px-[15px] pb-3.5 text-[11.5px] leading-[1.7] text-[#ff9c8f]">
        适老化模式开着，弹窗广告照样来。工信部 2021 年的适老化规范明确禁止适老模式出现广告弹窗。
      </p>
    </div>

    <!-- 原生广告位（保留组件，当前阶段打磨原生界面，由 adsEnabled 控制显示） -->
    <InAppAdSlot v-if="storm.adsEnabled" creative-id="health-bp" caption="设置页底部也是广告位。" />
  </div>
</template>
