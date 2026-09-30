<script setup lang="ts">
import { HOME_GROUP_TITLES, appsByCategory } from '@/data/apps'
import type { AppCategory, AppMeta } from '@/types/ad'
import AppIcon from './AppIcon.vue'

const emit = defineEmits<{ open: [id: string] }>()

interface Group {
  category: AppCategory
  title: string
  hint: string
  apps: readonly AppMeta[]
}

/**
 * 两个分区刻意与现实倒置（prd.md R5）。
 * 提示语直接点出反差，否则用户可能不会意识到这是刻意安排。
 */
const groups: Group[] = [
  {
    category: 'system',
    title: HOME_GROUP_TITLES.system,
    hint: '在这部手机里，它们全被广告攻陷了',
    apps: appsByCategory('system'),
  },
  {
    category: 'commercial',
    title: HOME_GROUP_TITLES.commercial,
    hint: '在这部手机里，它们一个广告都没有',
    apps: appsByCategory('commercial'),
  },
]
</script>

<template>
  <div class="phone-scroll home">
    <p class="home__intro">
      从你打开这部手机的那一刻起，它就已经在弹广告了。<strong>试着把它们关掉。</strong>
    </p>

    <section v-for="group in groups" :key="group.category" class="home-group">
      <h2 class="home-group__title">
        <span
          class="home-group__tag"
          :class="`home-group__tag--${group.category}`"
          aria-hidden="true"
        >
          {{ group.category === 'system' ? 'A' : 'B' }}
        </span>
        {{ group.title }}
      </h2>
      <p class="home-group__hint">{{ group.hint }}</p>

      <div class="home-group__grid">
        <button
          v-for="app in group.apps"
          :key="app.id"
          type="button"
          class="app-tile"
          @click="emit('open', app.id)"
        >
          <span class="app-tile__icon" :class="`app-tile__icon--${group.category}`">
            <AppIcon :name="app.id" />
          </span>
          <span class="app-tile__name">{{ app.name }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding: 4px 20px 90px;
}

.home__intro {
  margin: 8px 0 20px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(242, 244, 248, 0.72);
}

.home__intro strong {
  color: #ffd54a;
  font-weight: 600;
}

.home-group + .home-group {
  margin-top: 24px;
}

.home-group__title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.home-group__tag {
  display: inline-grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  color: #0b0d11;
}

.home-group__tag--system {
  background: var(--accent);
  color: #fff;
}

.home-group__tag--commercial {
  background: #4ade80;
}

.home-group__hint {
  margin: 5px 0 12px 24px;
  font-size: 11.5px;
  color: rgba(242, 244, 248, 0.48);
}

.home-group__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px 10px;
}

.app-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 0;
}

.app-tile__icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  padding: 12px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #eef1f6;
  transition: transform 0.16s ease;
}

.app-tile__icon--commercial {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.28);
  color: #b9f5cd;
}

.app-tile:active .app-tile__icon {
  transform: scale(0.93);
}

.app-tile__name {
  font-size: 11px;
  color: rgba(242, 244, 248, 0.8);
}
</style>
