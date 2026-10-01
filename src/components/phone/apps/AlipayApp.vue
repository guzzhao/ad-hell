<script setup lang="ts">
import { ref } from 'vue'

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
  <div class="alipay-app">
    <!-- 顶部支付宝蓝大背景与功能区 -->
    <header class="alipay-header">
      <div class="alipay-top-bar">
        <div class="alipay-search">
          <span class="search-icon">🔍</span>
          <span class="search-ph">消费券 · 乘车码 · 医保电子凭证</span>
        </div>
        <button
          type="button"
          class="alipay-msg-btn"
          aria-label="消息"
          @click="showTip('暂无未读消息')"
        >
          🔔
        </button>
      </div>

      <!-- 四大核心快捷金刚入口 -->
      <div class="alipay-core-grid">
        <button type="button" class="core-item" @click="showScanner = true">
          <span class="core-icon">⛶</span>
          <span class="core-label">扫一扫</span>
        </button>
        <button type="button" class="core-item" @click="showPayCode = true">
          <span class="core-icon">▦</span>
          <span class="core-label">付钱/收钱</span>
        </button>
        <button type="button" class="core-item" @click="showTip('已自动出示杭州公共交通乘车码')">
          <span class="core-icon">🚌</span>
          <span class="core-label">出行</span>
        </button>
        <button type="button" class="core-item" @click="showTip('卡包已收纳 12 张会员卡与优惠券')">
          <span class="core-icon">🪪</span>
          <span class="core-label">卡包</span>
        </button>
      </div>
    </header>

    <!-- 主体可滚动区 -->
    <main class="alipay-body phone-scroll">
      <!-- 宫格服务区 -->
      <div class="alipay-service-card">
        <div class="service-grid">
          <button type="button" class="service-item" @click="showTip('转账功能已就绪')">
            <span class="service-icon" style="background: #e6f4ff; color: #1677ff">⇄</span>
            <span class="service-name">转账</span>
          </button>
          <button type="button" class="service-item" @click="showTip('信用卡本期账单已全部结清')">
            <span class="service-icon" style="background: #fff1f0; color: #f5222d">💳</span>
            <span class="service-name">信用卡还款</span>
          </button>
          <button type="button" class="service-item" @click="showTip('当前话费余额充沛 ¥96.50')">
            <span class="service-icon" style="background: #f6ffed; color: #52c41a">📱</span>
            <span class="service-name">充值中心</span>
          </button>
          <button type="button" class="service-item" @click="showTip('余额宝昨日收益 +¥3.28')">
            <span class="service-icon" style="background: #fff7e6; color: #fa8c16">📈</span>
            <span class="service-name">余额宝</span>
          </button>
          <button type="button" class="service-item" @click="showTip('花呗下期应还 ¥0.00')">
            <span class="service-icon" style="background: #e6f7ff; color: #1890ff">🌸</span>
            <span class="service-name">花呗</span>
          </button>
          <button type="button" class="service-item" @click="showTip('水费/电费/燃气费均无欠费')">
            <span class="service-icon" style="background: #f9f0ff; color: #722ed1">⚡</span>
            <span class="service-name">生活缴费</span>
          </button>
          <button type="button" class="service-item" @click="showTip('市民中心社保/公积金已绑定')">
            <span class="service-icon" style="background: #e6fffb; color: #13c2c2">🏛️</span>
            <span class="service-name">市民中心</span>
          </button>
          <button type="button" class="service-item" @click="showTip('更多 120+ 便民小程序')">
            <span class="service-icon" style="background: #f0f2f5; color: #595959">···</span>
            <span class="service-name">更多</span>
          </button>
        </div>
      </div>

      <!-- 蚂蚁森林绿色卡片 -->
      <section class="alipay-forest-card">
        <div class="forest-left">
          <div class="forest-badge">🌲 蚂蚁森林 · 绿色守护</div>
          <h4 class="forest-title">保护地巡护中 · 已累计减碳 42kg</h4>
          <p class="forest-sub">今日步行 8,420 步，已转化低碳能量</p>
        </div>
        <div class="forest-right">
          <button
            type="button"
            class="energy-bubble"
            :class="{ 'is-collected': collectedForest }"
            aria-label="收取能量"
            @click="collectEnergy"
          >
            <span class="energy-num">{{ collectedForest ? '✓' : `+${forestEnergy}g` }}</span>
            <span class="energy-label">{{ collectedForest ? '已收取' : '点我收取' }}</span>
          </button>
        </div>
      </section>

      <!-- 最近动态账单列表 -->
      <section class="alipay-bill-card">
        <div class="bill-card-head">
          <strong class="bill-title">近期账单明细</strong>
          <span class="bill-more">查看全部账单 ›</span>
        </div>

        <div class="bill-list">
          <div v-for="t in transactions" :key="t.id" class="bill-item">
            <div class="bill-avatar" :style="{ background: t.bg }">
              <span>{{ t.icon }}</span>
            </div>
            <div class="bill-info">
              <span class="bill-name">{{ t.title }}</span>
              <span class="bill-time">{{ t.time }} · {{ t.subtitle }}</span>
            </div>
            <span class="bill-amount" :class="{ 'is-income': t.isPositive }">
              {{ t.amount }}
            </span>
          </div>
        </div>
      </section>
    </main>

    <!-- 付款码弹窗 -->
    <Transition name="fade-scale">
      <div v-if="showPayCode" class="modal-mask" @click="showPayCode = false">
        <div class="paycode-card" @click.stop>
          <div class="paycode-head">
            <strong>向商家付款</strong>
            <button type="button" class="close-x" @click="showPayCode = false">✕</button>
          </div>
          <div class="barcode-box">
            <div class="barcode-lines" />
            <span class="barcode-num">6214 **** **** 8829</span>
          </div>
          <div class="qrcode-box">
            <div class="mock-qr" />
            <span class="qr-refresh">每分钟自动刷新 · 付款保护中</span>
          </div>
          <div class="paycode-channel">
            <span>优先扣款渠道：余额宝 (推荐) ›</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 扫一扫弹窗 -->
    <Transition name="fade-scale">
      <div v-if="showScanner" class="modal-mask" @click="showScanner = false">
        <div class="scanner-card" @click.stop>
          <div class="scanner-top">
            <strong>扫一扫 / 识物</strong>
            <button type="button" class="close-x" @click="showScanner = false">✕</button>
          </div>
          <div class="scan-frame">
            <div class="scan-laser" />
            <div class="scan-corner scan-corner--tl" />
            <div class="scan-corner scan-corner--tr" />
            <div class="scan-corner scan-corner--bl" />
            <div class="scan-corner scan-corner--br" />
          </div>
          <span class="scan-tip">将二维码 / 条形码放入框内即可自动扫描</span>
        </div>
      </div>
    </Transition>

    <!-- 交互轻提示 Toast -->
    <Transition name="toast">
      <div v-if="showToast" class="alipay-toast">
        {{ toastText }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.alipay-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f4f6f9;
  color: #1f2937;
  overflow: hidden;
  position: relative;
}

/* 顶部支付宝蓝 */
.alipay-header {
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  color: #ffffff;
  padding: 8px 14px 14px;
  flex: none;
}

.alipay-top-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.alipay-search {
  flex: 1;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
}

.search-ph {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alipay-msg-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #ffffff;
}

/* 四大金刚入口 */
.alipay-core-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.core-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
}

.core-icon {
  font-size: 26px;
  line-height: 1;
}

.core-label {
  font-size: 12.5px;
  font-weight: 500;
}

/* 身体卡片流 */
.alipay-body {
  flex: 1;
  padding: 10px 12px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 宫格服务卡 */
.alipay-service-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 8px 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 6px;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
}

.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 19px;
  font-weight: 600;
}

.service-name {
  font-size: 11.5px;
  color: #374151;
}

/* 蚂蚁森林卡片 */
.alipay-forest-card {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-radius: 16px;
  padding: 12px 14px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.forest-badge {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.9;
}

.forest-title {
  margin: 3px 0 2px;
  font-size: 13px;
  font-weight: 700;
}

.forest-sub {
  margin: 0;
  font-size: 10.5px;
  opacity: 0.8;
}

.energy-bubble {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  animation: pulse-energy 2s ease-in-out infinite;
}

.energy-bubble.is-collected {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  animation: none;
}

.energy-num {
  font-size: 11.5px;
  font-weight: 700;
}

.energy-label {
  font-size: 9px;
  opacity: 0.9;
}

@keyframes pulse-energy {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

/* 账单卡片 */
.alipay-bill-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.bill-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bill-title {
  font-size: 13.5px;
  color: #111827;
}

.bill-more {
  font-size: 11.5px;
  color: #6b7280;
  cursor: pointer;
}

.bill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bill-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bill-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex: none;
}

.bill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bill-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-time {
  font-size: 10.5px;
  color: #9ca3af;
}

.bill-amount {
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
}

.bill-amount.is-income {
  color: #16a34a;
}

/* 弹窗遮罩 */
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

.paycode-card,
.scanner-card {
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.paycode-head,
.scanner-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.close-x {
  background: #f3f4f6;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
}

.barcode-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 14px;
}

.barcode-lines {
  width: 85%;
  height: 48px;
  background: repeating-linear-gradient(
    90deg,
    #111827 0px,
    #111827 2px,
    transparent 2px,
    transparent 5px,
    #111827 5px,
    #111827 8px,
    transparent 8px,
    transparent 11px
  );
}

.barcode-num {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: #6b7280;
}

.qrcode-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.mock-qr {
  width: 140px;
  height: 140px;
  border: 4px solid #111827;
  padding: 6px;
  background-image:
    radial-gradient(#111827 2px, transparent 2px), radial-gradient(#111827 2px, transparent 2px);
  background-size: 8px 8px;
  background-position:
    0 0,
    4px 4px;
}

.qr-refresh {
  font-size: 10.5px;
  color: #9ca3af;
}

.paycode-channel {
  margin-top: 14px;
  font-size: 11.5px;
  color: #1677ff;
}

/* 扫一扫取景框 */
.scan-frame {
  width: 180px;
  height: 180px;
  border: 1px solid rgba(22, 119, 255, 0.4);
  position: relative;
  overflow: hidden;
  margin: 16px 0;
}

.scan-laser {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #1677ff, transparent);
  box-shadow: 0 0 10px #1677ff;
  animation: laser-scan 2s linear infinite;
}

@keyframes laser-scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

.scan-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: #1677ff;
  border-style: solid;
}

.scan-corner--tl {
  top: 0;
  left: 0;
  border-width: 3px 0 0 3px;
}

.scan-corner--tr {
  top: 0;
  right: 0;
  border-width: 3px 3px 0 0;
}

.scan-corner--bl {
  bottom: 0;
  left: 0;
  border-width: 0 0 3px 3px;
}

.scan-corner--br {
  bottom: 0;
  right: 0;
  border-width: 0 3px 3px 0;
}

.scan-tip {
  font-size: 11.5px;
  color: #6b7280;
}

/* 交互吐司 */
.alipay-toast {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.78);
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
