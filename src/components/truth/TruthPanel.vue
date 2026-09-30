<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'
import MoneyChainChart from './MoneyChainChart.vue'
import PenaltyCompare from './PenaltyCompare.vue'
import AdviceList from './AdviceList.vue'

const storm = useStormStore()
const { closedCount, spawnedCount, misclickCount, elapsedSeconds } = storeToRefs(storm)

/** 数据来源：央视新闻相关报道，IT之家转载。全页唯一的数据出处。 */
const SOURCE_URL = 'https://www.ithome.com/1/008/059.htm'

const oversight = [
  '弹窗广告常与"快应用"技术有关。快应用本是系统内置的免安装应用形态，被滥用后可以在后台生成悬浮窗，覆盖在其他应用之上。',
  '开发者在上架前不触发弹窗，通过后台跟踪用户机型、区域，在特定时间地点突然触发，导致监控方难以取证和复现。',
  '弹窗背后是一条完整的流量变现链条，涉及广告主、广告平台和 App 开发者三方。',
]
</script>

<template>
  <div class="truth">
    <article class="truth__doc">
      <header class="truth__head">
        <p class="truth__eyebrow">你现在看到的，不是特效</p>
        <h1 class="truth__title">关不掉的弹窗</h1>
        <p class="truth__lede">
          刚才那部手机里的每一样东西都来自公开报道：被广告盖住的相机和拨号键、
          伪装成"女儿来电"的广告、右上角那个小得点不到的关闭键。
          区别只在于——现实里它不会在 55 秒后停下来。
        </p>
      </header>

      <!-- 你刚才的经历 -->
      <section class="truth__run" aria-label="你刚才的经历">
        <div class="truth__run-item">
          <span>坚持了</span>
          <b>{{ elapsedSeconds }}s</b>
        </div>
        <div class="truth__run-item">
          <span>关掉了</span>
          <b>{{ closedCount }} 个</b>
        </div>
        <div class="truth__run-item">
          <span>又来了</span>
          <b class="is-bad">{{ spawnedCount }} 个</b>
        </div>
        <div class="truth__run-item">
          <span>误触</span>
          <b class="is-bad">{{ misclickCount }} 次</b>
        </div>
      </section>

      <!-- 1. 变现链条 -->
      <section class="truth__section">
        <h2><span class="truth__no">01</span>弹窗为什么这么多</h2>
        <MoneyChainChart />
      </section>

      <!-- 2. 违法成本 -->
      <section class="truth__section">
        <h2><span class="truth__no">02</span>为什么屡禁不止</h2>
        <PenaltyCompare />
      </section>

      <!-- 3. 监管困境 -->
      <section class="truth__section">
        <h2><span class="truth__no">03</span>为什么取证这么难</h2>
        <ul class="truth__list">
          <li v-for="item in oversight" :key="item">{{ item }}</li>
        </ul>
      </section>

      <!-- 4. 法规依据 -->
      <section class="truth__section">
        <h2><span class="truth__no">04</span>规矩其实早就有了</h2>
        <ul class="truth__list">
          <li>
            《广告法》《互联网广告管理办法》要求弹窗广告显著标明关闭标志，
            <b>确保一键关闭</b>。
          </li>
          <li>
            工信部 2021 年发布的适老化规范明确禁止适老模式出现广告弹窗，
            并对关闭按钮的位置、大小作出限制。
          </li>
          <li>2026 年 6 月，工信部发文指导规范 App 信息窗口跳转行为。</li>
        </ul>
      </section>

      <!-- 5. 可以做的事 -->
      <section class="truth__section">
        <h2><span class="truth__no">05</span>可以做的事</h2>
        <AdviceList />
      </section>

      <footer class="truth__foot">
        <p class="truth__source">
          数据与事实来源：央视新闻《起底手机弹窗广告乱象："快应用"被滥用，违法成本远低于收益》，
          <a :href="SOURCE_URL" target="_blank" rel="noopener noreferrer">IT之家转载全文</a>。
          本页未使用任何真实企业名称、商标或 Logo，所有广告品牌均为虚构。
        </p>

        <div class="truth__actions">
          <button type="button" class="truth__again" @click="storm.restart()">
            再被淹一次（换个弹窗序列）
          </button>
        </div>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.truth {
  position: fixed;
  inset: 0;
  z-index: 500;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--page-bg);
}

.truth__doc {
  max-width: 680px;
  margin: 0 auto;
  padding: 56px 22px 72px;
}

.truth__eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: var(--accent);
}

.truth__title {
  margin: 12px 0 0;
  font-size: clamp(30px, 8vw, 46px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.truth__lede {
  margin: 18px 0 0;
  font-size: 15px;
  line-height: 1.9;
  color: var(--ink-dim);
}

.truth__run {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  margin: 32px 0 8px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

@media (min-width: 520px) {
  .truth__run {
    grid-template-columns: repeat(4, 1fr);
  }
}

.truth__run-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 16px 18px;
  background: #11151d;
}

.truth__run-item span {
  font-size: 11.5px;
  color: var(--ink-faint);
}

.truth__run-item b {
  font-family: var(--font-num);
  font-size: 19px;
  font-weight: 700;
}

.truth__run-item b.is-bad {
  color: #ff8f7f;
}

.truth__section {
  margin-top: 56px;
}

.truth__section h2 {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 22px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.truth__no {
  font-family: var(--font-num);
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
}

.truth__list {
  margin: 0;
  padding-left: 20px;
  font-size: 13.5px;
  line-height: 2;
  color: var(--ink-dim);
}

.truth__list b {
  color: var(--ink);
  font-weight: 600;
}

.truth__foot {
  margin-top: 64px;
  padding-top: 26px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.truth__source {
  margin: 0;
  font-size: 12px;
  line-height: 1.9;
  color: var(--ink-faint);
}

.truth__source a {
  color: #7fd4ff;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.truth__actions {
  margin-top: 26px;
}

.truth__again {
  min-height: 52px;
  padding: 0 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
}

.truth__again:active {
  background: rgba(255, 255, 255, 0.14);
}
</style>
