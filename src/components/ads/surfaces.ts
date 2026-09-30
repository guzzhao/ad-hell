import type { Component } from 'vue'
import type { AdSurface } from '@/types/ad'
import AdLayer from './AdLayer.vue'
import TakeoverLayer from './TakeoverLayer.vue'

/**
 * 呈现面 → 层组件的注册表。穷尽性同样由编译器保证（见 `layouts.ts` 的说明）。
 */
export const SURFACES: Record<AdSurface, Component> = {
  popup: AdLayer,
  takeover: TakeoverLayer,
}

/**
 * 各层的挂载顺序。
 *
 * 层级优先级由每一层自己的 `z-index` 静态决定，**不依赖挂载顺序**；
 * 这张表存在的意义是让宿主（`PhoneScreen`）能泛用地遍历所有呈现面，
 * 从而在新增一种呈现面时不必改宿主的模板。
 *
 * 数组无法被编译器强制穷尽，所以 `registry.spec.ts` 会断言它覆盖 `SURFACES` 的全部键。
 */
export const SURFACE_ORDER: readonly AdSurface[] = ['popup', 'takeover']
