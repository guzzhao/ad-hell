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
    class="escape fixed top-[calc(12px+env(safe-area-inset-top,0px))] right-[calc(12px+env(safe-area-inset-right,0px))] z-[1000]"
  >
    <button
      type="button"
      class="escape__btn inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-full bg-[#0f141e]/45 border border-white/12 text-[#eef1f6]/80 text-[11.5px] font-medium backdrop-blur-md shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)] transition-all duration-200 ease-out hover:bg-[#19202e]/85 hover:text-white active:scale-95 cursor-pointer"
      @click="storm.enterTruth()"
    >
      <span class="escape__label">结束体验</span>
      <kbd
        class="escape__kbd px-[5px] py-px rounded bg-white/10 font-mono text-[9px] tracking-wider opacity-70"
        aria-hidden="true"
      >
        Esc
      </kbd>
    </button>
  </div>
</template>
