<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <Icon :name="icon" class="w-8 h-8 text-gray-400" />
    </div>
    <h3 class="text-base font-semibold text-gray-700 mb-1">{{ title }}</h3>
    <p v-if="description" class="text-sm text-gray-400 max-w-xs">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
}>(), {
  icon: 'heroicons:inbox',
})
</script>
