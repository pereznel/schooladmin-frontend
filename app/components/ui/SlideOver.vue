<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 overflow-hidden">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />

        <!-- Panel -->
        <div class="absolute inset-y-0 right-0 flex max-w-full">
          <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full"
          >
            <div v-if="open" :class="['relative w-screen bg-white shadow-xl flex flex-col', widthClass]">
              <!-- Header -->
              <div class="flex items-center justify-between px-6 h-16 border-b border-gray-200 shrink-0">
                <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
                <button
                  class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  @click="$emit('close')"
                >
                  <Icon name="heroicons:x-mark" class="w-5 h-5" />
                </button>
              </div>

              <!-- Contenido -->
              <div class="flex-1 overflow-y-auto px-6 py-5">
                <slot />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  width?: 'sm' | 'md' | 'lg'
}>(), {
  width: 'md',
})

const emit = defineEmits<{ close: [] }>()

const widthClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}[props.width]))

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.open) emit('close')
  }
  document.addEventListener('keydown', handler)
  onUnmounted(() => document.removeEventListener('keydown', handler))
})
</script>
