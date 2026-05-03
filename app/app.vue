<template>
  <div>
    <NuxtLoadingIndicator color="#2563EB" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
const auth = useAuthStore()
onMounted(() => {
  auth.initFromStorage()
})
</script>
