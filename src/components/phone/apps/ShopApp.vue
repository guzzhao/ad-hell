<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStormStore } from '@/stores/storm'

const storm = useStormStore()
const showCouponModal = ref(true)

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
  isAd?: boolean
  adCta?: string
}

const categories = ['精选推荐', '数码潮电', '品质居家', '户外运动', '美食生鲜']
const activeCategory = ref('精选推荐')

const promoBanners = [
  {
    platform: '京选速达',
    tag: '广告 · 百亿补贴狂欢',
    title: '京选数码大促：正品直降 1000 元',
    sub: '次日必达 · 假一赔十 · 享24期免息 ›',
    icon: '⚡',
    gradient: 'from-red-600 via-rose-600 to-amber-600',
  },
  {
    platform: '拼一拼优选',
    tag: '广告 · 9.9 包邮专场',
    title: '秋季拼一拼：食品生鲜 9.9 元抢购',
    sub: '顺丰直达 · 坏果包赔 · 领券立减 ›',
    icon: '🥜',
    gradient: 'from-orange-500 via-amber-500 to-red-500',
  },
  {
    platform: '淘得乐工厂',
    tag: '广告 · 工厂源头直发',
    title: '淘得乐产业带：全场 1 元起包邮',
    sub: '无中间商赚差价 · 7天无理由退换 ›',
    icon: '🏭',
    gradient: 'from-orange-600 via-rose-500 to-purple-600',
  },
  {
    platform: '唯享特卖会',
    tag: '广告 · 名牌断码 1 折',
    title: '唯享大牌清仓：轻奢服饰 1 折起',
    sub: '专柜直发 · 支持验货 · 今日截单 ›',
    icon: '🏷️',
    gradient: 'from-pink-600 via-fuchsia-600 to-purple-700',
  },
]
const activeBannerIdx = ref(0)
let bannerTimer: number | null = null
onMounted(() => {
  bannerTimer = window.setInterval(() => {
    activeBannerIdx.value = (activeBannerIdx.value + 1) % promoBanners.length
  }, 4000)
})
onUnmounted(() => {
  if (bannerTimer) clearInterval(bannerTimer)
})
const currentBanner = computed(() => promoBanners[activeBannerIdx.value] ?? promoBanners[0]!)

const products: Product[] = [
  {
    id: 101,
    name: '【拼一拼优选】9.9 包邮巨无霸坚果大礼包',
    subtitle: '整整10大包 · 顺丰直达 · 今日前100名免单',
    price: 9.9,
    origPrice: 99,
    category: '美食生鲜',
    sales: '已抢 12.8万+ 件',
    tag: '广告 · 拼一拼',
    rating: '5.0分 (4.8万条好评)',
    thumb: '🥜',
    gradient: 'linear-gradient(145deg, #78350f 0%, #451a03 100%)',
    isAd: true,
    adCta: '9.9元立即拼',
  },
  {
    id: 102,
    name: '【京选速达】百亿补贴 旗舰级主动降噪耳机',
    subtitle: '正品现货 · 次日必达 · 假一赔十 · 24期免息',
    price: 199,
    origPrice: 699,
    category: '数码潮电',
    sales: '已抢 8.6万+ 件',
    tag: '广告 · 京选自营',
    rating: '4.9分 (3.2万条好评)',
    thumb: '🎧',
    gradient: 'linear-gradient(145deg, #7f1d1d 0%, #450a0a 100%)',
    isAd: true,
    adCta: '立省500抢',
  },
  {
    id: 103,
    name: '【淘得乐工厂】源头直供 19.9 元纯棉加厚卫衣',
    subtitle: '产地直发 · 无中间商赚差价 · 破损全包赔',
    price: 19.9,
    origPrice: 129,
    category: '品质居家',
    sales: '已售 32.1万+ 件',
    tag: '广告 · 淘得乐直销',
    rating: '4.8分 (1.8万条好评)',
    thumb: '👕',
    gradient: 'linear-gradient(145deg, #7c2d12 0%, #431407 100%)',
    isAd: true,
    adCta: '工厂价秒杀',
  },
  {
    id: 104,
    name: '【聚省省拼购】0 元免费领 智能多功能电饭煲',
    subtitle: '已砍99.9% · 仅差0.01颗金币 · 邀好友立即提货',
    price: 0,
    origPrice: 299,
    category: '品质居家',
    sales: '已免费提走 5.4万+ 台',
    tag: '广告 · 砍价免费拿',
    rating: '4.9分 (9200条好评)',
    thumb: '🍚',
    gradient: 'linear-gradient(145deg, #701a75 0%, #4a044e 100%)',
    isAd: true,
    adCta: '0元立即提货',
  },
  {
    id: 105,
    name: '【唯享名牌特卖】法国高定轻奢羊毛大衣',
    subtitle: '专柜断码清仓 1折起 · 100%正品专柜验货',
    price: 188,
    origPrice: 1880,
    category: '户外运动',
    sales: '仅剩最后 17 件',
    tag: '广告 · 唯享大牌特卖',
    rating: '5.0分 (6400条好评)',
    thumb: '🧥',
    gradient: 'linear-gradient(145deg, #831843 0%, #500724 100%)',
    isAd: true,
    adCta: '1折进场抢',
  },
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
      <!-- 多电商平台联合大促横幅 (轮播) -->
      <section
        class="rounded-2xl p-3.5 text-white flex justify-between items-center shadow-sm cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all bg-gradient-to-r"
        :class="currentBanner.gradient"
        aria-label="电商大促专区"
        @click="storm.tapAdBody(currentBanner.platform)"
      >
        <div class="min-w-0 pr-2">
          <div class="flex items-center gap-1.5 mb-1">
            <span
              class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/25 text-white inline-block shrink-0"
              >{{ currentBanner.tag }}</span
            >
            <span class="text-[10px] opacity-75 truncate">电商联名特惠</span>
          </div>
          <h2 class="text-base font-bold m-0 mb-0.5 truncate">{{ currentBanner.title }}</h2>
          <p class="text-[11px] text-white/85 m-0 truncate">{{ currentBanner.sub }}</p>
        </div>
        <div aria-hidden="true" class="shrink-0 flex flex-col items-center">
          <span class="text-3xl">{{ currentBanner.icon }}</span>
          <div class="flex gap-1 mt-1.5">
            <span
              v-for="(_, i) in promoBanners"
              :key="i"
              class="w-1.5 h-1.5 rounded-full transition-all"
              :class="i === activeBannerIdx ? 'bg-white scale-125' : 'bg-white/40'"
            />
          </div>
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

    <!-- 进店首屏弹出：新人专享 888 元拼团大礼包 (带微小假关闭键) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-90"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="storm.adsEnabled && showCouponModal"
        class="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-5 select-none"
        @click.self="showCouponModal = false"
      >
        <div
          class="relative w-full max-w-[280px] rounded-3xl bg-gradient-to-b from-red-600 via-rose-600 to-amber-600 p-5 text-white text-center shadow-2xl border border-yellow-300/40"
        >
          <!-- 极小隐蔽关闭键 -->
          <button
            type="button"
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 text-[10px] text-white/50 hover:text-white grid place-items-center cursor-pointer"
            aria-label="关闭"
            @click="showCouponModal = false"
          >
            ✕
          </button>

          <span class="text-4xl block my-1">🧧</span>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-300 text-red-900 uppercase"
          >
            限时 10 分钟失效
          </span>
          <h3 class="text-base font-extrabold text-yellow-100 mt-2">恭喜获得多电商 888 元神券</h3>
          <p class="text-[11px] text-yellow-200/90 mt-0.5">
            京选速达 · 淘得乐 · 拼一拼 · 唯享特卖通用
          </p>

          <div class="my-3 space-y-1.5 text-left">
            <div
              class="py-1.5 px-2.5 rounded-xl bg-black/25 border border-yellow-300/25 flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-1.5">
                <span class="text-sm">⚡</span>
                <span class="text-yellow-200 font-medium">【京选速达】数码直减 200 元</span>
              </div>
              <span class="text-yellow-300 font-extrabold">待激活</span>
            </div>
            <div
              class="py-1.5 px-2.5 rounded-xl bg-black/25 border border-yellow-300/25 flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-1.5">
                <span class="text-sm">🥜</span>
                <span class="text-yellow-200 font-medium">【拼一拼】9.9 元食品无门槛</span>
              </div>
              <span class="text-yellow-300 font-extrabold">待激活</span>
            </div>
            <div
              class="py-1.5 px-2.5 rounded-xl bg-black/25 border border-yellow-300/25 flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-1.5">
                <span class="text-sm">🏷️</span>
                <span class="text-yellow-200 font-medium">【唯享特卖】大牌专柜 100 元券</span>
              </div>
              <span class="text-yellow-300 font-extrabold">待激活</span>
            </div>
          </div>

          <button
            type="button"
            class="w-full py-2.5 rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-red-950 font-black text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            @click="storm.tapAdBody('shop-luxury')"
          >
            一键领取全部礼券 ›
          </button>
          <span class="block mt-2 text-[9px] text-white/50">广告 · 点击领取将唤起合作活动</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
