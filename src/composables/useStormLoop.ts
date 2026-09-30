import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useStormStore } from '@/stores/storm'

/**
 * 单帧最多推进多少毫秒。
 * 标签页被切到后台时 rAF 会暂停，切回来那一帧的 delta 可能是几十秒；
 * 不夹紧的话风暴会瞬间跳到终局，观感与统计都失真。
 */
const MAX_FRAME_MS = 100

/**
 * 风暴主循环。
 *
 * 只负责**推进状态**，不做逐帧渲染：生成与关闭都是离散事件，
 * 交给 Pinia + Vue 响应式渲染。循环在离开 `storm` 阶段时自动停下，避免后台空转。
 */
export function useStormLoop(): void {
  const storm = useStormStore()

  let raf = 0
  let last = 0

  function stop(): void {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    last = 0
  }

  function frame(timestamp: number): void {
    if (!last) last = timestamp
    const dt = Math.min(MAX_FRAME_MS, Math.max(0, timestamp - last))
    last = timestamp

    storm.advance(dt)

    if (storm.phase === 'storm') {
      raf = requestAnimationFrame(frame)
    } else {
      stop()
    }
  }

  function start(): void {
    stop()
    raf = requestAnimationFrame(frame)
  }

  onMounted(() => {
    // 先把循环点着，再让风暴开始。
    // 顺序不能反：storm.start() 会把 phase 改成 storm，watch 随之触发；
    // 此时若 raf 还是 0，watch 会再点一次，造成一帧被安排两次。
    start()
    storm.start()
  })

  onBeforeUnmount(stop)

  // 「重新体验」会把 phase 拉回 storm，此时循环已经停了，需要重新点火。
  watch(
    () => storm.phase,
    (phase) => {
      if (phase === 'storm' && !raf) start()
    },
  )
}
