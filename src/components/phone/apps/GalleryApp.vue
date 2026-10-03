<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()

interface PhotoItem {
  id: number
  title: string
  location: string
  date: string
  time: string
  emoji: string
  gradient: string
  category: 'scenery' | 'portrait' | 'pet' | 'food'
  exif: string
  liked: boolean
}

const photos = ref<PhotoItem[]>([
  {
    id: 1,
    title: '日照金山全景',
    location: '贡嘎雪山 · 海拔5200m',
    date: '今天',
    time: '06:24',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #f59e0b 50%, #ea580c 100%)',
    category: 'scenery',
    exif: '48MP · 24mm · ƒ/1.8 · 1/800s · ISO 64',
    liked: true,
  },
  {
    id: 2,
    title: '暖阳橘猫午睡',
    location: '阳台小憩',
    date: '今天',
    time: '14:15',
    emoji: '🐱',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #78350f 100%)',
    category: 'pet',
    exif: '12MP · 50mm · ƒ/1.9 · 1/250s · ISO 100',
    liked: true,
  },
  {
    id: 3,
    title: '手工榫卯木作',
    location: '老张木艺坊',
    date: '昨天',
    time: '16:40',
    emoji: '🪵',
    gradient: 'linear-gradient(135deg, #78350f 0%, #451a03 60%, #1c1917 100%)',
    category: 'scenery',
    exif: '24MP · 35mm · ƒ/2.0 · 1/120s · ISO 200',
    liked: false,
  },
  {
    id: 4,
    title: '老火慢煨牛骨面',
    location: '深夜面馆',
    date: '昨天',
    time: '21:05',
    emoji: '🍜',
    gradient: 'linear-gradient(135deg, #b45309 0%, #7c2d12 60%, #1e1b18 100%)',
    category: 'food',
    exif: '12MP · 28mm · ƒ/1.8 · 1/60s · ISO 400',
    liked: false,
  },
  {
    id: 5,
    title: '手冲浅烘瑰夏',
    location: '慢调咖啡馆',
    date: '9月28日',
    time: '10:30',
    emoji: '☕',
    gradient: 'linear-gradient(135deg, #57534e 0%, #292524 60%, #0c0a09 100%)',
    category: 'food',
    exif: '24MP · 50mm · ƒ/2.2 · 1/160s · ISO 160',
    liked: true,
  },
  {
    id: 6,
    title: '秋日枫林人像',
    location: '西湖栖霞岭',
    date: '9月28日',
    time: '15:10',
    emoji: '🍁',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #7c2d12 100%)',
    category: 'portrait',
    exif: '48MP · 70mm · ƒ/2.0 · 1/400s · ISO 80',
    liked: false,
  },
  {
    id: 7,
    title: '城市璀璨夜景',
    location: '钱江新城大剧院',
    date: '9月26日',
    time: '20:18',
    emoji: '🌃',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #030712 100%)',
    category: 'scenery',
    exif: '12MP · 14mm · ƒ/2.2 · 2.5s · ISO 320',
    liked: true,
  },
  {
    id: 8,
    title: '森林林间微光',
    location: '莫干山竹海',
    date: '9月24日',
    time: '08:45',
    emoji: '🌲',
    gradient: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #064e3b 100%)',
    category: 'scenery',
    exif: '24MP · 24mm · ƒ/2.8 · 1/320s · ISO 120',
    liked: false,
  },
])

const activeTab = ref<'photos' | 'albums' | 'moments'>('photos')
const selectedPhoto = ref<PhotoItem | null>(null)
const filterCategory = ref<'all' | 'scenery' | 'portrait' | 'pet' | 'food'>('all')

const filteredPhotos = computed(() => {
  if (filterCategory.value === 'all') return photos.value
  return photos.value.filter((p) => p.category === filterCategory.value)
})

const albums = [
  {
    name: '相机胶卷',
    count: 128,
    coverEmoji: '📷',
    bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
  {
    name: '我的收藏',
    count: 24,
    coverEmoji: '❤️',
    bg: 'linear-gradient(135deg, #ec4899, #be185d)',
  },
  {
    name: '美食与咖啡',
    count: 36,
    coverEmoji: '☕',
    bg: 'linear-gradient(135deg, #f59e0b, #b45309)',
  },
  {
    name: '宠物伙伴',
    count: 42,
    coverEmoji: '🐱',
    bg: 'linear-gradient(135deg, #10b981, #047857)',
  },
]

function toggleLike(photo: PhotoItem, e?: MouseEvent): void {
  if (e) e.stopPropagation()
  photo.liked = !photo.liked
}

function nextPhoto(): void {
  if (!selectedPhoto.value) return
  const idx = filteredPhotos.value.findIndex((p) => p.id === selectedPhoto.value?.id)
  if (idx !== -1 && idx < filteredPhotos.value.length - 1) {
    selectedPhoto.value = filteredPhotos.value[idx + 1] ?? null
  }
}

function prevPhoto(): void {
  if (!selectedPhoto.value) return
  const idx = filteredPhotos.value.findIndex((p) => p.id === selectedPhoto.value?.id)
  if (idx > 0) {
    selectedPhoto.value = filteredPhotos.value[idx - 1] ?? null
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-[#0a0d14] text-white overflow-hidden relative">
    <!-- 顶部选项卡 -->
    <header
      class="flex justify-between items-center px-4 pt-3 pb-2 shrink-0 border-b border-white/5"
    >
      <div class="flex gap-4">
        <button
          type="button"
          class="text-sm text-gray-400 font-medium cursor-pointer pb-1 transition-all"
          :class="{ '!text-white !font-bold border-b-2 border-white': activeTab === 'photos' }"
          @click="activeTab = 'photos'"
        >
          照片
        </button>
        <button
          type="button"
          class="text-sm text-gray-400 font-medium cursor-pointer pb-1 transition-all"
          :class="{ '!text-white !font-bold border-b-2 border-white': activeTab === 'albums' }"
          @click="activeTab = 'albums'"
        >
          相册
        </button>
        <button
          type="button"
          class="text-sm text-gray-400 font-medium cursor-pointer pb-1 transition-all"
          :class="{ '!text-white !font-bold border-b-2 border-white': activeTab === 'moments' }"
          @click="activeTab = 'moments'"
        >
          时刻
        </button>
      </div>
      <button type="button" class="text-sm text-gray-400 cursor-pointer" aria-label="搜索照片">
        🔍
      </button>
    </header>

    <!-- 云存储容量告警广告条 -->
    <div
      v-if="storm.adsEnabled"
      class="flex items-center justify-between mx-4 mt-2 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs cursor-pointer hover:bg-amber-500/25 transition-all"
      @click="storm.tapAdBody('gallery-cloud')"
    >
      <div class="flex items-center gap-2 truncate">
        <span>☁️</span>
        <span class="truncate">云空间已用 98.4%，照片将停止同步</span>
      </div>
      <span class="shrink-0 text-[11px] font-bold text-amber-300 underline ml-2">1元扩容2TB ›</span>
    </div>

    <!-- 照片分类过滤胶囊 -->
    <div
      v-if="activeTab === 'photos'"
      class="flex gap-2 px-4 py-2 overflow-x-auto shrink-0 no-scrollbar"
    >
      <button
        type="button"
        class="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 whitespace-nowrap cursor-pointer transition-all"
        :class="{ '!bg-white !text-black !font-semibold': filterCategory === 'all' }"
        @click="filterCategory = 'all'"
      >
        全部 ({{ photos.length }})
      </button>
      <button
        type="button"
        class="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 whitespace-nowrap cursor-pointer transition-all"
        :class="{ '!bg-white !text-black !font-semibold': filterCategory === 'scenery' }"
        @click="filterCategory = 'scenery'"
      >
        风景
      </button>
      <button
        type="button"
        class="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 whitespace-nowrap cursor-pointer transition-all"
        :class="{ '!bg-white !text-black !font-semibold': filterCategory === 'portrait' }"
        @click="filterCategory = 'portrait'"
      >
        人像
      </button>
      <button
        type="button"
        class="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 whitespace-nowrap cursor-pointer transition-all"
        :class="{ '!bg-white !text-black !font-semibold': filterCategory === 'pet' }"
        @click="filterCategory = 'pet'"
      >
        萌宠
      </button>
      <button
        type="button"
        class="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 whitespace-nowrap cursor-pointer transition-all"
        :class="{ '!bg-white !text-black !font-semibold': filterCategory === 'food' }"
        @click="filterCategory = 'food'"
      >
        美食
      </button>
    </div>

    <!-- 照片视图 -->
    <main v-if="activeTab === 'photos'" class="flex-1 px-4 py-3 phone-scroll">
      <div class="grid grid-cols-2 gap-3">
        <template v-for="(photo, pIndex) in filteredPhotos" :key="photo.id">
          <!-- 伪装相册流的原生广告卡片 -->
          <div
            v-if="storm.adsEnabled && pIndex === 2"
            class="relative aspect-[3/4] rounded-2xl overflow-hidden p-3 flex flex-col justify-between cursor-pointer group shadow-lg bg-gradient-to-br from-rose-950 via-purple-950 to-neutral-900 border border-rose-500/40"
            @click="storm.tapAdBody('dating-nearby')"
          >
            <div class="flex items-center justify-between z-10">
              <span
                class="px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-amber-300 font-bold border border-amber-400/40"
                >推广</span
              >
              <span class="text-[10px] text-rose-300/80">附近3人</span>
            </div>
            <div class="flex-1 flex flex-col items-center justify-center select-none text-center">
              <span class="text-4xl mb-1 group-hover:scale-110 transition-transform">💌</span>
              <span class="text-xs font-bold text-white">近邻缘 · 同城交友</span>
              <span class="text-[10px] text-rose-200/80 mt-0.5">有好友想查看你的相册</span>
            </div>
            <div class="flex items-center justify-between z-10 pt-1 border-t border-white/10">
              <span class="text-[10px] text-white/60">广告</span>
              <span class="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold"
                >查看 ›</span
              >
            </div>
          </div>

          <article
            class="relative aspect-[3/4] rounded-2xl overflow-hidden p-3 flex flex-col justify-between cursor-pointer group shadow-lg"
            :style="{ background: photo.gradient }"
            @click="selectedPhoto = photo"
          >
            <div
              class="flex-1 grid place-items-center text-5xl select-none group-hover:scale-105 transition-transform"
            >
              <span>{{ photo.emoji }}</span>
            </div>

            <div class="flex flex-col z-10 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
              <span class="text-xs font-semibold text-white truncate">{{ photo.title }}</span>
              <span class="text-[10px] text-white/70">{{ photo.date }} {{ photo.time }}</span>
            </div>

            <button
              type="button"
              class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm grid place-items-center text-xs cursor-pointer z-10 active:scale-90 transition-transform"
              aria-label="收藏照片"
              @click="toggleLike(photo, $event)"
            >
              {{ photo.liked ? '❤️' : '🤍' }}
            </button>
          </article>
        </template>
      </div>
    </main>

    <!-- 相册视图 -->
    <main v-else-if="activeTab === 'albums'" class="flex-1 px-4 py-3 phone-scroll">
      <div class="grid grid-cols-2 gap-3.5">
        <div v-for="album in albums" :key="album.name" class="flex flex-col gap-1.5 cursor-pointer">
          <div
            class="aspect-square rounded-2xl grid place-items-center text-4xl shadow-md"
            :style="{ background: album.bg }"
          >
            <span>{{ album.coverEmoji }}</span>
          </div>
          <span class="text-xs font-semibold text-white">{{ album.name }}</span>
          <span class="text-[10.5px] text-gray-400">{{ album.count }} 项</span>
        </div>
      </div>
    </main>

    <!-- 时刻视图 -->
    <main v-else class="flex-1 px-4 py-3 phone-scroll">
      <div class="flex flex-col gap-3.5">
        <div
          class="rounded-2xl p-4 text-white shadow-lg bg-gradient-to-br from-blue-900 to-amber-500"
        >
          <span
            class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/30 backdrop-blur-sm inline-block mb-2"
            >精选时刻 · 9月</span
          >
          <h3 class="text-base font-bold mb-1">初秋的色彩与漫步</h3>
          <p class="text-xs text-white/80">共记录 28 张高清照片 · 杭州与贡嘎山</p>
        </div>
        <div
          class="rounded-2xl p-4 text-white shadow-lg bg-gradient-to-br from-emerald-800 to-emerald-600"
        >
          <span
            class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/30 backdrop-blur-sm inline-block mb-2"
            >周末时光</span
          >
          <h3 class="text-base font-bold mb-1">治愈系咖啡与手作</h3>
          <p class="text-xs text-white/80">共记录 14 张高清照片 · 慢调日常</p>
        </div>
      </div>
    </main>

    <!-- 全屏照片查看模态框 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="selectedPhoto"
        class="absolute inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4"
        role="dialog"
        aria-modal="true"
        aria-label="查看照片详情"
        @click="selectedPhoto = null"
      >
        <div class="w-full h-full flex flex-col justify-between" @click.stop>
          <header class="flex justify-between items-center text-white pb-2">
            <div>
              <strong class="text-sm font-semibold">{{ selectedPhoto.title }}</strong>
              <span class="text-[11px] text-gray-400 block mt-0.5"
                >📍 {{ selectedPhoto.location }}</span
              >
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-sm cursor-pointer"
              aria-label="关闭"
              @click="selectedPhoto = null"
            >
              ✕
            </button>
          </header>

          <div
            class="flex-1 my-3 rounded-2xl grid place-items-center text-8xl shadow-2xl"
            :style="{ background: selectedPhoto.gradient }"
          >
            <span>{{ selectedPhoto.emoji }}</span>
          </div>

          <footer class="flex flex-col gap-3 pt-2 border-t border-white/10">
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <span>📷</span>
              <span>{{ selectedPhoto.exif }}</span>
            </div>
            <div class="flex justify-between items-center">
              <button
                type="button"
                class="px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-medium cursor-pointer active:scale-95"
                @click="toggleLike(selectedPhoto)"
              >
                {{ selectedPhoto.liked ? '❤️ 已收藏' : '🤍 收藏' }}
              </button>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-300 cursor-pointer hover:bg-white/20 active:scale-95"
                  @click="prevPhoto"
                >
                  ‹ 上一张
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-300 cursor-pointer hover:bg-white/20 active:scale-95"
                  @click="nextPhoto"
                >
                  下一张 ›
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </div>
</template>
