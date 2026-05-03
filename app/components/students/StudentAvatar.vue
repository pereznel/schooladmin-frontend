<template>
  <div
    :class="[
      'relative rounded-full flex items-center justify-center font-bold text-white overflow-hidden shrink-0',
      sizeClasses[size],
    ]"
    :style="student.photo ? {} : { backgroundColor: avatarColor }"
  >
    <img
      v-if="student.photo"
      :src="student.photo"
      :alt="student.first_name"
      class="w-full h-full object-cover"
    />
    <span v-else>{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Student } from '~/composables/useStudents'

const props = withDefaults(defineProps<{
  student: Pick<Student, 'first_name' | 'last_name' | 'photo'>
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  size: 'md',
})

const sizeClasses = {
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-14 h-14 text-lg',
  xl:  'w-20 h-20 text-2xl',
}

const initials = computed(() => {
  const n = props.student.first_name?.charAt(0) || ''
  const a = props.student.last_name?.charAt(0) || ''
  return (n + a).toUpperCase()
})

// Deterministic color based on name
const COLORS = [
  '#C1524A', '#7C3AED', '#DB2777', '#A84040',
  '#D97706', '#EA580C', '#0891B2', '#78716C',
]

const avatarColor = computed(() => {
  const str = (props.student.first_name || '') + (props.student.last_name || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
})
</script>
