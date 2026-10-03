<script setup lang="ts">
import { ref } from 'vue'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()
const showAlipayReward = ref(true)

const showPayCode = ref(false)
const showScanner = ref(false)
const forestEnergy = ref(148)
const collectedForest = ref(false)
const toastText = ref('')
const showToast = ref(false)

function showTip(msg: string): void {
  toastText.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 1800)
}

function collectEnergy(): void {
  if (collectedForest.value) return
  collectedForest.value = true
  showTip(`成功收取 ${forestEnergy.value}g 绿色能量！`)
}

interface Transaction {
  id: number
  title: string
  subtitle: string
  amount: string
  isPositive?: boolean
  time: string
  icon: string
  bg: string
}

const transactions: Transaction[] = [
  {
    id: 1,
    title: '瑞幸咖啡 (西湖天地店)',
    subtitle: '花呗扣款',
    amount: '-9.90',
    time: '今天 14:32',
    icon: '☕',
    bg: '#002244',
  },
  {
    id: 2,
    title: '杭州地铁乘车码',
    subtitle: '电子客票乘车扣费',
    amount: '-4.00',
    time: '今天 08:45',
    icon: '🚇',
    bg: '#dc2626',
  },
  {
    id: 3,
    title: '全家 FamilyMart (钱江店)',
    subtitle: '余额宝免密支付',
    amount: '-18.50',
    time: '昨天 19:20',
    icon: '🏪',
    bg: '#16a34a',
  },
  {
    id: 4,
    title: '月度薪酬发放',
    subtitle: '招商银行转入',
    amount: '+18,500.00',
    isPositive: true,
    time: '9月28日',
    icon: '💰',
    bg: '#eab308',
  },
  {
    id: 5,
    title: '滴滴出行快车',
    subtitle: '行程代扣款',
    amount: '-26.80',
    time: '9月27日',
    icon: '🚗',
    bg: '#f97316',
  },
]
</script>

<template>
  <div class="flex flex-col h-full bg-[#f4f6f9] text-[#1f2937] overflow-hidden relative">
    <!-- 顶部支付宝蓝大背景与功能区 -->
    <header
      class="bg-gradient-to-br from-[#1677ff] to-[#0958d9] text-white px-3.5 pt-2 pb-3.5 shrink-0"
    >
      <div class="flex items-center gap-2.5 mb-3">
        <div
          class="flex-1 h-[34px] rounded-full bg-white/20 flex items-center px-3 gap-1.5 text-xs text-white/85 backdrop-blur-sm"
        >
          <span>🔍</span>
          <span class="truncate">消费券 · 乘车码 · 医保电子凭证</span>
        </div>
        <button
          type="button"
          class="text-lg text-white cursor-pointer"
          aria-label="消息"
          @click="showTip('暂无未读消息')"
        >
          🔔
        </button>
      </div>

      <!-- 四大核心快捷金刚入口 -->
      <div class="flex justify-around items-center">
        <button
          type="button"
          class="flex flex-col items-center gap-1 text-white cursor-pointer"
          @click="showScanner = true"
        >
          <span class="text-[26px] leading-none">⛶</span>
          <span class="text-[12.5px] font-medium">扫一扫</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1 text-white cursor-pointer"
          @click="showPayCode = true"
        >
          <span class="text-[26px] leading-none">▦</span>
          <span class="text-[12.5px] font-medium">付钱/收钱</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1 text-white cursor-pointer"
          @click="showTip('已自动出示杭州公共交通乘车码')"
        >
          <span class="text-[26px] leading-none">🚌</span>
          <span class="text-[12.5px] font-medium">出行</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1 text-white cursor-pointer"
          @click="showTip('卡包已收纳 12 张会员卡与优惠券')"
        >
          <span class="text-[26px] leading-none">🪪</span>
          <span class="text-[12.5px] font-medium">卡包</span>
        </button>
      </div>
    </header>

    <!-- 主体可滚动区 -->
    <main class="flex-1 px-3 pt-2.5 pb-6 flex flex-col gap-2.5 phone-scroll">
      <!-- 宫格服务区 -->
      <div class="bg-white rounded-2xl px-2 pt-3.5 pb-2.5 shadow-sm">
        <div class="grid grid-cols-4 gap-x-1.5 gap-y-3">
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 cursor-pointer"
            @click="showTip('转账功能已就绪')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-[19px] font-semibold bg-[#e6f4ff] text-[#1677ff]"
              >⇄</span
            >
            <span class="text-[11.5px] text-gray-700">转账</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 cursor-pointer"
            @click="showTip('信用卡本期账单已全部结清')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-[19px] font-semibold bg-[#fff1f0] text-[#f5222d]"
              >💳</span
            >
            <span class="text-[11.5px] text-gray-700">信用卡还款</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 cursor-pointer"
            @click="showTip('当前话费余额充沛 ¥96.50')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-[19px] font-semibold bg-[#f6ffed] text-[#52c41a]"
              >📱</span
            >
            <span class="text-[11.5px] text-gray-700">充值中心</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 cursor-pointer"
            @click="showTip('余额宝昨日收益 +¥3.28')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-[19px] font-semibold bg-[#fff7e6] text-[#fa8c16]"
              >📈</span
            >
            <span class="text-[11.5px] text-gray-700">余额宝</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 cursor-pointer"
            @click="showTip('花呗下期应还 ¥0.00')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-[19px] font-semibold bg-[#e6f7ff] text-[#1890ff]"
              >🌸</span
            >
            <span class="text-[11.5px] text-gray-700">花呗</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 cursor-pointer"
            @click="showTip('水费/电费/燃气费均无欠费')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-[19px] font-semibold bg-[#f9f0ff] text-[#722ed1]"
              >⚡</span
            >
            <span class="text-[11.5px] text-gray-700">生活缴费</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 cursor-pointer"
            @click="showTip('市民中心社保/公积金已绑定')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-[19px] font-semibold bg-[#e6fffb] text-[#13c2c2]"
              >🏛️</span
            >
            <span class="text-[11.5px] text-gray-700">市民中心</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 cursor-pointer"
            @click="showTip('更多 120+ 便民小程序')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-[19px] font-semibold bg-[#f0f2f5] text-[#595959]"
              >···</span
            >
            <span class="text-[11.5px] text-gray-700">更多</span>
          </button>
        </div>
      </div>

      <!-- 花呗分期免息 / 天天领现金 Banner -->
      <section
        v-if="storm.adsEnabled"
        class="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-2xl p-3 text-white flex items-center justify-between shadow-md cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all border border-blue-400/30"
        @click="storm.tapAdBody('alipay-huabei')"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm grid place-items-center text-xl shrink-0"
          >
            💰
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold truncate">花呗分期 · 专享 12 期免息</span>
              <span
                class="text-[9px] bg-amber-400 text-blue-950 font-black px-1.5 py-px rounded-full shrink-0"
                >新人专属</span
              >
            </div>
            <span class="text-[10px] text-blue-100 opacity-90 truncate mt-0.5"
              >最高可借 200,000 元 · 实时放款到账</span
            >
          </div>
        </div>
        <span
          class="px-2.5 py-1 rounded-full bg-yellow-300 text-blue-950 font-bold text-xs shrink-0 ml-2 shadow-xs"
        >
          领额度 ›
        </span>
      </section>

      <!-- 蚂蚁森林绿色卡片 -->
      <section
        class="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl px-3.5 py-3 text-white flex items-center justify-between shadow-[0_4px_12px_rgba(5,150,105,0.2)]"
      >
        <div>
          <div class="text-[11px] font-semibold opacity-90">🌲 蚂蚁森林 · 绿色守护</div>
          <h4 class="my-0.5 text-[13px] font-bold">保护地巡护中 · 已累计减碳 42kg</h4>
          <p class="m-0 text-[10.5px] opacity-80">今日步行 8,420 步，已转化低碳能量</p>
        </div>
        <div>
          <button
            type="button"
            class="w-[54px] h-[54px] rounded-full border-[1.5px] flex flex-col items-center justify-center text-white cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all"
            :class="
              collectedForest
                ? 'bg-white/15 border-white/20'
                : 'bg-white/25 border-white/50 animate-pulse'
            "
            aria-label="收取能量"
            @click="collectEnergy"
          >
            <span class="text-[11.5px] font-bold">{{
              collectedForest ? '✓' : `+${forestEnergy}g`
            }}</span>
            <span class="text-[9px] opacity-90">{{ collectedForest ? '已收取' : '点我收取' }}</span>
          </button>
        </div>
      </section>

      <!-- 最近动态账单列表 -->
      <section class="bg-white rounded-2xl p-3.5 shadow-sm">
        <div class="flex justify-between items-center mb-3">
          <strong class="text-[13.5px] font-semibold text-gray-900">近期账单明细</strong>
          <span class="text-[11.5px] text-gray-500 cursor-pointer">查看全部账单 ›</span>
        </div>

        <div class="flex flex-col gap-3">
          <div v-for="t in transactions" :key="t.id" class="flex items-center gap-2.5">
            <div
              class="w-9 h-9 rounded-full grid place-items-center text-lg shrink-0 text-white"
              :style="{ background: t.bg }"
            >
              <span>{{ t.icon }}</span>
            </div>
            <div class="flex-1 flex flex-col overflow-hidden">
              <span class="text-[12.5px] font-semibold text-gray-800 truncate">{{ t.title }}</span>
              <span class="text-[10.5px] text-gray-400">{{ t.time }} · {{ t.subtitle }}</span>
            </div>
            <span
              class="text-[13.5px] font-bold"
              :class="t.isPositive ? 'text-green-600' : 'text-gray-900'"
            >
              {{ t.amount }}
            </span>
          </div>
        </div>
      </section>
    </main>

    <!-- 付款码弹窗 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showPayCode"
        class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4.5"
        @click="showPayCode = false"
      >
        <div
          class="w-full bg-white rounded-[20px] p-4 flex flex-col items-center shadow-2xl"
          @click.stop
        >
          <div class="w-full flex justify-between items-center mb-3 text-sm font-semibold">
            <strong>向商家付款</strong>
            <button
              type="button"
              class="bg-gray-100 w-[26px] h-[26px] rounded-full grid place-items-center cursor-pointer text-gray-600"
              @click="showPayCode = false"
            >
              ✕
            </button>
          </div>
          <div class="w-full flex flex-col items-center gap-1 mb-3.5">
            <div
              class="w-[85%] h-12 bg-[repeating-linear-gradient(90deg,#111827_0px,#111827_2px,transparent_2px,transparent_5px,#111827_5px,#111827_8px,transparent_8px,transparent_11px)]"
            />
            <span class="text-[11px] tracking-widest text-gray-500">6214 **** **** 8829</span>
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <div
              class="w-[140px] h-[140px] border-4 border-gray-900 p-1.5 bg-[radial-gradient(#111827_2px,transparent_2px)] bg-[size:8px_8px]"
            />
            <span class="text-[10.5px] text-gray-400">每分钟自动刷新 · 付款保护中</span>
          </div>
          <div class="mt-3.5 text-[11.5px] text-blue-600">
            <span>优先扣款渠道：余额宝 (推荐) ›</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 扫一扫弹窗 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showScanner"
        class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4.5"
        @click="showScanner = false"
      >
        <div
          class="w-full bg-white rounded-[20px] p-4 flex flex-col items-center shadow-2xl"
          @click.stop
        >
          <div class="w-full flex justify-between items-center mb-3 text-sm font-semibold">
            <strong>扫一扫 / 识物</strong>
            <button
              type="button"
              class="bg-gray-100 w-[26px] h-[26px] rounded-full grid place-items-center cursor-pointer text-gray-600"
              @click="showScanner = false"
            >
              ✕
            </button>
          </div>
          <div class="w-[180px] h-[180px] border border-blue-500/40 relative overflow-hidden my-4">
            <div
              class="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_10px_#1677ff] animate-[laser-scan_2s_linear_infinite]"
            />
            <div
              class="absolute top-0 left-0 w-3.5 h-3.5 border-blue-500 border-t-[3px] border-l-[3px]"
            />
            <div
              class="absolute top-0 right-0 w-3.5 h-3.5 border-blue-500 border-t-[3px] border-r-[3px]"
            />
            <div
              class="absolute bottom-0 left-0 w-3.5 h-3.5 border-blue-500 border-b-[3px] border-l-[3px]"
            />
            <div
              class="absolute bottom-0 right-0 w-3.5 h-3.5 border-blue-500 border-b-[3px] border-r-[3px]"
            />
          </div>
          <span class="text-[11.5px] text-gray-500">将二维码 / 条形码放入框内即可自动扫描</span>
        </div>
      </div>
    </Transition>

    <!-- 交互轻提示 Toast -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showToast"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4.5 py-2 rounded-full text-xs z-[60] pointer-events-none"
      >
        {{ toastText }}
      </div>
    </Transition>

    <!-- 右下角悬浮：天天领现金红包挂件 -->
    <div
      v-if="storm.adsEnabled && showAlipayReward"
      class="absolute right-3 bottom-14 z-30 flex flex-col items-center cursor-pointer group select-none"
      @click="storm.tapAdBody('home-redpacket')"
    >
      <div
        class="relative flex flex-col items-center px-2 py-1.5 rounded-2xl bg-gradient-to-b from-red-600 via-rose-600 to-amber-500 shadow-xl border border-yellow-200/50"
        :class="{ 'animate-bounce': !storm.reducedMotion }"
      >
        <button
          type="button"
          class="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-black/70 text-[9px] text-white/90 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="关闭挂件"
          @click.stop="showAlipayReward = false"
        >
          ✕
        </button>
        <span class="text-2xl leading-none">🧧</span>
        <span class="text-[9px] font-black text-yellow-200 leading-tight mt-0.5">天天领</span>
        <span
          class="text-[8px] bg-yellow-300 text-red-900 font-black px-1 py-px rounded-full scale-90 mt-0.5"
        >
          现金
        </span>
      </div>
    </div>
  </div>
</template>
