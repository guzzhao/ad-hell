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
  <div class="flex flex-col h-full bg-[#f4f5f7] text-[#1f2937] overflow-hidden relative">
    <!-- 顶部搜索导航 -->
    <header class="bg-white px-3.5 pt-2 pb-2 shrink-0 border-b border-gray-200/80 shadow-xs z-10">
      <div
        class="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-500"
      >
        <span>🔍</span>
        <input
          type="text"
          class="bg-transparent border-none outline-none flex-1 text-xs text-gray-800 placeholder-gray-400"
          placeholder="搜索精选好物、数码潮玩、品牌大促…"
        />
        <button
          type="button"
          class="px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[11px] font-medium cursor-pointer"
        >
          搜索
        </button>
      </div>

      <!-- 分类横向滑动条 -->
      <nav class="flex gap-2 overflow-x-auto mt-2 no-scrollbar" aria-label="商品分类">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="px-2.5 py-1 rounded-full text-xs text-gray-600 whitespace-nowrap cursor-pointer transition-all"
          :class="{ '!bg-orange-500 !text-white !font-semibold': activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </nav>
    </header>

    <div class="flex-1 px-3 py-3 phone-scroll flex flex-col gap-3 pb-20">
      <!-- 官方运营活动大横幅 -->
      <section
        class="rounded-2xl p-3.5 bg-gradient-to-r from-orange-500 via-rose-500 to-red-500 text-white flex justify-between items-center shadow-sm"
        aria-label="品质焕新季"
      >
        <div>
          <span
            class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/20 text-orange-100 mb-1 inline-block"
            >品牌特惠 · 限时专享</span
          >
          <h2 class="text-base font-bold m-0 mb-0.5">秋季品质焕新季</h2>
          <p class="text-[11px] text-white/80 m-0">官方自营保障 · 每满200减30 · 极速次日达</p>
        </div>
        <div aria-hidden="true">
          <span class="text-4xl">🎁</span>
        </div>
      </section>

      <!-- 快捷功能金刚区 -->
      <div class="grid grid-cols-4 gap-2 bg-white rounded-2xl p-2.5 shadow-sm">
        <button type="button" class="flex flex-col items-center gap-1 cursor-pointer">
          <span
            class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-orange-50 text-orange-600"
            >🎫</span
          >
          <span class="text-[11px] text-gray-700">领大额券</span>
        </button>
        <button type="button" class="flex flex-col items-center gap-1 cursor-pointer">
          <span
            class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-orange-50 text-orange-600"
            >⚡</span
          >
          <span class="text-[11px] text-gray-700">限时秒杀</span>
        </button>
        <button type="button" class="flex flex-col items-center gap-1 cursor-pointer">
          <span
            class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-orange-50 text-orange-600"
            >🏆</span
          >
          <span class="text-[11px] text-gray-700">热卖榜单</span>
        </button>
        <button type="button" class="flex flex-col items-center gap-1 cursor-pointer">
          <span
            class="w-10 h-10 rounded-xl grid place-items-center text-lg bg-orange-50 text-orange-600"
            >📦</span
          >
          <span class="text-[11px] text-gray-700">顺丰自营</span>
        </button>
      </div>

      <!-- 双列瀑布流商品卡片 -->
      <section class="flex flex-col gap-2.5">
        <div class="flex justify-between items-center px-1">
          <span class="text-xs font-bold text-gray-800">今日优选好物</span>
          <span class="text-[10.5px] text-gray-400">品质溯源 · 官方认证</span>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <article
            v-for="item in filteredProducts"
            :key="item.id"
            class="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100/80 flex flex-col cursor-pointer group"
            @click="openDetail(item)"
          >
            <!-- 商品大图 -->
            <div
              class="aspect-square relative grid place-items-center select-none overflow-hidden"
              :style="{ background: item.gradient }"
            >
              <span class="text-5xl group-hover:scale-105 transition-transform">{{
                item.thumb
              }}</span>
              <span
                class="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-600 text-white shadow-xs"
                >{{ item.tag }}</span
              >
            </div>

            <!-- 商品文字信息 -->
            <div class="p-2.5 flex flex-col flex-1 justify-between">
              <div>
                <strong class="text-xs font-semibold text-gray-800 line-clamp-1 block">{{
                  item.name
                }}</strong>
                <p class="text-[10.5px] text-gray-400 line-clamp-1 mt-0.5 mb-2">
                  {{ item.subtitle }}
                </p>
              </div>

              <!-- 价格与加购栏 -->
              <div>
                <div class="flex justify-between items-center mt-auto">
                  <div class="flex items-baseline gap-0.5">
                    <span class="text-xs text-red-600 font-bold">¥</span>
                    <span class="text-base text-red-600 font-bold font-mono">{{ item.price }}</span>
                    <span class="text-[10px] text-gray-400 line-through ml-1"
                      >¥{{ item.origPrice }}</span
                    >
                  </div>
                  <button
                    type="button"
                    class="w-6 h-6 rounded-full bg-red-600 text-white font-bold grid place-items-center text-sm cursor-pointer active:scale-90 transition-transform"
                    aria-label="加入购物车"
                    @click.stop="addToCart(item, $event)"
                  >
                    +
                  </button>
                </div>

                <div class="mt-1.5 text-[9.5px] text-gray-400">
                  <span>{{ item.sales }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- 底部悬浮购物车栏入口 -->
    <div
      v-if="cartTotalCount > 0"
      class="absolute bottom-4 inset-x-4 h-12 rounded-full bg-gray-900/95 backdrop-blur-md text-white px-4 flex items-center justify-between z-30 shadow-xl cursor-pointer"
      @click="showCartDrawer = true"
    >
      <div class="flex items-center gap-2">
        <span class="text-lg">🛒</span>
        <span
          class="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none"
          >{{ cartTotalCount }}</span
        >
        <span class="text-xs font-semibold ml-1">合计: ¥{{ cartTotalPrice }}</span>
      </div>
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold cursor-pointer active:scale-95"
      >
        去结算 ›
      </button>
    </div>

    <!-- 购物车抽屉半屏弹窗 -->
    <Transition
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="translate-y-full opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showCartDrawer"
        class="absolute inset-x-0 bottom-0 max-h-[75%] rounded-t-3xl bg-white shadow-2xl z-50 flex flex-col p-4"
        role="dialog"
        aria-modal="true"
        aria-label="购物车清单"
      >
        <div class="flex justify-between items-center pb-3 border-b border-gray-100 text-sm">
          <strong>已选商品 ({{ cartTotalCount }})</strong>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-gray-100 grid place-items-center text-xs text-gray-500 cursor-pointer"
            @click="showCartDrawer = false"
          >
            ✕
          </button>
        </div>

        <div class="flex-1 my-2 overflow-y-auto flex flex-col gap-2.5 max-h-60 phone-scroll">
          <div
            v-for="item in cart"
            :key="item.product.id"
            class="flex items-center gap-2.5 py-1 border-b border-gray-50 last:border-none"
          >
            <span class="text-2xl w-8 h-8 rounded-lg bg-gray-50 grid place-items-center">{{
              item.product.thumb
            }}</span>
            <div class="flex-1 flex flex-col min-w-0">
              <span class="text-xs font-medium text-gray-800 truncate">{{
                item.product.name
              }}</span>
              <span class="text-xs font-bold text-red-600 font-mono"
                >¥{{ item.product.price }}</span
              >
            </div>
            <div class="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-0.5">
              <button
                type="button"
                class="text-xs text-gray-600 font-bold px-1 cursor-pointer"
                @click="updateCartQuantity(item.product.id, -1)"
              >
                −
              </button>
              <span class="text-xs font-mono font-semibold">{{ item.quantity }}</span>
              <button
                type="button"
                class="text-xs text-gray-600 font-bold px-1 cursor-pointer"
                @click="updateCartQuantity(item.product.id, 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">实付预估:</span>
            <span class="text-base font-bold text-red-600 font-mono">¥{{ cartTotalPrice }}</span>
          </div>
          <button
            type="button"
            class="w-full h-10 rounded-full bg-red-600 text-white text-sm font-semibold cursor-pointer active:bg-red-700"
            @click="showCartDrawer = false"
          >
            立即下单 (免运费)
          </button>
        </div>
      </div>
    </Transition>

    <!-- 商品详情全屏弹窗 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="selectedProduct"
        class="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm grid place-items-center p-4"
        @click="selectedProduct = null"
      >
        <div
          class="w-full max-w-[340px] bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
          @click.stop
        >
          <button
            type="button"
            class="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/40 text-white grid place-items-center text-xs cursor-pointer"
            @click="selectedProduct = null"
          >
            ✕
          </button>
          <div
            class="aspect-square relative grid place-items-center text-8xl"
            :style="{ background: selectedProduct.gradient }"
          >
            <span>{{ selectedProduct.thumb }}</span>
            <span
              class="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded bg-orange-600 text-white"
              >{{ selectedProduct.tag }}</span
            >
          </div>
          <div class="p-4 flex flex-col gap-2">
            <div class="flex items-baseline gap-2">
              <span class="text-xl font-bold text-red-600 font-mono"
                >¥{{ selectedProduct.price }}</span
              >
              <span class="text-xs text-gray-400 line-through"
                >原价 ¥{{ selectedProduct.origPrice }}</span
              >
              <span class="ml-auto text-xs text-gray-400">{{ selectedProduct.sales }}</span>
            </div>
            <h3 class="text-sm font-bold text-gray-900 m-0">{{ selectedProduct.name }}</h3>
            <p class="text-xs text-gray-500 m-0 leading-relaxed">{{ selectedProduct.subtitle }}</p>
            <div
              class="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100"
            >
              <span>🌟 {{ selectedProduct.rating }}</span>
              <span class="text-emerald-600">顺丰包邮 · 7天无理由</span>
            </div>
          </div>
          <div class="p-4 pt-0 flex gap-2">
            <button
              type="button"
              class="flex-1 h-10 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold cursor-pointer active:bg-orange-200"
              @click="addSelectedToCartAndClose"
            >
              加入购物车
            </button>
            <button
              type="button"
              class="flex-1 h-10 rounded-full bg-red-600 text-white text-xs font-semibold cursor-pointer active:bg-red-700"
              @click="buySelectedProduct"
            >
              立即购买
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 加入购物车轻提示 Toast -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showToast"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 text-white px-4 py-2 rounded-full text-xs z-[60] pointer-events-none"
        aria-live="polite"
      >
        <span>✓ {{ toastMsg }}</span>
      </div>
    </Transition>
  </div>
</template>
