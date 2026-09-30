import type { Component } from 'vue'
import type { AdLayout } from '@/types/ad'
import AdBanner from './creatives/AdBanner.vue'
import AdFloating from './creatives/AdFloating.vue'
import AdInterstitial from './creatives/AdInterstitial.vue'
import AdSplash from './creatives/AdSplash.vue'
import AdFakeCall from './creatives/AdFakeCall.vue'

/**
 * 版式 → 渲染组件的注册表。
 *
 * `Record<AdLayout, Component>` 的**穷尽性由编译器保证**：给 `AdLayout` 加一个分支
 * 却忘了在这里注册，`npm run type-check` 会直接报错。
 *
 * 这是"可扩展"最便宜的兑现方式——不需要运行期插件系统，也不需要初始化顺序约定。
 * 也正因为编译器已经管住了这件事，`registry.spec.ts` 里**不必**再写一遍
 * "LAYOUTS 是否覆盖全部 AdLayout"的重复测试。
 */
export const LAYOUTS: Record<AdLayout, Component> = {
  banner: AdBanner,
  floating: AdFloating,
  interstitial: AdInterstitial,
  splash: AdSplash,
  fakeCall: AdFakeCall,
}
