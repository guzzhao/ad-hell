import type { AppMeta } from '@/types/ad'

/**
 * 手机主屏上的 App。
 *
 * 两个分类刻意与现实倒置（prd.md R5）：
 * - `system`：现实中本不该有广告，演示里被广告攻陷；
 * - `commercial`：现实中广告最凶，演示里反而一个广告都没有。
 *
 * 这个反差本身就是论点：广告已经不满足于待在靠广告赚钱的 App 里了。
 */
export const APPS: readonly AppMeta[] = [
  // ── A 类：本来就该干干净净的 ──────────────────────────────
  { id: 'camera', name: '相机', category: 'system' },
  { id: 'alarm', name: '闹钟', category: 'system' },
  { id: 'calculator', name: '计算器', category: 'system' },
  { id: 'messages', name: '信息', category: 'system' },
  {
    id: 'dialer',
    name: '电话',
    category: 'system',
  },
  { id: 'settings', name: '设置', category: 'system' },

  // ── B 类：平时广告最多的 ──────────────────────────────────
  {
    id: 'video',
    name: '短视频',
    category: 'commercial',
    note: '这里一个广告都没有。',
  },
  {
    id: 'shop',
    name: '购物',
    category: 'commercial',
    note: '这里也一个广告都没有。',
  },
]

export const HOME_GROUP_TITLES = {
  system: '本来就该干干净净的',
  commercial: '平时广告最多的',
} as const

export function appsByCategory(category: AppMeta['category']): AppMeta[] {
  return APPS.filter((a) => a.category === category)
}
