<script setup lang="ts">
import CleanBadge from '../CleanBadge.vue'

const feed = [
  { author: '手艺人在做木工', desc: '一把椅子做了 40 年', likes: '1.2 万' },
  { author: '街角的面馆', desc: '凌晨四点开始熬汤', likes: '8613' },
]
</script>

<template>
  <div class="video">
    <CleanBadge text="这个演示里，它一个广告都没有。" />

    <article v-for="item in feed" :key="item.author" class="video__card">
      <div class="video__stage">
        <span class="video__play" aria-hidden="true">▶</span>
      </div>
      <div class="video__meta">
        <strong>{{ item.author }}</strong>
        <p>{{ item.desc }}</p>
        <small>♥ {{ item.likes }}</small>
      </div>
    </article>

    <p class="video__caption">
      现实里它的开屏、信息流、暂停、退出按钮上全是广告；这里反过来，
      一点广告也找不到。
    </p>
  </div>
</template>

<style scoped>
.video__card {
  margin-top: 14px;
  border-radius: 15px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.055);
}

.video__stage {
  display: grid;
  place-items: center;
  height: 150px;
  background: linear-gradient(160deg, #24304a 0%, #10151f 100%);
}

.video__play {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  font-size: 14px;
  padding-left: 3px;
}

.video__meta {
  padding: 11px 13px 13px;
}

.video__meta strong {
  font-size: 12.5px;
  font-weight: 600;
}

.video__meta p {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(242, 244, 248, 0.65);
}

.video__meta small {
  display: block;
  margin-top: 7px;
  font-size: 10.5px;
  color: rgba(242, 244, 248, 0.42);
}

.video__caption {
  margin: 16px 0 0;
  font-size: 11.5px;
  line-height: 1.7;
  color: rgba(242, 244, 248, 0.5);
}
</style>
