<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import InAppAdSlot from '../InAppAdSlot.vue'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()

// 拍摄模式
const modes = ['夜景', '人像', '拍照', '录像', '专业']
const currentMode = ref('拍照')

// 变焦倍率
const currentZoom = ref('1x')
const zooms = [
  { label: '0.5', val: '0.5x', scale: 0.8 },
  { label: '1x', val: '1x', scale: 1 },
  { label: '2', val: '2x', scale: 1.25 },
  { label: '5', val: '5x', scale: 1.6 },
]

// 相机硬件与参数状态
const shutterFlashing = ref(false)
const flashState = ref<'off' | 'auto' | 'on'>('auto')
const hdrState = ref(true)
const resolutionState = ref<'48MP' | '12MP'>('48MP')
const isFlipped = ref(false)
const isRecording = ref(false)
const recordSeconds = ref(0)
let recordTimer: number | null = null

// 倒计时拍摄定时器 (0 = 关, 3 = 3s, 10 = 10s)
const timerMode = ref<0 | 3 | 10>(0)
const countdownValue = ref<number | null>(null)
let countdownTimer: number | null = null

// 水印与网格设置
const showGrid = ref(true)
const showWatermark = ref(true)
const shutterSoundEnabled = ref(true)
const ringLightEnabled = ref(false)
const showSettingsModal = ref(false)

// 滤镜系统
interface FilterPreset {
  id: string
  name: string
  css: string
  isVip?: boolean
  description: string
}

const filters: FilterPreset[] = [
  { id: 'normal', name: '原图', css: 'none', description: '真实自然' },
  {
    id: 'film',
    name: '胶片',
    css: 'contrast(1.12) saturate(1.15) sepia(0.22) brightness(0.96)',
    description: '复古暖调',
  },
  {
    id: 'clear',
    name: '清透',
    css: 'contrast(1.22) saturate(1.2) brightness(1.06) hue-rotate(-6deg)',
    description: '通透冷白',
  },
  {
    id: 'retro',
    name: '古董',
    css: 'sepia(0.55) contrast(0.92) brightness(0.94) saturate(1.1)',
    description: '旧时光感',
  },
  {
    id: 'mono',
    name: '黑白',
    css: 'grayscale(1) contrast(1.35) brightness(0.92)',
    description: '经典莱卡黑白',
  },
  {
    id: 'japanese',
    name: '日系',
    css: 'brightness(1.12) saturate(0.85) contrast(0.95)',
    description: '清新柔和',
  },
  {
    id: 'vip_cinematic',
    name: '👑电影',
    css: 'contrast(1.25) saturate(1.3) hue-rotate(10deg) brightness(0.9)',
    isVip: true,
    description: '大师电影宽幅',
  },
]
const currentFilter = ref<FilterPreset>(filters[0]!)
const showFilterTray = ref(false)
const showVipFilterModal = ref(false)

// 专业模式手动参数
const proIso = ref('100')
const proShutter = ref('1/500s')
const proEv = ref('+0.0')
const proWb = ref('5500K')
const proFormat = ref<'RAW' | 'JPG'>('RAW')

// 人像模式虚拟光圈虚化 (ƒ/1.4 ~ ƒ/16)
const portraitAperture = ref('ƒ/2.0')
const portraitApertures = ['ƒ/1.4', 'ƒ/2.0', 'ƒ/4.0', 'ƒ/8.0']
const portraitBlur = computed(() => {
  switch (portraitAperture.value) {
    case 'ƒ/1.4':
      return 'blur(6px)'
    case 'ƒ/2.0':
      return 'blur(4px)'
    case 'ƒ/4.0':
      return 'blur(2px)'
    default:
      return 'blur(0px)'
  }
})

// 手动对焦与测光点
const focusPoint = ref<{ x: number; y: number } | null>(null)
const focusVisible = ref(false)
let focusTimer: number | null = null

// 夜景长曝光模拟进度
const nightProcessing = ref(false)
const nightProgress = ref(0)
let nightTimer: number | null = null

// 拍摄成果存储与历史相册
interface CapturedPhoto {
  id: number
  emoji: string
  mode: string
  filterName: string
  filterCss: string
  timestamp: string
  location: string
  exif: string
  watermark: boolean
  isFlipped: boolean
  isFavorite: boolean
}

const capturedPhotos = ref<CapturedPhoto[]>([])
const activeGalleryIndex = ref<number>(0)
const showGalleryModal = ref(false)
const showShutterAd = ref(false)
const showViewfinderAd = ref(true)
const showEnhanceToast = ref(false)

// 合成快门音与提示音 (Web Audio)
function playShutterSound(): void {
  if (!shutterSoundEnabled.value) return
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // 第一声：反光镜升起快门帘开启 (轻脆高频脉冲)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(850, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.04)
    gain.gain.setValueAtTime(0.35, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)

    // 第二声：快门帘闭合机械回弹 (机械厚重感)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'square'
    osc2.frequency.setValueAtTime(320, now + 0.055)
    osc2.frequency.exponentialRampToValueAtTime(90, now + 0.11)
    gain2.gain.setValueAtTime(0.28, now + 0.055)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.11)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.055)
    osc2.stop(now + 0.12)
  } catch {
    // 降级容错
  }
}

function playBeepSound(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1050, now)
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.09)
  } catch {
    // 降级容错
  }
}

// 触摸取景器手动对焦
function handleViewfinderClick(e: MouseEvent): void {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = Math.round(e.clientX - rect.left)
  const y = Math.round(e.clientY - rect.top)
  focusPoint.value = { x, y }
  focusVisible.value = true

  if (focusTimer) clearTimeout(focusTimer)
  focusTimer = window.setTimeout(() => {
    focusVisible.value = false
  }, 2200)
}

// 执行拍照并生成实体照片对象
function executeCapture(): void {
  // 快门视效与音效
  shutterFlashing.value = true
  playShutterSound()

  let photoEmoji = '📸'
  if (isFlipped.value) {
    photoEmoji = '🤳'
  } else if (currentMode.value === '夜景') {
    photoEmoji = '🌃'
  } else if (currentMode.value === '人像') {
    photoEmoji = '✨'
  } else if (currentMode.value === '录像') {
    photoEmoji = '🎬'
  } else if (currentMode.value === '专业') {
    photoEmoji = '🌄'
  } else {
    photoEmoji = '🏞️'
  }

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  const newPhoto: CapturedPhoto = {
    id: Date.now(),
    emoji: photoEmoji,
    mode: currentMode.value,
    filterName: currentFilter.value.name,
    filterCss: currentFilter.value.css,
    timestamp: timeStr,
    location: '杭州 · 西湖风景名胜区',
    exif: `${resolutionState.value} · 24mm ${portraitAperture.value} · ${proShutter.value} · ISO ${proIso.value}`,
    watermark: showWatermark.value,
    isFlipped: isFlipped.value,
    isFavorite: false,
  }

  capturedPhotos.value.unshift(newPhoto)
  activeGalleryIndex.value = 0

  setTimeout(() => {
    shutterFlashing.value = false
  }, 140)

  // 触发冲印浮层广告
  showShutterAd.value = true
}

// 快门主逻辑 (支持倒计时、夜景多帧、录像)
function handleShutter(): void {
  if (nightProcessing.value) return

  // 录像模式
  if (currentMode.value === '录像') {
    isRecording.value = !isRecording.value
    if (isRecording.value) {
      recordSeconds.value = 0
      recordTimer = window.setInterval(() => {
        recordSeconds.value += 1
      }, 1000)
    } else {
      if (recordTimer) clearInterval(recordTimer)
      executeCapture()
    }
    return
  }

  // 倒计时拍摄
  if (timerMode.value > 0) {
    if (countdownTimer) return
    countdownValue.value = timerMode.value
    playBeepSound()

    countdownTimer = window.setInterval(() => {
      if (countdownValue.value !== null && countdownValue.value > 1) {
        countdownValue.value -= 1
        playBeepSound()
      } else {
        if (countdownTimer) clearInterval(countdownTimer)
        countdownTimer = null
        countdownValue.value = null
        proceedShutterCapture()
      }
    }, 1000)
    return
  }

  proceedShutterCapture()
}

// 实际进入快门拍摄阶段 (区分夜景长曝光与普通快门)
function proceedShutterCapture(): void {
  if (currentMode.value === '夜景') {
    nightProcessing.value = true
    nightProgress.value = 0
    const step = 5
    nightTimer = window.setInterval(() => {
      nightProgress.value += step
      if (nightProgress.value >= 100) {
        if (nightTimer) clearInterval(nightTimer)
        nightProcessing.value = false
        executeCapture()
      }
    }, 60)
  } else {
    executeCapture()
  }
}

// 翻转前后镜头
function toggleFlip(): void {
  isFlipped.value = !isFlipped.value
}

// 循环切换闪光灯
function cycleFlash(): void {
  if (flashState.value === 'auto') flashState.value = 'on'
  else if (flashState.value === 'on') flashState.value = 'off'
  else flashState.value = 'auto'
}

// 循环切换倒计时 (0 -> 3 -> 10 -> 0)
function cycleTimer(): void {
  if (timerMode.value === 0) timerMode.value = 3
  else if (timerMode.value === 3) timerMode.value = 10
  else timerMode.value = 0
}

// 切换超清模式 (48MP <-> 12MP)
function toggleResolution(): void {
  resolutionState.value = resolutionState.value === '48MP' ? '12MP' : '48MP'
}

// 选择滤镜
function selectFilter(filter: FilterPreset): void {
  if (filter.isVip && storm.adsEnabled) {
    showVipFilterModal.value = true
    return
  }
  currentFilter.value = filter
}

function handleVipUnlock(): void {
  showVipFilterModal.value = false
  storm.tapAdBody('camera-print')
}

// 收藏照片
function toggleFavoriteCurrent(): void {
  const current = capturedPhotos.value[activeGalleryIndex.value]
  if (current) {
    current.isFavorite = !current.isFavorite
  }
}

// 删除当前照片
function deleteCurrentPhoto(): void {
  if (capturedPhotos.value.length === 0) return
  capturedPhotos.value.splice(activeGalleryIndex.value, 1)
  if (activeGalleryIndex.value >= capturedPhotos.value.length) {
    activeGalleryIndex.value = Math.max(0, capturedPhotos.value.length - 1)
  }
  if (capturedPhotos.value.length === 0) {
    showGalleryModal.value = false
  }
}

// 触发 AI 画质修复模拟
function triggerEnhancePhoto(): void {
  showEnhanceToast.value = true
  setTimeout(() => {
    showEnhanceToast.value = false
  }, 2200)
}

// 计算属性
const currentScale = computed(() => {
  const found = zooms.find((z) => z.val === currentZoom.value)
  return found ? found.scale : 1
})

const formattedRecordTime = computed(() => {
  const m = String(Math.floor(recordSeconds.value / 60)).padStart(2, '0')
  const s = String(recordSeconds.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

const lastPhotoPreview = computed(() => {
  return capturedPhotos.value.length > 0 ? capturedPhotos.value[0]?.emoji : '🖼️'
})

const activePhoto = computed(() => {
  return capturedPhotos.value[activeGalleryIndex.value] || null
})

onUnmounted(() => {
  if (focusTimer) clearTimeout(focusTimer)
  if (recordTimer) clearInterval(recordTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  if (nightTimer) clearInterval(nightTimer)
})
</script>

<template>
  <div class="flex flex-col h-full bg-black text-white overflow-hidden relative select-none">
    <!-- 前置自拍柔光屏幕补光灯覆盖层 (开启柔光补光灯时柔和照亮) -->
    <div
      v-if="isFlipped && ringLightEnabled"
      class="absolute inset-0 pointer-events-none z-30 border-[16px] border-amber-100/40 shadow-[inset_0_0_80px_rgba(254,243,199,0.35)] transition-all"
    />

    <!-- 顶部状态与相机控制栏 -->
    <header class="flex items-center justify-between px-3 pt-2.5 pb-1.5 z-20 shrink-0 bg-black/60">
      <!-- 闪光灯 -->
      <button
        type="button"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[11px] text-white/80 backdrop-blur-md cursor-pointer active:scale-95 transition-all"
        :class="{ '!bg-amber-400/25 !text-amber-300 font-medium': flashState !== 'off' }"
        aria-label="切换闪光灯"
        @click="cycleFlash"
      >
        <span>⚡</span>
        <span>{{ flashState === 'auto' ? '自动' : flashState === 'on' ? '常开' : '关' }}</span>
      </button>

      <!-- 定时倒计时 -->
      <button
        type="button"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[11px] text-white/80 backdrop-blur-md cursor-pointer active:scale-95 transition-all"
        :class="{ '!bg-amber-400/25 !text-amber-300 font-medium': timerMode > 0 }"
        aria-label="切换倒计时"
        @click="cycleTimer"
      >
        <span>⏱️</span>
        <span>{{ timerMode === 0 ? '倒计' : `${timerMode}s` }}</span>
      </button>

      <!-- 录像计时指示 -->
      <div
        v-if="isRecording"
        class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-xs font-mono animate-pulse"
      >
        <span class="w-2 h-2 rounded-full bg-white" />
        <span>{{ formattedRecordTime }}</span>
      </div>

      <!-- HDR 切换 -->
      <button
        type="button"
        class="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 text-[11px] text-white/80 backdrop-blur-md cursor-pointer active:scale-95 transition-all"
        :class="{ '!bg-amber-400/25 !text-amber-300 font-semibold': hdrState }"
        aria-label="HDR切换"
        @click="hdrState = !hdrState"
      >
        HDR
      </button>

      <!-- 分辨率 48MP / 12MP -->
      <button
        type="button"
        class="text-[10px] font-mono px-2 py-0.5 rounded border border-white/20 text-white/70 active:scale-95 transition-all"
        :class="{ '!border-amber-400 !text-amber-300 font-bold': resolutionState === '48MP' }"
        @click="toggleResolution"
      >
        {{ resolutionState }}
      </button>

      <!-- 滤镜菜单开关 -->
      <button
        type="button"
        class="w-7 h-7 rounded-full bg-white/10 grid place-items-center text-xs text-white/80 cursor-pointer active:scale-95 transition-all"
        :class="{ '!bg-amber-400/30 !text-amber-300': showFilterTray }"
        aria-label="滤镜面板"
        @click="showFilterTray = !showFilterTray"
      >
        🎨
      </button>

      <!-- 设置抽屉 -->
      <button
        type="button"
        class="w-7 h-7 rounded-full bg-white/10 grid place-items-center text-xs text-white/80 cursor-pointer active:scale-95 transition-all"
        aria-label="相机设置"
        @click="showSettingsModal = true"
      >
        ⚙️
      </button>
    </header>

    <!-- 真实取景器主舞台 -->
    <div
      class="flex-1 relative overflow-hidden cursor-crosshair transition-all"
      :class="{
        'brightness-200 contrast-125': shutterFlashing,
      }"
      @click="handleViewfinderClick"
    >
      <!-- 取景画面色彩滤镜承载层 (全屏绝对铺满) -->
      <div
        class="absolute inset-0 flex items-center justify-center transition-all duration-300"
        :style="{
          filter: currentFilter.css,
          transform: `scale(${currentScale}) ${isFlipped ? 'scaleX(-1)' : ''}`,
        }"
      >
        <!-- 模拟镜头内实景画面 -->
        <div
          class="w-full h-full flex items-center justify-center relative overflow-hidden transition-all duration-300"
          :class="{
            'bg-gradient-to-b from-sky-900 via-blue-900 to-emerald-950': currentMode === '拍照',
            'bg-gradient-to-b from-rose-950 via-purple-950 to-neutral-950': currentMode === '人像',
            'bg-gradient-to-b from-indigo-950 via-slate-950 to-black': currentMode === '夜景',
            'bg-gradient-to-b from-neutral-900 via-zinc-900 to-black': currentMode === '录像',
            'bg-gradient-to-b from-amber-950 via-neutral-950 to-black': currentMode === '专业',
          }"
        >
          <!-- 背景动感光斑与景深 -->
          <div
            class="absolute top-1/4 left-1/4 w-36 h-36 rounded-full bg-blue-500/15 blur-3xl pointer-events-none"
          />
          <div
            class="absolute bottom-1/3 right-1/4 w-44 h-44 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"
          />

          <!-- 模式一：拍照模式风景实景 -->
          <div
            v-if="currentMode === '拍照' && !isFlipped"
            class="w-full h-full flex flex-col items-center justify-center relative select-none"
          >
            <!-- 远山与太阳 -->
            <div class="absolute top-12 left-10 w-16 h-16 rounded-full bg-amber-200/20 blur-xl" />
            <div class="text-amber-100/30 text-5xl absolute top-10 left-12 animate-pulse">☀️</div>

            <!-- 主景主体 -->
            <div
              class="flex flex-col items-center justify-center z-10 transition-transform duration-300"
            >
              <span class="text-8xl drop-shadow-2xl">🏔️</span>
              <div class="flex items-center gap-1.5 mt-2">
                <span class="text-4xl">🌲</span>
                <span class="text-5xl">🦌</span>
                <span class="text-4xl">🌲</span>
              </div>
            </div>

            <!-- AI 场景识别气泡标签 -->
            <div
              class="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] text-amber-300 border border-amber-400/20 transition-all duration-200"
              :class="{ '!top-24': storm.adsEnabled && showViewfinderAd }"
            >
              <span class="animate-spin">✦</span>
              <span>AI 场景识别: 阳光山川 · 逆光 HDR</span>
            </div>
          </div>

          <!-- 模式二：人像模式（人脸追踪与大光圈景深虚化） -->
          <div
            v-else-if="currentMode === '人像' && !isFlipped"
            class="w-full h-full flex flex-col items-center justify-center relative select-none"
          >
            <!-- 背景虚化层 -->
            <div
              class="absolute inset-0 flex items-center justify-around opacity-30 transition-all duration-300 pointer-events-none"
              :style="{ filter: portraitBlur }"
            >
              <span class="text-6xl">🌸</span>
              <span class="text-7xl">🌿</span>
              <span class="text-6xl">✨</span>
            </div>

            <!-- 人像主体与智能对焦人脸框 -->
            <div class="relative flex flex-col items-center justify-center z-10">
              <span class="text-8xl drop-shadow-2xl">👤</span>

              <!-- 人脸对焦识别框 -->
              <div
                class="absolute -top-3 w-28 h-32 border-2 border-dashed border-amber-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-1 shadow-[0_0_12px_rgba(251,191,36,0.3)] animate-pulse"
              >
                <div class="flex justify-between text-[9px] text-amber-300 font-mono">
                  <span>99.2%</span>
                  <span>人脸追踪</span>
                </div>
                <div class="text-[8px] text-amber-200/90 text-center font-mono">质感肤色优化中</div>
              </div>
            </div>

            <!-- 美颜与虚化参数标签 -->
            <div
              class="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] text-rose-300 border border-rose-400/20 transition-all duration-200"
              :class="{ '!top-24': storm.adsEnabled && showViewfinderAd }"
            >
              <span>✨ 自然美颜 65% · 虚化 {{ portraitAperture }}</span>
            </div>
          </div>

          <!-- 模式三：夜景模式（星空、霓虹与长曝光） -->
          <div
            v-else-if="currentMode === '夜景' && !isFlipped"
            class="w-full h-full flex flex-col items-center justify-center relative select-none"
          >
            <!-- 繁星与月色 -->
            <div class="absolute top-8 right-10 text-4xl text-amber-200 drop-shadow-lg">🌙</div>
            <div class="absolute top-12 left-8 text-xs text-blue-200 opacity-60">✨</div>
            <div class="absolute top-20 right-28 text-xs text-indigo-200 opacity-80">⭐</div>

            <!-- 璀璨夜景轮廓 -->
            <div class="flex flex-col items-center justify-center z-10">
              <span class="text-8xl drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]">🌃</span>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-3xl text-indigo-400">✨</span>
                <span class="text-3xl text-rose-400">🏮</span>
                <span class="text-3xl text-amber-400">✨</span>
              </div>
            </div>

            <!-- 极暗光指示 -->
            <div
              class="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] text-indigo-300 border border-indigo-400/20 transition-all duration-200"
              :class="{ '!top-24': storm.adsEnabled && showViewfinderAd }"
            >
              <span>🌙 极暗夜景环境 · 建议手持保持稳定</span>
            </div>
          </div>

          <!-- 模式四：录像模式（动态画面与录制指示） -->
          <div
            v-else-if="currentMode === '录像' && !isFlipped"
            class="w-full h-full flex flex-col items-center justify-center relative select-none"
          >
            <div class="flex flex-col items-center justify-center z-10">
              <span class="text-8xl drop-shadow-2xl">🚗</span>
              <div class="flex items-center gap-4 mt-2">
                <span class="text-4xl">🏙️</span>
                <span class="text-4xl">🌳</span>
                <span class="text-4xl">🚦</span>
              </div>
            </div>

            <!-- 录像参数与音频跳动条 -->
            <div
              class="absolute top-3 left-3 flex items-center gap-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] text-red-300 border border-red-500/20 transition-all duration-200"
              :class="{ '!top-24': storm.adsEnabled && showViewfinderAd }"
            >
              <span
                class="w-1.5 h-1.5 rounded-full bg-red-500"
                :class="{ 'animate-ping': isRecording }"
              />
              <span>4K 60FPS · 杜比视界</span>
              <span v-if="isRecording" class="font-mono text-emerald-400 tracking-tighter">
                ▂▃▅▆▇
              </span>
            </div>
          </div>

          <!-- 模式五：专业模式（参数叠加与取景） -->
          <div
            v-else-if="currentMode === '专业' && !isFlipped"
            class="w-full h-full flex flex-col items-center justify-center relative select-none"
          >
            <div class="flex flex-col items-center justify-center z-10">
              <span class="text-8xl drop-shadow-2xl">🌄</span>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-3xl">🦅</span>
                <span class="text-4xl">🌲</span>
              </div>
            </div>

            <!-- 电子水平仪中线 -->
            <div
              class="absolute inset-x-8 top-1/2 -translate-y-1/2 flex items-center pointer-events-none opacity-40"
            >
              <div class="flex-1 h-px bg-amber-400" />
              <div class="w-2.5 h-2.5 border border-amber-400 rounded-full mx-1" />
              <div class="flex-1 h-px bg-amber-400" />
            </div>

            <!-- 实时直方图 HUD 模拟 -->
            <div
              class="absolute top-3 right-3 p-1.5 rounded bg-black/60 border border-white/10 text-[9px] font-mono pointer-events-none flex flex-col gap-0.5 transition-all duration-200"
              :class="{ '!top-24': storm.adsEnabled && showViewfinderAd }"
            >
              <div class="flex items-end gap-0.5 h-6 w-16">
                <span class="w-1 bg-white/40 h-2" />
                <span class="w-1 bg-white/50 h-4" />
                <span class="w-1 bg-white/70 h-5" />
                <span class="w-1 bg-white/90 h-6" />
                <span class="w-1 bg-white/80 h-4" />
                <span class="w-1 bg-white/60 h-3" />
                <span class="w-1 bg-white/30 h-1" />
              </div>
              <span class="text-white/50 text-[8px] text-right">HISTOGRAM</span>
            </div>
          </div>

          <!-- 前置自拍画面 (isFlipped 为真) -->
          <div
            v-else
            class="w-full h-full flex flex-col items-center justify-center relative select-none"
          >
            <div class="flex flex-col items-center justify-center z-10">
              <span class="text-8xl drop-shadow-2xl">🤳</span>
              <span class="text-xs text-white/60 mt-2 font-mono">前置 3200万像素 超广角自拍</span>
            </div>

            <div
              class="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] text-amber-300 border border-amber-400/20 transition-all duration-200"
              :class="{ '!top-24': storm.adsEnabled && showViewfinderAd }"
            >
              <span>🌸 屏幕智能补光 · 自动微表情对焦</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 构图九宫格参考线 -->
      <div
        v-if="showGrid"
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
            class="w-14 h-14 border border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse"
          />
          <span class="text-amber-400 text-sm" aria-hidden="true">☀️</span>
        </div>
      </Transition>

      <!-- 倒计时数字全屏指示器 -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-150"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 scale-75"
      >
        <div
          v-if="countdownValue !== null"
          class="absolute inset-0 z-40 bg-black/30 backdrop-blur-xs grid place-items-center pointer-events-none"
        >
          <span
            class="text-8xl font-black text-amber-300 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] animate-bounce"
          >
            {{ countdownValue }}
          </span>
        </div>
      </Transition>

      <!-- 夜景多帧长曝光合成进度覆盖层 -->
      <div
        v-if="nightProcessing"
        class="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 gap-4 text-center pointer-events-none"
      >
        <div
          class="w-16 h-16 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin"
        />
        <div class="flex flex-col gap-1">
          <strong class="text-base text-amber-300 font-bold">夜景多帧降噪合成中...</strong>
          <span class="text-xs text-white/70">保持手机稳定 · {{ nightProgress }}%</span>
        </div>
      </div>

      <!-- 人像光圈虚拟调节滑块 -->
      <div
        v-if="currentMode === '人像'"
        class="absolute bottom-16 inset-x-4 flex items-center justify-center gap-2 z-10 bg-black/40 backdrop-blur-md py-1 px-3 rounded-full border border-white/10"
        @click.stop
      >
        <span class="text-[10px] text-white/60">虚化光圈</span>
        <div class="flex items-center gap-1.5">
          <button
            v-for="ap in portraitApertures"
            :key="ap"
            type="button"
            class="px-2 py-0.5 rounded-full text-[11px] font-mono cursor-pointer transition-all"
            :class="[
              portraitAperture === ap
                ? 'bg-amber-400 text-black font-bold'
                : 'text-white/70 hover:bg-white/10',
            ]"
            @click="portraitAperture = ap"
          >
            {{ ap }}
          </button>
        </div>
      </div>

      <!-- 专业模式手动参数 HUD 栏 -->
      <div
        v-if="currentMode === '专业'"
        class="absolute bottom-16 inset-x-2 flex items-center justify-around text-[10px] font-mono text-white/80 bg-black/60 backdrop-blur-md py-1.5 px-2 rounded-lg border border-white/10 z-10"
        @click.stop
      >
        <button
          type="button"
          class="flex flex-col items-center cursor-pointer hover:text-amber-300"
          @click="proIso = proIso === '100' ? '400' : proIso === '400' ? '1600' : '100'"
        >
          <span class="text-[8px] text-white/40">ISO</span>
          <span class="font-bold text-amber-300">{{ proIso }}</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center cursor-pointer hover:text-amber-300"
          @click="
            proShutter =
              proShutter === '1/500s' ? '1/125s' : proShutter === '1/125s' ? '1/30s' : '1/500s'
          "
        >
          <span class="text-[8px] text-white/40">快门 S</span>
          <span class="font-bold">{{ proShutter }}</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center cursor-pointer hover:text-amber-300"
          @click="proEv = proEv === '+0.0' ? '+0.7' : proEv === '+0.7' ? '-0.7' : '+0.0'"
        >
          <span class="text-[8px] text-white/40">曝光 EV</span>
          <span class="font-bold">{{ proEv }}</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center cursor-pointer hover:text-amber-300"
          @click="proWb = proWb === '5500K' ? '3200K' : proWb === '3200K' ? '7000K' : '5500K'"
        >
          <span class="text-[8px] text-white/40">白平衡 WB</span>
          <span class="font-bold">{{ proWb }}</span>
        </button>
        <button
          type="button"
          class="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-bold text-white cursor-pointer active:scale-95"
          @click="proFormat = proFormat === 'RAW' ? 'JPG' : 'RAW'"
        >
          {{ proFormat }}
        </button>
      </div>

      <!-- 悬浮光学焦段选择器 (0.5x, 1x, 2x, 5x) -->
      <div
        class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 z-10"
        @click.stop
      >
        <button
          v-for="z in zooms"
          :key="z.val"
          type="button"
          class="w-7 h-7 rounded-full text-xs font-semibold grid place-items-center cursor-pointer text-white/70 transition-all"
          :class="{ '!bg-white/30 !text-amber-300 !scale-110 font-bold': currentZoom === z.val }"
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

      <!-- 广告悬浮挂载点（由 adsEnabled 状态控制，绝对定位浮于取景器上方，避免 flex 挤压形成左右分栏） -->
      <div
        v-if="storm.adsEnabled && showViewfinderAd"
        class="absolute top-3 left-3 right-3 z-25 pointer-events-auto"
        @click.stop
      >
        <div class="relative">
          <button
            type="button"
            class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 text-white/80 text-[10px] grid place-items-center z-10 cursor-pointer border border-white/20 hover:bg-black active:scale-95 shadow-sm"
            aria-label="关闭相机广告"
            @click.stop="showViewfinderAd = false"
          >
            ✕
          </button>
          <InAppAdSlot
            creative-id="fake-system"
            caption="相机取景界面广告（现实中常伪装为镜头滤镜推荐）"
            class="!my-0"
          />
        </div>
      </div>
    </div>

    <!-- 底部滑出滤镜调色盘 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showFilterTray"
        class="bg-neutral-900/95 backdrop-blur-md px-3 py-2 border-t border-white/10 z-20 shrink-0"
      >
        <div class="flex items-center justify-between mb-1.5 px-1">
          <span class="text-[11px] font-semibold text-white/70">风格色彩滤镜</span>
          <span class="text-[10px] text-amber-300">{{ currentFilter.description }}</span>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            v-for="flt in filters"
            :key="flt.id"
            type="button"
            class="flex flex-col items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-all"
            @click="selectFilter(flt)"
          >
            <div
              class="w-10 h-10 rounded-full border-2 grid place-items-center text-xs font-bold transition-all shadow-sm"
              :class="[
                currentFilter.id === flt.id
                  ? 'border-amber-400 text-amber-300 scale-105 bg-white/15'
                  : 'border-white/20 text-white/70 bg-white/5',
              ]"
            >
              <span>{{ flt.name.slice(0, 2) }}</span>
            </div>
            <span
              class="text-[10px] truncate max-w-[44px]"
              :class="{ 'text-amber-300 font-bold': currentFilter.id === flt.id }"
            >
              {{ flt.name }}
            </span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 模式横向滑动切换 -->
    <nav
      class="flex items-center justify-center gap-6 py-2 bg-black text-xs shrink-0 tracking-wider z-10"
      aria-label="拍摄模式"
    >
      <button
        v-for="mode in modes"
        :key="mode"
        type="button"
        class="text-white/50 cursor-pointer font-medium transition-colors"
        :class="{ '!text-amber-400 !font-bold scale-105': currentMode === mode }"
        @click="currentMode = mode"
      >
        {{ mode }}
      </button>
    </nav>

    <!-- 底部快门与相册控制栏 -->
    <footer class="flex items-center justify-around px-6 pt-2 pb-6 bg-black shrink-0 z-10">
      <!-- 最近照片相册入口 -->
      <div class="w-12 flex justify-center">
        <button
          type="button"
          class="relative w-11 h-11 rounded-full bg-white/10 border border-white/20 grid place-items-center text-xl cursor-pointer overflow-hidden active:scale-95 transition-transform"
          aria-label="查看相册"
          @click="showGalleryModal = true"
        >
          <span>{{ lastPhotoPreview }}</span>
          <span
            v-if="capturedPhotos.length > 0"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold grid place-items-center"
          >
            {{ capturedPhotos.length }}
          </span>
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

    <!-- 全屏照片详情画廊查看模态框 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showGalleryModal"
        class="absolute inset-0 z-50 bg-black/95 backdrop-blur-md p-4 flex flex-col justify-between text-white"
        role="dialog"
        aria-modal="true"
        aria-label="查看拍摄照片"
        @click="showGalleryModal = false"
      >
        <div class="w-full h-full flex flex-col justify-between" @click.stop>
          <header
            class="flex justify-between items-center py-2 text-sm text-gray-300 border-b border-white/10"
          >
            <div class="flex items-center gap-2">
              <span class="font-bold text-white">拍摄成果预览</span>
              <span v-if="capturedPhotos.length > 0" class="text-xs text-white/50">
                ({{ activeGalleryIndex + 1 }} / {{ capturedPhotos.length }})
              </span>
            </div>
            <button
              type="button"
              class="w-7 h-7 rounded-full bg-white/10 grid place-items-center cursor-pointer text-white active:scale-95"
              aria-label="关闭照片预览"
              @click="showGalleryModal = false"
            >
              ✕
            </button>
          </header>

          <!-- 照片展示区 -->
          <div
            v-if="activePhoto"
            class="flex-1 flex flex-col items-center justify-center my-3 relative"
          >
            <div
              class="w-full max-h-[300px] aspect-[3/4] rounded-2xl flex flex-col items-center justify-center relative shadow-2xl overflow-hidden border border-white/10"
              :style="{
                filter: activePhoto.filterCss,
                background:
                  activePhoto.mode === '人像'
                    ? 'linear-gradient(135deg, #4c1d95, #1e1b4b)'
                    : activePhoto.mode === '夜景'
                      ? 'linear-gradient(135deg, #0f172a, #020617)'
                      : 'linear-gradient(135deg, #1e3a8a, #064e3b)',
              }"
            >
              <!-- 模拟照片图案 -->
              <span class="text-8xl select-none">{{ activePhoto.emoji }}</span>

              <!-- 拍摄水印条 (若开启) -->
              <div
                v-if="activePhoto.watermark"
                class="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded"
              >
                <span>📸 LEICA SUMMICRON · 48MP AI CAMERA</span>
                <span class="text-amber-300/90 font-bold">顺丰包邮冲印赞助</span>
              </div>
            </div>

            <!-- 照片 EXIF 参数信息条 -->
            <div
              class="w-full flex items-center justify-between text-[11px] text-white/60 mt-3 px-2"
            >
              <span>📍 {{ activePhoto.location }}</span>
              <span>{{ activePhoto.timestamp }}</span>
            </div>
            <div class="w-full text-[10px] text-amber-200/70 font-mono mt-0.5 px-2">
              {{ activePhoto.exif }} · 滤镜: {{ activePhoto.filterName }}
            </div>
          </div>

          <!-- 无照片提示 -->
          <div v-else class="flex-1 grid place-items-center text-center text-white/50">
            <div class="flex flex-col items-center gap-2">
              <span class="text-5xl">📷</span>
              <p class="text-xs">暂无拍摄照片，按下快门拍摄第一张吧！</p>
            </div>
          </div>

          <!-- 底部动作与切换条 -->
          <footer class="flex flex-col gap-2 pt-2 border-t border-white/10">
            <div v-if="activePhoto" class="flex justify-between items-center">
              <button
                type="button"
                class="px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium cursor-pointer active:scale-95"
                @click="toggleFavoriteCurrent"
              >
                {{ activePhoto.isFavorite ? '❤️ 已收藏' : '🤍 收藏' }}
              </button>

              <button
                type="button"
                class="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 cursor-pointer active:scale-95"
                @click="triggerEnhancePhoto"
              >
                ✨ AI 超清修复
              </button>

              <button
                type="button"
                class="px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 text-xs font-medium cursor-pointer active:scale-95"
                @click="deleteCurrentPhoto"
              >
                🗑️ 删除
              </button>
            </div>

            <!-- 上下一张切换 -->
            <div v-if="capturedPhotos.length > 1" class="flex justify-between gap-3">
              <button
                type="button"
                class="flex-1 py-1.5 rounded-xl bg-white/10 text-xs font-medium text-white/80 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                :disabled="activeGalleryIndex >= capturedPhotos.length - 1"
                @click="activeGalleryIndex += 1"
              >
                ‹ 上一张
              </button>
              <button
                type="button"
                class="flex-1 py-1.5 rounded-xl bg-white/10 text-xs font-medium text-white/80 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                :disabled="activeGalleryIndex <= 0"
                @click="activeGalleryIndex -= 1"
              >
                下一张 ›
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>

    <!-- 相机设置抽屉模态框 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-6"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 translate-y-6"
    >
      <div
        v-if="showSettingsModal"
        class="absolute inset-x-0 bottom-0 z-50 bg-neutral-900 border-t border-white/20 p-4 rounded-t-3xl text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="相机设置选项"
      >
        <div class="flex justify-between items-center pb-3 border-b border-white/10">
          <strong class="text-sm font-bold">相机专业设置</strong>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-xs text-white/70"
            @click="showSettingsModal = false"
          >
            ✕
          </button>
        </div>

        <div class="flex flex-col gap-3.5 py-3">
          <!-- 徕卡定制水印开关 -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-medium">照片定制水印</span>
              <span class="text-[10px] text-white/50">在成片底部印刻高精度定制机型标识</span>
            </div>
            <button
              type="button"
              class="w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer"
              :class="showWatermark ? 'bg-amber-500' : 'bg-white/20'"
              @click="showWatermark = !showWatermark"
            >
              <div
                class="w-5 h-5 rounded-full bg-white transition-transform"
                :class="{ 'translate-x-5': showWatermark }"
              />
            </button>
          </div>

          <!-- 九宫格构图线开关 -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-medium">构图九宫格参考线</span>
              <span class="text-[10px] text-white/50">黄金分割比例三等分辅助取景构图</span>
            </div>
            <button
              type="button"
              class="w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer"
              :class="showGrid ? 'bg-amber-500' : 'bg-white/20'"
              @click="showGrid = !showGrid"
            >
              <div
                class="w-5 h-5 rounded-full bg-white transition-transform"
                :class="{ 'translate-x-5': showGrid }"
              />
            </button>
          </div>

          <!-- 快门声效开关 -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-medium">机械快门声音</span>
              <span class="text-[10px] text-white/50">模拟单反反光镜抬起与闭合音效</span>
            </div>
            <button
              type="button"
              class="w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer"
              :class="shutterSoundEnabled ? 'bg-amber-500' : 'bg-white/20'"
              @click="shutterSoundEnabled = !shutterSoundEnabled"
            >
              <div
                class="w-5 h-5 rounded-full bg-white transition-transform"
                :class="{ 'translate-x-5': shutterSoundEnabled }"
              />
            </button>
          </div>

          <!-- 自拍环形柔光灯开关 -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-medium">前置屏幕环形柔光灯</span>
              <span class="text-[10px] text-white/50">弱光环境下屏幕边缘泛光照亮面部</span>
            </div>
            <button
              type="button"
              class="w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer"
              :class="ringLightEnabled ? 'bg-amber-500' : 'bg-white/20'"
              @click="ringLightEnabled = !ringLightEnabled"
            >
              <div
                class="w-5 h-5 rounded-full bg-white transition-transform"
                :class="{ 'translate-x-5': ringLightEnabled }"
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          class="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs cursor-pointer active:scale-98"
          @click="showSettingsModal = false"
        >
          完成设置
        </button>
      </div>
    </Transition>

    <!-- VIP 大师滤镜购买/广告弹窗 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showVipFilterModal"
        class="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
        @click="showVipFilterModal = false"
      >
        <div
          class="w-full rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900 border border-amber-400/40 p-4 text-white shadow-2xl flex flex-col gap-3"
          @click.stop
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-300">👑 专属大师电影滤镜包</span>
            <button
              type="button"
              class="text-xs text-white/50 cursor-pointer"
              @click="showVipFilterModal = false"
            >
              ✕
            </button>
          </div>
          <p class="text-xs text-white/80 leading-relaxed">
            大师电影宽幅滤镜为尊贵高级功能。观看 15 秒激励视频，或领取 30 张免费冲印券即可永久解锁！
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-extrabold cursor-pointer active:scale-95 shadow-md"
              @click="handleVipUnlock"
            >
              观看视频免费解锁
            </button>
            <button
              type="button"
              class="px-3 py-2 rounded-xl bg-white/10 text-xs text-white/70 cursor-pointer"
              @click="showVipFilterModal = false"
            >
              放弃
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- AI 修复提示浮动条 -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showEnhanceToast"
        class="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-amber-400 text-black text-xs font-bold shadow-lg pointer-events-none"
      >
        ✨ AI 超清画质修复已生效 · 细节提升 200%
      </div>
    </Transition>
  </div>
</template>
