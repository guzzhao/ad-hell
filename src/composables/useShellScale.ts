import { computed, type Ref } from 'vue'
import { useElementSize, useMediaQuery } from '@vueuse/core'
import { DESKTOP_BREAKPOINT_PX, PHONE_H, PHONE_W, SHELL_MARGIN, SHELL_MIN_SCALE } from '@/constants'

/**
 * 计算桌面样机的等比缩放系数。
 *
 * 为什么必须用 JS 算：`transform: scale()` 需要一个**无单位数**，
 * 而 CSS `calc()` 无法把长度除以长度得到无单位数（`calc(100dvh / 844)` 的结果仍是长度）。
 * `zoom` 看似可行但兼容性与布局副作用都不可接受。
 *
 * 移动端形态下恒为 1 —— 那种形态下手机视口直接铺满，不需要缩放。
 *
 * @param target 用于测量的容器（`.device-shell__stage`，铺满视口）
 */
export function useShellScale(target: Ref<HTMLElement | null>): Ref<number> {
  // 与 styles/phone.css 的媒体查询同一个断点，都由 DESKTOP_BREAKPOINT_PX 决定
  const isMobileLayout = useMediaQuery(`(max-width: ${DESKTOP_BREAKPOINT_PX - 1}px)`)
  const { width, height } = useElementSize(target)

  return computed(() => {
    if (isMobileLayout.value) return 1

    // ResizeObserver 的首次尺寸要等布局之后才送达，在那之前 width/height 是 0。
    // 若直接代入公式会得到 SHELL_MIN_SCALE（0.4），桌面端首帧会出现一次明显的缩小闪烁。
    // 这里退回 1，与"还没量到就用默认值"的旧实现一致。
    if (width.value === 0 || height.value === 0) return 1

    const availableW = width.value - SHELL_MARGIN * 2
    const availableH = height.value - SHELL_MARGIN * 2
    const fitted = Math.min(availableW / PHONE_W, availableH / PHONE_H)
    return Math.max(SHELL_MIN_SCALE, Math.min(1, fitted))
  })
}
