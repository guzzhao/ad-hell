<script setup lang="ts">
import { ref } from 'vue'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()

const isBalanceHidden = ref(false)
const balanceTotal = ref(158260.5)
const demandDeposit = ref(48200.0)
const wealthDeposit = ref(110060.5)

const showTransferModal = ref(false)
const transferAmount = ref('')
const transferPayee = ref('')
const toastMsg = ref('')
const showToast = ref(false)

function showTip(msg: string): void {
  toastMsg.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 1800)
}

interface BankRecord {
  id: number
  title: string
  account: string
  amount: string
  isIncome?: boolean
  time: string
}

const records = ref<BankRecord[]>([
  {
    id: 1,
    title: '微信互联快捷支付',
    account: '储蓄卡 (尾号8829)',
    amount: '-128.00',
    time: '今天 12:40',
  },
  {
    id: 2,
    title: '季度活期利息结息',
    account: '活期一本通',
    amount: '+18.42',
    isIncome: true,
    time: '9月21日',
  },
  {
    id: 3,
    title: '科技实业月度薪资',
    account: '代发工资专户',
    amount: '+18,500.00',
    isIncome: true,
    time: '9月15日',
  },
])

function handleTransferSubmit(): void {
  const amt = parseFloat(transferAmount.value)
  if (isNaN(amt) || amt <= 0) {
    showTip('请输入有效的转账金额')
    return
  }
  if (amt > demandDeposit.value) {
    showTip('活期账户可用余额不足')
    return
  }
  if (!transferPayee.value.trim()) {
    showTip('请输入收款人姓名')
    return
  }

  // 扣减活期余额并记账
  demandDeposit.value -= amt
  balanceTotal.value -= amt
  records.value.unshift({
    id: Date.now(),
    title: `转账汇款给 ${transferPayee.value}`,
    account: '跨行实时清算',
    amount: `-${amt.toFixed(2)}`,
    time: '刚刚',
  })

  showTransferModal.value = false
  transferAmount.value = ''
  transferPayee.value = ''
  showTip(`转账成功！已实时汇出 ¥${amt.toFixed(2)}`)
}
</script>

<template>
  <div class="flex flex-col h-full bg-[#f8f9fa] text-[#1f2937] overflow-hidden relative">
    <!-- 稳重金融顶栏 -->
    <header
      class="bg-gradient-to-br from-[#1a1f2c] via-[#222938] to-[#121620] text-white px-4 pt-3 pb-4 shrink-0"
    >
      <div class="flex justify-between items-center mb-2.5">
        <div class="flex items-center gap-1.5">
          <span class="text-base">🏛️</span>
          <span class="text-sm font-semibold tracking-wide">招商银行</span>
          <span
            class="text-[9.5px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium"
            >尊享黑金</span
          >
        </div>
        <div class="text-[10.5px] text-emerald-400 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 安全保护中
        </div>
      </div>

      <!-- 客户问候 -->
      <div class="flex justify-between items-center mb-3">
        <span class="text-xs text-gray-300 font-medium">下午好，顾先生</span>
        <button
          type="button"
          class="text-[11px] text-gray-400 hover:text-white cursor-pointer"
          aria-label="隐藏或显示余额"
          @click="isBalanceHidden = !isBalanceHidden"
        >
          {{ isBalanceHidden ? '🙈 资产已隐' : '👁️ 显示资产' }}
        </button>
      </div>

      <!-- 核心资产卡片 -->
      <div class="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md border border-white/10 shadow-lg">
        <div class="flex justify-between items-center mb-1">
          <span class="text-[11px] text-gray-400">总资产 (元)</span>
          <span class="text-[11px] text-rose-400 font-medium">今日预期收益 +28.60</span>
        </div>
        <div class="text-2xl font-bold tracking-tight text-white mb-2.5 font-mono">
          {{
            isBalanceHidden
              ? '****'
              : `¥ ${balanceTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
          }}
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400">活期储蓄</span>
            <span class="text-xs font-semibold text-gray-200 mt-0.5 font-mono">
              {{
                isBalanceHidden
                  ? '****'
                  : `¥ ${demandDeposit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
              }}
            </span>
          </div>
          <div class="w-px h-6 bg-white/10" />
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400">理财与基金</span>
            <span class="text-xs font-semibold text-gray-200 mt-0.5 font-mono">
              {{
                isBalanceHidden
                  ? '****'
                  : `¥ ${wealthDeposit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
              }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- 滚动业务区 -->
    <main class="flex-1 px-3.5 pt-3 pb-6 flex flex-col gap-3 phone-scroll">
      <!-- 快捷金融金刚区 -->
      <div class="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div class="grid grid-cols-4 gap-y-3 gap-x-2">
          <button
            type="button"
            class="flex flex-col items-center gap-1 cursor-pointer"
            @click="showTransferModal = true"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-gray-50 text-gray-800"
              >⇄</span
            >
            <span class="text-[11px] text-gray-700">转账汇款</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 cursor-pointer"
            @click="showTip('本月累计收支明细已生成')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-gray-50 text-gray-800"
              >📑</span
            >
            <span class="text-[11px] text-gray-700">账户明细</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 cursor-pointer"
            @click="showTip('精选年化稳健理财')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-gray-50 text-gray-800"
              >📈</span
            >
            <span class="text-[11px] text-gray-700">理财精选</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 cursor-pointer"
            @click="showTip('尊享白金信用卡额度 ¥100,000')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-gray-50 text-gray-800"
              >💳</span
            >
            <span class="text-[11px] text-gray-700">信用卡</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 cursor-pointer"
            @click="showTip('大额存单三年期 2.85%')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-gray-50 text-gray-800"
              >📜</span
            >
            <span class="text-[11px] text-gray-700">大额存单</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 cursor-pointer"
            @click="showTip('实时美元结汇汇率 7.02')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-gray-50 text-gray-800"
              >💱</span
            >
            <span class="text-[11px] text-gray-700">结售汇</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 cursor-pointer"
            @click="showTip('闪电贷预授信额度 ¥200,000')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-gray-50 text-gray-800"
              >⚡</span
            >
            <span class="text-[11px] text-gray-700">贷款专区</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 cursor-pointer"
            @click="showTip('支持全国网点免密查询')"
          >
            <span
              class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-gray-50 text-gray-800"
              >···</span
            >
            <span class="text-[11px] text-gray-700">全部服务</span>
          </button>
        </div>
      </div>

      <!-- 尊享闪电贷营销大卡片 -->
      <section
        v-if="storm.adsEnabled"
        class="rounded-2xl p-3.5 bg-gradient-to-r from-red-800 via-rose-900 to-amber-950 text-white shadow-md border border-amber-500/30 flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all"
        @click="storm.tapAdBody('bank-lightning')"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/30 grid place-items-center text-2xl shrink-0"
          >
            ⚡
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-amber-200 truncate"
                >尊享闪电贷 · 最高额度 300,000 元</span
              >
              <span
                class="text-[9px] bg-red-600 text-white font-black px-1.5 py-px rounded-full shrink-0"
                >特批</span
              >
            </div>
            <span class="text-[10px] text-amber-100/80 truncate mt-0.5"
              >年化利率 3.2% 起 · 凭信用 1 分钟到账</span
            >
          </div>
        </div>
        <span
          class="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 text-red-950 font-black text-xs shrink-0 ml-2 shadow-xs"
        >
          立即测额 ›
        </span>
      </section>

      <!-- 精选稳健理财专区 -->
      <section class="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-2.5">
          <strong class="text-xs font-semibold text-gray-900">稳健理财优选</strong>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium"
            >官方风控 R1 低风险</span
          >
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center p-2 rounded-xl bg-gray-50">
            <div class="flex flex-col">
              <span class="text-xs font-medium text-gray-800">朝朝宝 · 活期进阶</span>
              <span class="text-base font-bold text-rose-600 font-mono">2.45%</span>
              <span class="text-[10px] text-gray-400">近7日年化 · 自动消费代扣</span>
            </div>
            <button
              type="button"
              class="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-medium cursor-pointer active:scale-95"
              @click="showTip('朝朝宝已签约开通')"
            >
              申购
            </button>
          </div>
          <div class="flex justify-between items-center p-2 rounded-xl bg-gray-50">
            <div class="flex flex-col">
              <span class="text-xs font-medium text-gray-800">季季开门红 · 90天稳健</span>
              <span class="text-base font-bold text-rose-600 font-mono">3.18%</span>
              <span class="text-[10px] text-gray-400">业绩基准 · 期限90天</span>
            </div>
            <button
              type="button"
              class="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-medium cursor-pointer active:scale-95"
              @click="showTip('理财份额充足，购买成功')"
            >
              申购
            </button>
          </div>
        </div>
      </section>

      <!-- 存款送油营销卡片 -->
      <section
        v-if="storm.adsEnabled"
        class="rounded-2xl p-3 bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/25 flex items-center justify-between text-gray-800 cursor-pointer hover:bg-amber-500/20 active:scale-[0.99] transition-all"
        @click="storm.tapAdBody('dialer-finance')"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="text-2xl shrink-0">🎁</span>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-bold text-amber-900 truncate"
              >定期存款达标有礼 · 抽 5L 压榨花生油</span
            >
            <span class="text-[10.5px] text-amber-800/80 truncate mt-0.5"
              >起存金额 1 万元 · 100% 中奖</span
            >
          </div>
        </div>
        <span
          class="px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[11px] shrink-0 ml-2 shadow-xs"
        >
          去抽奖 ›
        </span>
      </section>

      <!-- 最近收支动账记录 -->
      <section class="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-2.5">
          <strong class="text-xs font-semibold text-gray-900">近期动账记录</strong>
          <span class="text-[11px] text-gray-400 cursor-pointer">更多 ›</span>
        </div>
        <div class="flex flex-col gap-2.5">
          <div
            v-for="rec in records"
            :key="rec.id"
            class="flex justify-between items-center py-1 border-b border-gray-50 last:border-none"
          >
            <div class="flex flex-col">
              <span class="text-xs font-medium text-gray-800">{{ rec.title }}</span>
              <span class="text-[10px] text-gray-400">{{ rec.time }} · {{ rec.account }}</span>
            </div>
            <span
              class="text-xs font-bold font-mono"
              :class="rec.isIncome ? 'text-emerald-600' : 'text-gray-900'"
            >
              {{ rec.amount }}
            </span>
          </div>
        </div>
      </section>
    </main>

    <!-- 快捷转账汇款模态框 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showTransferModal"
        class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
        @click="showTransferModal = false"
      >
        <div class="w-full bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-2xl" @click.stop>
          <div class="flex justify-between items-center text-sm font-semibold">
            <strong>转账汇款</strong>
            <button
              type="button"
              class="w-6 h-6 rounded-full bg-gray-100 grid place-items-center text-xs text-gray-500 cursor-pointer"
              @click="showTransferModal = false"
            >
              ✕
            </button>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-600">收款人姓名</label>
            <input
              v-model="transferPayee"
              type="text"
              class="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-rose-600"
              placeholder="请输入收款人真实姓名"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-gray-600">转账金额 (元)</label>
            <input
              v-model="transferAmount"
              type="number"
              class="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-rose-600"
              placeholder="0.00"
            />
            <span class="text-[10.5px] text-gray-400"
              >活期可用: ¥{{ demandDeposit.toFixed(2) }}</span
            >
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-[10.5px] text-gray-500 bg-gray-50 p-2 rounded-lg text-center"
              >🛡️ 银行实时风控芯片保护 · 免手续费</span
            >
          </div>

          <button
            type="button"
            class="h-10 rounded-xl bg-rose-600 text-white text-sm font-medium cursor-pointer active:bg-rose-700"
            @click="handleTransferSubmit"
          >
            确认转账
          </button>
        </div>
      </div>
    </Transition>

    <!-- 提示 Toast -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showToast"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-xs z-[60] pointer-events-none"
      >
        {{ toastMsg }}
      </div>
    </Transition>
  </div>
</template>
