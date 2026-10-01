<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'

/**
 * 真实落地页：模仿应用商店下载详情页。
 * 适度、克制且真实，具备清晰的应用信息、进度与返回入口。
 */
const storm = useStormStore()
const { landingOpen } = storeToRefs(storm)
</script>

<template>
  <Transition name="landing">
    <div
      v-if="landingOpen"
      class="landing absolute inset-0 z-[900] flex flex-col bg-slate-50 text-slate-900"
      role="dialog"
      aria-modal="true"
      aria-label="应用详情"
    >
      <!-- 顶部系统导航栏：避让顶部刘海/状态栏，提供明确的返回和关闭通道 -->
      <header
        class="landing__nav flex items-center justify-between pt-[42px] px-4 pb-3 bg-white border-b border-slate-200"
      >
        <button
          type="button"
          class="landing__back inline-flex items-center gap-0.5 text-[14.5px] font-semibold text-blue-600 px-2 py-1.5 rounded-lg active:bg-blue-50 cursor-pointer"
          aria-label="返回"
          @click="storm.closeLanding()"
        >
          <span class="landing__back-arrow text-xl leading-none" aria-hidden="true">‹</span> 返回
        </button>
        <span class="landing__nav-title text-[13.5px] font-semibold text-slate-700">应用详情</span>
        <button
          type="button"
          class="landing__close-btn grid place-items-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[13px] font-semibold active:bg-slate-200 cursor-pointer border-none"
          aria-label="关闭详情"
          @click="storm.closeLanding()"
        >
          ✕
        </button>
      </header>

      <div class="landing__page flex-1 min-h-0 overflow-y-auto px-[18px] pt-5 pb-6">
        <!-- 应用基本信息 -->
        <div class="landing__app-header flex gap-4 items-center">
          <div
            class="landing__app-icon grid place-items-center w-[68px] h-[68px] rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_4px_14px_-3px_rgba(234,88,12,0.35)]"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="landing__icon-svg w-8 h-8"
            >
              <path d="M6 3 3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-4Z" />
              <path d="M3 7h18M16 11a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div class="landing__app-info flex flex-col gap-0.5">
            <h2 class="landing__app-name m-0 text-[16.5px] font-bold text-slate-900">拼一拼优选</h2>
            <p class="landing__app-sub m-0 text-[11.5px] text-slate-500">
              品质生活 · 特惠商城 · 48.6 MB
            </p>
            <div class="landing__rating flex items-center gap-1.5 mt-0.5 text-[11px]">
              <span class="landing__stars text-amber-500 tracking-tighter">★★★★★</span>
              <span class="landing__score font-semibold text-amber-600">4.8 分</span>
              <span class="landing__dl-count text-slate-400">5600 万次安装</span>
            </div>
          </div>
        </div>

        <!-- 下载与安装进度条 -->
        <div class="landing__progress-card mt-5 p-4 rounded-xl bg-white border border-slate-200">
          <div
            class="landing__progress-top flex justify-between text-xs font-semibold text-slate-800"
          >
            <span class="landing__progress-status">正在下载安装包…</span>
            <span class="landing__progress-percent text-blue-600">76%</span>
          </div>
          <div class="landing__progress-bar mt-2 h-[5px] rounded-full bg-slate-100 overflow-hidden">
            <div class="landing__progress-fill h-full w-[76%] rounded-full bg-blue-600" />
          </div>
          <p class="landing__progress-speed mt-1.5 text-[10.5px] text-slate-500">
            12.4 MB/s · 已通过安全扫描
          </p>
        </div>

        <!-- 真实截图画廊预览 -->
        <div class="landing__gallery grid grid-cols-3 gap-2 mt-5" aria-hidden="true">
          <div
            class="landing__shot landing__shot--1 flex flex-col items-center justify-center gap-[3px] h-24 rounded-[10px] p-2 text-center text-white bg-gradient-to-br from-blue-500 to-blue-700"
          >
            <span class="landing__shot-title text-[11.5px] font-semibold">每日特惠</span>
            <span class="landing__shot-sub text-[9.5px] opacity-85">精选大牌折扣</span>
          </div>
          <div
            class="landing__shot landing__shot--2 flex flex-col items-center justify-center gap-[3px] h-24 rounded-[10px] p-2 text-center text-white bg-gradient-to-br from-emerald-500 to-emerald-700"
          >
            <span class="landing__shot-title text-[11.5px] font-semibold">品质保障</span>
            <span class="landing__shot-sub text-[9.5px] opacity-85">正品溯源验真</span>
          </div>
          <div
            class="landing__shot landing__shot--3 flex flex-col items-center justify-center gap-[3px] h-24 rounded-[10px] p-2 text-center text-white bg-gradient-to-br from-indigo-500 to-indigo-700"
          >
            <span class="landing__shot-title text-[11.5px] font-semibold">极速物流</span>
            <span class="landing__shot-sub text-[9.5px] opacity-85">售后无忧保障</span>
          </div>
        </div>
      </div>

      <!-- 底部操作悬浮栏：提供明确的关闭和返回入口 -->
      <footer
        class="landing__footer flex flex-col items-center px-[18px] pt-3.5 pb-[calc(14px+env(safe-area-inset-bottom,0px))] bg-white border-t border-slate-200"
      >
        <button
          type="button"
          class="landing__cancel-btn flex items-center justify-center w-full h-11 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-300 cursor-pointer transition-all active:bg-slate-200 active:scale-[0.98]"
          @click="storm.closeLanding()"
        >
          ✕ 取消下载并返回
        </button>
      </footer>
    </div>
  </Transition>
</template>

<style scoped>
.landing-enter-active,
.landing-leave-active {
  transition:
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.28s ease;
}

.landing-enter-from,
.landing-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
