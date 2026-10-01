<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

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
    target?.closest('.video-app__actions') ||
    target?.closest('.comments-drawer') ||
    target?.closest('.video-app__nav')
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
  const absDy = Math.abs(dy)
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
    class="video-app"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @wheel.passive="handleWheel"
  >
    <!-- 顶部状态与分类导航 (固定在视口最上方) -->
    <header class="video-app__nav">
      <button type="button" class="video-app__live-btn" aria-label="直播入口">
        <span class="live-dot" /> 直播
      </button>
      <div class="video-app__tabs">
        <button
          type="button"
          class="video-tab"
          :class="{ 'is-active': activeTab === 'follow' }"
          @click="activeTab = 'follow'"
        >
          关注
        </button>
        <button
          type="button"
          class="video-tab"
          :class="{ 'is-active': activeTab === 'friends' }"
          @click="activeTab = 'friends'"
        >
          朋友
        </button>
        <button
          type="button"
          class="video-tab"
          :class="{ 'is-active': activeTab === 'recommend' }"
          @click="activeTab = 'recommend'"
        >
          推荐
        </button>
      </div>
      <button type="button" class="video-app__search-btn" aria-label="搜索">🔍</button>
    </header>

    <!-- 垂直视频轮播轨道 -->
    <div class="video-feed-container">
      <div class="video-slider-track" :style="trackStyle">
        <div
          v-for="(v, idx) in videos"
          :key="v.id"
          class="video-slide"
          :style="{ background: v.gradient }"
          :class="{ 'is-active': idx === currentIndex }"
          @click="handleStageClick"
        >
          <!-- 视频动态氛围背景 -->
          <div class="stage-backdrop" :class="`stage-backdrop--${v.videoTheme}`">
            <div class="stage-particles" aria-hidden="true" />
            <div class="stage-graphic">
              <span class="stage-emoji">{{ v.avatar }}</span>
            </div>
          </div>

          <!-- 暂停播放状态图标 (仅当前激活视频) -->
          <Transition name="fade-scale">
            <div
              v-if="idx === currentIndex && !isPlaying"
              class="stage-play-badge"
              aria-hidden="true"
            >
              <span class="play-triangle">▶</span>
            </div>
          </Transition>

          <!-- 右侧互动侧边操作栏 -->
          <aside class="video-app__actions" aria-label="视频互动操作">
            <!-- 作者头像与关注 -->
            <div class="action-item action-avatar">
              <span class="avatar-face">{{ v.avatar }}</span>
              <button
                v-if="!v.followed"
                type="button"
                class="avatar-follow-btn"
                aria-label="关注作者"
                @click.stop="v.followed = true"
              >
                +
              </button>
            </div>

            <!-- 点赞 -->
            <button
              type="button"
              class="action-item"
              :class="{ 'is-liked': v.liked }"
              aria-label="点赞"
              @click.stop="handleLike(v)"
            >
              <span class="action-icon action-icon--heart">{{ v.liked ? '❤️' : '🤍' }}</span>
              <span class="action-count">{{
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
              class="action-item"
              aria-label="评论"
              @click.stop="showComments = true"
            >
              <span class="action-icon">💬</span>
              <span class="action-count">{{ v.comments }}</span>
            </button>

            <!-- 收藏 -->
            <button
              type="button"
              class="action-item"
              :class="{ 'is-collected': v.collected }"
              aria-label="收藏"
              @click.stop="handleCollect(v)"
            >
              <span class="action-icon">{{ v.collected ? '⭐️' : '☆' }}</span>
              <span class="action-count">{{ v.collects }}</span>
            </button>

            <!-- 分享 -->
            <button type="button" class="action-item" aria-label="分享" @click.stop>
              <span class="action-icon">↗</span>
              <span class="action-count">{{ v.shares }}</span>
            </button>

            <!-- 旋转黑胶唱片 -->
            <div class="action-disc" :class="{ 'is-spinning': idx === currentIndex && isPlaying }">
              <span class="disc-inner">🎵</span>
            </div>
          </aside>

          <!-- 底部视频信息与音乐条 -->
          <div class="video-slide__bottom">
            <div class="video-meta">
              <strong class="meta-author">@{{ v.author }}</strong>
              <p class="meta-desc">{{ v.desc }}</p>
              <div class="meta-tags">
                <span v-for="tag in v.tags" :key="tag" class="meta-tag">{{ tag }}</span>
              </div>
              <div class="meta-music">
                <span class="music-icon">🎵</span>
                <span class="music-ticker">{{ v.music }}</span>
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
      class="floating-heart"
      :style="{ left: `${heart.x}px`, top: `${heart.y}px` }"
    >
      ❤️
    </div>

    <!-- 上下滑动提示浮标 (初次进入或轻提示) -->
    <Transition name="fade">
      <div v-if="showSwipeGuide" class="swipe-guide" @click="showSwipeGuide = false">
        <span class="swipe-guide__icon">⇅</span>
        <span class="swipe-guide__text">上下滑动切换视频</span>
      </div>
    </Transition>

    <!-- 固定在屏幕底部的控制区与进度条 -->
    <div class="video-app__fixed-footer">
      <div class="video-progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }" />
      </div>

      <!-- 快速切换上一条 / 下一条按钮 -->
      <div class="video-switch-controls">
        <button type="button" class="switch-btn" aria-label="上一条视频" @click.stop="prevVideo">
          ∧ 上一条
        </button>
        <span class="switch-count">{{ currentIndex + 1 }} / {{ videos.length }}</span>
        <button type="button" class="switch-btn" aria-label="下一条视频" @click.stop="nextVideo">
          ∨ 下一条
        </button>
      </div>
    </div>

    <!-- 评论半屏抽屉弹窗 -->
    <Transition name="drawer">
      <div
        v-if="showComments"
        class="comments-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="视频评论"
      >
        <div class="drawer-header">
          <span class="drawer-title">全部评论 ({{ currentVideo.comments }})</span>
          <button
            type="button"
            class="drawer-close"
            aria-label="关闭评论"
            @click="showComments = false"
          >
            ✕
          </button>
        </div>
        <div class="drawer-list">
          <div v-for="c in sampleComments" :key="c.id" class="comment-card">
            <span class="comment-avatar">👤</span>
            <div class="comment-body">
              <div class="comment-user-row">
                <span class="comment-user">{{ c.user }}</span>
                <span class="comment-time">{{ c.time }}</span>
              </div>
              <p class="comment-text">{{ c.text }}</p>
              <div class="comment-actions">
                <span>❤️ {{ c.likes }}</span>
                <span class="comment-reply">回复</span>
              </div>
            </div>
          </div>
        </div>
        <div class="drawer-input-row">
          <input type="text" class="drawer-input" placeholder="发条友善的评论吧…" />
          <button type="button" class="drawer-send-btn">发送</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.video-app {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #ffffff;
  overflow: hidden;
  user-select: none;
  touch-action: pan-x;
  background: #000000;
}

/* 顶部导航 */
.video-app__nav {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  pointer-events: auto;
}

.video-app__live-btn,
.video-app__search-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff2b55;
  box-shadow: 0 0 6px #ff2b55;
}

.video-app__tabs {
  display: flex;
  align-items: center;
  gap: 16px;
}

.video-tab {
  position: relative;
  font-size: 14.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  background: none;
  border: none;
  transition: all 0.15s ease;
}

.video-tab.is-active {
  color: #ffffff;
  font-weight: 700;
  font-size: 15.5px;
}

.video-tab.is-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 2.5px;
  border-radius: 999px;
  background: #ffffff;
}

/* 轮播流容器与滑轨 */
.video-feed-container {
  flex: 1;
  position: relative;
  height: 100%;
  overflow: hidden;
}

.video-slider-track {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  will-change: transform;
}

/* 单个视频卡片 Slide */
.video-slide {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 0 0 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  cursor: grab;
}

.video-slide:active {
  cursor: grabbing;
}

/* 舞台背景与氛围 */
.stage-backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  pointer-events: none;
}

.stage-particles {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.6;
}

.stage-graphic {
  display: grid;
  place-items: center;
  width: 140px;
  height: 140px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.07);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  backdrop-filter: blur(8px);
}

.stage-emoji {
  font-size: 64px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
  animation: float-pulse 3s ease-in-out infinite;
}

@keyframes float-pulse {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.05);
  }
}

.stage-play-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 10;
  pointer-events: none;
}

.play-triangle {
  font-size: 26px;
  margin-left: 5px;
  color: rgba(255, 255, 255, 0.9);
}

/* 右侧操作栏 */
.video-app__actions {
  position: absolute;
  right: 12px;
  bottom: 85px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  pointer-events: auto;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  background: none;
  border: none;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
}

.action-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
  font-size: 22px;
  box-shadow: 0 0 0 1.5px #ffffff;
  margin-bottom: 4px;
}

.avatar-follow-btn {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff2b55;
  color: #ffffff;
  font-size: 13px;
  line-height: 16px;
  font-weight: 700;
  display: grid;
  place-items: center;
  cursor: pointer;
  border: 1.5px solid #ffffff;
}

.action-icon {
  font-size: 27px;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
  transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-item:active .action-icon {
  transform: scale(0.85);
}

.action-item.is-liked .action-icon--heart {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 8px rgba(255, 43, 85, 0.8));
}

.action-count {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.action-disc {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 4px solid #374151;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  margin-top: 4px;
}

.action-disc.is-spinning {
  animation: rotate-disc 6s linear infinite;
}

.disc-inner {
  font-size: 14px;
}

@keyframes rotate-disc {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 底部视频信息 */
.video-slide__bottom {
  position: relative;
  z-index: 15;
  padding: 0 76px 78px 16px;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.4) 60%,
    transparent 100%
  );
  pointer-events: none;
}

.video-meta {
  pointer-events: auto;
}

.meta-author {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.meta-desc {
  margin: 5px 0 6px;
  font-size: 12.5px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.92);
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 7px;
}

.meta-tag {
  font-size: 11.5px;
  color: #ffd54a;
  font-weight: 500;
}

.meta-music {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.75);
}

.music-ticker {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* 固定底部控制栏与进度条 */
.video-app__fixed-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 25;
  padding: 0 16px 10px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  pointer-events: auto;
}

.video-progress-bar {
  height: 2.5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  transition: width 0.1s linear;
}

.video-switch-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 8px;
}

.switch-btn {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.switch-btn:active {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.switch-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-variant-numeric: tabular-nums;
}

/* 滑动引导浮标 */
.swipe-guide {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 28;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  backdrop-filter: blur(12px);
  pointer-events: none;
  animation: pulse-guide 2.5s ease-in-out infinite;
}

.swipe-guide__icon {
  font-size: 18px;
  animation: bounce-y 1.4s ease-in-out infinite;
}

.swipe-guide__text {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  white-space: nowrap;
}

@keyframes bounce-y {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes pulse-guide {
  0%,
  100% {
    opacity: 0.9;
  }
  50% {
    opacity: 0.6;
  }
}

/* 双击漂浮爱心 */
.floating-heart {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 64px;
  z-index: 40;
  pointer-events: none;
  animation: float-heart 0.75s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  filter: drop-shadow(0 4px 14px rgba(255, 43, 85, 0.7));
}

@keyframes float-heart {
  0% {
    transform: translate(-50%, -50%) scale(0.3) rotate(-15deg);
    opacity: 0;
  }
  40% {
    transform: translate(-50%, -50%) scale(1.3) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -100px) scale(1) rotate(15deg);
    opacity: 0;
  }
}

/* 评论半屏抽屉 */
.comments-drawer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 70%;
  z-index: 50;
  display: flex;
  flex-direction: column;
  background: #181d26;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.7);
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom, 0px));
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.drawer-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #ffffff;
}

.drawer-close {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  border: none;
}

.drawer-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comment-card {
  display: flex;
  gap: 10px;
}

.comment-avatar {
  font-size: 22px;
  flex: none;
}

.comment-body {
  flex: 1;
}

.comment-user-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.comment-user {
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
}

.comment-time {
  color: rgba(255, 255, 255, 0.35);
}

.comment-text {
  margin: 3px 0 4px;
  font-size: 12px;
  line-height: 1.45;
  color: #f1f5f9;
}

.comment-actions {
  display: flex;
  gap: 14px;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.45);
}

.comment-reply {
  color: #60a5fa;
  cursor: pointer;
}

.drawer-input-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.drawer-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 12px;
}

.drawer-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.drawer-send-btn {
  padding: 0 14px;
  border-radius: 999px;
  background: #ff2b55;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

/* 过渡动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.7);
}
</style>
