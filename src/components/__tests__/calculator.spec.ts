import { beforeEach, describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalculatorApp from '@/components/phone/apps/CalculatorApp.vue'
import { useStormStore } from '@/stores/storm'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CalculatorApp 计算器功能测试', () => {
  it('键盘包含完整的运算符与等于号 =', () => {
    const wrapper = mount(CalculatorApp)

    const equalsBtn = wrapper.find('button[aria-label="等于"]')
    expect(equalsBtn.exists()).toBe(true)
    expect(equalsBtn.text()).toBe('=')

    // 检查基础按键
    expect(wrapper.text()).toContain('C')
    expect(wrapper.text()).toContain('±')
    expect(wrapper.text()).toContain('%')
    expect(wrapper.text()).toContain('÷')
    expect(wrapper.text()).toContain('×')
    expect(wrapper.text()).toContain('−')
    expect(wrapper.text()).toContain('+')
    expect(wrapper.text()).toContain('.')
    expect(wrapper.text()).toContain('0')

    wrapper.unmount()
  })

  it('点击按键能正确完成加法运算并在点击等号后得出结果', async () => {
    const wrapper = mount(CalculatorApp)
    const storm = useStormStore()
    storm.adsEnabled = false

    const btn7 = wrapper.findAll('button').find((b) => b.text() === '7')
    const btnPlus = wrapper.findAll('button').find((b) => b.text() === '+')
    const btn8 = wrapper.findAll('button').find((b) => b.text() === '8')
    const btnEquals = wrapper.find('button[aria-label="等于"]')

    await btn7!.trigger('click')
    await btnPlus!.trigger('click')
    await btn8!.trigger('click')
    await btnEquals.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('15')

    wrapper.unmount()
  })

  it('当风暴广告开启时，底部广告不遮挡等于号按键', async () => {
    const wrapper = mount(CalculatorApp)
    const storm = useStormStore()
    storm.adsEnabled = true
    await nextTick()

    // 等于号依然正常存在且可见
    const equalsBtn = wrapper.find('button[aria-label="等于"]')
    expect(equalsBtn.exists()).toBe(true)
    expect(equalsBtn.isVisible()).toBe(true)

    // 底部广告也存在
    expect(wrapper.text()).toContain('一刀 9999 级')

    // 支持关闭底部广告
    const closeBtn = wrapper.find('button[aria-label="关闭计算器底部广告"]')
    expect(closeBtn.exists()).toBe(true)
    await closeBtn.trigger('click')
    await nextTick()

    expect(wrapper.text()).not.toContain('一刀 9999 级')

    wrapper.unmount()
  })
})
