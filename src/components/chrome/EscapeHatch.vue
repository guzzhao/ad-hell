<script setup lang="ts">
import { useStormStore } from '@/stores/storm'

/**
 * 常驻的逃生通道。
 *
 * 这个页面是**故意**让人烦躁的，所以爱好者必须随时能出去：
 * 一个把用户困住的"反广告"页面，本身就成了它要批判的那种东西。
 *
 * 它刻意做成"网页控件"的样子（深色胶囊 + 明确文字），而不是模仿手机 UI，
 * 以免和弹窗的关闭键混在一起 —— 那会变成另一种误导。
 */
const storm = useStormStore()
</script>

<template>
  <div
    class="escape fixed top-[calc(12px+env(safe-area-inset-top,0px))] right-[calc(12px+env(safe-area-inset-right,0px))] z-[1000] flex items-center gap-2"
  >
    <!-- 模式切换：场景探索 vs 自动风暴 -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full border text-[12px] font-medium backdrop-blur-md shadow-[0_6px_20px_-4px_rgba(0,0,0,0.6)] transition-all duration-200 active:scale-95 cursor-pointer"
      :class="
        storm.explorationMode === 'auto'
          ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 hover:bg-amber-500/30'
          : 'bg-[#0f141e]/75 border-white/15 text-[#eef1f6]/90 hover:bg-[#1a2232]'
      "
      :title="
        storm.explorationMode === 'auto'
          ? '当前：自动风暴模式（点击切换为手动探索）'
          : '当前：手动探索模式（点击开启自动风暴）'
      "
      @click="storm.setExplorationMode(storm.explorationMode === 'auto' ? 'manual' : 'auto')"
    >
      <span
        class="w-1.5 h-1.5 rounded-full shrink-0"
        :class="
          storm.explorationMode === 'auto'
            ? 'bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.8)]'
            : 'bg-emerald-400'
        "
        aria-hidden="true"
      />
      <span>{{ storm.explorationMode === 'auto' ? '自动风暴' : '场景探索' }}</span>
    </button>

    <button
      type="button"
      class="escape__btn inline-flex items-center gap-2 min-h-[36px] px-3.5 rounded-full bg-[#0f141e]/75 border border-white/15 text-[#eef1f6] text-[12px] font-medium backdrop-blur-md shadow-[0_6px_20px_-4px_rgba(0,0,0,0.6)] transition-all duration-200 ease-out hover:bg-[#1a2232] hover:border-white/30 hover:shadow-[0_0_16px_rgba(255,255,255,0.12)] active:scale-95 cursor-pointer"
      @click="storm.enterTruth()"
    >
      <span
        class="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)] shrink-0"
        aria-hidden="true"
      />
      <span class="escape__label font-medium">结束体验</span>
      <kbd
        class="escape__kbd px-[6px] py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[9.5px] tracking-wider opacity-75 shadow-inner"
        aria-hidden="true"
      >
        Esc
      </kbd>
    </button>
  </div>
</template>
