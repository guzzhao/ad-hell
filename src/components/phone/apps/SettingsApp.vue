<script setup lang="ts">
import InAppAdSlot from '../InAppAdSlot.vue'

const rows = [
  { label: 'WLAN', value: '已连接' },
  { label: '蓝牙', value: '已关闭' },
  { label: '显示与亮度', value: '' },
  { label: '电池', value: '68%' },
  { label: '应用管理', value: '43 个' },
]
</script>

<template>
  <div class="settings">
    <div class="settings__group">
      <div v-for="row in rows" :key="row.label" class="settings__row">
        <span class="settings__label">{{ row.label }}</span>
        <span class="settings__value">{{ row.value }}</span>
      </div>
    </div>

    <!-- 报道里工信部 2021 年适老化规范明确禁止适老模式出现广告弹窗 -->
    <div class="settings__group settings__group--hl">
      <div class="settings__row">
        <span class="settings__label">适老化模式</span>
        <span class="settings__value settings__value--on">已开启</span>
      </div>
      <p class="settings__note">
        适老化模式开着，弹窗广告照样来。工信部 2021 年的适老化规范明确禁止适老模式出现广告弹窗。
      </p>
    </div>

    <InAppAdSlot creative-id="health-bp" caption="设置页底部也是广告位。" />

    <div class="settings__group">
      <div class="settings__row">
        <span class="settings__label">关于手机</span>
        <span class="settings__value">›</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings__group {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.055);
  overflow: hidden;
  margin-bottom: 14px;
}

.settings__group--hl {
  border: 1px solid rgba(226, 59, 46, 0.4);
  background: rgba(226, 59, 46, 0.08);
}

.settings__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.settings__group .settings__row:last-child {
  border-bottom: none;
}

.settings__label {
  font-size: 13px;
}

.settings__value {
  font-size: 12px;
  color: rgba(242, 244, 248, 0.5);
}

.settings__value--on {
  color: #4ade80;
  font-weight: 600;
}

.settings__note {
  margin: 0;
  padding: 0 15px 14px;
  font-size: 11.5px;
  line-height: 1.7;
  color: #ff9c8f;
}
</style>
