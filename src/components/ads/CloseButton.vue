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

const variantClasses: Record<CloseVariant, string> = {
  honest: 'top-1.5 right-1.5 w-7 h-7 text-xs text-white bg-black/40',
  deceptive: 'top-1.5 right-1.5 w-7 h-7 text-xs text-white bg-black/40',
  tiny: 'top-1.5 right-1.5 w-5 h-5 text-[10px] text-white/70 bg-black/25',
  corner: 'top-1.5 left-1.5 w-[22px] h-[22px] text-[11px] text-black/60 bg-black/10',
  none: '',
}
</script>

<template>
  <button
    v-if="closable"
    type="button"
    class="absolute grid place-items-center p-0 leading-none rounded-full cursor-pointer z-10 before:content-[''] before:absolute before:-inset-2 before:rounded-full"
    :class="variantClasses[variant]"
    aria-label="关闭"
    @click.stop="emit('hit')"
  >
    <span aria-hidden="true">✕</span>
  </button>
</template>
