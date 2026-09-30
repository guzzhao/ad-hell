<script setup lang="ts">
import InAppAdSlot from '../InAppAdSlot.vue'
</script>

<template>
  <div class="camera">
    <div class="camera__viewfinder">
      <span class="camera__ad-flag">拍摄前广告 · 15s</span>
      <span class="camera__skip">跳过</span>
      <div class="camera__grid" aria-hidden="true"><i /><i /><i /><i /></div>
    </div>

    <div class="camera__modes">
      <span class="is-active">拍照</span>
      <span>录像</span>
      <span>人像</span>
    </div>

    <div class="camera__shutter-row">
      <span class="camera__thumb" aria-hidden="true" />
      <span class="camera__shutter" aria-hidden="true" />
      <span class="camera__flip" aria-hidden="true">⟳</span>
    </div>

    <InAppAdSlot
      creative-id="fake-system"
      caption="取景框上方压着「拍摄前广告」，那个「跳过」只有 10px 高、浅灰色。"
    />
  </div>
</template>

<style scoped>
.camera__viewfinder {
  position: relative;
  height: 240px;
  border-radius: 16px;
  background: linear-gradient(170deg, #1b2333 0%, #0a0d13 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.camera__ad-flag {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  padding: 5px 9px;
  border-radius: 7px;
  background: rgba(226, 59, 46, 0.92);
  font-size: 11px;
  font-weight: 700;
}

.camera__skip {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  /* 故意做小、做灰 —— 这正是报道里描述的关闭陷阱 */
  font-size: 9px;
  color: rgba(242, 244, 248, 0.35);
}

.camera__grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.camera__grid i {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.camera__modes {
  display: flex;
  justify-content: center;
  gap: 22px;
  margin: 14px 0 12px;
  font-size: 12.5px;
  color: rgba(242, 244, 248, 0.45);
}

.camera__modes .is-active {
  color: #ffd54a;
  font-weight: 600;
}

.camera__shutter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}

.camera__thumb,
.camera__flip {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  font-size: 15px;
  color: rgba(242, 244, 248, 0.6);
}

.camera__shutter {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.18);
}
</style>
