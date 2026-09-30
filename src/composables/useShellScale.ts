import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import {
  DESKTOP_BREAKPOINT_PX,
  PHONE_H,
  PHONE_W,
  SHELL_MARGIN,
  SHELL_MIN_SCALE,
} from '@/constants'

/**
 * 计算桌面样机的等比缩放系数。
 *
 * 为什么必须用 JS 算：`transform: scale()` 需要一个**无单位数**，
 * 而 CSS `calc()` 无法把长度除以长度得到无单位数（`calc(100dvh / 844)` 的结果仍是长度）。
 * `zoom` 看似可行但兼容性与布局副作用都不可接受。
 *
 * 移动端形态下恒为 1 —— 那种形态下手机视口直接铺满，不需要缩放。
 */
export function useShellScale(target: Ref<HTMLElement | null>): Ref<number> {
  const scale = ref(1)
  let observer: ResizeObserver | null = null

  function measure(): void {
    const el = target.value
    if (!el) return

    if (window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT_PX - 1}px)`).matches) {
      scale.value = 1
      return
    }

    const availableW = el.clientWidth - SHELL_MARGIN * 2
    const availableH = el.clientHeight - SHELL_MARGIN * 2
    const fitted = Math.min(availableW / PHONE_W, availableH / PHONE_H)
    scale.value = Math.max(SHELL_MIN_SCALE, Math.min(1, fitted))
  }

  onMounted(() => {
    observer = new ResizeObserver(measure)
    if (target.value) observer.observe(target.value)
    measure()
    window.addEventListener('resize', measure)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    window.removeEventListener('resize', measure)
  })

  return scale
}
