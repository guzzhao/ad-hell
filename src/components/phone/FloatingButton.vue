<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  openApp?: boolean
}>()

const emit = defineEmits<{
  back: []
  home: []
}>()

// 悬浮球屏幕百分比位置 (相对于 phone-screen 视口)
// 初始位于右侧，垂直高度 62%
const topPercent = ref(62)
const isRightSide = ref(true)

const isLongPressed = ref(false)
const isDragging = ref(false)
const showMenu = ref(false)

let startPointerX = 0
let startPointerY = 0
let currentPointerX = 0
let currentPointerY = 0
let startTopPx = 0
let hasMoved = false
let longPressTimer: number | null = null

// 长按生效阈值（毫秒）：按住超过此时间才激活移动模式
const LONG_PRESS_DELAY = 350

function onPointerDown(e: PointerEvent): void {
  if (e.button !== 0 && e.pointerType === 'mouse') return

  startPointerX = e.clientX
  startPointerY = e.clientY
  currentPointerX = e.clientX
  currentPointerY = e.clientY
  hasMoved = false
  isLongPressed.value = false
  isDragging.value = false

  const parent = (e.currentTarget as HTMLElement)?.closest('.phone-screen')
  if (parent) {
    const parentRect = parent.getBoundingClientRect()
    startTopPx = (topPercent.value / 100) * parentRect.height
  }

  // 严格长按定时器：必须长按 350ms 后才允许移动位置
  longPressTimer = window.setTimeout(() => {
    isLongPressed.value = true
    isDragging.value = true
    // 长按触发瞬间对齐当前光标位置，防止突跳
    startPointerX = currentPointerX
    startPointerY = currentPointerY
    if (parent) {
      const parentRect = parent.getBoundingClientRect()
      startTopPx = (topPercent.value / 100) * parentRect.height
    }
  }, LONG_PRESS_DELAY)

  try {
    ;(e.currentTarget as HTMLElement)?.setPointerCapture(e.pointerId)
  } catch {
    // ignore
  }
}

function onPointerMove(e: PointerEvent): void {
  currentPointerX = e.clientX
  currentPointerY = e.clientY

  const dx = e.clientX - startPointerX
  const dy = e.clientY - startPointerY
  const dist = Math.sqrt(dx * dx + dy * dy)

  // 关键控制：长按尚未触发前，绝对不改变位置
  if (!isLongPressed.value) {
    // 若在长按判定前发生明显晃动（> 14px），判定为非长按意图，取消长按
    if (dist > 14) {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }
    return
  }

  // 长按触发后，响应上下与左右位置移动
  if (dist > 3) {
    hasMoved = true
  }

  const parent = (e.currentTarget as HTMLElement)?.closest('.phone-screen')
  if (!parent) return

  const parentRect = parent.getBoundingClientRect()
  const currentY = startTopPx + dy
  // 限制在 8% 到 86% 之间，避免超出屏幕或遮挡状态栏/底栏
  const newPercent = Math.min(Math.max((currentY / parentRect.height) * 100, 8), 86)
  topPercent.value = newPercent

  // 水平判定左侧或右侧
  const relativeX = e.clientX - parentRect.left
  isRightSide.value = relativeX >= parentRect.width / 2
}

function onPointerUp(e: PointerEvent): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }

  try {
    ;(e.currentTarget as HTMLElement)?.releasePointerCapture(e.pointerId)
  } catch {
    // ignore
  }

  // 未达成长按 -> 视为短按，立即触发返回
  if (!isLongPressed.value) {
    handleShortPress()
  } else {
    // 达成长按且几乎没有拖动 -> 原地长按切换展开辅助菜单
    if (!hasMoved) {
      showMenu.value = !showMenu.value
    }
  }

  isLongPressed.value = false
  isDragging.value = false
}

function onPointerCancel(): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  isLongPressed.value = false
  isDragging.value = false
}

// 短按触发返回
function handleShortPress(): void {
  if (showMenu.value) {
    showMenu.value = false
    return
  }
  emit('back')
}

// 辅助菜单项动作
function handleGoHome(): void {
  showMenu.value = false
  emit('home')
}

function handleGoBack(): void {
  showMenu.value = false
  emit('back')
}

// 上调：页面向上滚动，并微调悬浮按钮垂直高度偏上
function handleScrollUp(): void {
  const container = document.querySelector('.phone-scroll')
  if (container) {
    container.scrollBy({ top: -240, behavior: 'smooth' })
  }
  topPercent.value = Math.max(topPercent.value - 6, 10)
}

// 下调：页面向下滚动，并微调悬浮按钮垂直高度偏下
function handleScrollDown(): void {
  const container = document.querySelector('.phone-scroll')
  if (container) {
    container.scrollBy({ top: 240, behavior: 'smooth' })
  }
  topPercent.value = Math.min(topPercent.value + 6, 84)
}

function handleClickOutside(e: MouseEvent): void {
  const target = e.target as HTMLElement | null
  if (!target?.closest('.floating-control')) {
    showMenu.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (longPressTimer) clearTimeout(longPressTimer)
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    class="floating-control absolute z-40 select-none touch-none transition-all duration-150 ease-out"
    :style="{
      top: `${topPercent}%`,
      left: isRightSide ? 'auto' : '10px',
      right: isRightSide ? '10px' : 'auto',
    }"
  >
    <!-- 悬浮球主体 -->
    <div
      class="group relative w-11 h-11 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-xl border border-white/30 shadow-[0_6px_22px_rgba(0,0,0,0.65)] grid place-items-center cursor-pointer transition-transform active:scale-90"
      :class="{
        '!scale-110 !border-amber-400/80 !shadow-[0_0_20px_rgba(251,191,36,0.4)]': isLongPressed,
        'ring-2 ring-white/40': showMenu,
      }"
      title="短按返回 · 长按后可移动位置"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @contextmenu.prevent="showMenu = !showMenu"
    >
      <!-- 双层拟物同心环 -->
      <div
        class="w-6 h-6 rounded-full border-2 border-white/85 bg-white/20 grid place-items-center shadow-inner transition-transform group-hover:scale-105"
      >
        <span v-if="!showMenu" class="text-white text-xs font-bold leading-none -ml-px">‹</span>
        <span v-else class="text-white text-[11px] font-bold leading-none">✕</span>
      </div>

      <!-- 拖拽中状态提示 -->
      <span
        v-if="isLongPressed"
        class="absolute -top-6.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/85 border border-amber-400/40 text-[9.5px] font-medium text-amber-300 whitespace-nowrap shadow-lg animate-pulse"
      >
        已激活 · 拖动调整位置
      </span>
    </div>

    <!-- 长按或点击展开的快捷辅助面板 (上调、下调、返回桌面、返回) -->
    <Transition
      enter-active-class="transition duration-180 ease-out"
      enter-from-class="opacity-0 scale-90"
      leave-active-class="transition duration-120 ease-in"
      leave-to-class="opacity-0 scale-90"
    >
      <div
        v-if="showMenu"
        class="absolute top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-white z-50 min-w-[96px]"
        :class="isRightSide ? 'right-13 origin-right' : 'left-13 origin-left'"
        @click.stop
      >
        <!-- 返回桌面 -->
        <button
          type="button"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-white/15 active:bg-white/25 cursor-pointer text-left transition-colors"
          @click="handleGoHome"
        >
          <span class="text-sm">🏠</span>
          <span>返回桌面</span>
        </button>

        <!-- 返回上一级 -->
        <button
          type="button"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-white/15 active:bg-white/25 cursor-pointer text-left transition-colors"
          @click="handleGoBack"
        >
          <span class="text-sm font-bold">‹</span>
          <span>返回</span>
        </button>

        <div class="h-px bg-white/10 my-0.5" />

        <!-- 上调 -->
        <button
          type="button"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-white/15 active:bg-white/25 cursor-pointer text-left transition-colors"
          @click="handleScrollUp"
        >
          <span class="text-sm">▲</span>
          <span>上调</span>
        </button>

        <!-- 下调 -->
        <button
          type="button"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-white/15 active:bg-white/25 cursor-pointer text-left transition-colors"
          @click="handleScrollDown"
        >
          <span class="text-sm">▼</span>
          <span>下调</span>
        </button>
      </div>
    </Transition>
  </div>
</template>
