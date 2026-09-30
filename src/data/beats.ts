import type { StormBeat } from '@/types/ad'

/**
 * 风暴剧本。
 *
 * 全屏接管广告**不能**交给 `spawnOne()` 随机生成，原因有两条：
 *   1. 随机上演意味着"这一遍可能看不到来电广告"，AC15 / AC16 就无法稳定验收；
 *   2. 什么时候上演会取决于种子，体验不可复现。
 *
 * 所以这里用一张固定的小表：第几毫秒上演哪条素材。
 * 节拍表是**数据**——将来要加"全屏视频广告"之类的演出，加一行即可。
 *
 * 当前两拍相隔 18 秒，而接管广告的生命周期上限是 12 秒（`STORM.takeoverMaxMs`），
 * 因此两者不会重叠。真要重叠了也不会出事：`spawnTakeover` 会让新的那一拍让位。
 */
export const BEATS: readonly StormBeat[] = [
  { atMs: 14_000, creativeId: 'call-loan-service' },
  { atMs: 32_000, creativeId: 'call-health-agent' },
]
