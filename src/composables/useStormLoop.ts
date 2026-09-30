import { onMounted, watch } from 'vue'
import { useRafFn } from '@vueuse/core'
import { useStormStore } from '@/stores/storm'

/**
 * 单帧最多推进多少毫秒。
 *
 * 标签页切到后台时 rAF 会停摆，而循环此时**仍然是 active 的**：
 * 切回来那一帧的 delta 是整段隐藏时长，不夹紧的话风暴会一步跳到终局，
 * 观感与 HUD 计数全都失真。
 *
 * 注意 `useRafFn` 盖不住这一种：它只在 pause → resume 时把时间基准重置为 0，
 * 而"一直 active 但没帧"恰恰不经过 pause。所以这个夹紧不能因为换了库就删掉。
 */
const MAX_FRAME_MS = 100

/**
 * 风暴主循环。
 *
 * 只负责**推进状态**，不做逐帧渲染：生成与关闭都是离散事件，
 * 交给 Pinia + Vue 响应式渲染。离开 `storm` 阶段就暂停，避免后台空转。
 *
 * 帧循环的记账（帧 id、时间基准、取消、scope 销毁时的清理）全部交给 `useRafFn`，
 * 它内部 `tryOnScopeDispose(pause)`，所以这里不需要 onBeforeUnmount。
 */
export function useStormLoop(): void {
  const storm = useStormStore()

  const { pause, resume } = useRafFn(
    ({ delta }) => {
      storm.advance(Math.min(MAX_FRAME_MS, Math.max(0, delta)))

      // 崩塌 / 真相阶段不需要再逐帧推进了
      if (storm.phase !== 'storm') pause()
    },
    // 先别跑，等 onMounted 里把状态机也一起起好
    { immediate: false },
  )

  onMounted(() => {
    // 先把循环点着，再让风暴开始：storm.start() 会把 phase 改成 storm，
    // watch 随之触发；此时若循环没在跑，watch 会再点一次，造成一帧被安排两次。
    resume()
    storm.start()
  })

  // 「重新体验」把 phase 拉回 storm，而循环此前已经 pause 过了，需要重新点火。
  watch(
    () => storm.phase,
    (phase) => {
      if (phase === 'storm') resume()
    },
  )
}
