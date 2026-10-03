import { beforeEach, describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CameraApp from '@/components/phone/apps/CameraApp.vue'
import { useStormStore } from '@/stores/storm'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CameraApp 相机应用核心功能测试', () => {
  it('正确挂载并渲染初始模式与基础控制按钮', () => {
    const wrapper = mount(CameraApp)

    expect(wrapper.text()).toContain('拍照')
    expect(wrapper.text()).toContain('人像')
    expect(wrapper.text()).toContain('夜景')
    expect(wrapper.text()).toContain('录像')
    expect(wrapper.text()).toContain('专业')

    // 默认 48MP、HDR 在位
    expect(wrapper.text()).toContain('48MP')
    expect(wrapper.text()).toContain('HDR')

    wrapper.unmount()
  })

  it('切换拍摄模式并动态切换对应取景场景与专属控制', async () => {
    const wrapper = mount(CameraApp)

    // 切换到人像模式
    const portraitBtn = wrapper.findAll('nav button').find((b) => b.text().includes('人像'))
    expect(portraitBtn?.exists()).toBe(true)
    await portraitBtn!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('人脸追踪')
    expect(wrapper.text()).toContain('虚化光圈')

    // 切换到夜景模式
    const nightBtn = wrapper.findAll('nav button').find((b) => b.text().includes('夜景'))
    await nightBtn!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('极暗夜景环境')

    // 切换到专业模式
    const proBtn = wrapper.findAll('nav button').find((b) => b.text().includes('专业'))
    await proBtn!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('HISTOGRAM')
    expect(wrapper.text()).toContain('ISO')
    expect(wrapper.text()).toContain('快门 S')

    wrapper.unmount()
  })

  it('拍照快门能够生成照片并在缩略图上计数递增', async () => {
    const wrapper = mount(CameraApp)
    const storm = useStormStore()
    storm.adsEnabled = false

    // 点击快门
    const shutterBtn = wrapper.find('button[aria-label="拍照"]')
    expect(shutterBtn.exists()).toBe(true)
    await shutterBtn.trigger('click')
    await nextTick()

    // 缩略图角标显示为 1
    const galleryThumb = wrapper.find('button[aria-label="查看相册"]')
    expect(galleryThumb.text()).toContain('1')

    // 打开相册模态框
    await galleryThumb.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('拍摄成果预览')
    expect(wrapper.text()).toContain('LEICA SUMMICRON')

    wrapper.unmount()
  })

  it('支持切换倒计时、闪光灯与分辨率', async () => {
    const wrapper = mount(CameraApp)

    // 闪光灯
    const flashBtn = wrapper.find('button[aria-label="切换闪光灯"]')
    expect(flashBtn.text()).toContain('自动')
    await flashBtn.trigger('click')
    expect(flashBtn.text()).toContain('常开')
    await flashBtn.trigger('click')
    expect(flashBtn.text()).toContain('关')

    // 倒计时
    const timerBtn = wrapper.find('button[aria-label="切换倒计时"]')
    expect(timerBtn.text()).toContain('倒计')
    await timerBtn.trigger('click')
    expect(timerBtn.text()).toContain('3s')
    await timerBtn.trigger('click')
    expect(timerBtn.text()).toContain('10s')

    // 分辨率
    const resBtn = wrapper.findAll('button').find((b) => b.text() === '48MP')
    expect(resBtn?.exists()).toBe(true)
    await resBtn!.trigger('click')
    expect(resBtn!.text()).toBe('12MP')

    wrapper.unmount()
  })

  it('支持前后镜头翻转与自拍特有界面', async () => {
    const wrapper = mount(CameraApp)

    const flipBtn = wrapper.find('button[aria-label="翻转前后镜头"]')
    expect(flipBtn.exists()).toBe(true)
    await flipBtn.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('前置 3200万像素 超广角自拍')

    wrapper.unmount()
  })

  it('支持打开风格滤镜面板与设置抽屉', async () => {
    const wrapper = mount(CameraApp)

    // 打开滤镜面板
    const filterBtn = wrapper.find('button[aria-label="滤镜面板"]')
    await filterBtn.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('风格色彩滤镜')
    expect(wrapper.text()).toContain('胶片')
    expect(wrapper.text()).toContain('黑白')

    // 打开设置抽屉
    const settingsBtn = wrapper.find('button[aria-label="相机设置"]')
    await settingsBtn.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('相机专业设置')
    expect(wrapper.text()).toContain('照片定制水印')
    expect(wrapper.text()).toContain('构图九宫格参考线')

    wrapper.unmount()
  })

  it('广告开启时作为绝对定位浮层置顶，且支持手动关闭', async () => {
    const wrapper = mount(CameraApp)
    const storm = useStormStore()
    storm.adsEnabled = true
    await nextTick()

    // 广告应该渲染并存在
    expect(wrapper.text()).toContain('检测到内存不足')

    // 验证关闭按钮
    const closeAdBtn = wrapper.find('button[aria-label="关闭相机广告"]')
    expect(closeAdBtn.exists()).toBe(true)
    await closeAdBtn.trigger('click')
    await nextTick()

    expect(wrapper.text()).not.toContain('检测到内存不足')

    wrapper.unmount()
  })
})
