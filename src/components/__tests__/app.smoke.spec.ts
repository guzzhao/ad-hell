import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  } as unknown as MediaQueryList
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

  it('主屏同时呈现 A 类与 B 类两个分区，且点明反差', () => {
    const wrapper = mount(App)
    const text = wrapper.text()

    expect(text).toContain('本来就该干干净净的')
    expect(text).toContain('平时广告最多的')
    expect(text).toContain('一个广告都没有')

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
