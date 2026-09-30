<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'

/**
 * 摇一摇提示。
 *
 * 只在**屏上确实存在响应摇一摇的广告**时才出现——这既是数据驱动，
 * 也如实反映了"摇一摇是素材的能力"这件事：没有那种广告时，晃手机不该有任何反应。
 *
 * 它同时承担三件事：
 *   1. 告诉用户这条广告在等着你晃手机（真机上本来就该靠晃动，不该有人告诉你）
 *   2. 在没有传感器的桌面样机上，给出一个等价的入口
 *   3. 在 iOS 上提供传感器授权按钮 —— 而"这条广告要读你的传感器"本身
 *      就是现实里这套滥用最该被看见的一环
 *
 * 属于**页面控件层**（z-index 1000），永远盖在广告之上，不会被弹出层遮住。
 */
defineProps<{ needsPermission: boolean }>()
const emit = defineEmits<{ request: []; simulate: [] }>()

const storm = useStormStore()
const { shakeArmed } = storeToRefs(storm)
</script>

<template>
  <Transition name="shake-hint">
    <div v-if="shakeArmed" class="shake-hint">
      <!--
        授权按钮必须在用户手势里被点击，iOS 才会真的弹窗；
        这正是为什么它不能自动请求 —— 而现实中的摇一摇广告也是这么做的。
      -->
      <button v-if="needsPermission" type="button" class="shake-hint__btn" @click="emit('request')">
        允许访问运动与方向
      </button>

      <button v-else type="button" class="shake-hint__btn" @click="emit('simulate')">
        <span class="shake-hint__icon" aria-hidden="true">↔</span>
        摇一摇
      </button>

      <p class="shake-hint__note">
        {{
          needsPermission
            ? '这条广告请求读取你的运动传感器'
            : '晃动手机即跳转；桌面可左右晃动样机，或点上面的按钮'
        }}
      </p>
    </div>
  </Transition>
</template>

<style scoped>
.shake-hint {
  position: fixed;
  left: 50%;
  /* 只用 translateX 居中；过渡只改透明度，不去动 transform，免得互相覆盖 */
  transform: translateX(-50%);
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  /* 高于弹窗层（100）、接管层（700）与页内假落地页（900） */
  z-index: 1000;
}

.shake-hint__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  /* 触控目标下限 44px */
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: rgba(12, 15, 20, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #eef1f6;
  font-size: 13.5px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 12px 28px -14px rgba(0, 0, 0, 0.95);
}

.shake-hint__btn:active {
  background: rgba(30, 36, 46, 0.94);
}

.shake-hint__icon {
  font-size: 15px;
  letter-spacing: -0.1em;
}

.shake-hint__note {
  max-width: 280px;
  margin: 0;
  text-align: center;
  font-size: 11px;
  line-height: 1.5;
  color: rgba(238, 241, 246, 0.66);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
}

.shake-hint-enter-active,
.shake-hint-leave-active {
  transition: opacity 200ms ease;
}

.shake-hint-enter-from,
.shake-hint-leave-to {
  opacity: 0;
}
</style>
