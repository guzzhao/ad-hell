<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import InAppAdSlot from '../InAppAdSlot.vue'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()

const modes = ['夜景', '人像', '拍照', '录像', '专业']
const currentMode = ref('拍照')
const currentZoom = ref('1x')
const zooms = [
  { label: '0.5', val: '0.5x', scale: 0.8 },
  { label: '1x', val: '1x', scale: 1 },
  { label: '2', val: '2x', scale: 1.25 },
  { label: '5', val: '5x', scale: 1.6 },
]

const shutterFlashing = ref(false)
const flashState = ref<'off' | 'auto' | 'on'>('auto')
const hdrState = ref(true)
const isFlipped = ref(false)
const isRecording = ref(false)
const recordSeconds = ref(0)
let recordTimer: number | null = null

// 手动对焦与测光点
const focusPoint = ref<{ x: number; y: number } | null>(null)
const focusVisible = ref(false)
let focusTimer: number | null = null

// 最近拍摄的预览缩略图
const captureCount = ref(0)
const lastPhoto = ref<string | null>(null)
const showGalleryModal = ref(false)
const showShutterAd = ref(false)

function handleViewfinderClick(e: MouseEvent): void {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = Math.round(e.clientX - rect.left)
  const y = Math.round(e.clientY - rect.top)
  focusPoint.value = { x, y }
  focusVisible.value = true

  if (focusTimer) clearTimeout(focusTimer)
  focusTimer = window.setTimeout(() => {
    focusVisible.value = false
  }, 2500)
}

function handleShutter(): void {
  if (currentMode.value === '录像') {
    isRecording.value = !isRecording.value
    if (isRecording.value) {
      recordSeconds.value = 0
      recordTimer = window.setInterval(() => {
        recordSeconds.value += 1
      }, 1000)
    } else {
      if (recordTimer) clearInterval(recordTimer)
      lastPhoto.value = '🎬'
      captureCount.value += 1
      showShutterAd.value = true
    }
    return
  }

  // 拍照快门演出
  shutterFlashing.value = true
  captureCount.value += 1
  lastPhoto.value = currentMode.value === '夜景' ? '🌃' : currentMode.value === '人像' ? '✨' : '📸'
  showShutterAd.value = true

  setTimeout(() => {
    shutterFlashing.value = false
  }, 120)
}

function toggleFlip(): void {
  isFlipped.value = !isFlipped.value
}

function cycleFlash(): void {
  if (flashState.value === 'auto') flashState.value = 'on'
  else if (flashState.value === 'on') flashState.value = 'off'
  else flashState.value = 'auto'
}

const currentScale = computed(() => {
  const found = zooms.find((z) => z.val === currentZoom.value)
  return found ? found.scale : 1
})

const formattedRecordTime = computed(() => {
  const m = String(Math.floor(recordSeconds.value / 60)).padStart(2, '0')
  const s = String(recordSeconds.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

onUnmounted(() => {
  if (focusTimer) clearTimeout(focusTimer)
  if (recordTimer) clearInterval(recordTimer)
})
</script>

<template>
  <div class="flex flex-col h-full bg-black text-white overflow-hidden relative select-none">
    <!-- 顶部状态与相机控制栏 -->
    <header class="flex items-center justify-between px-4 pt-3 pb-2 z-20 shrink-0">
      <!-- 闪光灯 -->
      <button
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs text-white/80 backdrop-blur-md cursor-pointer active:scale-95 transition-all"
        :class="{ '!bg-white/25 !text-amber-300': flashState !== 'off' }"
        aria-label="切换闪光灯"
        @click="cycleFlash"
      >
        <span>⚡</span>
        <span>{{ flashState === 'auto' ? '自动' : flashState === 'on' ? '开启' : '关闭' }}</span>
      </button>

      <!-- 录像进行中计时器 -->
      <div
        v-if="isRecording"
        class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-xs font-mono animate-pulse"
      >
        <span class="w-2 h-2 rounded-full bg-white" />
        <span>{{ formattedRecordTime }}</span>
      </div>

      <!-- HDR 与设置 -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-xs text-white/80 backdrop-blur-md cursor-pointer active:scale-95 transition-all"
          :class="{ '!bg-white/25 !text-amber-300 font-semibold': hdrState }"
          @click="hdrState = !hdrState"
        >
          HDR
        </button>
        <span
          class="text-[10px] font-mono text-white/50 px-1.5 py-0.5 rounded border border-white/20"
          >48MP</span
        >
      </div>
    </header>

    <!-- 真实取景器主舞台 -->
    <div
      class="flex-1 relative overflow-hidden flex items-center justify-center cursor-crosshair transition-all"
      :class="{
        'brightness-200 contrast-125': shutterFlashing,
        '-scale-x-100': isFlipped,
      }"
      @click="handleViewfinderClick"
    >
      <!-- 模拟镜头内实景画面 -->
      <div
        class="w-full h-full flex items-center justify-center transition-transform duration-200"
        :style="{ transform: `scale(${currentScale})` }"
      >
        <!-- 景深虚化与动态光斑 -->
        <div
          class="w-full h-full flex items-center justify-center relative bg-gradient-to-b from-slate-900 via-slate-800 to-black"
        >
          <div class="text-7xl drop-shadow-2xl select-none transition-transform">
            <span>
              {{ currentMode === '人像' ? '👤' : currentMode === '夜景' ? '🌙' : '🏞️' }}
            </span>
          </div>
          <div class="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
          <div
            class="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl"
          />
        </div>
      </div>

      <!-- 构图九宫格参考线 -->
      <div
        class="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3"
        aria-hidden="true"
      >
        <div class="border-b border-r border-white/15" />
        <div class="border-b border-r border-white/15" />
        <div class="border-b border-white/15" />
        <div class="border-b border-r border-white/15" />
        <div class="border-b border-r border-white/15" />
        <div class="border-b border-white/15" />
        <div class="border-r border-white/15" />
        <div class="border-r border-white/15" />
        <div />
      </div>

      <!-- 动态点击对焦/测光框 -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-125"
        leave-active-class="transition duration-200 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="focusVisible && focusPoint"
          class="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2"
          :style="{
            left: `${focusPoint.x}px`,
            top: `${focusPoint.y}px`,
          }"
        >
          <div
            class="w-14 h-14 border border-amber-400 rounded-none shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse"
          />
          <span class="text-amber-400 text-sm" aria-hidden="true">☀️</span>
        </div>
      </Transition>

      <!-- 专业模式手动参数 HUD -->
      <div
        v-if="currentMode === '专业'"
        class="absolute bottom-16 inset-x-0 flex justify-around text-[10px] font-mono text-white/60 bg-black/40 backdrop-blur-sm py-1"
      >
        <span>ISO 100</span>
        <span>S 1/500s</span>
        <span>EV +0.0</span>
        <span>WB 5500K</span>
        <span>AF-C</span>
      </div>

      <!-- 悬浮光学焦段选择器 -->
      <div
        class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 z-10"
        @click.stop
      >
        <button
          v-for="z in zooms"
          :key="z.val"
          type="button"
          class="w-7 h-7 rounded-full text-xs font-semibold grid place-items-center cursor-pointer text-white/70 transition-all"
          :class="{ '!bg-white/30 !text-amber-300 !scale-110': currentZoom === z.val }"
          @click="currentZoom = z.val"
        >
          {{ z.label }}
        </button>
      </div>

      <!-- 快门拍照后触发冲印浮层广告 -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-3"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="storm.adsEnabled && showShutterAd"
          class="absolute bottom-16 left-3 right-3 z-30 flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/95 to-orange-600/95 text-white shadow-xl backdrop-blur-md cursor-pointer border border-yellow-300/30"
          @click="storm.tapAdBody('camera-print')"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xl shrink-0">🖼️</span>
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-bold truncate">拍摄成功！免费领取 30 张高清冲印</span>
              <span class="text-[10px] text-yellow-100 opacity-90 truncate"
                >今日限时顺丰包邮 · 新人专享</span
              >
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0 ml-2">
            <span
              class="px-2.5 py-1 rounded-full bg-white text-orange-700 text-xs font-extrabold shadow-sm"
              >立即领</span
            >
            <button
              type="button"
              class="w-5 h-5 rounded-full bg-black/30 text-[10px] text-white/80 grid place-items-center"
              aria-label="关闭广告"
              @click.stop="showShutterAd = false"
            >
              ✕
            </button>
          </div>
        </div>
      </Transition>

      <!-- 广告保留挂载点（由 adsEnabled 状态控制） -->
      <InAppAdSlot
        v-if="storm.adsEnabled"
        creative-id="fake-system"
        caption="相机取景界面广告（现实中常伪装为镜头滤镜推荐）"
      />
    </div>

    <!-- 模式横向滑动切换 -->
    <nav
      class="flex items-center justify-center gap-6 py-2 bg-black text-xs shrink-0 tracking-wider"
      aria-label="拍摄模式"
    >
      <button
        v-for="mode in modes"
        :key="mode"
        type="button"
        class="text-white/50 cursor-pointer font-medium transition-colors"
        :class="{ '!text-amber-400 !font-bold': currentMode === mode }"
        @click="currentMode = mode"
      >
        {{ mode }}
      </button>
    </nav>

    <!-- 底部快门与相册控制栏 -->
    <footer class="flex items-center justify-around px-6 pt-2 pb-6 bg-black shrink-0">
      <!-- 最近照片相册入口 -->
      <div class="w-12 flex justify-center">
        <button
          type="button"
          class="relative w-11 h-11 rounded-full bg-white/10 border border-white/20 grid place-items-center text-xl cursor-pointer overflow-hidden"
          aria-label="查看相册"
          @click="showGalleryModal = true"
        >
          <span>{{ lastPhoto || '🖼️' }}</span>
          <span
            v-if="captureCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold grid place-items-center"
            >{{ captureCount }}</span
          >
        </button>
      </div>

      <!-- 快门键 -->
      <div class="flex justify-center">
        <button
          type="button"
          class="w-18 h-18 rounded-full border-4 border-white p-1 grid place-items-center cursor-pointer active:scale-95 transition-transform"
          :aria-label="currentMode === '录像' ? (isRecording ? '停止录像' : '开始录像') : '拍照'"
          @click="handleShutter"
        >
          <span
            class="w-full h-full rounded-full transition-all"
            :class="[
              currentMode === '录像'
                ? isRecording
                  ? 'bg-red-600 !rounded-md !w-6 !h-6'
                  : 'bg-red-600'
                : 'bg-white',
            ]"
          />
        </button>
      </div>

      <!-- 前后镜头翻转 -->
      <div class="w-12 flex justify-center">
        <button
          type="button"
          class="w-11 h-11 rounded-full bg-white/10 grid place-items-center text-xl cursor-pointer active:rotate-180 transition-transform"
          aria-label="翻转前后镜头"
          @click="toggleFlip"
        >
          <span>⟳</span>
        </button>
      </div>
    </footer>

    <!-- 照片预览画廊弹窗 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showGalleryModal"
        class="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex flex-col justify-between text-white"
        @click="showGalleryModal = false"
      >
        <div class="w-full flex-1 flex flex-col" @click.stop>
          <header class="flex justify-between items-center py-2 text-sm text-gray-300">
            <span>刚刚拍摄 · 4800万像素 HDR</span>
            <button
              type="button"
              class="w-7 h-7 rounded-full bg-white/10 grid place-items-center cursor-pointer text-white"
              @click="showGalleryModal = false"
            >
              ✕
            </button>
          </header>
          <div class="flex-1 grid place-items-center text-8xl">
            <span>{{ lastPhoto || '📸' }}</span>
          </div>
          <p class="text-center text-xs text-gray-400 py-3">已存入系统相册 · RAW无损格式</p>
        </div>
      </div>
    </Transition>
  </div>
</template>
