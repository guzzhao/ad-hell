<script setup lang="ts">
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()

const threads = [
  {
    from: '中国联通',
    preview: '【余额提醒】您的可用话费余额为 86.50 元，本月流量剩余 24.8 GB。',
    time: '刚刚',
    unread: true,
    flagged: false,
  },
  {
    from: '菜鸟驿站',
    preview: '【取件通知】您的包裹已到达南门菜鸟驿站，凭提货码 5-2-4018 尽快取件。',
    time: '11:20',
    unread: true,
    flagged: false,
  },
  {
    from: '女儿',
    preview: '妈，今晚想喝排骨汤，我大概六点半到家~',
    time: '09:45',
    unread: false,
    flagged: false,
  },
  {
    from: '招商银行',
    preview: '【动账通知】您尾号 8812 的账户完成微信快捷支付人民币 38.00 元。',
    time: '昨天',
    unread: false,
    flagged: false,
  },
  {
    from: '接警中心',
    preview: '【现场取证】请点击链接验证并上传相关说明材料。',
    time: '前天',
    unread: false,
    flagged: true,
  },
]
</script>

<template>
  <div class="msg">
    <!-- 顶部搜索栏 -->
    <div
      class="msg__search flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-white/[0.08] text-[11.5px] text-[rgba(242,244,248,0.5)] mb-2"
    >
      <span>🔍 搜索短信或联系人…</span>
    </div>

    <ul class="msg__list list-none m-0 p-0">
      <li
        v-for="thread in threads"
        :key="thread.from"
        class="msg__item flex gap-3 px-0.5 py-[13px] border-b border-white/[0.07]"
        :class="{
          'is-flagged -mx-2.5 px-2.5 rounded-[13px] bg-[rgba(226,59,46,0.1)] !border-b-transparent':
            storm.adsEnabled && thread.flagged,
        }"
      >
        <div class="msg__avatar-box relative flex-none">
          <span
            class="msg__avatar grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-white text-[14.5px] font-semibold"
            aria-hidden="true"
            >{{ thread.from.slice(0, 1) }}</span
          >
          <span
            v-if="thread.unread"
            class="msg__unread-dot absolute -top-px -right-px w-[9px] h-[9px] rounded-full bg-[#3b82f6] border-2 border-black"
            aria-hidden="true"
          />
        </div>
        <div class="msg__body min-w-0 flex-1">
          <div class="msg__head flex items-baseline justify-between gap-2">
            <strong class="msg__from text-[13px] font-semibold text-white">{{
              thread.from
            }}</strong>
            <small class="msg__time text-[10.5px] text-[rgba(242,244,248,0.42)]">{{
              thread.time
            }}</small>
          </div>
          <p class="msg__preview mt-[3px] text-[12px] leading-[1.55] text-[rgba(242,244,248,0.68)]">
            {{ thread.preview }}
          </p>
          <p
            v-if="storm.adsEnabled && thread.flagged"
            class="msg__flag mt-1.5 text-[11px] leading-[1.6] text-[#ff9c8f]"
          >
            点开这个链接，先弹出来的是浏览器的开屏广告。
          </p>
        </div>
      </li>
    </ul>

    <p
      v-if="storm.adsEnabled"
      class="msg__caption mt-4 text-[11.5px] leading-[1.7] text-[rgba(242,244,248,0.5)]"
    >
      信息广告位（已保留，待启用）
    </p>
  </div>
</template>
