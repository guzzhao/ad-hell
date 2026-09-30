import { onBeforeUnmount, onMounted } from 'vue'
import { useStormStore } from '@/stores/storm'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * 把系统的"减少动态效果"偏好同步到 store。
 *
 * 这个页面是**故意**让人不适的，因此必须尊重用户明确的减动效诉求：
 * 屏幕抖动与大幅位移会关掉，弹窗生成节奏也会放慢（见 DeviceShell 与 storm 引擎）。
 */
export function useReducedMotion(): void {
  const storm = useStormStore()
  let query: MediaQueryList | null = null

  function update(): void {
    storm.setReducedMotion(query?.matches ?? false)
  }

  onMounted(() => {
    query = window.matchMedia(QUERY)
    update()
    query.addEventListener('change', update)
  })

  onBeforeUnmount(() => {
    query?.removeEventListener('change', update)
  })
}
