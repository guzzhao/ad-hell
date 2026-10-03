import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { useStormStore } from '@/stores/storm'

/**
 * App 级冒烟测试。
 *
 * jsdom 没有实现 ResizeObserver 与 matchMedia，而 DeviceShell / useReducedMotion
 * 都要用它们，所以必须补最小桩，否则挂载就会抛错。
 */
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

function matchMediaStub(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }
}

const matchMediaMock = vi.fn<(query: string) => MediaQueryList>(matchMediaStub)

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  vi.stubGlobal('matchMedia', matchMediaMock)
})

describe('App 冒烟测试', () => {
  it('挂载后自动进入风暴，而不是停在开场', () => {
    const wrapper = mount(App)
    const storm = useStormStore()

    // 这一条曾经真的漏掉过：useStormLoop 只点了 rAF 循环，没人调用 storm.start()，
    // 结果页面永远停在 boot，一个广告都不弹。
    expect(storm.phase).toBe('storm')
    expect(wrapper.find('.phone-screen').exists()).toBe(true)
    expect(wrapper.find('.ad-layer').exists()).toBe(true)

    wrapper.unmount()
  })

  it('主循环真的在推进风暴，并且夹紧了单帧步长', async () => {
    const wrapper = mount(App)
    const storm = useStormStore()

    // store 的单测是直接调 advance(100) 的，绕过了主循环；这一条专门补上那段集成，
    // 保证 rAF 真的接上了 store，而且 MAX_FRAME_MS 的夹紧在换实现之后仍然生效。
    const advance = vi.spyOn(storm, 'advance')

    await new Promise((resolve) => setTimeout(resolve, 120))

    expect(advance).toHaveBeenCalled()

    const deltas = advance.mock.calls.map(([dt]) => dt)
    expect(deltas.length).toBeGreaterThan(0)
    // 每一帧都必须落在 [0, 100]：切后台回来的那种巨大 delta 会被夹掉
    for (const dt of deltas) {
      expect(dt).toBeGreaterThanOrEqual(0)
      expect(dt).toBeLessThanOrEqual(100)
    }
    // 至少有一帧确实推进了时间，否则循环只是在空转
    expect(deltas.some((dt) => dt > 0)).toBe(true)

    advance.mockRestore()
    wrapper.unmount()
  })

  it('主屏呈现真实手机桌面，且不包含说教口号文案', () => {
    const wrapper = mount(App)
    const text = wrapper.text()

    // 真实应用齐全
    expect(text).toContain('相机')
    expect(text).toContain('设置')
    expect(text).toContain('短视频')
    expect(text).toContain('购物')

    // 严禁出现破坏真实感的口号文案
    expect(text).not.toContain('本来就该干干净净的')
    expect(text).not.toContain('平时广告最多的')
    expect(text).not.toContain('一个广告都没有')
    expect(text).not.toContain('探索模式')

    wrapper.unmount()
  })

  it('打开短视频应用后能够返回主屏', async () => {
    const wrapper = mount(App)
    const storm = useStormStore()
    await nextTick()

    // 找到短视频图标并点击
    const videoBtn = wrapper.findAll('button').find((b) => b.text().includes('短视频'))
    expect(videoBtn?.exists()).toBe(true)
    await videoBtn!.trigger('click')
    await nextTick()

    // 关闭可能弹出的开屏广告
    storm.closeAllAds()
    await nextTick()

    const backBtn = wrapper.findAll('button').find((b) => b.text().includes('主屏'))
    expect(backBtn?.exists()).toBe(true)
    await backBtn!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('短视频')
    expect(wrapper.findComponent({ name: 'HomeGrid' }).exists()).toBe(true)

    wrapper.unmount()
  })

  it('逃生通道始终在位：常驻「结束体验」按钮', async () => {
    const wrapper = mount(App)
    // phase 在 onMounted 里才被置为 storm，DOM 更新要等一个 tick
    await nextTick()
    const button = wrapper.find('.escape__btn')

    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('结束体验')
    expect(button.attributes('type')).toBe('button')

    wrapper.unmount()
  })

  it('点「结束体验」进入真相环节，六项内容齐全', async () => {
    const wrapper = mount(App)
    const storm = useStormStore()
    await nextTick()

    await wrapper.find('.escape__btn').trigger('click')
    await nextTick()

    expect(storm.phase).toBe('truth')

    const text = wrapper.text()
    expect(text).toContain('关不掉的弹窗')
    expect(text).toContain('弹窗为什么这么多')
    expect(text).toContain('为什么屡禁不止')
    expect(text).toContain('为什么取证这么难')
    expect(text).toContain('规矩其实早就有了')
    expect(text).toContain('可以做的事')
    // 实用建议里最关键的一条来自报道
    expect(text).toContain('连按侧边键 5 次')

    wrapper.unmount()
  })

  it('真相环节的来源链接指向报道原文，且带 noopener', async () => {
    const wrapper = mount(App)
    const storm = useStormStore()

    storm.enterTruth()
    await nextTick()

    const link = wrapper.find('.truth__source a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://www.ithome.com/1/008/059.htm')
    expect(link.attributes('rel')).toContain('noopener')
    expect(link.attributes('target')).toBe('_blank')

    wrapper.unmount()
  })

  it('Esc 与「结束体验」等效', async () => {
    const wrapper = mount(App)
    const storm = useStormStore()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(storm.phase).toBe('truth')

    wrapper.unmount()
  })

  it('真相环节可以重新开始一次风暴', async () => {
    const wrapper = mount(App)
    const storm = useStormStore()

    storm.enterTruth()
    await nextTick()
    expect(storm.phase).toBe('truth')

    await wrapper.find('.truth__again').trigger('click')
    await nextTick()

    expect(storm.phase).toBe('storm')
    expect(wrapper.find('.phone-screen').exists()).toBe(true)

    wrapper.unmount()
  })
})

describe('音频控件', () => {
  it('静音键在位，状态如实反映在 aria-pressed 上', async () => {
    const wrapper = mount(App)
    const storm = useStormStore()
    await nextTick()

    const button = wrapper.find('.audio-controls__btn')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-pressed')).toBe('false')

    await button.trigger('click')
    await nextTick()

    expect(storm.muted).toBe(true)
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(wrapper.text()).toContain('已静音')

    wrapper.unmount()
  })

  it('声音偏好与动效偏好互不推导', async () => {
    const wrapper = mount(App)
    const storm = useStormStore()
    await nextTick()

    // matchMedia 在测试里一律返回 matches:false，所以 reducedMotion 是 false
    expect(storm.reducedMotion).toBe(false)

    await wrapper.find('.audio-controls__btn').trigger('click')
    await nextTick()

    // 静音不该顺手把动效也关了——这是两件事
    expect(storm.muted).toBe(true)
    expect(storm.reducedMotion).toBe(false)

    wrapper.unmount()
  })

  it('没有 AudioContext 的环境里静默降级，并如实提示需要点击解锁', async () => {
    const wrapper = mount(App)
    const storm = useStormStore()

    // jsdom 不实现 AudioContext，于是这条测试走的正是"环境不支持音频"的降级路径
    expect('AudioContext' in globalThis).toBe(false)

    storm.ads.push({
      id: 1,
      creativeId: 'call-loan-service',
      surface: 'takeover',
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      z: 10,
      bornAt: 0,
    })
    await nextTick()

    // 这是关键的一条：有声音要放却放不出来时，界面必须说实话，
    // 而不是静悄悄地不出声让人以为页面坏了；而且全程不能抛错（AC17）。
    expect(storm.audioBlocked).toBe(true)
    expect(wrapper.find('.audio-controls__hint').exists()).toBe(true)

    wrapper.unmount()
  })

  it('支持双桌面与左右滑动分页切换', async () => {
    const wrapper = mount(App)
    await nextTick()

    const homeGrid = wrapper.findComponent({ name: 'HomeGrid' })
    expect(homeGrid.exists()).toBe(true)

    // 第一屏应用与第二屏预装推广应用均已就绪
    expect(homeGrid.text()).toContain('相机')
    expect(homeGrid.text()).toContain('极速清理')
    expect(homeGrid.text()).toContain('龙渊传奇')

    // 存在两页分页指示按钮
    const dots = homeGrid.findAll('[aria-label="分页指示器"] button')
    expect(dots.length).toBe(2)

    // 点击第二页切换
    await dots[1]!.trigger('click')
    await nextTick()

    // 再次点击第一页切换回主屏
    await dots[0]!.trigger('click')
    await nextTick()

    wrapper.unmount()
  })
})
