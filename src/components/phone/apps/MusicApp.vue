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
  <div class="flex flex-col h-full bg-[#0d0f18] text-white overflow-hidden relative">
    <!-- 顶部导航 -->
    <header
      class="flex justify-between items-center px-4 pt-3 pb-2 shrink-0 border-b border-white/5"
    >
      <div class="flex gap-4">
        <button
          type="button"
          class="text-sm text-gray-400 font-medium cursor-pointer pb-1 transition-all"
          :class="{
            '!text-white !font-bold border-b-2 border-rose-500': activeTab === 'recommend',
          }"
          @click="activeTab = 'recommend'"
        >
          推荐
        </button>
        <button
          type="button"
          class="text-sm text-gray-400 font-medium cursor-pointer pb-1 transition-all"
          :class="{ '!text-white !font-bold border-b-2 border-rose-500': activeTab === 'charts' }"
          @click="activeTab = 'charts'"
        >
          排行榜
        </button>
        <button
          type="button"
          class="text-sm text-gray-400 font-medium cursor-pointer pb-1 transition-all"
          :class="{ '!text-white !font-bold border-b-2 border-rose-500': activeTab === 'my' }"
          @click="activeTab = 'my'"
        >
          我的
        </button>
      </div>
      <button type="button" class="text-sm text-gray-400 cursor-pointer" aria-label="搜索">
        🔍
      </button>
    </header>

    <!-- 滚动歌单与榜单内容 -->
    <main class="flex-1 px-4 pt-3 pb-24 phone-scroll flex flex-col gap-4">
      <!-- 推荐大横幅 -->
      <section
        class="rounded-2xl p-4 bg-gradient-to-br from-rose-900/80 via-purple-900/60 to-slate-900 border border-rose-500/20 shadow-lg relative overflow-hidden"
      >
        <div class="text-[10px] text-rose-300 font-bold uppercase tracking-wider mb-1">
          每日私享 · 官方甄选
        </div>
        <h3 class="text-base font-bold mb-1">秋雨午后 · 惬意轻音乐</h3>
        <p class="text-xs text-gray-300 mb-3">根据你的近期收听习惯生成 · 30 首精选好歌</p>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold cursor-pointer active:scale-95 shadow-md"
          @click="selectSong(0)"
        >
          ▶ 立即播放
        </button>
      </section>

      <!-- 热门单曲列表 -->
      <section class="flex flex-col gap-2.5">
        <div class="flex justify-between items-center mb-1">
          <strong class="text-xs font-semibold text-gray-200 tracking-wide">热歌飙升榜</strong>
          <span class="text-[11px] text-gray-400 cursor-pointer">实时更新 ›</span>
        </div>

        <div class="flex flex-col gap-2">
          <div
            v-for="(song, idx) in songs"
            :key="song.id"
            class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
            :class="{ '!bg-white/10': idx === currentSongIndex }"
            @click="selectSong(idx)"
          >
            <span
              class="w-5 text-center text-xs font-bold text-gray-500"
              :class="{ '!text-rose-400': idx < 3 }"
              >{{ idx + 1 }}</span
            >
            <div
              class="w-10 h-10 rounded-lg grid place-items-center text-xl shrink-0 shadow-sm"
              :style="{ background: song.coverBg }"
            >
              <span>{{ song.coverEmoji }}</span>
            </div>
            <div class="flex-1 flex flex-col min-w-0">
              <span class="text-xs font-medium text-white truncate">{{ song.title }}</span>
              <span class="text-[10.5px] text-gray-400 truncate"
                >{{ song.artist }} - {{ song.album }}</span
              >
            </div>
            <button
              type="button"
              class="text-xs p-1 text-gray-400 cursor-pointer active:scale-90 transition-transform"
              :class="{ '!text-rose-500': song.liked }"
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
    <div
      class="absolute bottom-0 inset-x-0 h-14 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-4 flex items-center justify-between z-30 cursor-pointer"
      @click="showFullPlayer = true"
    >
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <div
          class="w-9 h-9 rounded-full grid place-items-center text-base shrink-0 shadow-md transition-all"
          :class="{ 'animate-[spin_12s_linear_infinite]': isPlaying }"
          :style="{ background: currentSong.coverBg }"
        >
          <span>{{ currentSong.coverEmoji }}</span>
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-xs font-medium text-white truncate">{{ currentSong.title }}</span>
          <span class="text-[10.5px] text-gray-400 truncate">{{ currentSong.artist }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="text-lg text-white p-1 cursor-pointer active:scale-90"
          aria-label="播放暂停"
          @click="togglePlay"
        >
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button
          type="button"
          class="text-lg text-gray-300 p-1 cursor-pointer active:scale-90"
          aria-label="下一首"
          @click="nextTrack"
        >
          ⏭
        </button>
      </div>
    </div>

    <!-- 全屏高保真黑胶唱片播放器 -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      leave-active-class="transition duration-250 ease-in"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showFullPlayer"
        class="absolute inset-0 z-50 bg-gradient-to-b from-slate-900 via-[#1a0f1d] to-black p-6 flex flex-col justify-between text-white"
        role="dialog"
        aria-modal="true"
      >
        <header class="flex justify-between items-center pb-2">
          <button
            type="button"
            class="text-2xl text-gray-400 p-1 cursor-pointer"
            @click="showFullPlayer = false"
          >
            ⌄
          </button>
          <div class="flex flex-col items-center">
            <strong class="text-sm font-semibold">{{ currentSong.title }}</strong>
            <span class="text-xs text-gray-400">{{ currentSong.artist }}</span>
          </div>
          <button
            type="button"
            class="text-base p-1 cursor-pointer"
            :class="{ '!text-rose-500': currentSong.liked }"
            @click="toggleSongLike(currentSong)"
          >
            {{ currentSong.liked ? '❤️' : '🤍' }}
          </button>
        </header>

        <!-- 唱盘黑胶中心展示 -->
        <div class="relative my-auto flex items-center justify-center">
          <div
            class="w-56 h-56 rounded-full bg-stone-900 border-8 border-stone-800 shadow-2xl grid place-items-center relative"
            :class="{ 'animate-[spin_18s_linear_infinite]': isPlaying }"
          >
            <div
              class="w-24 h-24 rounded-full grid place-items-center text-4xl shadow-inner border-2 border-stone-700"
              :style="{ background: currentSong.coverBg }"
            >
              <span>{{ currentSong.coverEmoji }}</span>
            </div>
          </div>
        </div>

        <!-- 歌词轮播区域 -->
        <div class="flex flex-col items-center gap-1.5 my-3 text-center">
          <p
            v-for="(line, lidx) in currentSong.lyrics"
            :key="lidx"
            class="text-xs transition-all m-0"
            :class="
              lidx === 2 ? 'text-rose-400 font-semibold scale-105' : 'text-gray-500 opacity-60'
            "
          >
            {{ line }}
          </p>
        </div>

        <!-- 播放进度条 -->
        <div class="flex flex-col gap-1.5 my-2">
          <div class="h-1 bg-white/15 rounded-full overflow-hidden">
            <div
              class="h-full bg-rose-500 rounded-full transition-all"
              :style="{ width: `${(currentSec / currentSong.durationSec) * 100}%` }"
            />
          </div>
          <div class="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>{{ formatTime(currentSec) }}</span>
            <span>{{ currentSong.duration }}</span>
          </div>
        </div>

        <!-- 底层主要控制栏 -->
        <footer class="flex items-center justify-around pt-2">
          <button type="button" class="text-lg text-gray-400 cursor-pointer" aria-label="循环模式">
            🔁
          </button>
          <button
            type="button"
            class="text-2xl text-white cursor-pointer active:scale-90"
            aria-label="上一首"
            @click="prevTrack"
          >
            ⏮
          </button>
          <button
            type="button"
            class="w-14 h-14 rounded-full bg-rose-600 text-white text-2xl grid place-items-center cursor-pointer shadow-lg active:scale-95"
            aria-label="播放暂停"
            @click="togglePlay"
          >
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button
            type="button"
            class="text-2xl text-white cursor-pointer active:scale-90"
            aria-label="下一首"
            @click="nextTrack"
          >
            ⏭
          </button>
          <button type="button" class="text-lg text-gray-400 cursor-pointer" aria-label="播放列表">
            📑
          </button>
        </footer>
      </div>
    </Transition>
  </div>
</template>
