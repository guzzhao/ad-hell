import { watch } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useStormStore } from '@/stores/storm'

/**
 * 把系统的"减少动态效果"偏好同步到 store。
 *
 * 这个页面是**故意**让人不适的，因此必须尊重用户明确的减动效诉求：
 * 屏幕抖动与大幅位移会关掉（见 DeviceShell），弹窗生成节奏也已经放慢。
 *
 * 用 `usePreferredReducedMotion` 而不是手写 `matchMedia`：后者要自己管
 * `addEventListener` / `removeEventListener`，漏掉清理就会随热更新累积监听器。
 */
export function useReducedMotion(): void {
  const storm = useStormStore()

  // 注意这个返回的是 'reduce' | 'no-preference'，不是布尔值
  const preference = usePreferredReducedMotion()

  watch(preference, (value) => storm.setReducedMotion(value === 'reduce'), { immediate: true })
}
