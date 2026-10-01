<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Song {
  id: number
  title: string
  artist: string
  album: string
  duration: string
  durationSec: number
  coverEmoji: string
  coverBg: string
  lyrics: string[]
  liked: boolean
}

const songs = ref<Song[]>([
  {
    id: 1,
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    duration: '04:29',
    durationSec: 269,
    coverEmoji: '🎸',
    coverBg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    lyrics: [
      '故事的小黄花 从出生那年就飘着',
      '童年的荡秋千 随记忆一直晃到现在',
      'Re So So Si Do Si La So La Si Si Si Si La Si La So',
      '吹着前奏望着天空 我想起花瓣试着掉落',
      '为你翘课的那一天 花落的那一天',
      '教室的那一间 我怎么看不见',
    ],
    liked: true,
  },
  {
    id: 2,
    title: '起风了',
    artist: '买辣椒也用券',
    album: '起风了',
    duration: '05:13',
    durationSec: 313,
    coverEmoji: '🍃',
    coverBg: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    lyrics: [
      '这一路上走走停停 顺着少年漂流的痕迹',
      '迈出车站的前一刻 竟有些犹豫',
      '不禁笑这近乡情怯 仍无可避免',
      '我曾难自拔于世界之大 也沉溺于其中梦话',
      '不得真假 不做挣扎 不惧笑话',
    ],
    liked: true,
  },
  {
    id: 3,
    title: '晚风心里吹',
    artist: '阿细',
    album: '晚风心里吹',
    duration: '03:45',
    durationSec: 225,
    coverEmoji: '🎷',
    coverBg: 'linear-gradient(135deg, #831843 0%, #f43f5e 100%)',
    lyrics: [
      '愿晚风将我吹 吹进你心内',
      '晚风吹过旧时梦 梦里伊人何处去',
      '看星光闪烁 忆起当日离别情深',
      '唯愿时光能缓 故人不散',
    ],
    liked: false,
  },
  {
    id: 4,
    title: '漠河舞厅',
    artist: '柳爽',
    album: '1st.尘埃',
    duration: '04:38',
    durationSec: 278,
    coverEmoji: '❄️',
    coverBg: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
    lyrics: [
      '我从没有见过极光出现的村落',
      '也没有见过有人 在深夜里跳舞',
      '如果时间能倒流 回到那个冬夜',
      '你是否还会 在火光中紧紧拥抱我',
    ],
    liked: false,
  },
  {
    id: 5,
    title: '慢调手冲咖啡爵士',
    artist: '雨天白噪音俱乐部',
    album: '午后留声机',
    duration: '03:20',
    durationSec: 200,
    coverEmoji: '☕',
    coverBg: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)',
    lyrics: [
      '「手冲水流注入浅烘咖啡豆的沙沙声」',
      '「雨滴敲打玻璃窗的温柔回响」',
      '「低音提琴慢速拨弦带来的宁静」',
    ],
    liked: true,
  },
])

const currentSongIndex = ref(0)
const currentSong = computed(() => songs.value[currentSongIndex.value] ?? songs.value[0]!)
const isPlaying = ref(true)
const currentSec = ref(42)
const showFullPlayer = ref(false)
const activeTab = ref<'recommend' | 'charts' | 'my'>('recommend')

let playTimer: number | null = null

onMounted(() => {
  playTimer = window.setInterval(() => {
    if (isPlaying.value) {
      if (currentSec.value < currentSong.value.durationSec) {
        currentSec.value += 1
      } else {
        nextTrack()
      }
    }
  }, 1000)
})

onUnmounted(() => {
  if (playTimer) clearInterval(playTimer)
})

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
}

function togglePlay(e?: MouseEvent): void {
  if (e) e.stopPropagation()
  isPlaying.value = !isPlaying.value
}

function nextTrack(e?: MouseEvent): void {
  if (e) e.stopPropagation()
  currentSongIndex.value = (currentSongIndex.value + 1) % songs.value.length
  currentSec.value = 0
  isPlaying.value = true
}

function prevTrack(e?: MouseEvent): void {
  if (e) e.stopPropagation()
  currentSongIndex.value = (currentSongIndex.value - 1 + songs.value.length) % songs.value.length
  currentSec.value = 0
  isPlaying.value = true
}

function selectSong(index: number): void {
  currentSongIndex.value = index
  currentSec.value = 0
  isPlaying.value = true
}

function toggleSongLike(song: Song, e?: MouseEvent): void {
  if (e) e.stopPropagation()
  song.liked = !song.liked
}
</script>

<template>
  <div class="music-app">
    <!-- 顶部导航 -->
    <header class="music-header">
      <div class="music-tabs">
        <button
          type="button"
          class="music-tab"
          :class="{ 'is-active': activeTab === 'recommend' }"
          @click="activeTab = 'recommend'"
        >
          推荐
        </button>
        <button
          type="button"
          class="music-tab"
          :class="{ 'is-active': activeTab === 'charts' }"
          @click="activeTab = 'charts'"
        >
          排行榜
        </button>
        <button
          type="button"
          class="music-tab"
          :class="{ 'is-active': activeTab === 'my' }"
          @click="activeTab = 'my'"
        >
          我的
        </button>
      </div>
      <button type="button" class="music-search-btn" aria-label="搜索">🔍</button>
    </header>

    <!-- 滚动歌单与榜单内容 -->
    <main class="music-content phone-scroll">
      <!-- 推荐大横幅 -->
      <section class="music-hero-banner">
        <div class="banner-tag">每日私享 · 官方甄选</div>
        <h3 class="banner-title">秋雨午后 · 惬意轻音乐</h3>
        <p class="banner-sub">根据你的近期收听习惯生成 · 30 首精选好歌</p>
        <button type="button" class="banner-play-btn" @click="selectSong(0)">▶ 立即播放</button>
      </section>

      <!-- 热门单曲列表 -->
      <section class="music-list-section">
        <div class="section-title-row">
          <strong class="section-title">热歌飙升榜</strong>
          <span class="section-sub">实时更新 ›</span>
        </div>

        <div class="song-list">
          <div
            v-for="(song, idx) in songs"
            :key="song.id"
            class="song-item"
            :class="{ 'is-current': idx === currentSongIndex }"
            @click="selectSong(idx)"
          >
            <span class="song-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
            <div class="song-cover" :style="{ background: song.coverBg }">
              <span>{{ song.coverEmoji }}</span>
            </div>
            <div class="song-info">
              <span class="song-name">{{ song.title }}</span>
              <span class="song-artist">{{ song.artist }} - {{ song.album }}</span>
            </div>
            <button
              type="button"
              class="song-like-btn"
              :class="{ 'is-liked': song.liked }"
              aria-label="喜欢歌曲"
              @click="toggleSongLike(song, $event)"
            >
              {{ song.liked ? '❤️' : '🤍' }}
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部常驻迷你播放条 (Mini Player) -->
    <div class="mini-player" @click="showFullPlayer = true">
      <div
        class="mini-cover"
        :class="{ 'is-spinning': isPlaying }"
        :style="{ background: currentSong.coverBg }"
      >
        <span>{{ currentSong.coverEmoji }}</span>
      </div>
      <div class="mini-info">
        <span class="mini-title">{{ currentSong.title }}</span>
        <span class="mini-artist">{{ currentSong.artist }}</span>
      </div>
      <div class="mini-controls">
        <button type="button" class="mini-btn" aria-label="播放暂停" @click="togglePlay">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button type="button" class="mini-btn" aria-label="下一首" @click="nextTrack">⏭</button>
      </div>
    </div>

    <!-- 全屏高保真黑胶唱片播放器 -->
    <Transition name="player-slide">
      <div v-if="showFullPlayer" class="full-player" role="dialog" aria-modal="true">
        <header class="player-top">
          <button type="button" class="player-down-btn" @click="showFullPlayer = false">⌄</button>
          <div class="player-header-title">
            <strong class="full-song-title">{{ currentSong.title }}</strong>
            <span class="full-song-artist">{{ currentSong.artist }}</span>
          </div>
          <button
            type="button"
            class="player-like-btn"
            :class="{ 'is-liked': currentSong.liked }"
            @click="toggleSongLike(currentSong)"
          >
            {{ currentSong.liked ? '❤️' : '🤍' }}
          </button>
        </header>

        <!-- 唱盘黑胶中心展示 -->
        <div class="player-disc-area">
          <div class="disc-tonearm" :class="{ 'is-playing': isPlaying }" />
          <div class="vinyl-outer" :class="{ 'is-spinning': isPlaying }">
            <div class="vinyl-core" :style="{ background: currentSong.coverBg }">
              <span class="vinyl-emoji">{{ currentSong.coverEmoji }}</span>
            </div>
          </div>
        </div>

        <!-- 歌词轮播区域 -->
        <div class="player-lyrics">
          <p
            v-for="(line, lidx) in currentSong.lyrics"
            :key="lidx"
            class="lyric-line"
            :class="{ 'is-active': lidx === 2 }"
          >
            {{ line }}
          </p>
        </div>

        <!-- 播放进度条 -->
        <div class="player-scrubber">
          <div class="scrub-bar">
            <div
              class="scrub-fill"
              :style="{ width: `${(currentSec / currentSong.durationSec) * 100}%` }"
            />
          </div>
          <div class="scrub-time">
            <span>{{ formatTime(currentSec) }}</span>
            <span>{{ currentSong.duration }}</span>
          </div>
        </div>

        <!-- 底层主要控制栏 -->
        <footer class="player-foot-controls">
          <button type="button" class="foot-btn" aria-label="循环模式">🔁</button>
          <button
            type="button"
            class="foot-btn foot-btn--nav"
            aria-label="上一首"
            @click="prevTrack"
          >
            ⏮
          </button>
          <button
            type="button"
            class="foot-btn foot-btn--main"
            aria-label="播放暂停"
            @click="togglePlay"
          >
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button
            type="button"
            class="foot-btn foot-btn--nav"
            aria-label="下一首"
            @click="nextTrack"
          >
            ⏭
          </button>
          <button type="button" class="foot-btn" aria-label="播放列表">📑</button>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.music-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0f141c;
  color: #f1f5f9;
  overflow: hidden;
  position: relative;
}

/* 顶部 Tab */
.music-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 8px;
  background: rgba(15, 20, 28, 0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.music-tabs {
  display: flex;
  gap: 16px;
}

.music-tab {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 4px 0;
  transition: all 0.15s ease;
}

.music-tab.is-active {
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
}

.music-tab.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2.5px;
  border-radius: 999px;
  background: #f43f5e;
}

.music-search-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  cursor: pointer;
}

/* 主体列表 */
.music-content {
  flex: 1;
  padding: 12px 14px 70px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.music-hero-banner {
  background: linear-gradient(135deg, #be123c 0%, #4c0519 100%);
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 8px 24px rgba(190, 18, 60, 0.25);
}

.banner-tag {
  font-size: 10.5px;
  color: #fecdd3;
  font-weight: 600;
  margin-bottom: 6px;
}

.banner-title {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
}

.banner-sub {
  margin: 0 0 14px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.8);
}

.banner-play-btn {
  background: #ffffff;
  color: #be123c;
  border: none;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 14px;
  color: #ffffff;
}

.section-sub {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.15s ease;
}

.song-item:active,
.song-item.is-current {
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.25);
}

.song-rank {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  width: 18px;
  text-align: center;
}

.song-rank.rank-top {
  color: #f43f5e;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex: none;
}

.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.song-name {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.song-like-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

/* 底部迷你播放条 */
.mini-player {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(24, 31, 46, 0.95);
  backdrop-filter: blur(18px);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  cursor: pointer;
  z-index: 20;
}

.mini-cover {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 16px;
  border: 2px solid #334155;
  flex: none;
}

.mini-cover.is-spinning {
  animation: spin-vinyl 8s linear infinite;
}

.mini-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mini-title {
  font-size: 12.5px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-artist {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.55);
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
}

/* 全屏黑胶播放器 */
.full-player {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: linear-gradient(180deg, #182236 0%, #0d121d 100%);
  display: flex;
  flex-direction: column;
  padding: 10px 18px 24px;
  color: #ffffff;
}

.player-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.player-down-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  cursor: pointer;
}

.player-header-title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.full-song-title {
  font-size: 14.5px;
  font-weight: 700;
}

.full-song-artist {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.player-like-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

/* 唱盘 */
.player-disc-area {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0 10px;
}

.disc-tonearm {
  position: absolute;
  top: -16px;
  left: 54%;
  width: 60px;
  height: 18px;
  background: #94a3b8;
  transform-origin: top left;
  transform: rotate(-30deg);
  transition: transform 0.4s ease;
  z-index: 10;
  border-radius: 4px;
}

.disc-tonearm.is-playing {
  transform: rotate(0deg);
}

.vinyl-outer {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: radial-gradient(#111827 0%, #030712 100%);
  border: 10px solid #1f2937;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7);
  display: grid;
  place-items: center;
}

.vinyl-outer.is-spinning {
  animation: spin-vinyl 12s linear infinite;
}

.vinyl-core {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 6px #111827;
}

.vinyl-emoji {
  font-size: 32px;
}

@keyframes spin-vinyl {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 歌词 */
.player-lyrics {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  padding: 6px 0;
}

.lyric-line {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.lyric-line.is-active {
  font-size: 13.5px;
  color: #38bdf8;
  font-weight: 600;
}

/* 进度条 */
.player-scrubber {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.scrub-bar {
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.scrub-fill {
  height: 100%;
  background: #f43f5e;
  border-radius: 999px;
  transition: width 0.3s linear;
}

.scrub-time {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.5);
  font-variant-numeric: tabular-nums;
}

/* 控制按钮 */
.player-foot-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}

.foot-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 20px;
  cursor: pointer;
}

.foot-btn--nav {
  font-size: 24px;
}

.foot-btn--main {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #f43f5e;
  color: #ffffff;
  font-size: 24px;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 18px rgba(244, 63, 94, 0.4);
}

.player-slide-enter-active,
.player-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.player-slide-enter-from,
.player-slide-leave-to {
  transform: translateY(100%);
}
</style>
