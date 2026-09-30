<script setup lang="ts">
/**
 * B 类 App 的"干净"标记。
 *
 * 现实里广告最凶的那几个 App，在这个演示里反而一个广告都没有——
 * 不写一句话点明，用户只会觉得"这里怎么空空的"，读不出反差。
 */
defineProps<{ text: string }>()
</script>

<template>
  <p class="clean-badge">
    <span class="clean-badge__dot" aria-hidden="true" />
    {{ text }}
  </p>
</template>

<style scoped>
.clean-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 18px 0 0;
  padding: 11px 13px;
  border: 1px dashed rgba(74, 222, 128, 0.42);
  border-radius: 12px;
  background: rgba(74, 222, 128, 0.07);
  font-size: 12px;
  line-height: 1.6;
  color: #b9f5cd;
}

.clean-badge__dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.18);
}
</style>
