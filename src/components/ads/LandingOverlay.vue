<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStormStore } from '@/stores/storm'
import { APPS } from '@/data/apps'

/**
 * 真实而符合逻辑的广告落地页：
 * 绝不仅限于“拼一拼优选”，而是根据所点击的广告来源与品类（网贷、游戏、医疗器械、
 * 减肥、同城交友、系统清理、保险、名师课、电商等），精准呈现对应的高保真互动落地页。
 */
const storm = useStormStore()
const { landingOpen, currentLanding } = storeToRefs(storm)

const targetAppName = computed(() => {
  if (!currentLanding.value?.targetAppId) return ''
  return APPS.find((a) => a.id === currentLanding.value.targetAppId)?.name ?? ''
})

const feedbackToast = ref<string | null>(null)
let toastTimer: number | null = null

function triggerAction(actionName: string) {
  feedbackToast.value = `已为您响应：${actionName}`
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    feedbackToast.value = null
  }, 2200)
}

function handleLaunchTargetApp(appId: string) {
  storm.openApp(appId)
  storm.closeLanding()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    leave-active-class="transition duration-300 ease-in"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="landingOpen && currentLanding"
      class="absolute inset-0 z-[900] flex flex-col bg-slate-50 text-slate-900 select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      :aria-label="currentLanding.brand"
    >
      <!-- 顶部系统导航栏：避让顶部刘海/状态栏，提供明确的返回和关闭通道 -->
      <header
        class="flex items-center justify-between pt-[42px] px-4 pb-3 bg-white border-b border-slate-200 shrink-0"
      >
        <button
          type="button"
          class="inline-flex items-center gap-0.5 text-[14.5px] font-semibold text-blue-600 px-2 py-1 rounded-lg active:bg-blue-50 cursor-pointer"
          aria-label="返回"
          @click="storm.closeLanding()"
        >
          <span class="text-xl leading-none" aria-hidden="true">‹</span> 返回
        </button>
        <div class="flex flex-col items-center">
          <span class="text-[13.5px] font-semibold text-slate-800">应用详情</span>
          <span class="text-[9.5px] text-slate-400">{{ currentLanding.category }}</span>
        </div>
        <button
          type="button"
          class="grid place-items-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[13px] font-semibold active:bg-slate-200 cursor-pointer border-none"
          aria-label="关闭详情"
          @click="storm.closeLanding()"
        >
          ✕
        </button>
      </header>

      <!-- 交互操作浮动反馈条 -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-4 opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="-translate-y-4 opacity-0"
      >
        <div
          v-if="feedbackToast"
          class="absolute top-16 inset-x-6 z-50 py-2 px-3 rounded-xl bg-slate-900/90 text-white text-xs font-medium text-center shadow-xl backdrop-blur-sm pointer-events-none"
        >
          {{ feedbackToast }}
        </div>
      </Transition>

      <div class="flex-1 min-h-0 overflow-y-auto px-[18px] pt-4 pb-6 phone-scroll">
        <!-- 应用基本信息 -->
        <div class="flex gap-4 items-center">
          <div
            class="grid place-items-center w-[68px] h-[68px] rounded-2xl text-white shadow-lg shrink-0 bg-gradient-to-br"
            :class="currentLanding.theme.iconBg"
            aria-hidden="true"
          >
            <!-- 动态品类图标 -->
            <!-- 贷款 / 金融 -->
            <svg
              v-if="currentLanding.iconType === 'loan' || currentLanding.iconType === 'finance'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <circle cx="7" cy="15" r="1.5" fill="currentColor" />
              <path d="M14 15h4" />
            </svg>

            <!-- 游戏 -->
            <svg
              v-else-if="currentLanding.iconType === 'game'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <rect x="2" y="6" width="20" height="12" rx="6" />
              <path d="M6 12h4M8 10v4" />
              <circle cx="15" cy="11" r="1" fill="currentColor" />
              <circle cx="17" cy="13" r="1" fill="currentColor" />
            </svg>

            <!-- 医疗 / 健康 -->
            <svg
              v-else-if="currentLanding.iconType === 'health'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <path
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
              />
              <path d="M12 9v6M9 12h6" />
            </svg>

            <!-- 减肥 / 瘦身 -->
            <svg
              v-else-if="currentLanding.iconType === 'slim'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <path
                d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
              />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>

            <!-- 同城交友 -->
            <svg
              v-else-if="currentLanding.iconType === 'dating'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path
                d="M12 8c.5-1 1.5-1.5 2.5-1 1.2.6 1.2 2.2 0 3.2L12 12.5 9.5 10.2c-1.2-1-1.2-2.6 0-3.2 1-.5 2 0 2.5 1Z"
                fill="currentColor"
              />
            </svg>

            <!-- 系统清理 / 电池 -->
            <svg
              v-else-if="
                currentLanding.iconType === 'cleaner' || currentLanding.iconType === 'battery'
              "
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              />
            </svg>

            <!-- 保险 -->
            <svg
              v-else-if="currentLanding.iconType === 'insurance'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <!-- 学习名师课 -->
            <svg
              v-else-if="currentLanding.iconType === 'course'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>

            <!-- 短视频 -->
            <svg
              v-else-if="currentLanding.iconType === 'video'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>

            <!-- 照片冲印 -->
            <svg
              v-else-if="currentLanding.iconType === 'photo'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>

            <!-- 云存储 -->
            <svg
              v-else-if="currentLanding.iconType === 'cloud'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>

            <!-- 奖金 / 福利红包 -->
            <svg
              v-else-if="currentLanding.iconType === 'reward'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M15 9.5a3 3 0 0 0-6 0c0 3 6 2 6 5a3 3 0 0 1-6 0" />
            </svg>

            <!-- 音乐 -->
            <svg
              v-else-if="currentLanding.iconType === 'music'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>

            <!-- 电商 / 购物默认 -->
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-9 h-9"
            >
              <path d="M6 3 3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-4Z" />
              <path d="M3 7h18M16 11a4 4 0 0 1-8 0" />
            </svg>
          </div>

          <div class="flex flex-col gap-0.5 min-w-0">
            <div class="flex items-center gap-1.5">
              <h2 class="m-0 text-[17px] font-bold text-slate-900 truncate">
                {{ currentLanding.brand }}
              </h2>
              <span
                class="px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0"
                :class="[currentLanding.theme.badgeBg, currentLanding.theme.badgeFg]"
              >
                官方正版
              </span>
            </div>
            <p class="m-0 text-[11.5px] text-slate-500 truncate">{{ currentLanding.tagline }}</p>
            <div class="flex items-center gap-1.5 mt-0.5 text-[11px]">
              <span class="text-amber-500 tracking-tighter">★★★★★</span>
              <span class="font-semibold text-amber-600">{{ currentLanding.rating }} 分</span>
              <span class="text-slate-400">{{ currentLanding.downloads }}</span>
            </div>
          </div>
        </div>

        <!-- 针对该品类量身定制的专属核心交互卡片 -->
        <section
          v-if="currentLanding.heroCard"
          class="mt-4 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col gap-2"
        >
          <div class="flex items-center justify-between">
            <span
              v-if="currentLanding.heroCard.badge"
              class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              :class="[currentLanding.theme.badgeBg, currentLanding.theme.badgeFg]"
            >
              {{ currentLanding.heroCard.badge }}
            </span>
            <span class="text-[10.5px] text-slate-400">实时授权安全通道</span>
          </div>

          <div class="mt-0.5">
            <h3 class="text-xs font-semibold text-slate-700 m-0">
              {{ currentLanding.heroCard.title }}
            </h3>
            <div
              class="text-[21px] font-black tracking-tight mt-1 text-slate-950 flex items-baseline gap-1"
            >
              <span>{{ currentLanding.heroCard.highlight }}</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1 mb-0 leading-relaxed">
              {{ currentLanding.heroCard.subtext }}
            </p>
          </div>

          <button
            type="button"
            class="w-full mt-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer bg-gradient-to-r"
            :class="currentLanding.theme.iconBg"
            @click="triggerAction(currentLanding.heroCard.buttonText)"
          >
            {{ currentLanding.heroCard.buttonText }}
          </button>

          <p
            v-if="currentLanding.heroCard.note"
            class="text-[9.5px] text-slate-400 mt-1 mb-0 text-center leading-tight"
          >
            {{ currentLanding.heroCard.note }}
          </p>
        </section>

        <!-- 唤起已安装应用特权快捷入口（如果属于手机内置的 App，如购物、短视频、银行、支付宝等） -->
        <section
          v-if="currentLanding.targetAppId && targetAppName"
          class="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between gap-2 shadow-xs"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-sm">📱</span>
              <span class="text-xs font-bold text-blue-950">本机已安装【{{ targetAppName }}】</span>
            </div>
            <p class="text-[10.5px] text-blue-700/80 m-0 truncate mt-0.5">
              无需等待下载，支持直接一键唤醒并直达特惠专区
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold shadow hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
            @click="handleLaunchTargetApp(currentLanding.targetAppId)"
          >
            立即打开 ›
          </button>
        </section>

        <!-- 下载与安装进度条 -->
        <div class="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div class="flex justify-between text-xs font-semibold text-slate-800">
            <span>正在下载 {{ currentLanding.brand }} 安装包…</span>
            <span class="text-blue-600 font-bold">78%</span>
          </div>
          <div class="mt-2 h-[5px] rounded-full bg-slate-100 overflow-hidden">
            <div
              class="h-full w-[78%] rounded-full bg-blue-600 transition-all duration-300 animate-pulse"
            />
          </div>
          <div class="flex items-center justify-between mt-1.5 text-[10.5px] text-slate-500">
            <span
              >{{ currentLanding.downloadSpeed }} · 已完成 24.8 MB / {{ currentLanding.size }}</span
            >
            <span class="text-emerald-600 font-medium">✓ 已通过安全扫描</span>
          </div>
        </div>

        <!-- 真实截图画廊预览 (针对不同素材品类动态展示三项特征) -->
        <div class="grid grid-cols-3 gap-2 mt-4" aria-hidden="true">
          <div
            v-for="(feat, idx) in currentLanding.features"
            :key="idx"
            class="flex flex-col items-center justify-center gap-[3px] h-24 rounded-[12px] p-2 text-center text-white bg-gradient-to-br shadow-xs"
            :class="feat.gradient"
          >
            <span class="text-[11.5px] font-bold leading-tight">{{ feat.title }}</span>
            <span class="text-[9.5px] opacity-85 leading-tight">{{ feat.desc }}</span>
          </div>
        </div>
      </div>

      <!-- 底部操作悬浮栏：提供明确的取消和返回入口 -->
      <footer
        class="flex flex-col items-center px-[18px] pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-white border-t border-slate-200 shrink-0"
      >
        <button
          type="button"
          class="flex items-center justify-center w-full h-10.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 cursor-pointer transition-all active:bg-slate-200 active:scale-[0.98]"
          @click="storm.closeLanding()"
        >
          ✕ 取消下载并返回
        </button>
      </footer>
    </div>
  </Transition>
</template>
