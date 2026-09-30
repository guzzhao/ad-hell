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
  <ol class="advice">
    <li v-for="(item, index) in advice" :key="item.title" class="advice__item">
      <span class="advice__num" aria-hidden="true">{{ index + 1 }}</span>
      <div class="advice__body">
        <h4>{{ item.title }}</h4>
        <p>{{ item.body }}</p>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.advice {
  list-style: none;
  margin: 0;
  padding: 0;
}

.advice__item {
  display: flex;
  gap: 14px;
  padding: 18px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.advice__item:first-child {
  border-top: none;
  padding-top: 4px;
}

.advice__num {
  flex: none;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(255, 213, 74, 0.14);
  color: #ffd54a;
  font-family: var(--font-num);
  font-size: 13px;
  font-weight: 700;
}

.advice__body h4 {
  margin: 0;
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.5;
}

.advice__body p {
  margin: 7px 0 0;
  font-size: 13px;
  line-height: 1.85;
  color: var(--ink-dim);
}
</style>
