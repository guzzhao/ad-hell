<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'

/**
 * 摇一摇提示。
 *
 * 只在**屏上确实存在响应摇一摇的广告**时才出现——这既是数据驱动，
 * 也如实反映了"摇一摇是素材的能力"这件事：没有那种广告时，晃手机不该有任何反应。
 *
 * 它同时承担三件事：
 *   1. 告诉用户这条广告在等着你晃手机（真机上本来就该靠晃动，不该有人告诉你）
 *   2. 在没有传感器的桌面样机上，给出一个等价的入口
 *   3. 在 iOS 上提供传感器授权按钮 —— 而"这条广告要读你的传感器"本身
 *      就是现实里这套滥用最该被看见的一环
 *
 * 属于**页面控件层**（z-index 1000），永远盖在广告之上，不会被弹出层遮住。
 */
defineProps<{ needsPermission: boolean }>()
const emit = defineEmits<{ request: []; simulate: [] }>()

const storm = useStormStore()
const { shakeArmed } = storeToRefs(storm)
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="shakeArmed"
      class="fixed left-1/2 -translate-x-1/2 bottom-[calc(14px+env(safe-area-inset-bottom,0px))] flex flex-col items-center gap-1.5 z-[1000]"
    >
      <!--
        授权按钮必须在用户手势里被点击，iOS 才会真的弹窗；
        这正是为什么它不能自动请求 —— 而现实中的摇一摇广告也是这么做的。
      -->
      <button
        v-if="needsPermission"
        type="button"
        class="inline-flex items-center gap-3 min-h-[48px] px-5 rounded-full bg-[#121620]/90 border border-white/20 text-white backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(0,0,0,0.8)] active:scale-95 active:bg-[#1e2637]/95 transition-all cursor-pointer"
        @click="emit('request')"
      >
        <span class="text-base" aria-hidden="true">🔒</span>
        允许访问运动与方向以激活互动
      </button>

      <button
        v-else
        type="button"
        class="inline-flex items-center gap-3 min-h-[50px] pl-4 pr-5 rounded-full bg-[#121620]/95 border border-amber-400/40 text-white backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(0,0,0,0.9),0_0_24px_rgba(251,191,36,0.15)] active:scale-95 active:bg-[#1e2637]/95 transition-all cursor-pointer hover:border-amber-400/70"
        @click="emit('simulate')"
      >
        <span class="grid place-items-center w-7 h-7" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="animate-[phone-shake-tilt_1.4s_ease-in-out_infinite] origin-bottom w-[22px] h-[22px]"
          >
            <rect x="5" y="2" width="14" height="20" rx="3" />
            <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5" />
          </svg>
        </span>
        <div class="flex flex-col items-start text-left">
          <span class="text-[13px] font-bold tracking-wide text-[#ffd54a]">晃动手机 跳转详情</span>
          <span class="text-[10px] text-[#f2f4f8]/70">检测到晃动即可自动进入 · 或点击此栏</span>
        </div>
      </button>
    </div>
  </Transition>
</template>
