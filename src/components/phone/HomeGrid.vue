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
</script>

<template>
  <div class="phone-scroll home relative flex flex-col px-[18px] pt-2 pb-[90px]">
    <!-- 桌面顶部微件：时钟、日期与天气 -->
    <div
      class="home-widget flex flex-col items-center my-3 mb-5 [text-shadow:0_2px_10px_rgba(0,0,0,0.4)]"
      aria-hidden="true"
    >
      <div
        class="home-widget__time font-sans text-[52px] font-light tracking-tighter leading-none text-white"
      >
        {{ clockTime }}
      </div>
      <div class="home-widget__date mt-1 text-[13px] font-normal text-[#f2f4f8]/85 tracking-wide">
        {{ dateStr }} · 晴 26℃ 空气优
      </div>
      <div
        class="home-widget__search flex items-center gap-2 w-full max-w-[320px] mt-[18px] px-3.5 py-2 rounded-full bg-white/12 border border-white/[0.18] backdrop-blur-md text-[#f2f4f8]/65 text-xs"
      >
        <span class="home-widget__search-icon text-[11px] opacity-80">🔍</span>
        <span class="home-widget__search-text">搜索应用或网页…</span>
      </div>
    </div>

    <!-- 真实手机桌面应用网格 -->
    <div class="home__content flex-1 flex flex-col justify-start mt-2.5">
      <div class="home-grid grid grid-cols-4 gap-x-2.5 gap-y-5 py-1">
        <button
          v-for="app in APPS"
          :key="app.id"
          type="button"
          class="app-tile flex flex-col items-center gap-1.5 p-0 cursor-pointer"
          @click="emit('open', app.id)"
        >
          <span
            class="app-tile__icon grid place-items-center w-[54px] h-[54px] p-3 rounded-2xl shadow-[0_4px_14px_-3px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.15)] text-white transition-transform duration-150 ease-out active:scale-90"
            :class="`app-tile__icon--${app.id}`"
          >
            <AppIcon :name="app.id" />
          </span>
          <span
            class="app-tile__name text-[11px] font-medium text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.7)] tracking-wide"
            >{{ app.name }}</span
          >
        </button>
      </div>

      <!-- 桌面分页指示 -->
      <div class="home-dots flex justify-center items-center gap-1.5 mt-6" aria-hidden="true">
        <span class="home-dot is-active w-3.5 h-1.5 rounded-full bg-white/90" />
        <span class="home-dot w-1.5 h-1.5 rounded-full bg-white/35" />
        <span class="home-dot w-1.5 h-1.5 rounded-full bg-white/35" />
      </div>
    </div>

    <!-- 真实手机底部 Dock 栏 -->
    <div
      class="home-dock flex justify-around items-center mt-[26px] py-2.5 px-3 rounded-[28px] bg-white/[0.14] border border-white/[0.22] backdrop-blur-[24px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)]"
      aria-label="快捷应用栏"
    >
      <button
        v-for="app in dockApps"
        :key="`dock-${app.id}`"
        type="button"
        class="dock-tile flex flex-col items-center gap-1 cursor-pointer"
        @click="emit('open', app.id)"
      >
        <span
          class="app-tile__icon dock-tile__icon grid place-items-center w-[50px] h-[50px] p-[11px] rounded-2xl shadow-[0_4px_14px_-3px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.15)] text-white transition-transform duration-150 ease-out active:scale-90"
          :class="`app-tile__icon--${app.id}`"
        >
          <AppIcon :name="app.id" />
        </span>
        <span
          class="dock-tile__name text-[10px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
          >{{ app.name }}</span
        >
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 丰富真实的各应用图标渐变配色 */

.app-tile__name {
  font-size: 11px;
  font-weight: 500;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
  letter-spacing: 0.01em;
}

/* 丰富真实的各应用图标渐变配色 */
.app-tile__icon--camera {
  background: linear-gradient(135deg, #3f4756 0%, #1e232d 100%);
}

.app-tile__icon--alarm {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.app-tile__icon--calculator {
  background: linear-gradient(135deg, #475569 0%, #1e293b 100%);
}

.app-tile__icon--messages {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.app-tile__icon--dialer {
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
}

.app-tile__icon--settings {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.app-tile__icon--video {
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
}

.app-tile__icon--shop {
  background: linear-gradient(135deg, #ff5722 0%, #d32f2f 100%);
}

.app-tile__icon--gallery {
  background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
}

.app-tile__icon--alipay {
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
}

.app-tile__icon--music {
  background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
}

.app-tile__icon--bank {
  background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
}

/* 底部 Dock 栏 */
.home-dock {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 26px;
  padding: 10px 12px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.45);
}

.dock-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.dock-tile__icon {
  width: 50px;
  height: 50px;
  padding: 11px;
}

.dock-tile__name {
  font-size: 10px;
  font-weight: 500;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
</style>
