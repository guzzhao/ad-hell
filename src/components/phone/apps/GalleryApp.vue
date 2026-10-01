<script setup lang="ts">
import { computed, ref } from 'vue'

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
  <div class="gallery-app">
    <!-- 顶部选项卡 -->
    <header class="gallery-header">
      <div class="gallery-tabs">
        <button
          type="button"
          class="gallery-tab"
          :class="{ 'is-active': activeTab === 'photos' }"
          @click="activeTab = 'photos'"
        >
          照片
        </button>
        <button
          type="button"
          class="gallery-tab"
          :class="{ 'is-active': activeTab === 'albums' }"
          @click="activeTab = 'albums'"
        >
          相册
        </button>
        <button
          type="button"
          class="gallery-tab"
          :class="{ 'is-active': activeTab === 'moments' }"
          @click="activeTab = 'moments'"
        >
          时刻
        </button>
      </div>
      <button type="button" class="gallery-search-btn" aria-label="搜索照片">🔍</button>
    </header>

    <!-- 照片分类过滤胶囊 -->
    <div v-if="activeTab === 'photos'" class="gallery-filters">
      <button
        type="button"
        class="filter-chip"
        :class="{ 'is-active': filterCategory === 'all' }"
        @click="filterCategory = 'all'"
      >
        全部 ({{ photos.length }})
      </button>
      <button
        type="button"
        class="filter-chip"
        :class="{ 'is-active': filterCategory === 'scenery' }"
        @click="filterCategory = 'scenery'"
      >
        风景
      </button>
      <button
        type="button"
        class="filter-chip"
        :class="{ 'is-active': filterCategory === 'portrait' }"
        @click="filterCategory = 'portrait'"
      >
        人像
      </button>
      <button
        type="button"
        class="filter-chip"
        :class="{ 'is-active': filterCategory === 'pet' }"
        @click="filterCategory = 'pet'"
      >
        萌宠
      </button>
      <button
        type="button"
        class="filter-chip"
        :class="{ 'is-active': filterCategory === 'food' }"
        @click="filterCategory = 'food'"
      >
        美食
      </button>
    </div>

    <!-- 照片视图 -->
    <main v-if="activeTab === 'photos'" class="gallery-scroll phone-scroll">
      <div class="photo-grid">
        <article
          v-for="photo in filteredPhotos"
          :key="photo.id"
          class="photo-card"
          :style="{ background: photo.gradient }"
          @click="selectedPhoto = photo"
        >
          <div class="photo-visual">
            <span class="photo-emoji">{{ photo.emoji }}</span>
          </div>

          <div class="photo-card-info">
            <span class="photo-card-title">{{ photo.title }}</span>
            <span class="photo-card-time">{{ photo.date }} {{ photo.time }}</span>
          </div>

          <button
            type="button"
            class="photo-card-like"
            :class="{ 'is-liked': photo.liked }"
            aria-label="收藏照片"
            @click="toggleLike(photo, $event)"
          >
            {{ photo.liked ? '❤️' : '🤍' }}
          </button>
        </article>
      </div>
    </main>

    <!-- 相册视图 -->
    <main v-else-if="activeTab === 'albums'" class="gallery-scroll phone-scroll">
      <div class="albums-grid">
        <div v-for="album in albums" :key="album.name" class="album-card">
          <div class="album-cover" :style="{ background: album.bg }">
            <span class="album-emoji">{{ album.coverEmoji }}</span>
          </div>
          <span class="album-name">{{ album.name }}</span>
          <span class="album-count">{{ album.count }} 项</span>
        </div>
      </div>
    </main>

    <!-- 时刻视图 -->
    <main v-else class="gallery-scroll phone-scroll">
      <div class="moments-list">
        <div class="moment-hero" style="background: linear-gradient(135deg, #1e3a8a, #f59e0b)">
          <span class="moment-badge">精选时刻 · 9月</span>
          <h3 class="moment-title">初秋的色彩与漫步</h3>
          <p class="moment-sub">共记录 28 张高清照片 · 杭州与贡嘎山</p>
        </div>
        <div class="moment-hero" style="background: linear-gradient(135deg, #065f46, #047857)">
          <span class="moment-badge">周末时光</span>
          <h3 class="moment-title">治愈系咖啡与手作</h3>
          <p class="moment-sub">共记录 14 张高清照片 · 慢调日常</p>
        </div>
      </div>
    </main>

    <!-- 全屏照片查看模态框 -->
    <Transition name="fade-zoom">
      <div
        v-if="selectedPhoto"
        class="photo-modal"
        role="dialog"
        aria-modal="true"
        aria-label="查看照片详情"
        @click="selectedPhoto = null"
      >
        <div class="modal-box" @click.stop>
          <header class="modal-top">
            <div class="modal-title-group">
              <strong class="modal-title">{{ selectedPhoto.title }}</strong>
              <span class="modal-loc">📍 {{ selectedPhoto.location }}</span>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              aria-label="关闭"
              @click="selectedPhoto = null"
            >
              ✕
            </button>
          </header>

          <div class="modal-preview" :style="{ background: selectedPhoto.gradient }">
            <span class="modal-emoji">{{ selectedPhoto.emoji }}</span>
          </div>

          <footer class="modal-meta-bar">
            <div class="modal-exif">
              <span class="exif-icon">📷</span>
              <span class="exif-text">{{ selectedPhoto.exif }}</span>
            </div>
            <div class="modal-actions">
              <button
                type="button"
                class="modal-act-btn"
                :class="{ 'is-liked': selectedPhoto.liked }"
                @click="toggleLike(selectedPhoto)"
              >
                {{ selectedPhoto.liked ? '❤️ 已收藏' : '🤍 收藏' }}
              </button>
              <div class="modal-nav-btns">
                <button type="button" class="nav-btn" @click="prevPhoto">‹ 上一张</button>
                <button type="button" class="nav-btn" @click="nextPhoto">下一张 ›</button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.gallery-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #090d16;
  color: #f8fafc;
  overflow: hidden;
}

/* 顶部 Tab */
.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 8px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.gallery-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gallery-tab {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 4px 0;
  transition: all 0.15s ease;
}

.gallery-tab.is-active {
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
}

.gallery-tab.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2.5px;
  border-radius: 999px;
  background: #38bdf8;
}

.gallery-search-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 14px;
}

/* 过滤标签 */
.gallery-filters {
  display: flex;
  gap: 8px;
  padding: 10px 16px 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.gallery-filters::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  flex: none;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-chip.is-active {
  background: #38bdf8;
  color: #041426;
  border-color: #38bdf8;
  font-weight: 600;
}

/* 照片滚动区域 */
.gallery-scroll {
  flex: 1;
  padding: 8px 14px 20px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.photo-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease;
}

.photo-card:active {
  transform: scale(0.97);
}

.photo-visual {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.photo-emoji {
  font-size: 48px;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
}

.photo-card-info {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  padding: 8px 4px 2px;
  border-radius: 8px;
}

.photo-card-title {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.photo-card-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.65);
}

.photo-card-like {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
  cursor: pointer;
}

/* 相册视图 */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  padding-top: 6px;
}

.album-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.album-cover {
  aspect-ratio: 1;
  border-radius: 16px;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  margin-bottom: 6px;
}

.album-emoji {
  font-size: 42px;
}

.album-name {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

.album-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

/* 时刻列表 */
.moments-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 6px;
}

.moment-hero {
  border-radius: 18px;
  padding: 20px 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}

.moment-badge {
  font-size: 10.5px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.moment-title {
  margin: 10px 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.moment-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

/* 全屏模态查看器 */
.photo-modal {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  width: 100%;
  max-height: 92%;
  display: flex;
  flex-direction: column;
  background: #111827;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title-group {
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 14px;
  color: #ffffff;
}

.modal-loc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
}

.modal-preview {
  aspect-ratio: 4 / 3;
  display: grid;
  place-items: center;
}

.modal-emoji {
  font-size: 72px;
}

.modal-meta-bar {
  padding: 12px 16px;
  background: #1a2233;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-exif {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-act-btn {
  background: rgba(255, 255, 255, 0.12);
  border: none;
  padding: 5px 12px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
}

.modal-nav-btns {
  display: flex;
  gap: 8px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.12);
  border: none;
  padding: 5px 10px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 11.5px;
  cursor: pointer;
}

.nav-btn:active,
.modal-act-btn:active {
  background: rgba(255, 255, 255, 0.25);
}

.fade-zoom-enter-active,
.fade-zoom-leave-active {
  transition: all 0.22s ease;
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
