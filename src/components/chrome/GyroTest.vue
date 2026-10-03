<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEventListener } from '@vueuse/core'

/**
 * 陀螺仪与设备运动传感器测试诊断面板。
 * 供移动端真机局域网调试与传感器可用性验证。
 */

interface PermissionWithRequest {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const isOpen = ref(false)

// 环境与安全上下文
const isSecure = ref(false)
const originUrl = ref('')
const hasMotionEvent = ref(false)
const hasOrientationEvent = ref(false)
const permissionStatus = ref<string>('未请求')

// 统计计数
const motionEventCount = ref(0)
const orientationEventCount = ref(0)
const shakeDetectCount = ref(0)
const lastShakeTime = ref('')

// DeviceOrientation 数据 (陀螺仪/姿态)
const orientation = ref({
  alpha: 0, // Z 轴 (0 ~ 360)
  beta: 0, // X 轴 前后 (-180 ~ 180)
  gamma: 0, // Y 轴 左右 (-90 ~ 90)
  absolute: false,
})

// DeviceMotion 数据 (加速度/运动)
const motion = ref({
  accX: 0,
  accY: 0,
  accZ: 0,
  gravX: 0,
  gravY: 0,
  gravZ: 0,
  rotAlpha: 0,
  rotBeta: 0,
  rotGamma: 0,
  magnitude: 0,
  deviation: 0,
})

// 水平仪小球偏移位置 (用于可视化呈现)
const bubbleStyle = computed(() => {
  // 限制偏移在圆盘半径内
  const maxOffset = 38
  const x = Math.max(-maxOffset, Math.min(maxOffset, (orientation.value.gamma / 45) * maxOffset))
  const y = Math.max(-maxOffset, Math.min(maxOffset, (orientation.value.beta / 45) * maxOffset))
  return {
    transform: `translate(${x}px, ${y}px)`,
  }
})

// 晃动检测逻辑 (与项目 shake 判定对齐)
const GRAVITY = 9.81
const MOTION_BEAT_DEVIATION = 4
let aboveMotionBar = false

function onDeviceOrientation(event: DeviceOrientationEvent): void {
  orientationEventCount.value++
  orientation.value = {
    alpha: Number((event.alpha ?? 0).toFixed(1)),
    beta: Number((event.beta ?? 0).toFixed(1)),
    gamma: Number((event.gamma ?? 0).toFixed(1)),
    absolute: event.absolute ?? false,
  }
}

function onDeviceMotion(event: DeviceMotionEvent): void {
  motionEventCount.value++
  const acc = event.acceleration
  const grav = event.accelerationIncludingGravity
  const rot = event.rotationRate

  const gx = grav?.x ?? 0
  const gy = grav?.y ?? 0
  const gz = grav?.z ?? 0
  const magnitude = Math.hypot(gx, gy, gz)
  const deviation = Math.abs(magnitude - GRAVITY)

  motion.value = {
    accX: Number((acc?.x ?? 0).toFixed(2)),
    accY: Number((acc?.y ?? 0).toFixed(2)),
    accZ: Number((acc?.z ?? 0).toFixed(2)),
    gravX: Number(gx.toFixed(2)),
    gravY: Number(gy.toFixed(2)),
    gravZ: Number(gz.toFixed(2)),
    rotAlpha: Number((rot?.alpha ?? 0).toFixed(1)),
    rotBeta: Number((rot?.beta ?? 0).toFixed(1)),
    rotGamma: Number((rot?.gamma ?? 0).toFixed(1)),
    magnitude: Number(magnitude.toFixed(2)),
    deviation: Number(deviation.toFixed(2)),
  }

  // 模拟摇晃节拍判定
  const above = deviation >= MOTION_BEAT_DEVIATION
  if (above && !aboveMotionBar) {
    shakeDetectCount.value++
    const now = new Date()
    lastShakeTime.value = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(
      now.getMilliseconds() / 100,
    )}`
  }
  aboveMotionBar = above
}

useEventListener(window, 'deviceorientation', onDeviceOrientation)
useEventListener(window, 'devicemotion', onDeviceMotion)

async function requestPermissions(): Promise<void> {
  let grantedAny = false
  const dme: unknown = globalThis.DeviceMotionEvent
  if (
    (typeof dme === 'function' || typeof dme === 'object') &&
    dme !== null &&
    'requestPermission' in dme
  ) {
    try {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const res = await (dme as PermissionWithRequest).requestPermission?.()
      permissionStatus.value = `Motion: ${res}`
      if (res === 'granted') grantedAny = true
    } catch (err: unknown) {
      permissionStatus.value = `Motion 失败: ${String(err)}`
    }
  }

  const doe: unknown = globalThis.DeviceOrientationEvent
  if (
    (typeof doe === 'function' || typeof doe === 'object') &&
    doe !== null &&
    'requestPermission' in doe
  ) {
    try {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const res = await (doe as PermissionWithRequest).requestPermission?.()
      permissionStatus.value += ` | Orientation: ${res}`
      if (res === 'granted') grantedAny = true
    } catch (err: unknown) {
      permissionStatus.value += ` | Orientation 失败: ${String(err)}`
    }
  }

  if (!grantedAny && permissionStatus.value === '未请求') {
    permissionStatus.value = '当前平台无需显式申请权限 (非 iOS 13+)'
  }
}

function resetCounters(): void {
  motionEventCount.value = 0
  orientationEventCount.value = 0
  shakeDetectCount.value = 0
  lastShakeTime.value = ''
}

onMounted(() => {
  isSecure.value = globalThis.isSecureContext ?? false
  originUrl.value = globalThis.location?.href ?? ''
  hasMotionEvent.value = typeof globalThis.DeviceMotionEvent === 'function'
  hasOrientationEvent.value = typeof globalThis.DeviceOrientationEvent === 'function'
})
</script>

<template>
  <!-- 顶部常驻快捷测试胶囊 (永不被广告遮挡) -->
  <div
    class="fixed top-[calc(10px+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-[1002]"
  >
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10141d]/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-md active:scale-95 transition-all cursor-pointer hover:border-emerald-400"
      @click="isOpen = !isOpen"
    >
      <span
        class="w-2 h-2 rounded-full animate-pulse"
        :class="motionEventCount > 0 ? 'bg-emerald-400' : 'bg-amber-400'"
      />
      <span>陀螺仪测试</span>
      <span class="opacity-75">({{ orientationEventCount + motionEventCount }}次)</span>
    </button>
  </div>

  <!-- 诊断详情浮层 -->
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[1005] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4"
      @click.self="isOpen = false"
    >
      <div
        class="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-[#141923] border border-white/20 text-[#e6ebf5] p-4 text-xs font-sans shadow-2xl flex flex-col gap-3"
      >
        <!-- 头部 -->
        <div class="flex items-center justify-between pb-2 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="text-base">🧭</span>
            <span class="font-bold text-sm text-white">传感器与陀螺仪实机测试</span>
          </div>
          <button
            type="button"
            class="px-2.5 py-1 rounded bg-white/10 text-white/80 active:bg-white/20 cursor-pointer text-xs"
            @click="isOpen = false"
          >
            关闭
          </button>
        </div>

        <!-- 非安全上下文警告 -->
        <div
          v-if="!isSecure"
          class="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 leading-relaxed"
        >
          <div class="font-bold flex items-center gap-1 text-amber-300">
            <span>⚠️</span> 注意：当前为非安全上下文 (HTTP 局域网访问)
          </div>
          <div class="mt-1 text-[11px] text-amber-200/90">
            大多数现代手机浏览器（如 iOS Safari、Android Chrome）出于隐私安全，**强制要求 HTTPS** 或
            localhost 才允许调用陀螺仪与加速度计。
          </div>
          <div class="mt-1 text-[10px] text-amber-300/80">
            若下方计数一直为 0，请检查是否被浏览器拦截。
          </div>
        </div>

        <!-- 环境信息 -->
        <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-white/5 font-mono text-[11px]">
          <div>
            <span class="text-white/50">安全上下文:</span>
            <span :class="isSecure ? 'text-emerald-400' : 'text-rose-400 font-bold'">
              {{ isSecure ? '是 (Secure)' : '否 (Insecure HTTP)' }}
            </span>
          </div>
          <div>
            <span class="text-white/50">DeviceMotion:</span>
            <span :class="hasMotionEvent ? 'text-emerald-400' : 'text-rose-400'">
              {{ hasMotionEvent ? '支持' : '不支持' }}
            </span>
          </div>
          <div>
            <span class="text-white/50">DeviceOrientation:</span>
            <span :class="hasOrientationEvent ? 'text-emerald-400' : 'text-rose-400'">
              {{ hasOrientationEvent ? '支持' : '不支持' }}
            </span>
          </div>
          <div>
            <span class="text-white/50">摇晃命中:</span>
            <span class="text-amber-400 font-bold">{{ shakeDetectCount }} 次</span>
          </div>
        </div>

        <!-- 权限请求与操作按钮 -->
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-medium text-xs transition cursor-pointer text-center"
            @click="requestPermissions()"
          >
            🔒 请求传感器权限 (iOS 必点)
          </button>
          <button
            type="button"
            class="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 active:scale-98 text-white/80 text-xs transition cursor-pointer"
            @click="resetCounters()"
          >
            清空计数
          </button>
        </div>
        <div v-if="permissionStatus !== '未请求'" class="text-[10px] text-white/60 font-mono">
          授权状态: {{ permissionStatus }}
        </div>

        <!-- 水平仪小球可视化 -->
        <div class="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <div
            class="w-24 h-24 rounded-full border-2 border-dashed border-emerald-400/40 relative flex items-center justify-center shrink-0 bg-black/40"
          >
            <!-- 十字准星 -->
            <div class="absolute w-full h-[1px] bg-white/10 pointer-events-none" />
            <div class="absolute h-full w-[1px] bg-white/10 pointer-events-none" />
            <!-- 水平小球 -->
            <div
              class="w-6 h-6 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-transform duration-75 ease-out"
              :style="bubbleStyle"
            />
          </div>
          <div class="flex-1 space-y-1 text-[11px]">
            <div class="font-bold text-white/90">水平仪与倾角</div>
            <div class="text-white/60">
              左右倾斜 (Gamma):
              <span class="font-mono text-emerald-300 font-bold">{{ orientation.gamma }}°</span>
            </div>
            <div class="text-white/60">
              前后倾斜 (Beta):
              <span class="font-mono text-emerald-300 font-bold">{{ orientation.beta }}°</span>
            </div>
            <div class="text-white/60">
              方位指南 (Alpha):
              <span class="font-mono text-emerald-300 font-bold">{{ orientation.alpha }}°</span>
            </div>
            <div class="text-[10px] text-white/40">倾斜手机查看小球实时移动</div>
          </div>
        </div>

        <!-- DeviceOrientation 详情 -->
        <div class="p-2.5 rounded-lg bg-white/5 space-y-1 font-mono text-[11px]">
          <div class="flex justify-between items-center text-xs font-bold text-white/80 font-sans">
            <span>陀螺仪姿态 (DeviceOrientation)</span>
            <span class="text-emerald-400">{{ orientationEventCount }} 次事件</span>
          </div>
          <div class="grid grid-cols-3 gap-1 pt-1 text-center">
            <div class="p-1 rounded bg-black/30">
              <div class="text-white/40 text-[10px]">Alpha (Z)</div>
              <div class="text-white font-bold">{{ orientation.alpha }}°</div>
            </div>
            <div class="p-1 rounded bg-black/30">
              <div class="text-white/40 text-[10px]">Beta (X)</div>
              <div class="text-white font-bold">{{ orientation.beta }}°</div>
            </div>
            <div class="p-1 rounded bg-black/30">
              <div class="text-white/40 text-[10px]">Gamma (Y)</div>
              <div class="text-white font-bold">{{ orientation.gamma }}°</div>
            </div>
          </div>
        </div>

        <!-- DeviceMotion 详情 -->
        <div class="p-2.5 rounded-lg bg-white/5 space-y-1 font-mono text-[11px]">
          <div class="flex justify-between items-center text-xs font-bold text-white/80 font-sans">
            <span>加速度与晃动 (DeviceMotion)</span>
            <span class="text-emerald-400">{{ motionEventCount }} 次事件</span>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <div class="p-1.5 rounded bg-black/30 space-y-0.5">
              <div class="text-white/40 text-[10px]">含重力 (m/s²)</div>
              <div>X: {{ motion.gravX }}</div>
              <div>Y: {{ motion.gravY }}</div>
              <div>Z: {{ motion.gravZ }}</div>
              <div class="text-emerald-300 font-bold">模长: {{ motion.magnitude }}</div>
            </div>
            <div class="p-1.5 rounded bg-black/30 space-y-0.5">
              <div class="text-white/40 text-[10px]">线性加速度 (m/s²)</div>
              <div>X: {{ motion.accX }}</div>
              <div>Y: {{ motion.accY }}</div>
              <div>Z: {{ motion.accZ }}</div>
              <div class="text-amber-300 font-bold">偏离: {{ motion.deviation }}</div>
            </div>
          </div>
          <div v-if="lastShakeTime" class="pt-1 text-[10px] text-amber-300 font-sans">
            ⚡ 上次检测到晃动触发: {{ lastShakeTime }}
          </div>
        </div>

        <!-- 调试小贴士 -->
        <div class="text-[10px] text-white/50 leading-normal p-2 rounded bg-black/20">
          💡 <b>提示:</b> 若移动端使用 Chrome 局域网访问，可访问
          <code>chrome://flags/#unsafely-treat-insecure-origin-as-secure</code
          >，将当前网址加入白名单即可在 HTTP 下启用传感器。
        </div>
      </div>
    </div>
  </Transition>
</template>
