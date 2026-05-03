<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold text-gray-900">Horario de clases</h1>
    </div>

    <CalendarClassSchedule :schedule="schedule" :pending="pending" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCalendar } from '../composables/useCalendar'

interface ClassScheduleEntry {
  schedule_id: number
  block_id: number
  subject: string
  color: string
  start_time: string
  end_time: string
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

const { fetchSchedule } = useCalendar()

const schedule = ref<ClassScheduleEntry[]>([])
const pending = ref(true)
fetchSchedule().then((data: ClassScheduleEntry[]) => { schedule.value = data }).finally(() => { pending.value = false })
</script>
