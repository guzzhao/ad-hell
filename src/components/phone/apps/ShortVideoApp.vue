<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits<{ back: [] }>()

interface VideoItem {
  id: number
  author: string
  handle: string
  avatar: string
  desc: string
  tags: string[]
  music: string
  likes: number
  likesFormatted: string
  comments: number
  collects: number
  shares: number
  followed: boolean
  liked: boolean
  collected: boolean
  gradient: string
  videoTheme: string
}

interface FloatingHeart {
  id: number
  x: number
  y: number
}

const videos = ref<VideoItem[]>([
  {
    id: 1,
    author: '手艺人老张',
    handle: '@craftsman_zhang',
    avatar: '🪵',
    desc: '一把榫卯椅子做了40年，不用一颗钉子，这就是传统手工的温度与匠心。',
    tags: ['#匠人精神', '#榫卯工艺', '#传统手艺', '#慢生活'],
    music: '手艺人老张的原声 - 匠心木语',
    likes: 128400,
    likesFormatted: '12.8万',
    comments: 3418,
    collects: 12300,
    shares: 8962,
    followed: false,
    liked: false,
    collected: false,
    gradient: 'linear-gradient(175deg, #1e1b18 0%, #2e241c 45%, #14100c 100%)',
    videoTheme: 'woodwork',
  },
  {
    id: 2,
    author: '深夜街角面馆',
    handle: '@noodle_story',
    avatar: '🍜',
    desc: '凌晨四点开始熬制牛骨高汤，三十年老火慢煨，一碗面温暖早起的人。',
    tags: ['#治愈美食', '#城市烟火气', '#深夜食堂', '#人间烟火'],
    music: '城市慢调 - 暖冬食堂爵士',
    likes: 86200,
    likesFormatted: '8.6万',
    comments: 1820,
    collects: 7410,
    shares: 4120,
    followed: true,
    liked: true,
    collected: false,
    gradient: 'linear-gradient(175deg, #241914 0%, #3d2319 45%, #120e0b 100%)',
    videoTheme: 'noodles',
  },
  {
    id: 3,
    author: '极境地理摄影',
    handle: '@geo_traveler',
    avatar: '🏔️',
    desc: '海拔5200米的日照金山全景实拍，晨光洒在雪峰上的那一刻，万物皆有回响。',
    tags: ['#自然风光', '#日照金山', '#视觉盛宴', '#心之所向'],
    music: '雪山之巅 - 晨曦大提琴独奏',
    likes: 245000,
    likesFormatted: '24.5万',
    comments: 6730,
    collects: 31200,
    shares: 15400,
    followed: false,
    liked: false,
    collected: true,
    gradient: 'linear-gradient(175deg, #182236 0%, #2f3e5c 45%, #0e1422 100%)',
    videoTheme: 'mountain',
  },
  {
    id: 4,
    author: '橘猫的暖阳日常',
    handle: '@orange_cat_daily',
    avatar: '🐱',
    desc: '阳台上的第一缕阳光刚刚好，伸个懒腰再睡五分钟，这就是猫生圆满。',
    tags: ['#萌宠日常', '#猫咪的治愈瞬间', '#晒太阳', '#慵懒时光'],
    music: '阳光午后 - 尤克里里暖调',
    likes: 193200,
    likesFormatted: '19.3万',
    comments: 4520,
    collects: 18600,
    shares: 6240,
    followed: false,
    liked: true,
    collected: false,
    gradient: 'linear-gradient(175deg, #2a2217 0%, #44321d 45%, #15110b 100%)',
    videoTheme: 'cat',
  },
  {
    id: 5,
    author: '慢调手冲咖啡馆',
    handle: '@pour_over_lab',
    avatar: '☕',
    desc: '浅烘埃塞瑰夏，水温91度慢速细水流，研磨那一刻满屋都是柑橘与茉莉花香。',
    tags: ['#咖啡日记', '#手冲咖啡', '#治愈系声音', '#慢节奏'],
    music: '手冲慢语 - 咖啡店雨天环境白噪音',
    likes: 142100,
    likesFormatted: '14.2万',
    comments: 2980,
    collects: 16500,
    shares: 5310,
    followed: false,
    liked: false,
    collected: false,
    gradient: 'linear-gradient(175deg, #241c19 0%, #3b2820 45%, #140e0b 100%)',
    videoTheme: 'coffee',
  },
])

const currentIndex = ref(0)
const currentVideo = computed(() => videos.value[currentIndex.value] ?? videos.value[0]!)
const isPlaying = ref(true)
const progress = ref(24)
const showComments = ref(false)
const activeTab = ref<'follow' | 'friends' | 'recommend'>('recommend')
const showSwipeGuide = ref(true)

// 手势滑动与拖拽状态
const isDragging = ref(false)
const dragOffsetY = ref(0)
let startY = 0
let startX = 0
let startTime = 0
let hasMoved = false
let suppressTap = false

// 双击点赞爱心列表
const floatingHearts = ref<FloatingHeart[]>([])
let heartSeq = 0
let lastTapTimestamp = 0
let singleTapTimeout: number | null = null

let progressTimer: number | null = null

onMounted(() => {
  progressTimer = window.setInterval(() => {
    if (isPlaying.value) {
      progress.value = (progress.value + 0.8) % 100
    }
  }, 100)

  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer)
  window.removeEventListener('keydown', handleKeydown)
})

// 进度与视频切换
function nextVideo(): void {
  if (currentIndex.value < videos.value.length - 1) {
    currentIndex.value++
  } else {
    // 循环播放
    currentIndex.value = 0
  }
  onVideoChanged()
}

function prevVideo(): void {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    // 循环至末尾
    currentIndex.value = videos.value.length - 1
  }
  onVideoChanged()
}

function onVideoChanged(): void {
  progress.value = 0
  isPlaying.value = true
  showSwipeGuide.value = false
}

function togglePlay(): void {
  isPlaying.value = !isPlaying.value
}

// 点赞交互
function handleLike(v: VideoItem): void {
  v.liked = !v.liked
  if (v.liked) {
    v.likes += 1
  } else {
    v.likes -= 1
  }
}

function spawnFloatingHeart(x: number, y: number): void {
  const heartId = ++heartSeq
  floatingHearts.value.push({ id: heartId, x, y })
  setTimeout(() => {
    floatingHearts.value = floatingHearts.value.filter((h) => h.id !== heartId)
  }, 800)
}

function handleCollect(v: VideoItem): void {
  v.collected = !v.collected
  v.collects += v.collected ? 1 : -1
}

// 触摸 / 鼠标指针手势处理
function onPointerDown(e: PointerEvent): void {
  // 如果在操作栏或评论抽屉中，不劫持
  const target = e.target as HTMLElement | null
  if (
    target?.closest('.actions-bar') ||
    target?.closest('.comments-drawer') ||
    target?.closest('.nav-header')
  ) {
    return
  }

  isDragging.value = true
  startY = e.clientY
  startX = e.clientX
  startTime = Date.now()
  dragOffsetY.value = 0
  hasMoved = false
  suppressTap = false

  try {
    ;(e.currentTarget as HTMLElement)?.setPointerCapture(e.pointerId)
  } catch {
    // ignore
  }
}

function onPointerMove(e: PointerEvent): void {
  if (!isDragging.value) return

  const deltaY = e.clientY - startY
  const deltaX = e.clientX - startX

  if (Math.abs(deltaY) > 6 || Math.abs(deltaX) > 6) {
    hasMoved = true
  }

  // 阻尼阻抗计算
  const isAtTop = currentIndex.value === 0 && deltaY > 0
  const isAtBottom = currentIndex.value === videos.value.length - 1 && deltaY < 0

  if (isAtTop || isAtBottom) {
    dragOffsetY.value = deltaY * 0.28
  } else {
    dragOffsetY.value = deltaY
  }
}

function onPointerUp(e: PointerEvent): void {
  if (!isDragging.value) return
  isDragging.value = false

  try {
    ;(e.currentTarget as HTMLElement)?.releasePointerCapture(e.pointerId)
  } catch {
    // ignore
  }

  const elapsed = Date.now() - startTime
  const dy = dragOffsetY.value
  const dx = e.clientX - startX
  const absDy = Math.abs(dy)
  const absDx = Math.abs(dx)

  // 手机左边缘向右滑动返回手势
  if (hasMoved && startX < 50 && dx > 50 && absDx > absDy * 1.4) {
    emit('back')
    dragOffsetY.value = 0
    return
  }

  const isFlick = elapsed < 320 && absDy > 35
  const isDragFar = absDy > 70

  if (hasMoved && (isFlick || isDragFar)) {
    suppressTap = true
    setTimeout(() => {
      suppressTap = false
    }, 120)

    if (dy < 0) {
      // 向上滑动 -> 下一个视频
      nextVideo()
    } else {
      // 向下滑动 -> 上一个视频
      prevVideo()
    }
  }

  dragOffsetY.value = 0
}

function onPointerCancel(e: PointerEvent): void {
  isDragging.value = false
  dragOffsetY.value = 0
  try {
    ;(e.currentTarget as HTMLElement)?.releasePointerCapture(e.pointerId)
  } catch {
    // ignore
  }
}

// 滚轮切换 (桌面端手感)
let lastWheelTime = 0
function handleWheel(e: WheelEvent): void {
  if (showComments.value) return
  const now = Date.now()
  if (now - lastWheelTime < 450) return

  if (Math.abs(e.deltaY) > 28) {
    lastWheelTime = now
    if (e.deltaY > 0) {
      nextVideo()
    } else {
      prevVideo()
    }
  }
}

// 键盘按键支持
function handleKeydown(e: KeyboardEvent): void {
  if (showComments.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    nextVideo()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    prevVideo()
  } else if (e.key === ' ') {
    e.preventDefault()
    togglePlay()
  }
}

// 单击播放/暂停与双击点赞判断
function handleStageClick(e: MouseEvent): void {
  if (suppressTap || hasMoved) return

  const now = Date.now()
  const timeSinceLast = now - lastTapTimestamp

  if (timeSinceLast < 280) {
    // 双击点赞
    if (singleTapTimeout) {
      clearTimeout(singleTapTimeout)
      singleTapTimeout = null
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    spawnFloatingHeart(x, y)
    if (!currentVideo.value.liked) {
      currentVideo.value.liked = true
      currentVideo.value.likes += 1
    }
  } else {
    // 单击切换播放/暂停
    singleTapTimeout = window.setTimeout(() => {
      togglePlay()
      singleTapTimeout = null
    }, 240)
  }

  lastTapTimestamp = now
}

// 滑块轨道动态样式
const trackStyle = computed(() => {
  const basePercent = -currentIndex.value * 100
  const dragPx = dragOffsetY.value
  return {
    transform: `translate3d(0, calc(${basePercent}% + ${dragPx}px), 0)`,
    transition: isDragging.value ? 'none' : 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
  }
})

const sampleComments = [
  {
    id: 1,
    user: '木艺爱好者',
    text: '这种传统的燕尾榫咬合严丝合缝，没有几十年功底根本切不出来！',
    time: '10分钟前',
    likes: 238,
  },
  {
    id: 2,
    user: '云淡风轻',
    text: '太治愈了，现代快节奏生活里最需要这种专注与平静。',
    time: '1小时前',
    likes: 142,
  },
  {
    id: 3,
    user: '山间清风',
    text: '背景音乐配得太棒了，求歌名！收藏了慢慢看。',
    time: '3小时前',
    likes: 89,
  },
]
</script>

<template>
  <div
    class="relative flex flex-col h-full w-full bg-black text-white overflow-hidden select-none touch-none"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @wheel.passive="handleWheel"
  >
    <!-- 顶部状态与分类导航 (固定在视口最上方) -->
    <header
      class="nav-header absolute top-0 inset-x-0 z-30 flex items-center justify-between px-3.5 pt-2 pb-2 text-white/90"
    >
      <button
        type="button"
        class="inline-flex items-center gap-1 min-h-[32px] px-2.5 text-[12px] font-medium text-white/90 bg-black/45 rounded-full backdrop-blur-md cursor-pointer hover:bg-black/65 active:scale-95 transition-all"
        aria-label="返回主屏"
        @click="emit('back')"
      >
        <span aria-hidden="true" class="text-sm font-bold leading-none">‹</span>
        <span>主屏</span>
      </button>
      <div class="flex items-center gap-4 text-sm font-medium">
        <button
          type="button"
          class="text-white/60 cursor-pointer pb-0.5 transition-all"
          :class="{ '!text-white !font-bold border-b-2 border-white': activeTab === 'follow' }"
          @click="activeTab = 'follow'"
        >
          关注
        </button>
        <button
          type="button"
          class="text-white/60 cursor-pointer pb-0.5 transition-all"
          :class="{ '!text-white !font-bold border-b-2 border-white': activeTab === 'friends' }"
          @click="activeTab = 'friends'"
        >
          朋友
        </button>
        <button
          type="button"
          class="text-white/60 cursor-pointer pb-0.5 transition-all"
          :class="{ '!text-white !font-bold border-b-2 border-white': activeTab === 'recommend' }"
          @click="activeTab = 'recommend'"
        >
          推荐
        </button>
      </div>
      <button type="button" class="text-sm text-white/80 cursor-pointer" aria-label="搜索">
        🔍
      </button>
    </header>

    <!-- 垂直视频轮播轨道 -->
    <div class="flex-1 relative overflow-hidden w-full h-full">
      <div class="w-full h-full will-change-transform" :style="trackStyle">
        <div
          v-for="(v, idx) in videos"
          :key="v.id"
          class="w-full h-full relative overflow-hidden flex flex-col justify-between"
          :style="{ background: v.gradient }"
          @click="handleStageClick"
        >
          <!-- 视频动态氛围背景 -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="text-9xl opacity-80 drop-shadow-2xl">{{ v.avatar }}</span>
          </div>

          <!-- 暂停播放状态图标 (仅当前激活视频) -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-75"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0 scale-75"
          >
            <div
              v-if="idx === currentIndex && !isPlaying"
              class="absolute inset-0 grid place-items-center z-10 pointer-events-none"
              aria-hidden="true"
            >
              <span
                class="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md text-white text-3xl grid place-items-center pl-1"
                >▶</span
              >
            </div>
          </Transition>

          <!-- 右侧互动侧边操作栏 -->
          <aside
            class="actions-bar absolute right-2.5 bottom-24 z-20 flex flex-col items-center gap-4 text-white"
            aria-label="视频互动操作"
          >
            <!-- 作者头像与关注 -->
            <div
              class="relative w-11 h-11 rounded-full border border-white/50 grid place-items-center text-2xl bg-white/10 mb-1"
            >
              <span>{{ v.avatar }}</span>
              <button
                v-if="!v.followed"
                type="button"
                class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-rose-500 text-white font-bold text-xs grid place-items-center cursor-pointer shadow-xs leading-none"
                aria-label="关注作者"
                @click.stop="v.followed = true"
              >
                +
              </button>
            </div>

            <!-- 点赞 -->
            <button
              type="button"
              class="flex flex-col items-center gap-1 cursor-pointer"
              aria-label="点赞"
              @click.stop="handleLike(v)"
            >
              <span class="text-2xl drop-shadow-md transition-transform active:scale-125">{{
                v.liked ? '❤️' : '🤍'
              }}</span>
              <span class="text-[10.5px] font-semibold text-white/90 drop-shadow-sm">{{
                v.liked
                  ? v.likes > 10000
                    ? (v.likes / 10000).toFixed(1) + '万'
                    : v.likes
                  : v.likesFormatted
              }}</span>
            </button>

            <!-- 评论 -->
            <button
              type="button"
              class="flex flex-col items-center gap-1 cursor-pointer"
              aria-label="评论"
              @click.stop="showComments = true"
            >
              <span class="text-2xl drop-shadow-md">💬</span>
              <span class="text-[10.5px] font-semibold text-white/90 drop-shadow-sm">{{
                v.comments
              }}</span>
            </button>

            <!-- 收藏 -->
            <button
              type="button"
              class="flex flex-col items-center gap-1 cursor-pointer"
              aria-label="收藏"
              @click.stop="handleCollect(v)"
            >
              <span class="text-2xl drop-shadow-md transition-transform active:scale-125">{{
                v.collected ? '⭐️' : '☆'
              }}</span>
              <span class="text-[10.5px] font-semibold text-white/90 drop-shadow-sm">{{
                v.collects
              }}</span>
            </button>

            <!-- 分享 -->
            <button
              type="button"
              class="flex flex-col items-center gap-1 cursor-pointer"
              aria-label="分享"
              @click.stop
            >
              <span class="text-2xl drop-shadow-md">↗</span>
              <span class="text-[10.5px] font-semibold text-white/90 drop-shadow-sm">{{
                v.shares
              }}</span>
            </button>

            <!-- 旋转黑胶唱片 -->
            <div
              class="w-10 h-10 rounded-full bg-stone-900 border-4 border-stone-800 grid place-items-center text-xs shadow-lg mt-1"
              :class="{ 'animate-[spin_10s_linear_infinite]': idx === currentIndex && isPlaying }"
            >
              <span>🎵</span>
            </div>
          </aside>

          <!-- 底部视频信息与音乐条 -->
          <div class="absolute bottom-12 inset-x-0 z-20 px-4 pb-2 text-white">
            <div class="flex flex-col gap-1 max-w-[78%]">
              <strong class="text-sm font-bold [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]"
                >@{{ v.author }}</strong
              >
              <p
                class="text-xs text-white/90 line-clamp-2 leading-relaxed [text-shadow:0_1px_4px_rgba(0,0,0,0.8)] m-0"
              >
                {{ v.desc }}
              </p>
              <div class="flex flex-wrap gap-1 mt-0.5">
                <span
                  v-for="tag in v.tags"
                  :key="tag"
                  class="text-[11px] font-medium text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
                  >{{ tag }}</span
                >
              </div>
              <div
                class="flex items-center gap-1.5 mt-1 text-[11px] text-white/75 overflow-hidden [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
              >
                <span>🎵</span>
                <span class="truncate">{{ v.music }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 双击动态爱心喷泉 -->
    <div
      v-for="heart in floatingHearts"
      :key="heart.id"
      class="absolute -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none animate-ping z-40"
      :style="{ left: `${heart.x}px`, top: `${heart.y}px` }"
    >
      ❤️
    </div>

    <!-- 上下滑动提示浮标 -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showSwipeGuide"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white z-40 flex items-center gap-1.5 pointer-events-none"
        @click="showSwipeGuide = false"
      >
        <span>⇅</span>
        <span>上下滑动切换视频</span>
      </div>
    </Transition>

    <!-- 固定在屏幕底部的控制区与进度条 -->
    <div
      class="absolute bottom-0 inset-x-0 z-30 flex flex-col bg-gradient-to-t from-black/80 to-transparent pb-1 pt-4"
    >
      <div class="h-[2px] bg-white/20 w-full">
        <div
          class="h-full bg-white transition-all duration-100"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <!-- 快速切换上一条 / 下一条按钮 -->
      <div class="flex justify-between items-center px-4 py-1.5 text-xs text-white/60">
        <button
          type="button"
          class="px-2.5 py-1 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:scale-95 cursor-pointer text-[11px]"
          aria-label="上一条视频"
          @click.stop="prevVideo"
        >
          ∧ 上一条
        </button>
        <span class="text-[11px] font-mono">{{ currentIndex + 1 }} / {{ videos.length }}</span>
        <button
          type="button"
          class="px-2.5 py-1 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:scale-95 cursor-pointer text-[11px]"
          aria-label="下一条视频"
          @click.stop="nextVideo"
        >
          ∨ 下一条
        </button>
      </div>
    </div>

    <!-- 评论半屏抽屉弹窗 -->
    <Transition
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="translate-y-full opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showComments"
        class="comments-drawer absolute inset-x-0 bottom-0 h-[65%] rounded-t-3xl bg-slate-900/95 backdrop-blur-xl text-white z-50 flex flex-col p-4 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="视频评论"
      >
        <div class="flex justify-between items-center pb-3 border-b border-white/10">
          <span class="text-sm font-semibold">全部评论 ({{ currentVideo.comments }})</span>
          <button
            type="button"
            class="w-7 h-7 rounded-full bg-white/10 grid place-items-center text-xs text-gray-300 cursor-pointer"
            aria-label="关闭评论"
            @click="showComments = false"
          >
            ✕
          </button>
        </div>
        <div class="flex-1 my-2 overflow-y-auto flex flex-col gap-3 phone-scroll">
          <div v-for="c in sampleComments" :key="c.id" class="flex gap-2.5 items-start">
            <span class="text-xl">👤</span>
            <div class="flex-1 flex flex-col">
              <div class="flex justify-between text-xs text-gray-400">
                <span>{{ c.user }}</span>
                <span>{{ c.time }}</span>
              </div>
              <p class="text-xs text-white/90 my-1 leading-relaxed">{{ c.text }}</p>
              <div class="flex items-center gap-3 text-[10px] text-gray-400">
                <span>❤️ {{ c.likes }}</span>
                <span class="cursor-pointer hover:text-white">回复</span>
              </div>
            </div>
          </div>
        </div>
        <div class="pt-2 border-t border-white/10 flex gap-2">
          <input
            type="text"
            class="flex-1 h-9 px-3 rounded-full bg-white/10 text-xs text-white placeholder-gray-400 border border-white/10 outline-none"
            placeholder="发条友善的评论吧…"
          />
          <button
            type="button"
            class="px-4 h-9 rounded-full bg-rose-600 text-white text-xs font-semibold cursor-pointer active:bg-rose-700"
          >
            发送
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
