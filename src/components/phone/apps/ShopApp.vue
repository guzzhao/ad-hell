<script setup lang="ts">
import { computed, ref } from 'vue'

interface Product {
  id: number
  name: string
  subtitle: string
  price: number
  origPrice: number
  category: string
  sales: string
  tag: string
  rating: string
  thumb: string
  gradient: string
}

const categories = ['精选推荐', '数码潮电', '品质居家', '户外运动', '美食生鲜']
const activeCategory = ref('精选推荐')

const products: Product[] = [
  {
    id: 1,
    name: '无线主动降噪耳机 Pro',
    subtitle: '48dB旗舰降噪 · 空间音频 · 40h超长续航',
    price: 399,
    origPrice: 499,
    category: '数码潮电',
    sales: '已售 2.8万+ 件',
    tag: '官方自营',
    rating: '4.9分 (1.2万条评价)',
    thumb: '🎧',
    gradient: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
  },
  {
    id: 2,
    name: '铝坨坨机械键盘 75配列',
    subtitle: '全CNC铝合金 · 气体垫片结构 · 三模热插拔',
    price: 269,
    origPrice: 329,
    category: '数码潮电',
    sales: '已售 1.4万+ 件',
    tag: '热销榜Top1',
    rating: '4.8分 (8900条评价)',
    thumb: '⌨️',
    gradient: 'linear-gradient(145deg, #334155 0%, #1e293b 100%)',
  },
  {
    id: 3,
    name: '纯棉水洗亚麻抱枕套',
    subtitle: '高克重棉麻 · 透气亲肤 · 极简原色生活',
    price: 49,
    origPrice: 69,
    category: '品质居家',
    sales: '已售 9800+ 件',
    tag: '质造优选',
    rating: '4.9分 (6200条评价)',
    thumb: '🛋️',
    gradient: 'linear-gradient(145deg, #2d3748 0%, #1a202c 100%)',
  },
  {
    id: 4,
    name: '日式手工粗陶马克杯',
    subtitle: '高温色釉烧制 · 原矿陶土 · 质感厚实温润',
    price: 58,
    origPrice: 78,
    category: '品质居家',
    sales: '已售 6200+ 件',
    tag: '匠人手作',
    rating: '4.8分 (3400条评价)',
    thumb: '☕',
    gradient: 'linear-gradient(145deg, #374151 0%, #1f2937 100%)',
  },
  {
    id: 5,
    name: '智能数显控温电热水壶',
    subtitle: '1.7L大容量 · 316L医用不锈钢 · 多段保温',
    price: 159,
    origPrice: 199,
    category: '品质居家',
    sales: '已售 1.9万+ 件',
    tag: '次日达',
    rating: '4.9分 (1.5万条评价)',
    thumb: '🫖',
    gradient: 'linear-gradient(145deg, #1f2937 0%, #111827 100%)',
  },
  {
    id: 6,
    name: '轻量化铝合金折叠露营桌',
    subtitle: '超强承重50kg · 蛋卷式收纳 · 防泼水易打理',
    price: 128,
    origPrice: 168,
    category: '户外运动',
    sales: '已售 8300+ 件',
    tag: '户外必备',
    rating: '4.7分 (4100条评价)',
    thumb: '⛺',
    gradient: 'linear-gradient(145deg, #293548 0%, #131c2a 100%)',
  },
]

const filteredProducts = computed(() => {
  if (activeCategory.value === '精选推荐') return products
  return products.filter((p) => p.category === activeCategory.value)
})

// 购物车状态
const cart = ref<{ product: Product; quantity: number }[]>([])
const showCartDrawer = ref(false)
const showToast = ref(false)
const toastMsg = ref('')

// 商品详情弹窗
const selectedProduct = ref<Product | null>(null)

const cartTotalCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))

const cartTotalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
)

function addToCart(p: Product, e?: MouseEvent): void {
  if (e) e.stopPropagation()
  const existing = cart.value.find((item) => item.product.id === p.id)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.value.push({ product: p, quantity: 1 })
  }
  toastMsg.value = `已加入: ${p.name}`
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 1600)
}

function updateCartQuantity(productId: number, delta: number): void {
  const index = cart.value.findIndex((item) => item.product.id === productId)
  if (index === -1) return
  cart.value[index]!.quantity += delta
  if (cart.value[index]!.quantity <= 0) {
    cart.value.splice(index, 1)
  }
}

function openDetail(p: Product): void {
  selectedProduct.value = p
}

function addSelectedToCartAndClose(): void {
  if (selectedProduct.value) {
    addToCart(selectedProduct.value)
    selectedProduct.value = null
  }
}

function buySelectedProduct(): void {
  if (selectedProduct.value) {
    addToCart(selectedProduct.value)
    selectedProduct.value = null
    showCartDrawer.value = true
  }
}
</script>

<template>
  <div class="shop-app">
    <!-- 顶部搜索导航 -->
    <header class="shop-header">
      <div class="shop-search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" placeholder="搜索精选好物、数码潮玩、品牌大促…" />
        <button type="button" class="search-btn">搜索</button>
      </div>

      <!-- 分类横向滑动条 -->
      <nav class="shop-cat-nav" aria-label="商品分类">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="cat-chip"
          :class="{ 'is-active': activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </nav>
    </header>

    <div class="shop-content phone-scroll">
      <!-- 官方运营活动大横幅 -->
      <section class="shop-hero-card" aria-label="品质焕新季">
        <div class="hero-left">
          <span class="hero-badge">品牌特惠 · 限时专享</span>
          <h2 class="hero-title">秋季品质焕新季</h2>
          <p class="hero-sub">官方自营保障 · 每满200减30 · 极速次日达</p>
        </div>
        <div class="hero-right" aria-hidden="true">
          <span class="hero-gift-icon">🎁</span>
        </div>
      </section>

      <!-- 快捷功能金刚区 -->
      <div class="shop-portals">
        <button type="button" class="portal-item">
          <span class="portal-icon">🎫</span>
          <span class="portal-label">领大额券</span>
        </button>
        <button type="button" class="portal-item">
          <span class="portal-icon">⚡</span>
          <span class="portal-label">限时秒杀</span>
        </button>
        <button type="button" class="portal-item">
          <span class="portal-icon">🏆</span>
          <span class="portal-label">热卖榜单</span>
        </button>
        <button type="button" class="portal-item">
          <span class="portal-icon">📦</span>
          <span class="portal-label">顺丰自营</span>
        </button>
      </div>

      <!-- 双列瀑布流商品卡片 -->
      <section class="shop-section">
        <div class="section-header">
          <span class="section-title">今日优选好物</span>
          <span class="section-filter">品质溯源 · 官方认证</span>
        </div>

        <div class="shop-grid">
          <article
            v-for="item in filteredProducts"
            :key="item.id"
            class="product-card"
            @click="openDetail(item)"
          >
            <!-- 商品大图 -->
            <div class="product-thumb" :style="{ background: item.gradient }">
              <span class="thumb-emoji">{{ item.thumb }}</span>
              <span class="product-tag">{{ item.tag }}</span>
            </div>

            <!-- 商品文字信息 -->
            <div class="product-info">
              <strong class="product-name">{{ item.name }}</strong>
              <p class="product-sub">{{ item.subtitle }}</p>

              <!-- 价格与加购栏 -->
              <div class="product-foot">
                <div class="price-box">
                  <span class="currency">¥</span>
                  <span class="price-num">{{ item.price }}</span>
                  <span class="orig-price">¥{{ item.origPrice }}</span>
                </div>
                <button
                  type="button"
                  class="add-cart-btn"
                  aria-label="加入购物车"
                  @click.stop="addToCart(item, $event)"
                >
                  +
                </button>
              </div>

              <div class="sales-row">
                <span class="sales-text">{{ item.sales }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- 底部悬浮购物车栏入口 -->
    <div v-if="cartTotalCount > 0" class="shop-cart-pill" @click="showCartDrawer = true">
      <div class="cart-pill-left">
        <span class="cart-icon">🛒</span>
        <span class="cart-badge">{{ cartTotalCount }}</span>
        <span class="cart-total-text">合计: ¥{{ cartTotalPrice }}</span>
      </div>
      <button type="button" class="cart-checkout-btn">去结算 ›</button>
    </div>

    <!-- 购物车抽屉半屏弹窗 -->
    <Transition name="drawer">
      <div
        v-if="showCartDrawer"
        class="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="购物车清单"
      >
        <div class="drawer-head">
          <strong>已选商品 ({{ cartTotalCount }})</strong>
          <button type="button" class="drawer-close-btn" @click="showCartDrawer = false">✕</button>
        </div>

        <div class="cart-items phone-scroll">
          <div v-for="item in cart" :key="item.product.id" class="cart-row">
            <span class="cart-row-thumb">{{ item.product.thumb }}</span>
            <div class="cart-row-info">
              <span class="cart-row-name">{{ item.product.name }}</span>
              <span class="cart-row-price">¥{{ item.product.price }}</span>
            </div>
            <div class="cart-stepper">
              <button
                type="button"
                class="step-btn"
                @click="updateCartQuantity(item.product.id, -1)"
              >
                −
              </button>
              <span class="step-num">{{ item.quantity }}</span>
              <button
                type="button"
                class="step-btn"
                @click="updateCartQuantity(item.product.id, 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="drawer-bottom">
          <div class="bottom-total">
            <span class="total-label">实付预估:</span>
            <span class="total-amount">¥{{ cartTotalPrice }}</span>
          </div>
          <button type="button" class="pay-btn" @click="showCartDrawer = false">
            立即下单 (免运费)
          </button>
        </div>
      </div>
    </Transition>

    <!-- 商品详情全屏弹窗 -->
    <Transition name="fade">
      <div v-if="selectedProduct" class="product-modal" @click="selectedProduct = null">
        <div class="modal-card" @click.stop>
          <button type="button" class="modal-close" @click="selectedProduct = null">✕</button>
          <div class="modal-thumb" :style="{ background: selectedProduct.gradient }">
            <span class="modal-emoji">{{ selectedProduct.thumb }}</span>
            <span class="modal-tag">{{ selectedProduct.tag }}</span>
          </div>
          <div class="modal-body">
            <div class="modal-price-row">
              <span class="modal-price">¥{{ selectedProduct.price }}</span>
              <span class="modal-orig">原价 ¥{{ selectedProduct.origPrice }}</span>
              <span class="modal-sales">{{ selectedProduct.sales }}</span>
            </div>
            <h3 class="modal-title">{{ selectedProduct.name }}</h3>
            <p class="modal-desc">{{ selectedProduct.subtitle }}</p>
            <div class="modal-rating">
              <span>🌟 {{ selectedProduct.rating }}</span>
              <span class="modal-service">顺丰包邮 · 7天无理由</span>
            </div>
          </div>
          <div class="modal-foot">
            <button type="button" class="modal-add-btn" @click="addSelectedToCartAndClose">
              加入购物车
            </button>
            <button type="button" class="modal-buy-btn" @click="buySelectedProduct">
              立即购买
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 加入购物车轻提示 Toast -->
    <Transition name="toast">
      <div v-if="showToast" class="shop-toast" aria-live="polite">
        <span>✓ {{ toastMsg }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.shop-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #ffffff;
  background: #0d1117;
  overflow: hidden;
  user-select: none;
}

/* 顶部搜索栏与分类 */
.shop-header {
  padding: 8px 14px 6px;
  background: #161b22;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.shop-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.search-icon {
  font-size: 12px;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 11.5px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-btn {
  padding: 3px 10px;
  border-radius: 999px;
  background: #f59e0b;
  color: #111827;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.shop-cat-nav {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 10px 2px 2px;
  scrollbar-width: none;
}

.shop-cat-nav::-webkit-scrollbar {
  display: none;
}

.cat-chip {
  flex: none;
  padding: 4px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cat-chip.is-active {
  background: #f59e0b;
  color: #0f172a;
  font-weight: 700;
}

/* 主内容区 */
.shop-content {
  flex: 1;
  padding: 12px 14px 70px;
  overflow-y: auto;
}

/* 运营大卡 */
.shop-hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #b45309 0%, #78350f 100%);
  border: 1px solid rgba(251, 191, 36, 0.25);
  box-shadow: 0 10px 24px -8px rgba(180, 83, 9, 0.4);
  margin-bottom: 14px;
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hero-badge {
  display: inline-block;
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: #fef3c7;
  width: fit-content;
}

.hero-title {
  margin: 3px 0 0;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.hero-sub {
  margin: 0;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.85);
}

.hero-gift-icon {
  font-size: 34px;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4));
}

/* 金刚区 */
.shop-portals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.portal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.15s ease;
}

.portal-item:active {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.96);
}

.portal-icon {
  font-size: 20px;
}

.portal-label {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

/* 商品区 */
.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.section-filter {
  font-size: 10.5px;
  color: #f59e0b;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.product-card {
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  background: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.product-card:active {
  transform: scale(0.98);
}

.product-thumb {
  position: relative;
  display: grid;
  place-items: center;
  height: 100px;
  overflow: hidden;
}

.thumb-emoji {
  font-size: 42px;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
}

.product-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 1.5px 6px;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.9);
  color: #111827;
  font-size: 9px;
  font-weight: 700;
}

.product-info {
  display: flex;
  flex-direction: column;
  padding: 9px 10px 10px;
  gap: 4px;
}

.product-name {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-sub {
  margin: 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 11px;
  font-weight: 700;
  color: #f59e0b;
}

.price-num {
  font-size: 15px;
  font-weight: 800;
  color: #f59e0b;
}

.orig-price {
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: line-through;
  margin-left: 3px;
}

.add-cart-btn {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f59e0b;
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.add-cart-btn:active {
  transform: scale(0.85);
}

.sales-row {
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.4);
}

/* 底部悬浮购物车栏 */
.shop-cart-pill {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid rgba(245, 158, 11, 0.4);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(16px);
  cursor: pointer;
  animation: slide-up 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.cart-pill-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-icon {
  font-size: 18px;
}

.cart-badge {
  padding: 1px 6px;
  border-radius: 999px;
  background: #ef4444;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
}

.cart-total-text {
  font-size: 12.5px;
  font-weight: 700;
  color: #f59e0b;
}

.cart-checkout-btn {
  padding: 6px 14px;
  border-radius: 999px;
  background: #f59e0b;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* 购物车抽屉 */
.cart-drawer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 70%;
  z-index: 50;
  display: flex;
  flex-direction: column;
  background: #161b22;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -10px 35px rgba(0, 0, 0, 0.7);
  padding: 16px 16px calc(14px + env(safe-area-inset-bottom, 0px));
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13.5px;
}

.drawer-close-btn {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}

.cart-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-row-thumb {
  font-size: 26px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
}

.cart-row-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-row-name {
  font-size: 12px;
  font-weight: 600;
}

.cart-row-price {
  font-size: 12px;
  color: #f59e0b;
  font-weight: 700;
}

.cart-stepper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
}

.step-btn {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.step-num {
  font-size: 12px;
  font-weight: 600;
  min-width: 14px;
  text-align: center;
}

.drawer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.bottom-total {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.total-amount {
  font-size: 17px;
  font-weight: 800;
  color: #f59e0b;
}

.pay-btn {
  padding: 8px 18px;
  border-radius: 999px;
  background: #f59e0b;
  color: #0f172a;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

/* 详情浮层 */
.product-modal {
  position: absolute;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(14px);
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 320px;
  border-radius: 20px;
  background: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  font-size: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.modal-thumb {
  position: relative;
  height: 160px;
  display: grid;
  place-items: center;
}

.modal-emoji {
  font-size: 64px;
}

.modal-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 2px 7px;
  border-radius: 4px;
  background: #f59e0b;
  color: #0f172a;
  font-size: 10px;
  font-weight: 700;
}

.modal-body {
  padding: 14px 16px;
}

.modal-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.modal-price {
  font-size: 20px;
  font-weight: 800;
  color: #f59e0b;
}

.modal-orig {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: line-through;
}

.modal-sales {
  margin-left: auto;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.45);
}

.modal-title {
  margin: 6px 0 3px;
  font-size: 14.5px;
  font-weight: 700;
}

.modal-desc {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.65);
}

.modal-rating {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #ffd54a;
}

.modal-service {
  color: rgba(255, 255, 255, 0.45);
}

.modal-foot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-add-btn,
.modal-buy-btn {
  height: 38px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.modal-add-btn {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.modal-buy-btn {
  background: #f59e0b;
  color: #0f172a;
}

/* Toast 提示 */
.shop-toast {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 80;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.95);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
