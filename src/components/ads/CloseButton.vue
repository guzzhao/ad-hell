<script setup lang="ts">
import { computed } from 'vue'
import type { CloseVariant } from '@/types/ad'
import { isClosable } from '@/engine/close'

/**
 * 弹窗的关闭键。
 *
 * ⚠️ 这个组件**故意**违反可访问性规范：`tiny` 与 `corner` 的命中区只有 10~16px，
 * 远低于 44px 的建议值。这正是本页要表现的东西——报道里说关闭键"尺寸小于设计标准"、
 * 被放在不易点击的位置、或做成浅灰色小字。
 *
 * 因此页面必须自带一条**可达的逃生通道**（常驻「结束体验」+ Esc，见 EscapeHatch），
 * 否则这个演示本身就成了它要批判的对象。
 */
const props = defineProps<{ variant: CloseVariant }>()
const emit = defineEmits<{ hit: [] }>()

/** `none` 变体根本没有关闭键——这是报道里"无法关闭"那一类。 */
const closable = computed(() => isClosable(props.variant))
</script>

<template>
  <button
    v-if="closable"
    type="button"
    class="close-btn"
    :class="`close-btn--${variant}`"
    aria-label="关闭"
    @click.stop="emit('hit')"
  >
    <span aria-hidden="true">✕</span>
  </button>
</template>

<style scoped>
.close-btn {
  position: absolute;
  display: grid;
  place-items: center;
  padding: 0;
  line-height: 1;
  border-radius: 50%;
}

/* 正常关闭键：看得见、点得到 */
.close-btn--honest {
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.38);
}

/* 虚假关闭键：外观与正常关闭键完全一致 —— 用户无法凭视觉分辨，这正是陷阱所在 */
.close-btn--deceptive {
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.38);
}

/* 微型浅灰小字：命中区只有 14px */
.close-btn--tiny {
  top: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.42);
  background: transparent;
}

/* 放在左上角不易点击处，命中区 16px，颜色还很低对比 */
.close-btn--corner {
  top: 4px;
  left: 4px;
  width: 16px;
  height: 16px;
  font-size: 9px;
  color: rgba(0, 0, 0, 0.42);
  background: transparent;
}
</style>
