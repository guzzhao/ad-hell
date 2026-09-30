/**
 * 手机视口的逻辑尺寸（CSS px）。
 *
 * 这是全局唯一的坐标系基准：所有弹窗位置与尺寸都表达为该坐标系内的百分比，
 * 因此"移动端全屏"与"桌面样机"两种形态能共用同一份广告数据。
 * 改这里必须同步改 `src/styles/phone.css` 里的 `--phone-w` / `--phone-h`。
 */
export const PHONE_W = 390
export const PHONE_H = 844

/** 桌面样机四周保留的呼吸空间（px），参与缩放系数计算。 */
export const SHELL_MARGIN = 48

/** 缩放系数下限，避免可用空间异常时把样机缩到看不见。 */
export const SHELL_MIN_SCALE = 0.4

/** 超过这个宽度就切到"桌面样机"形态；否则是"移动端全屏手机"。 */
export const DESKTOP_BREAKPOINT_PX = 768
