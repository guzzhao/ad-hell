<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { useShellScale } from '@/composables/useShellScale'
import { useStormStore } from '@/stores/storm'
import PhoneScreen from './PhoneScreen.vue'

const storm = useStormStore()

const stage = ref<HTMLElement | null>(null)
const motion = ref<HTMLElement | null>(null)
const scale = useShellScale(stage)

/**
 * GSAP 上下文：作用域限定在 motion 元素内，卸载时一次性 revert，
 * 不留内联样式残留。注意不能 import '@gsap/vue'——该包在 npm 上不存在
 * （见 research/tech-stack-and-scaffold.md）。
 */
let ctx: gsap.Context | null = null

/** 屏幕抖动：强度随风暴进度增长。减动效时完全跳过。 */
function shake(): void {
  const el = motion.value
  if (!el || storm.reducedMotion) return
  const intensity = 2 + storm.progress * 9
  if (ctx) {
    ctx.add(() => {
      gsap.fromTo(
        el,
        { x: -intensity, y: intensity * 0.4 },
        { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, 0.36)', clearProps: 'x,y' },
      )
    })
  } else {
    gsap.fromTo(
      el,
      { x: -intensity, y: intensity * 0.4 },
      { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, 0.36)', clearProps: 'x,y' },
    )
  }
}

/** 崩塌演出：屏幕被压暗、轻微放大，然后停住。 */
function playCollapse(): void {
  const el = motion.value
  if (!el || storm.reducedMotion) return
  if (ctx) {
    ctx.add(() => {
      gsap.timeline().to(el, { scale: 1.035, duration: 0.85, ease: 'power2.inOut' }).to(el, {
        scale: 1,
        filter: 'brightness(0.22) saturate(0.4)',
        duration: 1.3,
        ease: 'power2.in',
      })
    })
  } else {
    gsap.timeline().to(el, { scale: 1.035, duration: 0.85, ease: 'power2.inOut' }).to(el, {
      scale: 1,
      filter: 'brightness(0.22) saturate(0.4)',
      duration: 1.3,
      ease: 'power2.in',
    })
  }
}

/** 每积累若干次生成抖一下，让升级过程有体感。 */
watch(
  () => storm.spawnedCount,
  (count, previous) => {
    if (count === previous) return
    if (count > 0 && count % 4 === 0) shake()
  },
)

watch(
  () => storm.phase,
  (phase) => {
    if (phase === 'collapsed') playCollapse()
    if (phase === 'storm') gsap.set(motion.value, { clearProps: 'filter,scale' })
  },
)

onMounted(() => {
  ctx = gsap.context(() => {}, motion.value ?? undefined)
})

onBeforeUnmount(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <div class="device-shell">
    <div ref="stage" class="device-shell__stage">
      <div class="device-frame" :style="{ '--shell-scale': String(scale) }">
        <!-- 侧边物理实体按键 -->
        <div class="device-frame__button device-frame__button--mute" aria-hidden="true" />
        <div class="device-frame__button device-frame__button--vol-up" aria-hidden="true" />
        <div class="device-frame__button device-frame__button--vol-down" aria-hidden="true" />
        <div class="device-frame__button device-frame__button--power" aria-hidden="true" />

        <!-- 灵动岛药丸屏（含真实感光学镜头与传感器） -->
        <div class="device-frame__notch" aria-hidden="true">
          <span class="device-frame__sensor" />
          <span class="device-frame__lens" />
        </div>
        <div ref="motion" class="device-frame__motion">
          <PhoneScreen />
        </div>
      </div>
    </div>
  </div>
</template>
