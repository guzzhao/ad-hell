<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { APPS } from '@/data/apps'
import { useStormStore } from '@/stores/storm'
import AppIcon from './AppIcon.vue'

const emit = defineEmits<{ open: [id: string] }>()
const storm = useStormStore()
const showRewardWidget = ref(true)

// 桌面分页控制：0 表示第一主屏，1 表示第二推广/娱乐屏
const currentPage = ref(0)
const isDragging = ref(false)
const dragDeltaX = ref(0)

let startX = 0
let startY = 0
let isHorizontalDrag = false
let isMouseDown = false

function onTouchStart(e: TouchEvent): void {
  const touch = e.touches[0]
  if (!touch) return
  startX = touch.clientX
  startY = touch.clientY
  isDragging.value = false
  dragDeltaX.value = 0
  isHorizontalDrag = false
}

function onTouchMove(e: TouchEvent): void {
  const touch = e.touches[0]
  if (!touch) return
  const dx = touch.clientX - startX
  const dy = touch.clientY - startY

  if (!isHorizontalDrag) {
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
      isHorizontalDrag = true
      isDragging.value = true
    }
  }

  if (isHorizontalDrag) {
    if (e.cancelable) e.preventDefault()
    // 阻尼回弹效果
    if ((currentPage.value === 0 && dx > 0) || (currentPage.value === 1 && dx < 0)) {
      dragDeltaX.value = dx * 0.3
    } else {
      dragDeltaX.value = dx
    }
  }
}

function onTouchEnd(): void {
  if (isHorizontalDrag) {
    if (dragDeltaX.value < -35 && currentPage.value === 0) {
      currentPage.value = 1
    } else if (dragDeltaX.value > 35 && currentPage.value === 1) {
      currentPage.value = 0
    }
  }
  isDragging.value = false
  dragDeltaX.value = 0
  isHorizontalDrag = false
}

function onMouseDown(e: MouseEvent): void {
  isMouseDown = true
  startX = e.clientX
  startY = e.clientY
  dragDeltaX.value = 0
  isDragging.value = false
  isHorizontalDrag = false

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent): void {
  if (!isMouseDown) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY

  if (!isHorizontalDrag && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
    isHorizontalDrag = true
    isDragging.value = true
  }

  if (isHorizontalDrag) {
    if ((currentPage.value === 0 && dx > 0) || (currentPage.value === 1 && dx < 0)) {
      dragDeltaX.value = dx * 0.3
    } else {
      dragDeltaX.value = dx
    }
  }
}

function onMouseUp(): void {
  if (isMouseDown && isHorizontalDrag) {
    if (dragDeltaX.value < -35 && currentPage.value === 0) {
      currentPage.value = 1
    } else if (dragDeltaX.value > 35 && currentPage.value === 1) {
      currentPage.value = 0
    }
  }
  isMouseDown = false
  isDragging.value = false
  dragDeltaX.value = 0
  isHorizontalDrag = false

  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function switchPage(pageIdx: number): void {
  currentPage.value = pageIdx
}

const trackTransform = computed(() => {
  if (isDragging.value) {
    return `translateX(calc(-${currentPage.value * 50}% + ${dragDeltaX.value}px))`
  }
  return `translateX(-${currentPage.value * 50}%)`
})

const clockTime = ref('20:48')
const dateStr = ref('9月30日 星期三')
let clockTimer: number | null = null

function updateHomeTime(): void {
  const now = new Date()
  clockTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  dateStr.value = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()] ?? '星期三'}`
}

onMounted(() => {
  updateHomeTime()
  clockTimer = window.setInterval(updateHomeTime, 5000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
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

/** 第二桌面专享：深度预装流氓应用、免安装快应用与各品类广告推广 */
const secondaryApps = [
  {
    id: 'quick-clean',
    name: '极速清理',
    icon: '🧹',
    gradient: 'from-cyan-500 to-blue-600',
    badge: '⚡',
    type: 'quickApp',
    target: 'quick-clean',
  },
  {
    id: 'quick-cash',
    name: '天天消消乐',
    icon: '🎮',
    gradient: 'from-amber-500 to-orange-600',
    badge: '领50',
    type: 'quickApp',
    target: 'quick-cash',
  },
  {
    id: 'quick-battery',
    name: '电池医生',
    icon: '❄️',
    gradient: 'from-rose-500 to-red-600',
    badge: '⚡',
    type: 'quickApp',
    target: 'quick-battery',
  },
  {
    id: 'game-legend',
    name: '龙渊传奇',
    icon: '🪓',
    gradient: 'from-purple-700 to-indigo-900',
    badge: '高爆',
    type: 'ad',
    target: 'game-legend',
  },
  {
    id: 'game-retro',
    name: '霸业复古',
    icon: '⚔️',
    gradient: 'from-stone-700 to-neutral-900',
    badge: '打金',
    type: 'ad',
    target: 'game-retro',
  },
  {
    id: 'loan-fast',
    name: '速银花',
    icon: '💰',
    gradient: 'from-red-600 to-rose-800',
    badge: '20万',
    type: 'ad',
    target: 'loan-fast',
  },
  {
    id: 'loan-quota',
    name: '钱多多',
    icon: '💳',
    gradient: 'from-blue-600 to-indigo-700',
    badge: '免息',
    type: 'ad',
    target: 'loan-quota',
  },
  {
    id: 'health-bp',
    name: '康寿堂',
    icon: '🩺',
    gradient: 'from-emerald-600 to-teal-800',
    badge: '0元领',
    type: 'ad',
    target: 'health-bp',
  },
  {
    id: 'dating-nearby',
    name: '近邻缘',
    icon: '💌',
    gradient: 'from-orange-500 to-pink-600',
    badge: '同城',
    type: 'ad',
    target: 'dating-nearby',
  },
  {
    id: 'slim-seven',
    name: '轻盈日记',
    icon: '🥗',
    gradient: 'from-pink-500 to-rose-600',
    badge: '减10斤',
    type: 'ad',
    target: 'slim-seven',
  },
  {
    id: 'shop-luxury',
    name: '唯享名牌',
    icon: '🏷️',
    gradient: 'from-pink-600 to-fuchsia-800',
    badge: '1折',
    type: 'ad',
    target: 'shop-luxury',
  },
  {
    id: 'gallery-cloud',
    name: '极速云盘',
    icon: '☁️',
    gradient: 'from-sky-500 to-blue-700',
    badge: '2TB',
    type: 'ad',
    target: 'gallery-cloud',
  },
  {
    id: 'camera-print',
    name: '相印宝',
    icon: '🖼️',
    gradient: 'from-amber-500 to-rose-600',
    badge: '冲印',
    type: 'ad',
    target: 'camera-print',
  },
  {
    id: 'alarm-reward',
    name: '早起赚现金',
    icon: '🌅',
    gradient: 'from-amber-400 to-orange-500',
    badge: '分5万',
    type: 'ad',
    target: 'alarm-reward',
  },
  {
    id: 'insurance-one',
    name: '安康保',
    icon: '🛡️',
    gradient: 'from-blue-600 to-indigo-800',
    badge: '1元保',
    type: 'ad',
    target: 'insurance-one',
  },
  {
    id: 'course-free',
    name: '学霸营',
    icon: '🎓',
    gradient: 'from-purple-600 to-indigo-800',
    badge: '名师',
    type: 'ad',
    target: 'course-free',
  },
]

function handleSecondaryAppClick(item: (typeof secondaryApps)[number]) {
  if (item.type === 'quickApp') {
    storm.spawnTargeted(item.target)
  } else {
    storm.tapAdBody(item.target)
  }
}
</script>

<template>
  <div class="relative flex flex-col h-full w-full overflow-hidden select-none">
    <!-- 可滑动桌面视口 (Swipeable Viewport) -->
    <div
      class="flex-1 overflow-hidden relative touch-pan-y"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <div
        class="flex h-full w-[200%]"
        :class="{ 'transition-transform duration-300 ease-out': !isDragging }"
        :style="{ transform: trackTransform }"
      >
        <!-- ── 第一主屏 (Page 0) ─────────────────────────────────── -->
        <div class="w-1/2 h-full flex flex-col px-[18px] pt-1.5 overflow-y-auto phone-scroll">
          <!-- 桌面顶部时钟、日期与天气 -->
          <div
            class="flex flex-col items-center my-2.5 mb-3 [text-shadow:0_2px_10px_rgba(0,0,0,0.4)]"
            aria-hidden="true"
          >
            <div
              class="font-sans text-[52px] font-extralight tracking-tighter leading-none text-white"
            >
              {{ clockTime }}
            </div>
            <div
              class="mt-1 flex items-center gap-2 text-[12px] font-normal text-[#f2f4f8]/85 tracking-wide"
            >
              <span>{{ dateStr }}</span>
              <span>·</span>
              <span class="inline-flex items-center gap-1">
                <span>☀️</span>
                <span>26℃</span>
                <span
                  class="px-1.5 py-px rounded-full bg-emerald-500/20 text-emerald-300 text-[9.5px] font-medium"
                >
                  空气优 32
                </span>
              </span>
            </div>

            <!-- 热搜广告搜索框 -->
            <div
              class="flex items-center justify-between w-full max-w-[320px] mt-3 px-4 py-2 rounded-full bg-white/12 border border-white/[0.18] backdrop-blur-md text-[#f2f4f8]/70 text-xs shadow-inner cursor-pointer hover:bg-white/16 transition-all"
              @click="storm.tapAdBody('loan-fast')"
            >
              <div class="flex items-center gap-2 overflow-hidden">
                <span class="text-xs opacity-80 shrink-0">🔍</span>
                <span class="text-amber-300 font-medium truncate"
                  >热搜：9.9元抢智能手表 · 速银花最高借20万</span
                >
              </div>
              <span class="text-xs opacity-75 shrink-0">🎙️</span>
            </div>
          </div>

          <!-- 第一屏应用网格 (12个核心系统与商业应用) -->
          <div class="grid grid-cols-4 gap-x-2.5 gap-y-4 py-1">
            <button
              v-for="app in APPS"
              :key="app.id"
              type="button"
              class="flex flex-col items-center gap-1 p-0 cursor-pointer group"
              @click="emit('open', app.id)"
            >
              <span
                class="grid place-items-center w-[52px] h-[52px] p-2.5 rounded-[22%] bg-gradient-to-br shadow-[0_8px_18px_-4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] text-white transition-all duration-150 ease-out active:scale-90 hover:brightness-105"
                :class="APP_GRADIENTS[app.id] ?? 'from-slate-700 to-slate-900'"
              >
                <AppIcon :name="app.id" />
              </span>
              <span
                class="text-[11px] font-medium text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.7)] tracking-wide"
              >
                {{ app.name }}
              </span>
            </button>
          </div>

          <!-- 第一屏向右滑动引导轻微提示 -->
          <div
            class="mt-auto mb-1 flex items-center justify-center gap-1 text-[10.5px] text-white/50 cursor-pointer hover:text-white/80 transition-colors"
            @click="switchPage(1)"
          >
            <span>滑动进入第二屏</span>
            <span class="text-xs">›</span>
          </div>
        </div>

        <!-- ── 第二推广与娱乐屏 (Page 1) ────────────────────────── -->
        <div class="w-1/2 h-full flex flex-col px-[18px] pt-1.5 overflow-y-auto phone-scroll">
          <!-- 顶部系统清理微件卡片 -->
          <section
            v-if="storm.adsEnabled"
            class="my-2 p-2.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 border border-blue-400/30 text-white flex items-center justify-between shadow-lg cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all"
            @click="storm.tapAdBody('quick-clean')"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 grid place-items-center text-lg shrink-0 text-cyan-300"
              >
                ⚡
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-[11.5px] font-bold truncate">系统加速 · 待清理 14.8GB</span>
                  <span
                    class="px-1 py-px rounded bg-red-500/30 text-red-300 text-[8.5px] font-bold border border-red-400/30"
                    >卡顿严重</span
                  >
                </div>
                <span class="text-[9.5px] text-blue-200/70 truncate mt-0.5"
                  >深度释放垃圾缓存 · 极速降温</span
                >
              </div>
            </div>
            <span
              class="shrink-0 px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[10px] shadow-sm ml-1"
            >
              一键加速
            </span>
          </section>

          <!-- 今日爆款补贴横幅 -->
          <div
            v-if="storm.adsEnabled"
            class="mb-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-400/30 text-amber-200 text-[10.5px] flex items-center justify-between cursor-pointer hover:bg-amber-500/25 transition-all"
            @click="storm.tapAdBody('shop-speed')"
          >
            <div class="flex items-center gap-1.5 truncate">
              <span class="text-xs">🔥</span>
              <span class="truncate">百亿补贴：旗舰数码直降 1000 元 · 24期免息</span>
            </div>
            <span class="text-amber-300 font-bold shrink-0 underline ml-1 text-[10px]">抢购 ›</span>
          </div>

          <!-- 第二屏流氓预装与推广应用网格 (16个定制应用) -->
          <div class="grid grid-cols-4 gap-x-2.5 gap-y-3.5 py-1">
            <button
              v-for="item in secondaryApps"
              :key="item.id"
              type="button"
              class="flex flex-col items-center gap-1 p-0 cursor-pointer group"
              @click="handleSecondaryAppClick(item)"
            >
              <div class="relative">
                <span
                  class="grid place-items-center w-[50px] h-[50px] rounded-[22%] bg-gradient-to-br shadow-[0_8px_18px_-4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] text-white text-2xl transition-all duration-150 ease-out active:scale-90 hover:brightness-105"
                  :class="item.gradient"
                >
                  {{ item.icon }}
                </span>
                <!-- 专属特色小角标 -->
                <span
                  v-if="item.badge"
                  class="absolute -top-1 -right-1 px-1 py-px rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[8px] leading-tight shadow-xs border border-white/40"
                >
                  {{ item.badge }}
                </span>
              </div>
              <span
                class="text-[10.5px] font-medium text-white/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.7)] tracking-wide truncate max-w-[62px]"
              >
                {{ item.name }}
              </span>
            </button>
          </div>

          <!-- 第二屏向左滑动返回引导提示 -->
          <div
            class="mt-auto mb-1 flex items-center justify-center gap-1 text-[10.5px] text-white/50 cursor-pointer hover:text-white/80 transition-colors"
            @click="switchPage(0)"
          >
            <span class="text-xs">‹</span>
            <span>滑动返回主屏</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面常驻悬浮红包/福利挂件 (全屏浮动) -->
    <div
      v-if="storm.adsEnabled && showRewardWidget"
      class="absolute right-2 top-28 z-30 flex flex-col items-center cursor-pointer group select-none"
      @click="storm.tapAdBody('home-redpacket')"
    >
      <div
        class="relative flex flex-col items-center px-2 py-1.5 rounded-2xl bg-gradient-to-b from-red-500 via-rose-500 to-amber-500 shadow-[0_8px_20px_rgba(239,68,68,0.5)] border border-yellow-200/40"
        :class="{ 'animate-bounce': !storm.reducedMotion }"
      >
        <button
          type="button"
          class="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-black/70 text-[9px] text-white/90 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="关闭挂件"
          @click.stop="showRewardWidget = false"
        >
          ✕
        </button>
        <span class="text-xl leading-none">🧧</span>
        <span class="text-[9px] font-bold text-yellow-100 leading-tight mt-0.5">领88元</span>
        <span
          class="text-[8px] bg-yellow-300 text-red-900 font-extrabold px-1 py-px rounded-full scale-90 mt-0.5"
        >
          现金
        </span>
      </div>
    </div>

    <!-- 真实手机桌面分页指示器 (Dots) -->
    <div
      class="flex justify-center items-center gap-2 py-1.5 shrink-0 z-20"
      aria-label="分页指示器"
    >
      <button
        type="button"
        class="h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none p-0"
        :class="
          currentPage === 0
            ? 'w-5 bg-white/95 shadow-[0_0_8px_rgba(255,255,255,0.6)]'
            : 'w-1.5 bg-white/35 hover:bg-white/60'
        "
        aria-label="第一屏"
        @click="switchPage(0)"
      />
      <button
        type="button"
        class="h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none p-0"
        :class="
          currentPage === 1
            ? 'w-5 bg-white/95 shadow-[0_0_8px_rgba(255,255,255,0.6)]'
            : 'w-1.5 bg-white/35 hover:bg-white/60'
        "
        aria-label="第二屏"
        @click="switchPage(1)"
      />
    </div>

    <!-- 真实手机底部常驻 Dock 栏 (跨桌面页面始终悬浮于底部) -->
    <div class="px-[18px] pb-3 shrink-0 z-20">
      <div
        class="flex justify-around items-center py-2 px-3 rounded-[26px] bg-white/[0.14] border border-white/[0.22] backdrop-blur-[24px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)]"
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
            class="grid place-items-center w-[48px] h-[48px] p-[10px] rounded-[22%] bg-gradient-to-br shadow-[0_6px_16px_-3px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] text-white transition-all duration-150 ease-out active:scale-90 hover:brightness-105"
            :class="APP_GRADIENTS[app.id] ?? 'from-slate-700 to-slate-900'"
          >
            <AppIcon :name="app.id" />
          </span>
          <span
            class="text-[10px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
            >{{ app.name }}</span
          >
        </button>
      </div>
    </div>
  </div>
</template>
