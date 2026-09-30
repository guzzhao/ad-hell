<script setup lang="ts">
import CleanBadge from '../CleanBadge.vue'

const items = [
  { name: '棉麻抱枕套', price: '¥ 39' },
  { name: '陶瓷马克杯', price: '¥ 58' },
  { name: '手工皂两块装', price: '¥ 26' },
  { name: '亚麻桌旗', price: '¥ 45' },
]
</script>

<template>
  <div class="shop">
    <CleanBadge text="这个演示里，它一个广告都没有。" />

    <div class="shop__grid">
      <article v-for="item in items" :key="item.name" class="shop__card">
        <div class="shop__thumb" aria-hidden="true" />
        <strong>{{ item.name }}</strong>
        <small>{{ item.price }}</small>
      </article>
    </div>

    <p class="shop__caption">
      现实里它的首页弹窗、签到弹窗、优惠券弹窗、退出挽留弹窗一个接一个； 这里反过来，一个都没有。
    </p>
  </div>
</template>

<style scoped>
.shop__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}

.shop__card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.055);
}

.shop__thumb {
  height: 74px;
  border-radius: 9px;
  background: linear-gradient(150deg, #2c3a55 0%, #131924 100%);
  margin-bottom: 3px;
}

.shop__card strong {
  font-size: 12px;
  font-weight: 600;
}

.shop__card small {
  font-size: 11.5px;
  color: #ffd54a;
}

.shop__caption {
  margin: 16px 0 0;
  font-size: 11.5px;
  line-height: 1.7;
  color: rgba(242, 244, 248, 0.5);
}
</style>
