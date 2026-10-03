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
  <div class="truth fixed inset-0 z-[500] overflow-y-auto overscroll-contain bg-[var(--page-bg)]">
    <article class="truth__doc max-w-[680px] mx-auto px-[22px] pt-14 pb-[72px]">
      <header class="truth__head">
        <p class="truth__eyebrow m-0 text-xs tracking-[0.16em] text-[#ff4d3d]">
          你现在看到的，不是特效
        </p>
        <h1
          class="truth__title mt-3 text-[clamp(30px,8vw,46px)] font-extrabold tracking-tight leading-[1.15] text-white"
        >
          关不掉的弹窗
        </h1>
        <p class="truth__lede mt-[18px] text-[15px] leading-[1.9] text-[#98a0b0]">
          刚才那部手机里的每一样东西都来自公开报道：被广告盖住的相机和拨号键、
          伪装成"女儿来电"的广告、右上角那个小得点不到的关闭键。 区别只在于——现实里它不会在 55
          秒后停下来。
        </p>
      </header>

      <!-- 你刚才的经历 -->
      <section
        class="truth__run grid grid-cols-2 min-[520px]:grid-cols-4 gap-px mt-8 mb-2 rounded-[14px] overflow-hidden bg-white/[0.08] shadow-md"
        aria-label="你刚才的经历"
      >
        <div
          class="truth__run-item flex flex-col gap-[5px] p-4 sm:p-[18px] bg-[#11151d] border-t-2 border-emerald-500/60"
        >
          <span class="text-[11.5px] text-[#5d6675]">坚持了</span>
          <b class="font-mono text-[20px] font-bold text-white">{{ elapsedSeconds }}s</b>
        </div>
        <div
          class="truth__run-item flex flex-col gap-[5px] p-4 sm:p-[18px] bg-[#11151d] border-t-2 border-sky-500/60"
        >
          <span class="text-[11.5px] text-[#5d6675]">关掉了</span>
          <b class="font-mono text-[20px] font-bold text-white">{{ closedCount }} 个</b>
        </div>
        <div
          class="truth__run-item flex flex-col gap-[5px] p-4 sm:p-[18px] bg-[#11151d] border-t-2 border-rose-500/60"
        >
          <span class="text-[11.5px] text-[#5d6675]">又来了</span>
          <b class="font-mono text-[20px] font-bold text-[#ff8f7f] is-bad">{{ spawnedCount }} 个</b>
        </div>
        <div
          class="truth__run-item flex flex-col gap-[5px] p-4 sm:p-[18px] bg-[#11151d] border-t-2 border-amber-500/60"
        >
          <span class="text-[11.5px] text-[#5d6675]">误触</span>
          <b class="font-mono text-[20px] font-bold text-[#ff8f7f] is-bad"
            >{{ misclickCount }} 次</b
          >
        </div>
      </section>

      <!-- 1. 变现链条 -->
      <section class="truth__section mt-14">
        <h2
          class="flex items-baseline gap-2.5 mb-[22px] text-[19px] font-bold tracking-tight text-white"
        >
          <span class="truth__no font-mono text-xs font-bold text-[#ff4d3d]">01</span
          >弹窗为什么这么多
        </h2>
        <MoneyChainChart />
      </section>

      <!-- 2. 违法成本 -->
      <section class="truth__section mt-14">
        <h2
          class="flex items-baseline gap-2.5 mb-[22px] text-[19px] font-bold tracking-tight text-white"
        >
          <span class="truth__no font-mono text-xs font-bold text-[#ff4d3d]">02</span>为什么屡禁不止
        </h2>
        <PenaltyCompare />
      </section>

      <!-- 3. 监管困境 -->
      <section class="truth__section mt-14">
        <h2
          class="flex items-baseline gap-2.5 mb-[22px] text-[19px] font-bold tracking-tight text-white"
        >
          <span class="truth__no font-mono text-xs font-bold text-[#ff4d3d]">03</span
          >为什么取证这么难
        </h2>
        <ul class="truth__list m-0 pl-5 text-[13.5px] leading-[2] text-[#98a0b0] list-disc">
          <li v-for="item in oversight" :key="item">{{ item }}</li>
        </ul>
      </section>

      <!-- 4. 法规依据 -->
      <section class="truth__section mt-14">
        <h2
          class="flex items-baseline gap-2.5 mb-[22px] text-[19px] font-bold tracking-tight text-white"
        >
          <span class="truth__no font-mono text-xs font-bold text-[#ff4d3d]">04</span
          >规矩其实早就有了
        </h2>
        <ul class="truth__list m-0 pl-5 text-[13.5px] leading-[2] text-[#98a0b0] list-disc">
          <li>
            《广告法》《互联网广告管理办法》要求弹窗广告显著标明关闭标志，
            <b class="text-[#e8eaef] font-semibold">确保一键关闭</b>。
          </li>
          <li>
            工信部 2021 年发布的适老化规范明确禁止适老模式出现广告弹窗，
            并对关闭按钮的位置、大小作出限制。
          </li>
          <li>2026 年 6 月，工信部发文指导规范 App 信息窗口跳转行为。</li>
        </ul>
      </section>

      <!-- 5. 可以做的事 -->
      <section class="truth__section mt-14">
        <h2
          class="flex items-baseline gap-2.5 mb-[22px] text-[19px] font-bold tracking-tight text-white"
        >
          <span class="truth__no font-mono text-xs font-bold text-[#ff4d3d]">05</span>可以做的事
        </h2>
        <AdviceList />
      </section>

      <footer class="truth__foot mt-16 pt-[26px] border-t border-white/10">
        <p class="truth__source m-0 text-xs leading-[1.9] text-[#5d6675]">
          数据与事实来源：央视新闻《起底手机弹窗广告乱象："快应用"被滥用，违法成本远低于收益》，
          <a
            :href="SOURCE_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#7fd4ff] underline underline-offset-2"
            >IT之家转载全文</a
          >。 本页未使用任何真实企业名称、商标或 Logo，所有广告品牌均为虚构。
        </p>

        <div class="truth__actions mt-[26px]">
          <button
            type="button"
            class="truth__again inline-flex items-center justify-center min-h-[52px] px-8 rounded-full bg-gradient-to-r from-white/[0.12] to-white/[0.08] hover:from-white/[0.18] hover:to-white/[0.12] border border-white/20 text-[#e8eaef] text-sm font-semibold cursor-pointer active:scale-95 transition-all shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)]"
            @click="storm.restart()"
          >
            再被淹一次（换个弹窗序列）
          </button>
        </div>
      </footer>
    </article>
  </div>
</template>
