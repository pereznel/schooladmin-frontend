<template>
  <div
    :class="[
      'relative rounded-xl p-5 border overflow-hidden',
      colorClasses[color].bg,
      colorClasses[color].border,
    ]"
  >
    <!-- Decorative corner pattern -->
    <div class="absolute top-0 right-0 w-20 h-20 opacity-10">
      <svg viewBox="0 0 80 80" fill="none" class="w-full h-full">
        <line x1="80" y1="0" x2="0" y2="80" :stroke="colorClasses[color].stroke" stroke-width="8" />
        <line x1="100" y1="0" x2="20" y2="80" :stroke="colorClasses[color].stroke" stroke-width="8" />
        <line x1="60" y1="0" x2="-20" y2="80" :stroke="colorClasses[color].stroke" stroke-width="8" />
      </svg>
    </div>

    <!-- Icon -->
    <div :class="['w-9 h-9 rounded-lg flex items-center justify-center mb-3', colorClasses[color].iconBg]">
      <Icon :name="icon || colorClasses[color].defaultIcon" :class="['w-5 h-5', colorClasses[color].iconColor]" />
    </div>

    <p class="text-sm font-medium text-gray-500 mb-0.5">{{ title }}</p>
    <p :class="['text-2xl font-bold', colorClasses[color].text]">{{ value }}</p>
    <p v-if="subtitle" class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  color?: 'green' | 'red' | 'yellow' | 'neutral' | 'blue'
}>(), {
  color: 'blue',
})

const colorClasses = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    text: 'text-green-700',
    stroke: '#16A34A',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    defaultIcon: 'heroicons:check-circle',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-700',
    stroke: '#C0504D',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    defaultIcon: 'heroicons:exclamation-circle',
  },
  yellow: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-700',
    stroke: '#D97706',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    defaultIcon: 'heroicons:clock',
  },
  neutral: {
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    text: 'text-stone-600',
    stroke: '#78716C',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-500',
    defaultIcon: 'heroicons:document-text',
  },
  blue: {
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    text: 'text-stone-700',
    stroke: '#78716C',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-600',
    defaultIcon: 'heroicons:chart-bar',
  },
}
</script>
