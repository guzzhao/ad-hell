<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'

/**
 * 音频相关的页面级控件。
 *
 * 与「结束体验」同属**页面控件层**（z-index 1000），因此永远盖在接管广告之上：
 * 这个页面是故意吵的，那就必须随手能把它按停——否则它本身就成了它要批判的东西。
 *
 * 它也刻意做成"网页控件"的样子，不模仿手机 UI，免得和广告的按钮混在一起。
 */
const storm = useStormStore()
const { muted, audioBlocked } = storeToRefs(storm)
</script>

<template>
  <div
    class="audio-controls fixed top-[calc(10px+env(safe-area-inset-top,0px))] left-[calc(10px+env(safe-area-inset-left,0px))] z-[1000]"
  >
    <button
      type="button"
      class="audio-controls__btn inline-flex items-center gap-[7px] min-h-[44px] px-[13px] rounded-full bg-[#0c0f14]/80 border border-white/15 text-[#eef1f6] text-[13px] font-medium backdrop-blur-[10px] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.9)] active:bg-[#1e242e]/90 cursor-pointer"
      :aria-pressed="muted"
      :aria-label="muted ? '取消静音' : '静音'"
      @click="storm.toggleMuted()"
    >
      <span class="audio-controls__icon text-[14px]" aria-hidden="true">{{
        muted ? '🔇' : '🔊'
      }}</span>
      <span class="audio-controls__label">{{ muted ? '已静音' : '声音开' }}</span>
      <span v-if="!muted" class="flex items-end gap-[2px] h-3 ml-0.5" aria-hidden="true">
        <span
          class="w-[2px] h-2 bg-emerald-400 rounded-full animate-[wave-bounce_0.8s_ease-in-out_infinite]"
        />
        <span
          class="w-[2px] h-3 bg-emerald-400 rounded-full animate-[wave-bounce_0.6s_ease-in-out_infinite_0.15s]"
        />
        <span
          class="w-[2px] h-1.5 bg-emerald-400 rounded-full animate-[wave-bounce_0.9s_ease-in-out_infinite_0.3s]"
        />
      </span>
    </button>

    <!--
      浏览器不允许在用户交互前出声。这时如实告诉用户需要点一下，
      而不是让来电广告静悄悄地出现、让人以为页面坏了。
      不需要专门点这个提示：页面上任意一次点击都会解锁音频。
    -->
    <p
      v-if="audioBlocked"
      class="audio-controls__hint max-w-[200px] mt-[7px] px-[10px] py-[5px] rounded-[9px] bg-[#0c0f14]/80 text-[#ffd54a] text-[11.5px] leading-relaxed"
    >
      点击页面任意处开启声音
    </p>
  </div>
</template>
