<script setup lang="ts">
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()

const threads = [
  {
    from: '10698888 · 速银花',
    preview:
      '【授信通知】恭喜！您的 200,000 元备用金已审批完成，点击领取立即提现，日息低至 0.02%！',
    time: '刚刚',
    unread: true,
    flagged: true,
    isAd: true,
    adTarget: 'loan-fast',
  },
  {
    from: '10689999 · 京选速达',
    preview: '【百亿补贴】您关注的旗舰数码降至 199 元！专柜正品次日送达，退订回T',
    time: '3分钟前',
    unread: true,
    flagged: true,
    isAd: true,
    adTarget: 'shop-speed',
  },
  {
    from: '中国联通',
    preview: '【余额提醒】您的可用话费余额为 86.50 元，本月流量剩余 24.8 GB。',
    time: '10分钟前',
    unread: true,
    flagged: false,
    isAd: false,
  },
  {
    from: '菜鸟驿站',
    preview: '【取件通知】您的包裹已到达南门菜鸟驿站，凭提货码 5-2-4018 尽快取件。',
    time: '11:20',
    unread: true,
    flagged: false,
    isAd: false,
  },
  {
    from: '女儿',
    preview: '妈，今晚想喝排骨汤，我大概六点半到家~',
    time: '09:45',
    unread: false,
    flagged: false,
    isAd: false,
  },
  {
    from: '招商银行',
    preview: '【动账通知】您尾号 8812 的账户完成微信快捷支付人民币 38.00 元。',
    time: '昨天',
    unread: false,
    flagged: false,
    isAd: false,
  },
]
</script>

<template>
  <div>
    <!-- 顶部搜索栏 -->
    <div
      class="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-white/[0.08] text-[11.5px] text-[rgba(242,244,248,0.5)] mb-2"
    >
      <span>🔍 搜索短信或联系人…</span>
    </div>

    <ul class="list-none m-0 p-0">
      <li
        v-for="thread in threads"
        :key="thread.from"
        class="flex gap-3 px-0.5 py-[13px] border-b border-white/[0.07] cursor-pointer"
        :class="{
          '-mx-2.5 px-2.5 rounded-[13px] bg-[rgba(226,59,46,0.12)] border border-[rgba(226,59,46,0.3)] shadow-xs':
            storm.adsEnabled && thread.flagged,
        }"
        @click="thread.isAd ? storm.tapAdBody(thread.adTarget) : null"
      >
        <div class="relative flex-none">
          <span
            class="grid place-items-center w-10 h-10 rounded-full text-white text-[14.5px] font-semibold"
            :class="
              thread.isAd
                ? 'bg-gradient-to-br from-red-600 to-amber-600'
                : 'bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8]'
            "
            aria-hidden="true"
            >{{ thread.isAd ? '💰' : thread.from.slice(0, 1) }}</span
          >
          <span
            v-if="thread.unread"
            class="absolute -top-px -right-px w-[9px] h-[9px] rounded-full bg-red-500 border-2 border-black"
            aria-hidden="true"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline justify-between gap-2">
            <div class="flex items-center gap-1.5 truncate">
              <strong class="text-[13px] font-semibold text-white truncate">{{
                thread.from
              }}</strong>
              <span
                v-if="thread.isAd"
                class="px-1 py-px rounded bg-red-500/30 text-red-300 text-[9px] font-bold border border-red-400/40 shrink-0"
                >营销推广</span
              >
            </div>
            <small class="text-[10.5px] text-[rgba(242,244,248,0.42)] shrink-0">{{
              thread.time
            }}</small>
          </div>
          <p class="mt-[3px] text-[12px] leading-[1.55] text-[rgba(242,244,248,0.68)]">
            {{ thread.preview }}
          </p>
          <div
            v-if="storm.adsEnabled && thread.flagged"
            class="mt-1.5 flex items-center justify-between text-[11px] leading-[1.6] text-amber-300"
          >
            <span>👉 点击进入提现认证（将唤起网页）</span>
            <span class="text-[10px] text-white/40">回复 TD 退订</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
