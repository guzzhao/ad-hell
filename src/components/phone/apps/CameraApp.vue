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
    }
    return
  }

  // 拍照快门演出
  shutterFlashing.value = true
  captureCount.value += 1
  lastPhoto.value = currentMode.value === '夜景' ? '🌃' : currentMode.value === '人像' ? '✨' : '📸'

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
  <div class="camera">
    <!-- 顶部状态与相机控制栏 -->
    <header class="camera__top-bar">
      <!-- 闪光灯 -->
      <button
        type="button"
        class="camera__btn-pill"
        :class="{ 'is-active': flashState !== 'off' }"
        aria-label="切换闪光灯"
        @click="cycleFlash"
      >
        <span class="btn-icon">⚡</span>
        <span class="btn-label">{{
          flashState === 'auto' ? '自动' : flashState === 'on' ? '开启' : '关闭'
        }}</span>
      </button>

      <!-- 录像进行中计时器 -->
      <div v-if="isRecording" class="camera__rec-badge">
        <span class="rec-dot" />
        <span>{{ formattedRecordTime }}</span>
      </div>

      <!-- HDR 与设置 -->
      <div class="camera__top-right">
        <button
          type="button"
          class="camera__btn-pill"
          :class="{ 'is-active': hdrState }"
          @click="hdrState = !hdrState"
        >
          HDR
        </button>
        <span class="camera__spec-tag">48MP</span>
      </div>
    </header>

    <!-- 真实取景器主舞台 -->
    <div
      class="camera__viewport"
      :class="{
        'is-flash': shutterFlashing,
        'is-flipped': isFlipped,
      }"
      @click="handleViewfinderClick"
    >
      <!-- 模拟镜头内实景画面 -->
      <div class="camera__scene" :style="{ transform: `scale(${currentScale})` }">
        <!-- 景深虚化与动态光斑 -->
        <div class="scene-ambient" :class="`scene-ambient--${currentMode}`">
          <div class="scene-subject">
            <span class="subject-glyph">
              {{ currentMode === '人像' ? '👤' : currentMode === '夜景' ? '🌙' : '🏞️' }}
            </span>
          </div>
          <div class="scene-bokeh scene-bokeh--1" />
          <div class="scene-bokeh scene-bokeh--2" />
        </div>
      </div>

      <!-- 构图九宫格参考线 -->
      <div class="camera__grid" aria-hidden="true">
        <div class="grid-line grid-line--h1" />
        <div class="grid-line grid-line--h2" />
        <div class="grid-line grid-line--v1" />
        <div class="grid-line grid-line--v2" />
      </div>

      <!-- 动态点击对焦/测光框 -->
      <Transition name="focus-fade">
        <div
          v-if="focusVisible && focusPoint"
          class="camera__focus-box"
          :style="{
            left: `${focusPoint.x}px`,
            top: `${focusPoint.y}px`,
          }"
        >
          <div class="focus-ring" />
          <span class="focus-sun" aria-hidden="true">☀️</span>
        </div>
      </Transition>

      <!-- 专业模式手动参数 HUD -->
      <div v-if="currentMode === '专业'" class="camera__pro-hud">
        <span>ISO 100</span>
        <span>S 1/500s</span>
        <span>EV +0.0</span>
        <span>WB 5500K</span>
        <span>AF-C</span>
      </div>

      <!-- 悬浮光学焦段选择器 -->
      <div class="camera__zoom-island" @click.stop>
        <button
          v-for="z in zooms"
          :key="z.val"
          type="button"
          class="zoom-chip"
          :class="{ 'is-selected': currentZoom === z.val }"
          @click="currentZoom = z.val"
        >
          {{ z.label }}
        </button>
      </div>

      <!-- 广告保留挂载点（由 adsEnabled 状态控制） -->
      <InAppAdSlot
        v-if="storm.adsEnabled"
        creative-id="fake-system"
        caption="相机广告位（已保留，待启用）"
      />
    </div>

    <!-- 模式横向滑动切换 -->
    <nav class="camera__modes-nav" aria-label="拍摄模式">
      <button
        v-for="mode in modes"
        :key="mode"
        type="button"
        class="mode-item"
        :class="{ 'is-active': currentMode === mode }"
        @click="currentMode = mode"
      >
        {{ mode }}
      </button>
    </nav>

    <!-- 底部快门与相册控制栏 -->
    <footer class="camera__footer">
      <!-- 最近照片相册入口 -->
      <div class="camera__thumb-box">
        <button
          type="button"
          class="camera__thumb-btn"
          aria-label="查看相册"
          @click="showGalleryModal = true"
        >
          <span class="thumb-emoji">{{ lastPhoto || '🖼️' }}</span>
          <span v-if="captureCount > 0" class="thumb-badge">{{ captureCount }}</span>
        </button>
      </div>

      <!-- 快门键 -->
      <div class="camera__shutter-wrapper">
        <button
          type="button"
          class="camera__shutter-btn"
          :class="{
            'is-record-mode': currentMode === '录像',
            'is-recording': isRecording,
          }"
          :aria-label="currentMode === '录像' ? (isRecording ? '停止录像' : '开始录像') : '拍照'"
          @click="handleShutter"
        >
          <span class="shutter-core" />
        </button>
      </div>

      <!-- 前后镜头翻转 -->
      <div class="camera__flip-box">
        <button
          type="button"
          class="camera__flip-btn"
          aria-label="翻转前后镜头"
          @click="toggleFlip"
        >
          <span class="flip-icon">⟳</span>
        </button>
      </div>
    </footer>

    <!-- 照片预览画廊弹窗 -->
    <Transition name="fade">
      <div v-if="showGalleryModal" class="camera__preview-modal" @click="showGalleryModal = false">
        <div class="preview-card" @click.stop>
          <header class="preview-header">
            <span>刚刚拍摄 · 4800万像素 HDR</span>
            <button type="button" class="preview-close" @click="showGalleryModal = false">✕</button>
          </header>
          <div class="preview-stage">
            <span class="preview-icon">{{ lastPhoto || '📸' }}</span>
          </div>
          <p class="preview-info">已存入系统相册 · RAW无损格式</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.camera {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #ffffff;
  background: #000000;
  user-select: none;
  padding: 4px 6px 12px;
}

/* 顶部控制栏 */
.camera__top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 10px;
  min-height: 40px;
}

.camera__btn-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.camera__btn-pill.is-active {
  background: #ffd54a;
  color: #000000;
}

.btn-icon {
  font-size: 12px;
}

.camera__rec-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  font-size: 12px;
  font-weight: 700;
  color: #ef4444;
}

.rec-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse-rec 1s infinite;
}

@keyframes pulse-rec {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.camera__top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.camera__spec-tag {
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

/* 取景框主视口 */
.camera__viewport {
  position: relative;
  flex: 1;
  border-radius: 20px;
  background: #0f131a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  cursor: crosshair;
  transition:
    filter 0.1s ease,
    transform 0.4s ease;
}

.camera__viewport.is-flash {
  filter: brightness(3.5);
}

.camera__viewport.is-flipped {
  transform: rotateY(180deg);
}

/* 场景内容与动态景深 */
.camera__scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.24s cubic-bezier(0.2, 0.8, 0.4, 1);
}

.scene-ambient {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 40%, #1e293b 0%, #090d14 80%);
}

.scene-ambient--夜景 {
  background: radial-gradient(circle at 60% 30%, #1e1b4b 0%, #060814 85%);
}

.scene-ambient--人像 {
  background: radial-gradient(circle at 50% 50%, #3f2d24 0%, #0d0c11 85%);
}

.scene-subject {
  position: relative;
  display: grid;
  place-items: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
}

.subject-glyph {
  font-size: 58px;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.6));
}

.scene-bokeh {
  position: absolute;
  border-radius: 50%;
  filter: blur(16px);
  opacity: 0.35;
  pointer-events: none;
}

.scene-bokeh--1 {
  width: 90px;
  height: 90px;
  top: 15%;
  left: 12%;
  background: #f59e0b;
}

.scene-bokeh--2 {
  width: 110px;
  height: 110px;
  bottom: 18%;
  right: 14%;
  background: #38bdf8;
}

/* 九宫格参考线 */
.camera__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.08);
}

.grid-line--h1 {
  top: 33.33%;
  left: 0;
  right: 0;
  height: 1px;
}
.grid-line--h2 {
  top: 66.66%;
  left: 0;
  right: 0;
  height: 1px;
}
.grid-line--v1 {
  left: 33.33%;
  top: 0;
  bottom: 0;
  width: 1px;
}
.grid-line--v2 {
  left: 66.66%;
  top: 0;
  bottom: 0;
  width: 1px;
}

/* 对焦框 */
.camera__focus-box {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}

.focus-ring {
  width: 54px;
  height: 54px;
  border: 1.5px solid #ffd54a;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(255, 213, 74, 0.4);
  animation: focus-snap 0.24s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes focus-snap {
  0% {
    transform: scale(1.4);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.focus-sun {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
}

/* 专业模式参数 HUD */
.camera__pro-hud {
  position: absolute;
  top: 10px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  font-weight: 600;
  color: #ffd54a;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 10px;
  border-radius: 6px;
  backdrop-filter: blur(8px);
}

/* 焦段浮标岛 */
.camera__zoom-island {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  z-index: 15;
}

.zoom-chip {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.zoom-chip.is-selected {
  background: rgba(255, 213, 74, 0.25);
  color: #ffd54a;
  transform: scale(1.08);
}

/* 拍摄模式选择 */
.camera__modes-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 14px 0 8px;
}

.mode-item {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-item.is-active {
  color: #ffd54a;
  font-weight: 700;
  font-size: 13.5px;
}

/* 快门与底部操作 */
.camera__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px 8px;
}

.camera__thumb-box,
.camera__flip-box {
  width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera__thumb-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  display: grid;
  place-items: center;
  cursor: pointer;
  overflow: hidden;
}

.thumb-emoji {
  font-size: 20px;
}

.thumb-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #3b82f6;
  font-size: 9.5px;
  font-weight: 700;
  color: #ffffff;
  display: grid;
  place-items: center;
}

.camera__shutter-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera__shutter-btn {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3.5px solid #ffffff;
  padding: 4px;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.camera__shutter-btn:active {
  transform: scale(0.92);
}

.shutter-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #ffffff;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.4, 1);
}

.camera__shutter-btn.is-record-mode .shutter-core {
  background: #ef4444;
}

.camera__shutter-btn.is-recording .shutter-core {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #ef4444;
}

.camera__flip-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  font-size: 20px;
  transition: transform 0.2s ease;
}

.camera__flip-btn:active {
  transform: rotate(180deg) scale(0.9);
}

/* 预览相册浮层 */
.camera__preview-modal {
  position: absolute;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(16px);
  display: grid;
  place-items: center;
  padding: 24px;
}

.preview-card {
  width: 100%;
  max-width: 280px;
  border-radius: 18px;
  background: #181d26;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  margin-bottom: 14px;
}

.preview-close {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.preview-stage {
  width: 180px;
  height: 220px;
  border-radius: 14px;
  background: linear-gradient(145deg, #243048 0%, #0d121c 100%);
  display: grid;
  place-items: center;
  font-size: 64px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.preview-info {
  margin: 14px 0 2px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.5);
}

/* 过渡 */
.focus-fade-enter-active,
.focus-fade-leave-active {
  transition: opacity 0.2s ease;
}

.focus-fade-enter-from,
.focus-fade-leave-to {
  opacity: 0;
}
</style>
