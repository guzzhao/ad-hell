<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AdCreative } from '@/types/ad'
import { useStormStore } from '@/stores/storm'

const props = defineProps<{ creative: AdCreative }>()
const emit = defineEmits<{ close: [] }>()

const storm = useStormStore()

// 挽留弹窗开关
const showRetention = ref(false)
// 快应用右上角菜单
const showMenu = ref(false)
// 桌面增生提示 Toast
const toastText = ref('')
const showToast = ref(false)

// 极速清理管家状态
const isCleaning = ref(false)
const cleaned = ref(false)
const cleanedSize = ref(14.8)

// 电池医生状态
const isCooling = ref(false)
const cooled = ref(false)
const batteryTemp = ref(44.5)

// 天天消消乐状态
const gameWon = ref(false)
const tiles = ref([
  { id: 1, icon: '💎', matched: false },
  { id: 2, icon: '💎', matched: false },
  { id: 3, icon: '💎', matched: false },
  { id: 4, icon: '⭐', matched: false },
  { id: 5, icon: '👑', matched: false },
  { id: 6, icon: '⭐', matched: false },
])

const danmuList = [
  '用户 138****9281 刚刚成功提现 50.00 元',
  '用户 189****3310 提现 50.00 元已到账',
  '用户 152****6194 刚刚提现 100.00 元',
  '用户 177****0822 提现 50.00 元秒到账',
]
const currentDanmu = ref(danmuList[0])
let danmuIdx = 0
setInterval(() => {
  danmuIdx = (danmuIdx + 1) % danmuList.length
  currentDanmu.value = danmuList[danmuIdx]
}, 3000)

function triggerToast(text: string): void {
  toastText.value = text
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2200)
}

function handleCapsuleClose(): void {
  // 点击胶囊的 ✕ 并不直接退出，而是强制触发流氓挽留弹窗
  showRetention.value = true
}

function handlePinDesktop(): void {
  showMenu.value = false
  triggerToast(`⚡ 已在桌面添加「${props.creative.brand}」图标`)
}

function handlePermission(): void {
  showMenu.value = false
  triggerToast('🛡️ 权限状态：已自动授权自启动')
}

function handleAbout(): void {
  showMenu.value = false
  triggerToast('⚡ 免安装即点即开轻量体验')
}

function confirmLeave(): void {
  showRetention.value = false
  triggerToast(`⚡ 已在桌面添加「${props.creative.brand}」图标`)
  // 延迟微秒后真正通知上层关闭接管
  setTimeout(() => {
    emit('close')
  }, 350)
}

function cancelRetention(): void {
  showRetention.value = false
  // 挽留弹窗点“继续”，通常在真实流氓软件中会被顺手导流到假落地页
  storm.tapAdBody(props.creative.id)
}

function startClean(): void {
  if (isCleaning.value || cleaned.value) return
  isCleaning.value = true
  const interval = setInterval(() => {
    if (cleanedSize.value > 0.3) {
      cleanedSize.value = Number((cleanedSize.value - 2.1).toFixed(1))
    } else {
      clearInterval(interval)
      cleanedSize.value = 0
      isCleaning.value = false
      cleaned.value = true
    }
  }, 180)
}

function startCooling(): void {
  if (isCooling.value || cooled.value) return
  isCooling.value = true
  const interval = setInterval(() => {
    if (batteryTemp.value > 32.5) {
      batteryTemp.value = Number((batteryTemp.value - 1.8).toFixed(1))
    } else {
      clearInterval(interval)
      batteryTemp.value = 32.0
      isCooling.value = false
      cooled.value = true
    }
  }, 160)
}

function matchTile(index: number): void {
  if (gameWon.value) return
  const tile = tiles.value[index]
  if (tile) tile.matched = true
  if (tiles.value.filter((t) => t.matched).length >= 3) {
    gameWon.value = true
  }
}

const retentionTitle = computed(() => {
  if (props.creative.id === 'quick-clean') return '清理尚未完成，确定要退出吗？'
  if (props.creative.id === 'quick-cash') return '确定放弃 50.00 元新手专属提现？'
  if (props.creative.id === 'quick-battery') return '高温尚未排除，退出可能损伤设备！'
  return '确定要残忍离开吗？'
})

const retentionSubline = computed(() => {
  if (props.creative.id === 'quick-clean')
    return '手机尚有 14.8GB 冗余垃圾未彻底释放，退出后将持续发热卡顿'
  if (props.creative.id === 'quick-cash')
    return '您有 50.00 元专属现金红包即将失效，退出即视为自动放弃！'
  if (props.creative.id === 'quick-battery')
    return '电池正处于 44.5℃ 危险高温，完成极速降温可延长寿命 3 年'
  return '当前服务正在运行中，退出后将无法享受免安装秒开特权'
})

const retentionPrimaryCta = computed(() => {
  if (props.creative.id === 'quick-clean') return '继续一键清理'
  if (props.creative.id === 'quick-cash') return '立即提现 50 元'
  if (props.creative.id === 'quick-battery') return '继续极速降温'
  return '继续使用'
})
</script>

<template>
  <div
    class="quick-app relative flex flex-col w-full h-full text-white overflow-hidden select-none"
    :style="{ backgroundColor: creative.palette.bg }"
  >
    <!-- 1. 快应用经典顶栏与胶囊控制按钮 -->
    <header
      class="shrink-0 flex items-center justify-between px-3.5 pt-11 pb-2.5 bg-black/40 border-b border-white/[0.08] backdrop-blur-md z-20"
      @click.stop
    >
      <!-- 左侧：快应用标识与应用名称 -->
      <div class="flex items-center gap-1.5 min-w-0">
        <span
          class="grid place-items-center w-5 h-5 rounded-md bg-amber-400 text-slate-950 font-black text-[11px] shadow-xs"
          >⚡</span
        >
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1.5">
            <strong class="text-[13px] font-bold text-white truncate max-w-[130px]">{{
              creative.brand
            }}</strong>
            <span
              class="px-1 py-px rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0"
              >免安装</span
            >
          </div>
          <span class="text-[9.5px] text-white/50 truncate">快应用引擎 2.4 · 官方认证</span>
        </div>
      </div>

      <!-- 右侧：快应用标志性胶囊按钮 [ ··· | ✕ ] -->
      <div
        class="flex items-center h-7 px-2.5 rounded-full bg-black/50 border border-white/20 text-white/80 text-xs shadow-xs"
      >
        <button
          type="button"
          class="px-1 text-[11px] hover:text-white transition-colors cursor-pointer"
          aria-label="快应用选项"
          @click.stop="showMenu = !showMenu"
        >
          ●●●
        </button>
        <span class="w-px h-3 bg-white/20 mx-1.5" />
        <button
          type="button"
          class="px-1 text-[13px] font-bold hover:text-white transition-colors cursor-pointer"
          aria-label="退出快应用"
          @click.stop="handleCapsuleClose"
        >
          ✕
        </button>
      </div>
    </header>

    <!-- 胶囊菜单弹窗 -->
    <div
      v-if="showMenu"
      class="absolute right-3.5 top-20 z-40 w-36 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-lg shadow-xl py-1 text-[11.5px] text-white/80"
      @click.stop
    >
      <div
        class="px-3 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-2"
        @click="handlePinDesktop"
      >
        <span>📌</span> 添加到桌面
      </div>
      <div
        class="px-3 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-2"
        @click="handlePermission"
      >
        <span>🛡️</span> 权限管理
      </div>
      <div
        class="px-3 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-2"
        @click="handleAbout"
      >
        <span>ℹ️</span> 关于快应用
      </div>
    </div>

    <!-- 2. 快应用主体内容展示 -->
    <main class="flex-1 flex flex-col px-4 py-4 overflow-y-auto min-h-0 relative">
      <!-- A. 极速清理管家 -->
      <section
        v-if="creative.id === 'quick-clean'"
        class="flex flex-col items-center justify-between flex-1 py-2 text-center"
      >
        <!-- 雷达扫描与垃圾总览 -->
        <div class="flex flex-col items-center mt-2">
          <div class="relative grid place-items-center w-40 h-40 my-3">
            <span
              class="absolute inset-0 rounded-full border-2 border-sky-400/25 animate-ping opacity-30"
            />
            <span class="absolute inset-2 rounded-full border border-sky-400/40" />
            <div
              v-if="isCleaning"
              class="absolute inset-0 rounded-full border-t-2 border-sky-400 animate-spin"
            />

            <div class="flex flex-col items-center justify-center z-10">
              <span class="text-3xl mb-1">{{ cleaned ? '✅' : '🧹' }}</span>
              <div class="flex items-baseline">
                <span class="text-3xl font-extrabold tracking-tight text-white">{{
                  cleanedSize
                }}</span>
                <span class="text-sm font-bold text-sky-400 ml-1">GB</span>
              </div>
              <span class="text-[10px] text-white/60">{{
                cleaned ? '清理完毕' : isCleaning ? '正在清理…' : '待释放垃圾'
              }}</span>
            </div>
          </div>

          <h2 class="text-base font-bold text-white mt-1">{{ creative.headline }}</h2>
          <p class="text-[11px] text-sky-300/80 mt-1 max-w-[280px]">{{ creative.subline }}</p>
        </div>

        <!-- 垃圾细项分类卡片 -->
        <div class="w-full max-w-[310px] space-y-2 mt-4 text-left">
          <div
            class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.06] border border-white/10"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">💬</span>
              <div class="flex flex-col">
                <span class="text-[11.5px] font-semibold text-white">社交通讯冗余视频</span>
                <span class="text-[9.5px] text-white/50">包含聊天短视频与高清原图</span>
              </div>
            </div>
            <span class="text-xs font-bold text-amber-400">{{
              cleaned ? '0.0 GB' : '8.2 GB'
            }}</span>
          </div>

          <div
            class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.06] border border-white/10"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">📦</span>
              <div class="flex flex-col">
                <span class="text-[11.5px] font-semibold text-white">临时卸载残留包</span>
                <span class="text-[9.5px] text-white/50">旧版本升级包与废弃日志</span>
              </div>
            </div>
            <span class="text-xs font-bold text-rose-400">{{ cleaned ? '0.0 GB' : '4.6 GB' }}</span>
          </div>

          <div
            class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.06] border border-white/10"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">📢</span>
              <div class="flex flex-col">
                <span class="text-[11.5px] font-semibold text-white">广告离线预载缓存</span>
                <span class="text-[9.5px] text-white/50">已为您智能标记清理</span>
              </div>
            </div>
            <span class="text-xs font-bold text-emerald-400">{{
              cleaned ? '0.0 GB' : '2.0 GB'
            }}</span>
          </div>
        </div>

        <!-- 底部大按钮 -->
        <div class="w-full max-w-[310px] mt-6 mb-2">
          <button
            v-if="!cleaned"
            type="button"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-[0_6px_20px_rgba(14,165,233,0.4)] active:scale-[0.98] transition-transform cursor-pointer"
            :disabled="isCleaning"
            @click.stop="startClean"
          >
            {{ isCleaning ? '正在极速清理…' : creative.cta }}
          </button>
          <button
            v-else
            type="button"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-transform cursor-pointer"
            @click.stop="storm.tapAdBody(creative.id)"
          >
            清理完成 · 免费领取深度加速特权 ›
          </button>
        </div>
      </section>

      <!-- B. 天天消消乐现金版 -->
      <section
        v-else-if="creative.id === 'quick-cash'"
        class="flex flex-col items-center justify-between flex-1 py-1 text-center"
      >
        <!-- 跑马灯滚动弹幕 -->
        <div
          class="w-full max-w-[310px] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10.5px] text-amber-200"
        >
          <span class="animate-bounce">📢</span>
          <span class="truncate">{{ currentDanmu }}</span>
        </div>

        <!-- 顶部通关现金说明 -->
        <div class="flex flex-col items-center mt-3">
          <div
            class="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-bold shadow-md"
          >
            🔥 {{ creative.badge }}
          </div>
          <h2 class="text-xl font-black text-amber-300 mt-2">{{ creative.headline }}</h2>
          <p class="text-[11px] text-white/70 mt-1">{{ creative.subline }}</p>
        </div>

        <!-- 互动九宫格消消乐游戏盘 -->
        <div
          class="relative w-full max-w-[270px] p-3 rounded-2xl bg-black/40 border border-amber-400/30 shadow-2xl my-3"
        >
          <div class="grid grid-cols-3 gap-2.5">
            <button
              v-for="(tile, idx) in tiles"
              :key="tile.id"
              type="button"
              class="aspect-square rounded-xl flex items-center justify-center text-3xl transition-all cursor-pointer"
              :class="
                tile.matched
                  ? 'bg-amber-400/30 border-2 border-amber-300 scale-95 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-white/10 hover:bg-white/20 active:scale-90 border border-white/15'
              "
              @click.stop="matchTile(idx)"
            >
              {{ tile.icon }}
            </button>
          </div>

          <div
            v-if="gameWon"
            class="absolute inset-0 rounded-2xl bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 animate-fade-in"
          >
            <span class="text-4xl animate-bounce">🎉</span>
            <strong class="text-base font-bold text-amber-300 mt-1">恭喜完成第 1 关！</strong>
            <span class="text-2xl font-black text-white mt-1">￥50.00</span>
            <span class="text-[10px] text-emerald-400 mt-0.5">已计入您的免安装快应用钱包</span>
          </div>
        </div>

        <!-- 提现引导按键 -->
        <div class="w-full max-w-[310px] mt-2 mb-2">
          <button
            type="button"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-extrabold text-sm shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:scale-[0.98] transition-transform cursor-pointer animate-pulse"
            @click.stop="storm.tapAdBody(creative.id)"
          >
            {{ gameWon ? '立即提现 50 元到零钱 ›' : creative.cta }}
          </button>
          <span class="block text-[9.5px] text-white/40 mt-1.5">免下载免绑定 · 现金零钱秒到账</span>
        </div>
      </section>

      <!-- C. 极速电池医生 -->
      <section
        v-else-if="creative.id === 'quick-battery'"
        class="flex flex-col items-center justify-between flex-1 py-2 text-center"
      >
        <!-- 电池高温告警仪表 -->
        <div class="flex flex-col items-center mt-2">
          <div class="relative grid place-items-center w-36 h-36 my-2">
            <span
              class="absolute inset-0 rounded-full border-2 border-red-500/30 animate-pulse opacity-40"
            />
            <div
              v-if="isCooling"
              class="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"
            />

            <div class="flex flex-col items-center justify-center z-10">
              <span class="text-3xl mb-0.5">{{ cooled ? '❄️' : '🔥' }}</span>
              <div class="flex items-baseline">
                <span
                  class="text-3xl font-extrabold tracking-tight"
                  :class="cooled ? 'text-cyan-300' : 'text-rose-500'"
                  >{{ batteryTemp }}</span
                >
                <span class="text-sm font-bold text-white/70 ml-1">℃</span>
              </div>
              <span
                class="text-[9.5px] px-2 py-0.5 rounded-full mt-1 font-bold"
                :class="cooled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-red-500/30 text-rose-300'"
              >
                {{ cooled ? '温度已恢复正常' : '严重过热中' }}
              </span>
            </div>
          </div>

          <h2 class="text-base font-bold text-white mt-1">{{ creative.headline }}</h2>
          <p class="text-[11px] text-rose-300/80 mt-1 max-w-[280px]">{{ creative.subline }}</p>
        </div>

        <!-- 异常高耗电应用列表 -->
        <div class="w-full max-w-[310px] space-y-2 mt-4 text-left">
          <div
            class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.06] border border-white/10"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">📹</span>
              <div class="flex flex-col">
                <span class="text-[11.5px] font-semibold text-white">后台短视频常驻进程</span>
                <span class="text-[9.5px] text-white/50">CPU 占用 42%</span>
              </div>
            </div>
            <span class="text-xs font-bold text-rose-400">{{
              cooled ? '已休眠' : '耗电 34%'
            }}</span>
          </div>

          <div
            class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.06] border border-white/10"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">📍</span>
              <div class="flex flex-col">
                <span class="text-[11.5px] font-semibold text-white">同城交友后台高频定位</span>
                <span class="text-[9.5px] text-white/50">GPS 持续唤醒</span>
              </div>
            </div>
            <span class="text-xs font-bold text-rose-400">{{
              cooled ? '已拦截' : '耗电 28%'
            }}</span>
          </div>

          <div
            class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.06] border border-white/10"
          >
            <div class="flex items-center gap-2">
              <span class="text-base">⚡</span>
              <div class="flex flex-col">
                <span class="text-[11.5px] font-semibold text-white">未知后台隐蔽推送</span>
                <span class="text-[9.5px] text-white/50">频繁唤醒主板</span>
              </div>
            </div>
            <span class="text-xs font-bold text-amber-400">{{
              cooled ? '已净化' : '耗电 22%'
            }}</span>
          </div>
        </div>

        <!-- 底部降温按键 -->
        <div class="w-full max-w-[310px] mt-6 mb-2">
          <button
            v-if="!cooled"
            type="button"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-white font-bold text-sm shadow-[0_6px_20px_rgba(244,63,94,0.4)] active:scale-[0.98] transition-transform cursor-pointer"
            :disabled="isCooling"
            @click.stop="startCooling"
          >
            {{ isCooling ? '正在极速冷却硬件…' : creative.cta }}
          </button>
          <button
            v-else
            type="button"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-[0_6px_20px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-transform cursor-pointer"
            @click.stop="storm.tapAdBody(creative.id)"
          >
            降温成功 · 免费领取 100% 原厂电池换新券 ›
          </button>
        </div>
      </section>

      <!-- D. 兜底通用快应用展现 -->
      <section v-else class="flex flex-col items-center justify-center flex-1 py-8 text-center">
        <h2 class="text-lg font-bold text-white">{{ creative.headline }}</h2>
        <p class="text-xs text-white/70 mt-2">{{ creative.subline }}</p>
        <button
          type="button"
          class="mt-6 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm cursor-pointer"
          @click.stop="storm.tapAdBody(creative.id)"
        >
          {{ creative.cta }}
        </button>
      </section>
    </main>

    <!-- 3. 经典快应用流氓退出挽留弹窗 (Retention Dialog) -->
    <div
      v-if="showRetention"
      class="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-5"
      @click.stop
    >
      <div
        class="w-full max-w-[310px] rounded-3xl bg-slate-900 border border-white/20 p-5 shadow-2xl flex flex-col items-center text-center animate-fade-in"
      >
        <div class="w-14 h-14 rounded-full bg-amber-500/20 grid place-items-center text-3xl mb-3">
          🥺
        </div>
        <strong class="text-base font-bold text-white leading-snug">{{ retentionTitle }}</strong>
        <p class="text-[11.5px] text-white/60 leading-relaxed mt-2 px-1">
          {{ retentionSubline }}
        </p>

        <!-- 显眼醒目的“继续使用/领福利”按钮（误导点击） -->
        <button
          type="button"
          class="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm shadow-[0_4px_16px_rgba(245,158,11,0.4)] active:scale-95 transition-transform cursor-pointer"
          @click.stop="cancelRetention"
        >
          {{ retentionPrimaryCta }}
        </button>

        <!-- 极其隐蔽微小的“残忍离开”按钮 -->
        <button
          type="button"
          class="mt-3 text-[11px] text-white/40 hover:text-white/70 transition-colors p-1 cursor-pointer"
          @click.stop="confirmLeave"
        >
          残忍离开 ›
        </button>
      </div>
    </div>

    <!-- 4. 增生桌面快捷方式 Toast -->
    <Transition name="fade">
      <div
        v-if="showToast"
        class="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/85 border border-white/20 text-white text-[11px] font-medium shadow-lg backdrop-blur-md whitespace-nowrap"
      >
        {{ toastText }}
      </div>
    </Transition>
  </div>
</template>
