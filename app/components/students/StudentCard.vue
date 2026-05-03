<template>
  <div
    class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-start gap-3">
      <StudentsStudentAvatar :student="student" size="lg" />

      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 truncate">
          {{ student.first_name }} {{ student.last_name }}
        </h3>

        <div class="flex flex-wrap gap-1.5 mt-1.5">
          <UiStatusBadge :status="student.status" />
          <UiStatusBadge v-if="currentMonthPayment" :status="currentMonthPayment" />
        </div>
      </div>

      <Icon name="heroicons:chevron-right" class="w-5 h-5 text-gray-300 shrink-0 mt-1" />
    </div>

    <div v-if="student.email || student.phone" class="mt-3 space-y-1">
      <p v-if="student.email" class="text-xs text-gray-400 truncate flex items-center gap-1">
        <Icon name="heroicons:envelope" class="w-3.5 h-3.5 shrink-0" />
        {{ student.email }}
      </p>
      <p v-if="student.phone" class="text-xs text-gray-400 flex items-center gap-1">
        <Icon name="heroicons:phone" class="w-3.5 h-3.5 shrink-0" />
        {{ student.phone }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Student } from '~/composables/useStudents'

const props = defineProps<{
  student: Student
}>()

defineEmits<{ click: [] }>()

const currentMonthPayment = computed(() => {
  if (!props.student.payments?.length) return null
  const now = new Date()
  const payment = props.student.payments.find(
    p => p.month === now.getMonth() + 1 && p.year === now.getFullYear()
  )
  return payment?.status ?? null
})
</script>
