<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'

/**
 * 页内假落地页。
 *
 * "误触跳转"必须让人看得见、且必须自己退回来——否则误触只是个无感的数字。
 * 关键约束：它**只在页内**，不触发任何真实外链跳转（prd.md R3 / design.md §6）。
 */
const storm = useStormStore()
const { landingOpen, misclickCount } = storeToRefs(storm)
</script>

<template>
  <Transition name="landing">
    <div
      v-if="landingOpen"
      class="landing"
      role="dialog"
      aria-modal="true"
      aria-label="误触跳转演示"
    >
      <div class="landing__page">
        <span class="landing__badge">你刚刚误触了广告</span>

        <h2 class="landing__title">正在为你打开…</h2>
        <p class="landing__note">
          这是一个演示用的假落地页，没有跳转到任何真实网站，也不会加载任何外部内容。
        </p>

        <div class="landing__wheel" aria-hidden="true">
          <span class="landing__wheel-ring">幸运转盘</span>
          <span class="landing__wheel-sub">恭喜获得 1 次抽奖机会</span>
        </div>

        <p class="landing__stat">
          你已经误触 <strong>{{ misclickCount }}</strong> 次。每误触一次，屏幕上就多出 2~4 个新弹窗。
        </p>
      </div>

      <button type="button" class="landing__back" @click="storm.closeLanding()">返回</button>
    </div>
  </Transition>
</template>

<style scoped>
.landing {
  position: absolute;
  inset: 0;
  z-index: 900;
  display: flex;
  flex-direction: column;
  background: #f4f5f7;
  color: #171a20;
}

.landing__page {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 26px 22px;
}

.landing__badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: #ffe0dc;
  color: #b3261a;
  font-size: 11px;
  font-weight: 700;
}

.landing__title {
  margin: 16px 0 0;
  font-size: 24px;
  font-weight: 800;
}

.landing__note {
  margin: 8px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: #5b6270;
}

.landing__wheel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 24px 0;
  padding: 30px 16px;
  border-radius: 18px;
  background: linear-gradient(150deg, #ffd54a 0%, #ff8a3d 55%, #e23b2e 100%);
  color: #fff;
}

.landing__wheel-ring {
  font-size: 20px;
  font-weight: 800;
}

.landing__wheel-sub {
  font-size: 12px;
  opacity: 0.92;
}

.landing__stat {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: #3c424e;
}

.landing__stat strong {
  color: #b3261a;
  font-size: 15px;
}

.landing__back {
  flex: none;
  /* 这是页面自己的控件，不是广告按钮，所以给足可点面积 */
  min-height: 56px;
  margin: 0;
  background: #171a20;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
}
</style>
