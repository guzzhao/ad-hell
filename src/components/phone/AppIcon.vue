<script setup lang="ts">
/**
 * App 图标。全部为手写的简单几何图形，不依赖任何图标库或字体，
 * 也不使用任何真实产品的 Logo（prd.md R6）。
 */
defineProps<{ name: string }>()
</script>

<template>
  <svg
    class="app-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'camera'">
      <path
        d="M4 7h3l1.6-2.2h6.8L17 7h3a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 7Z"
      />
      <circle cx="12" cy="12.8" r="3.6" />
    </template>

    <template v-else-if="name === 'alarm'">
      <circle cx="12" cy="13" r="7.6" />
      <path d="M12 9.4V13l2.6 1.8" />
      <path d="M4.6 4.8 7 2.9M19.4 4.8 17 2.9" />
    </template>

    <template v-else-if="name === 'calculator'">
      <rect x="5" y="2.5" width="14" height="19" rx="2.2" />
      <path d="M8.4 6.6h7.2" />
      <path
        d="M8.8 11.4h.01M12 11.4h.01M15.2 11.4h.01M8.8 15.2h.01M12 15.2h.01M15.2 15.2h.01M8.8 18.6h6.4"
      />
    </template>

    <template v-else-if="name === 'messages'">
      <path
        d="M20.5 12.4c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.4-.3L5 21l1-3.4A6.9 6.9 0 0 1 3.5 12.4c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"
      />
    </template>

    <template v-else-if="name === 'dialer'">
      <path
        d="M6.6 3.5h2.9l1.4 3.6-1.9 1.4a11.4 11.4 0 0 0 5.9 5.9l1.4-1.9 3.6 1.4v2.9a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"
      />
    </template>

    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3.2" />
      <path
        d="M12 2.8v2.6M12 18.6v2.6M4.5 12H2M22 12h-2.5M6.2 6.2 4.4 4.4M19.6 19.6l-1.8-1.8M6.2 17.8l-1.8 1.8M19.6 4.4l-1.8 1.8"
      />
    </template>

    <template v-else-if="name === 'video'">
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="2.6" />
      <path d="M10.4 9.6 15 12l-4.6 2.4Z" />
    </template>

    <template v-else-if="name === 'shop'">
      <path d="M6.2 2.8 3.5 6.6V19a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V6.6l-2.7-3.8Z" />
      <path d="M3.5 6.6h17" />
      <path d="M15.6 10.2a3.6 3.6 0 0 1-7.2 0" />
    </template>
  </svg>
</template>

<style scoped>
.app-icon {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
