<script setup lang="ts">
import { computed } from 'vue'
import type { AdCreative } from '@/types/ad'

const props = defineProps<{ creative: AdCreative }>()

const isLoan = computed(() => props.creative.category === '网贷')
const isGame = computed(() => props.creative.category === '传奇游戏')
const isHealth = computed(() => props.creative.category === '老人健康')
const isInsurance = computed(() => props.creative.category === '保险')
</script>

<template>
  <div
    class="ad-inter relative flex flex-col h-full rounded-[14px] bg-white text-slate-800 shadow-[0_10px_24px_-6px_rgba(0,0,0,0.35)] overflow-hidden"
    :class="`ad-inter--${creative.category}`"
  >
    <!-- 1. 金融/网贷：克制专业的消费信贷卡片 -->
    <template v-if="isLoan">
      <div
        class="inter-loan flex flex-col justify-between h-full px-4 pt-3.5 pb-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white"
      >
        <div class="inter-loan__header flex justify-between items-center">
          <div class="inter-loan__brand-box flex items-center gap-1.5">
            <span class="inter-loan__logo-dot w-[7px] h-[7px] rounded-full bg-sky-400" />
            <span class="inter-loan__bank text-[11.5px] font-medium text-slate-300"
              >{{ creative.brand }}消费金融</span
            >
          </div>
          <span
            v-if="creative.badge"
            class="inter-loan__tag text-[9.5px] px-1.5 py-px rounded bg-sky-400/15 text-sky-400"
            >{{ creative.badge }}</span
          >
        </div>

        <div class="inter-loan__body my-1.5">
          <span class="inter-loan__label text-[10px] text-slate-400">预估可用额度 (元)</span>
          <strong
            class="inter-loan__amount block font-mono text-[28px] font-bold text-white tracking-tight my-0.5"
            >¥200,000</strong
          >
          <p class="inter-loan__sub m-0 text-[11px] text-slate-400">{{ creative.subline }}</p>
        </div>

        <div
          class="inter-loan__footer flex items-center justify-between gap-2 pt-1.5 border-t border-white/10"
        >
          <span class="inter-loan__tip text-[9px] text-slate-500"
            >资金由持牌金融机构提供 · 贷款需谨慎</span
          >
          <button
            type="button"
            class="inter-btn inter-btn--primary px-4 py-2 rounded-full text-[12.5px] font-semibold bg-blue-600 text-white border-none cursor-pointer shadow-[0_2px_8px_-1px_rgba(0,0,0,0.15)] whitespace-nowrap"
            tabindex="-1"
          >
            {{ creative.cta }} ›
          </button>
        </div>
      </div>
    </template>

    <!-- 2. 手游：经典复古新服海报，克制有品质 -->
    <template v-else-if="isGame">
      <div
        class="inter-game flex flex-col justify-between h-full px-4 pt-3.5 pb-2.5 bg-gradient-to-br from-indigo-950 to-slate-900 text-white"
      >
        <div class="inter-game__header flex justify-between items-center">
          <span class="inter-game__brand text-[11.5px] font-semibold text-indigo-200">{{
            creative.brand
          }}</span>
          <span
            v-if="creative.badge"
            class="inter-game__badge text-[9px] px-1.5 py-px rounded bg-indigo-500 text-white"
            >{{ creative.badge }}</span
          >
        </div>

        <div class="inter-game__body flex items-center gap-3 my-1">
          <div
            class="inter-game__emblem grid place-items-center w-[42px] h-[42px] rounded-[10px] bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shrink-0"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="inter-game__svg w-6 h-6"
            >
              <path d="M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z" />
              <path d="M12 6v12M8 10h8" />
            </svg>
          </div>
          <div class="inter-game__text">
            <strong class="inter-game__title text-[14.5px] font-bold text-white">{{
              creative.headline
            }}</strong>
            <p class="inter-game__sub m-0 mt-[3px] text-[11px] text-slate-400">
              {{ creative.subline }}
            </p>
          </div>
        </div>

        <div
          class="inter-game__footer flex items-center justify-between pt-1.5 border-t border-white/10"
        >
          <span class="inter-game__tags text-[9.5px] text-indigo-400"
            >正版授权 · 自由交易 · 散人进驻</span
          >
          <button
            type="button"
            class="inter-btn inter-btn--game px-4 py-2 rounded-full text-[12.5px] font-semibold bg-indigo-700 text-white border-none cursor-pointer shadow-[0_2px_8px_-1px_rgba(0,0,0,0.15)] whitespace-nowrap"
            tabindex="-1"
          >
            {{ creative.cta }} ›
          </button>
        </div>
      </div>
    </template>

    <!-- 3. 健康生活：温和清新的医疗健康卡片 -->
    <template v-else-if="isHealth">
      <div
        class="inter-health flex flex-col justify-between h-full px-4 pt-3.5 pb-2.5 bg-emerald-50 text-emerald-950 border border-emerald-200"
      >
        <div class="inter-health__header flex justify-between items-center">
          <span class="inter-health__brand text-[11.5px] font-semibold text-emerald-700"
            >{{ creative.brand }}健康服务</span
          >
          <span
            v-if="creative.badge"
            class="inter-health__badge text-[9px] px-1.5 py-px rounded bg-emerald-500 text-white"
            >{{ creative.badge }}</span
          >
        </div>

        <div class="inter-health__body flex items-center gap-3 my-1">
          <div
            class="inter-health__icon grid place-items-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 shrink-0"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="inter-health__svg w-5 h-5"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <div class="inter-health__text">
            <strong class="inter-health__title text-sm font-bold text-emerald-950">{{
              creative.headline
            }}</strong>
            <p class="inter-health__sub m-0 mt-0.5 text-[11px] text-emerald-600">
              {{ creative.subline }}
            </p>
          </div>
        </div>

        <div
          class="inter-health__footer flex items-center justify-between pt-1.5 border-t border-emerald-200"
        >
          <span class="inter-health__tip text-[9.5px] text-emerald-700"
            >关爱银发健康 · 医用标准语音提示</span
          >
          <button
            type="button"
            class="inter-btn inter-btn--health px-4 py-2 rounded-full text-[12.5px] font-semibold bg-emerald-600 text-white border-none cursor-pointer shadow-[0_2px_8px_-1px_rgba(0,0,0,0.15)] whitespace-nowrap"
            tabindex="-1"
          >
            {{ creative.cta }} ›
          </button>
        </div>
      </div>
    </template>

    <!-- 4. 保险服务：稳重可信的医疗保障卡片 -->
    <template v-else-if="isInsurance">
      <div
        class="inter-ins flex flex-col justify-between h-full px-4 pt-3.5 pb-2.5 bg-sky-50 text-sky-950 border border-sky-200"
      >
        <div class="inter-ins__header flex justify-between items-center">
          <span class="inter-ins__brand text-[11.5px] font-semibold text-sky-600"
            >{{ creative.brand }}百万守护</span
          >
          <span
            v-if="creative.badge"
            class="inter-ins__badge text-[9px] px-1.5 py-px rounded bg-sky-500 text-white"
            >{{ creative.badge }}</span
          >
        </div>

        <div class="inter-ins__body my-1">
          <strong class="inter-ins__title text-[14.5px] font-bold text-sky-950">{{
            creative.headline
          }}</strong>
          <p class="inter-ins__sub m-0 mt-0.5 mb-1 text-[11px] text-sky-700">
            {{ creative.subline }}
          </p>
          <div class="inter-ins__features flex gap-3 text-[10px] text-sky-600">
            <span>✓ 包含特定进口药品</span>
            <span>✓ 在线快审极速服务</span>
          </div>
        </div>

        <div
          class="inter-ins__footer flex items-center justify-between pt-1.5 border-t border-sky-200"
        >
          <span class="inter-ins__tip text-[9.5px] text-sky-700">由经批准的专业保险机构承保</span>
          <button
            type="button"
            class="inter-btn inter-btn--ins px-4 py-2 rounded-full text-[12.5px] font-semibold bg-sky-600 text-white border-none cursor-pointer shadow-[0_2px_8px_-1px_rgba(0,0,0,0.15)] whitespace-nowrap"
            tabindex="-1"
          >
            {{ creative.cta }} ›
          </button>
        </div>
      </div>
    </template>

    <!-- 通用卡片 -->
    <template v-else>
      <div class="inter-default flex flex-col justify-between h-full px-4 pt-3.5 pb-2.5">
        <div class="inter-default__header flex justify-between items-center">
          <span class="inter-default__brand text-[11.5px] font-semibold text-slate-500">{{
            creative.brand
          }}</span>
          <span
            v-if="creative.badge"
            class="inter-default__badge text-[9px] px-1.5 py-px rounded bg-slate-200 text-slate-600"
            >{{ creative.badge }}</span
          >
        </div>
        <strong class="inter-default__title text-sm font-bold text-slate-800">{{
          creative.headline
        }}</strong>
        <p class="inter-default__sub m-0 my-0.5 text-[11px] text-slate-500">
          {{ creative.subline }}
        </p>
        <button
          type="button"
          class="inter-btn inter-btn--primary px-4 py-2 rounded-full text-[12.5px] font-semibold bg-blue-600 text-white border-none cursor-pointer shadow-[0_2px_8px_-1px_rgba(0,0,0,0.15)] whitespace-nowrap"
          tabindex="-1"
        >
          {{ creative.cta }} ›
        </button>
      </div>
    </template>

    <!-- 规范的广告提示标 -->
    <span
      class="ad-tag absolute bottom-1.5 right-2 text-[8px] text-slate-400 border border-slate-300 rounded px-[3px] leading-tight pointer-events-none"
      aria-hidden="true"
      >广告</span
    >
  </div>
</template>
