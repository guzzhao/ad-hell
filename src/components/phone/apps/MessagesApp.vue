<script setup lang="ts">
const threads = [
  { from: '物业群', preview: '明天停水，请提前储水', time: '20:14', flagged: false },
  { from: '接警中心', preview: '请点击链接上传现场视频', time: '23:01', flagged: true },
  { from: '女儿', preview: '妈，我到家了', time: '22:47', flagged: false },
]
</script>

<template>
  <div class="msg">
    <ul class="msg__list">
      <li v-for="thread in threads" :key="thread.from" class="msg__item" :class="{ 'is-flagged': thread.flagged }">
        <span class="msg__avatar" aria-hidden="true">{{ thread.from.slice(0, 1) }}</span>
        <div class="msg__body">
          <div class="msg__head">
            <strong>{{ thread.from }}</strong>
            <small>{{ thread.time }}</small>
          </div>
          <p class="msg__preview">
            {{ thread.preview }}
            <span v-if="thread.flagged" class="msg__link">ithome.example/upload</span>
          </p>
          <p v-if="thread.flagged" class="msg__flag">点开这个链接，先弹出来的是浏览器的开屏广告。</p>
        </div>
      </li>
    </ul>

    <p class="msg__caption">
      报道里就是这样：接警员发来的短信本身没有广告，弹窗来自手机浏览器——
      那位女士因此耽误了大约一分钟。
    </p>
  </div>
</template>

<style scoped>
.msg__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.msg__item {
  display: flex;
  gap: 11px;
  padding: 13px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.msg__item.is-flagged {
  margin: 0 -12px;
  padding: 13px 12px;
  border-radius: 13px;
  background: rgba(226, 59, 46, 0.1);
  border-bottom-color: transparent;
}

.msg__avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.11);
  font-size: 14px;
  font-weight: 600;
}

.msg__body {
  min-width: 0;
  flex: 1;
}

.msg__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.msg__head strong {
  font-size: 13px;
  font-weight: 600;
}

.msg__head small {
  font-size: 10.5px;
  color: rgba(242, 244, 248, 0.42);
}

.msg__preview {
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(242, 244, 248, 0.68);
}

.msg__link {
  color: #7fd4ff;
  text-decoration: underline;
  word-break: break-all;
}

.msg__flag {
  margin: 6px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: #ff9c8f;
}

.msg__caption {
  margin: 16px 0 0;
  font-size: 11.5px;
  line-height: 1.7;
  color: rgba(242, 244, 248, 0.5);
}
</style>
