<script setup lang="ts">
/**
 * 可以做的事。
 * 每条都能在报道里找到出处，不额外发明说法。
 */
const advice = [
  {
    title: '求救时打不出去：连按侧边键 5 次',
    body: '如果需要拨打求救电话却被弹窗挡住，大部分手机可以快速连按侧边键 5 次，启动应急模式进行紧急呼叫。这是报道里专家给出的提醒。',
  },
  {
    title: '认出关闭陷阱的三种长相',
    body: '关闭键被放在左上或右上角不好点的位置；做成浅灰色小字、尺寸小于设计标准；或者干脆是假的——一点就跳转。还有一类弹窗根本没有关闭键。',
  },
  {
    title: '一键关闭是法定要求，不是恩赐',
    body: '《广告法》《互联网广告管理办法》要求弹窗广告显著标明关闭标志、确保一键关闭。做不到就是违规，可以留证并向应用商店与监管部门举报。',
  },
  {
    title: '适老模式里不该有弹窗',
    body: '工信部 2021 年的适老化规范明确禁止适老模式出现广告弹窗，并对关闭按钮的位置和大小作了限制。给家里老人开启适老模式后，值得再确认一遍这条是否被遵守。',
  },
]
</script>

<template>
  <ol class="advice list-none m-0 p-0">
    <li
      v-for="(item, index) in advice"
      :key="item.title"
      class="advice__item flex gap-3.5 py-[18px] border-t border-white/[0.08] first:border-t-0 first:pt-1"
    >
      <span
        class="advice__num shrink-0 grid place-items-center w-[26px] h-[26px] rounded-lg bg-[#ffd54a]/15 text-[#ffd54a] font-mono text-[13px] font-bold"
        aria-hidden="true"
      >
        {{ index + 1 }}
      </span>
      <div class="advice__body">
        <h4 class="m-0 text-[14.5px] font-semibold leading-snug text-white">{{ item.title }}</h4>
        <p class="m-0 mt-[7px] text-[13px] leading-relaxed text-[#98a0b0]">{{ item.body }}</p>
      </div>
    </li>
  </ol>
</template>
