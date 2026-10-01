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
  <p
    class="clean-badge flex items-center gap-2 mt-[18px] px-[13px] py-[11px] border border-dashed border-green-400/40 rounded-xl bg-green-400/10 text-xs leading-relaxed text-[#b9f5cd]"
  >
    <span
      class="clean-badge__dot shrink-0 w-[7px] h-[7px] rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.18)]"
      aria-hidden="true"
    />
    {{ text }}
  </p>
</template>
