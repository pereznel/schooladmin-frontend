<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-5 py-4 border-b border-gray-100">
      <h2 class="font-semibold text-gray-800">Horario de clases</h2>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div v-for="i in 5" :key="i" class="h-48 rounded-lg bg-gray-100 animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!schedule.length" class="py-12">
      <UiEmptyState title="Sin horario cargado" icon="heroicons:calendar-days" />
    </div>

    <!-- Schedule grid -->
    <div v-else class="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div
        v-for="day in visibleDays"
        :key="day.key"
        class="rounded-xl p-1.5 -m-1.5 transition-all duration-300 ease-out hover:bg-gray-50 hover:scale-[1.02] hover:shadow-sm"
      >
        <!-- Day header -->
        <div
          class="text-center text-xs font-semibold uppercase tracking-wider py-1.5 rounded-lg mb-2"
          :class="day.isToday ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500'"
        >
          {{ day.label }}
        </div>

        <!-- Blocks for this day, sorted by start_time -->
        <div class="space-y-1.5">
          <div
            v-for="entry in byDay[day.key]"
            :key="`${entry.schedule_id}-${entry.block_id}`"
            class="h-14 rounded-lg px-2.5 flex flex-col justify-center overflow-hidden border-l-[3px]"
            :style="{
              backgroundColor: hexToRgba(entry.color, 0.20),
              borderLeftColor: darkenHex(entry.color, 0.35),
            }"
          >
            <p class="text-xs font-semibold leading-snug truncate" :style="{ color: darkenHex(entry.color, 0.55) }">
              {{ entry.subject }}
            </p>
            <p class="text-[0.6rem] tabular-nums mt-0.5" :style="{ color: darkenHex(entry.color, 0.4) }">
              {{ fmt(entry.start_time) }} – {{ fmt(entry.end_time) }}
            </p>
          </div>

          <p v-if="!byDay[day.key]?.length" class="text-[0.65rem] text-gray-300 text-center py-3">—</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const props = defineProps<{
  schedule: ClassScheduleEntry[]
  pending: boolean
}>()

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const jsDayToIndex: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 }
const todayDayIndex = jsDayToIndex[new Date().getDay()]

const visibleDays = computed(() =>
  DAY_KEYS
    .map((key, i) => ({ key, label: DAY_LABELS[i], isToday: i === todayDayIndex }))
    .filter(day => props.schedule.some(e => e[day.key as keyof ClassScheduleEntry]))
)

const byDay = computed(() => {
  const map: Record<string, ClassScheduleEntry[]> = {}
  for (const key of DAY_KEYS) {
    map[key] = props.schedule
      .filter(e => e[key as keyof ClassScheduleEntry])
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }
  return map
})

function fmt(time: string) {
  return time.slice(0, 5)
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return hex
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function darkenHex(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return hex
  const r = Math.max(0, Math.round(parseInt(h.slice(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.round(parseInt(h.slice(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.round(parseInt(h.slice(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
</script>
