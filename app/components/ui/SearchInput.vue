<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-gray-400" />
    </div>
    <input
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      class="block w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  debounce?: number
}>(), {
  placeholder: 'Search...',
  debounce: 300,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

let timer: ReturnType<typeof setTimeout>

function onInput(e: Event) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
  }, props.debounce)
}
</script>
