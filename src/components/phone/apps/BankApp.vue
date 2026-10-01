<script setup lang="ts">
import { ref } from 'vue'

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
  <div class="bank-app">
    <!-- 稳重金融顶栏 -->
    <header class="bank-header">
      <div class="bank-brand-row">
        <div class="bank-brand">
          <span class="bank-logo">🏛️</span>
          <span class="bank-name">招商银行</span>
          <span class="bank-badge">尊享黑金</span>
        </div>
        <div class="bank-sec-status"><span class="sec-dot" /> 安全保护中</div>
      </div>

      <!-- 客户问候 -->
      <div class="bank-welcome">
        <span class="welcome-text">下午好，顾先生</span>
        <button
          type="button"
          class="eye-btn"
          aria-label="隐藏或显示余额"
          @click="isBalanceHidden = !isBalanceHidden"
        >
          {{ isBalanceHidden ? '🙈 资产已隐' : '👁️ 显示资产' }}
        </button>
      </div>

      <!-- 核心资产卡片 -->
      <div class="asset-card">
        <div class="asset-top">
          <span class="asset-label">总资产 (元)</span>
          <span class="asset-profit">今日预期收益 +28.60</span>
        </div>
        <div class="asset-amount">
          {{
            isBalanceHidden
              ? '****'
              : `¥ ${balanceTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
          }}
        </div>
        <div class="asset-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-sub">活期储蓄</span>
            <span class="breakdown-val">
              {{
                isBalanceHidden
                  ? '****'
                  : `¥ ${demandDeposit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
              }}
            </span>
          </div>
          <div class="breakdown-sep" />
          <div class="breakdown-item">
            <span class="breakdown-sub">理财与基金</span>
            <span class="breakdown-val">
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
    <main class="bank-body phone-scroll">
      <!-- 快捷金融金刚区 -->
      <div class="bank-portals-card">
        <div class="portal-grid">
          <button type="button" class="portal-btn" @click="showTransferModal = true">
            <span class="portal-icon">⇄</span>
            <span class="portal-txt">转账汇款</span>
          </button>
          <button type="button" class="portal-btn" @click="showTip('本月累计收支明细已生成')">
            <span class="portal-icon">📑</span>
            <span class="portal-txt">账户明细</span>
          </button>
          <button type="button" class="portal-btn" @click="showTip('精选年化稳健理财')">
            <span class="portal-icon">📈</span>
            <span class="portal-txt">理财精选</span>
          </button>
          <button type="button" class="portal-btn" @click="showTip('尊享白金信用卡额度 ¥100,000')">
            <span class="portal-icon">💳</span>
            <span class="portal-txt">信用卡</span>
          </button>
          <button type="button" class="portal-btn" @click="showTip('大额存单三年期 2.85%')">
            <span class="portal-icon">📜</span>
            <span class="portal-txt">大额存单</span>
          </button>
          <button type="button" class="portal-btn" @click="showTip('实时美元结汇汇率 7.02')">
            <span class="portal-icon">💱</span>
            <span class="portal-txt">结售汇</span>
          </button>
          <button type="button" class="portal-btn" @click="showTip('闪电贷预授信额度 ¥200,000')">
            <span class="portal-icon">⚡</span>
            <span class="portal-txt">贷款专区</span>
          </button>
          <button type="button" class="portal-btn" @click="showTip('支持全国网点免密查询')">
            <span class="portal-icon">···</span>
            <span class="portal-txt">全部服务</span>
          </button>
        </div>
      </div>

      <!-- 精选稳健理财专区 -->
      <section class="bank-wealth-card">
        <div class="wealth-head">
          <strong class="wealth-title">稳健理财优选</strong>
          <span class="wealth-tag">官方风控 R1 低风险</span>
        </div>
        <div class="wealth-products">
          <div class="product-row">
            <div class="prod-left">
              <span class="prod-name">朝朝宝 · 活期进阶</span>
              <span class="prod-rate">2.45%</span>
              <span class="prod-desc">近7日年化 · 自动消费代扣</span>
            </div>
            <button type="button" class="prod-buy-btn" @click="showTip('朝朝宝已签约开通')">
              申购
            </button>
          </div>
          <div class="product-row">
            <div class="prod-left">
              <span class="prod-name">季季开门红 · 90天稳健</span>
              <span class="prod-rate">3.18%</span>
              <span class="prod-desc">业绩基准 · 期限90天</span>
            </div>
            <button type="button" class="prod-buy-btn" @click="showTip('理财份额充足，购买成功')">
              申购
            </button>
          </div>
        </div>
      </section>

      <!-- 最近收支动账记录 -->
      <section class="bank-records-card">
        <div class="records-head">
          <strong class="records-title">近期动账记录</strong>
          <span class="records-more">更多 ›</span>
        </div>
        <div class="records-list">
          <div v-for="rec in records" :key="rec.id" class="record-item">
            <div class="record-info">
              <span class="record-title">{{ rec.title }}</span>
              <span class="record-time">{{ rec.time }} · {{ rec.account }}</span>
            </div>
            <span class="record-amount" :class="{ 'is-income': rec.isIncome }">
              {{ rec.amount }}
            </span>
          </div>
        </div>
      </section>
    </main>

    <!-- 快捷转账汇款模态框 -->
    <Transition name="fade-scale">
      <div v-if="showTransferModal" class="modal-mask" @click="showTransferModal = false">
        <div class="transfer-card" @click.stop>
          <div class="modal-header">
            <strong>转账汇款</strong>
            <button type="button" class="close-btn" @click="showTransferModal = false">✕</button>
          </div>

          <div class="form-row">
            <label class="form-label">收款人姓名</label>
            <input
              v-model="transferPayee"
              type="text"
              class="form-input"
              placeholder="请输入收款人真实姓名"
            />
          </div>

          <div class="form-row">
            <label class="form-label">转账金额 (元)</label>
            <input v-model="transferAmount" type="number" class="form-input" placeholder="0.00" />
            <span class="form-tip">活期可用: ¥{{ demandDeposit.toFixed(2) }}</span>
          </div>

          <div class="form-row">
            <span class="safe-badge">🛡️ 银行实时风控芯片保护 · 免手续费</span>
          </div>

          <button type="button" class="transfer-submit-btn" @click="handleTransferSubmit">
            确认转账
          </button>
        </div>
      </div>
    </Transition>

    <!-- 提示 Toast -->
    <Transition name="toast">
      <div v-if="showToast" class="bank-toast">
        {{ toastMsg }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bank-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f1f5f9;
  color: #1e293b;
  overflow: hidden;
  position: relative;
}

/* 顶部金融风格卡片 */
.bank-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%);
  color: #ffffff;
  padding: 10px 14px 16px;
  flex: none;
}

.bank-brand-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.bank-brand {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bank-logo {
  font-size: 18px;
}

.bank-name {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.bank-badge {
  font-size: 9.5px;
  padding: 1px 6px;
  border-radius: 4px;
  background: linear-gradient(90deg, #d97706, #f59e0b);
  color: #ffffff;
  font-weight: 600;
}

.bank-sec-status {
  font-size: 10.5px;
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sec-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
}

.bank-welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.welcome-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}

.eye-btn {
  background: rgba(255, 255, 255, 0.12);
  border: none;
  border-radius: 999px;
  padding: 2px 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  cursor: pointer;
}

/* 核心资产卡片 */
.asset-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  padding: 14px;
  backdrop-filter: blur(16px);
}

.asset-top {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.asset-profit {
  color: #facc15;
}

.asset-amount {
  font-size: 26px;
  font-weight: 700;
  margin: 6px 0 10px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.asset-breakdown {
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;
}

.breakdown-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.breakdown-sub {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.6);
}

.breakdown-val {
  font-size: 12.5px;
  font-weight: 600;
}

.breakdown-sep {
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 12px;
}

/* 页面主体 */
.bank-body {
  flex: 1;
  padding: 10px 12px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 金刚区 */
.bank-portals-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 4px;
}

.portal-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
}

.portal-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.portal-txt {
  font-size: 11.5px;
  color: #334155;
  font-weight: 500;
}

/* 理财卡片 */
.bank-wealth-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.wealth-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.wealth-title {
  font-size: 13.5px;
  color: #0f172a;
}

.wealth-tag {
  font-size: 10.5px;
  color: #059669;
  background: #ecfdf5;
  padding: 2px 6px;
  border-radius: 4px;
}

.wealth-products {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #f8fafc;
  border-radius: 10px;
}

.prod-left {
  display: flex;
  flex-direction: column;
}

.prod-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #1e293b;
}

.prod-rate {
  font-size: 16px;
  font-weight: 700;
  color: #dc2626;
  margin: 2px 0;
}

.prod-desc {
  font-size: 10px;
  color: #64748b;
}

.prod-buy-btn {
  background: #dc2626;
  color: #ffffff;
  border: none;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

/* 动账记录 */
.bank-records-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.records-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.records-title {
  font-size: 13.5px;
  color: #0f172a;
}

.records-more {
  font-size: 11px;
  color: #64748b;
  cursor: pointer;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
}

.record-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.record-info {
  display: flex;
  flex-direction: column;
}

.record-title {
  font-size: 12.5px;
  font-weight: 500;
  color: #1e293b;
}

.record-time {
  font-size: 10px;
  color: #94a3b8;
}

.record-amount {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
}

.record-amount.is-income {
  color: #16a34a;
}

/* 转账弹窗 */
.modal-mask {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 18px;
}

.transfer-card {
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  font-size: 15px;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;
}

.form-label {
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
}

.form-input {
  height: 38px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
}

.form-input:focus {
  border-color: #1e3a8a;
}

.form-tip {
  font-size: 10.5px;
  color: #64748b;
}

.safe-badge {
  font-size: 10.5px;
  color: #059669;
  background: #f0fdf4;
  padding: 4px 8px;
  border-radius: 6px;
}

.transfer-submit-btn {
  margin-top: 6px;
  height: 40px;
  background: #1e3a8a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.bank-toast {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 23, 42, 0.85);
  color: #ffffff;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 12px;
  z-index: 60;
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>
