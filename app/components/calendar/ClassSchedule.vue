<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-5 py-4 border-b border-gray-100">
      <h2 class="font-semibold text-gray-800">Horario de clases</h2>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex gap-3 overflow-x-auto no-scrollbar p-4 pb-3">
      <div v-for="i in 5" :key="i" class="flex-none w-36 h-48 rounded-lg bg-gray-100 animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!schedule.length" class="py-12">
      <UiEmptyState title="Sin horario cargado" icon="heroicons:calendar-days" />
    </div>

    <!-- Schedule: horizontal scroll on mobile, expands on large screens -->
    <div
      v-else
      ref="scrollContainer"
      class="flex gap-3 overflow-x-auto no-scrollbar p-4 pb-3"
    >
      <div
        v-for="day in visibleDays"
        :key="day.key"
        :ref="(el) => setDayRef(el as HTMLElement | null, day.key)"
        class="flex-none w-36 lg:flex-1 rounded-xl p-1.5 transition-all duration-300 ease-out hover:bg-gray-50 hover:scale-[1.02] hover:shadow-sm"
        @mouseenter="hoveredDay = day.key"
        @mouseleave="hoveredDay = null"
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
            v-for="group in groupedByDay[day.key]"
            :key="group.key"
            class="rounded-lg px-2.5 flex flex-col justify-center overflow-hidden border-l-[3px] transition-colors duration-300"
            :style="{
              height: blockHeight(group.blockCount),
              backgroundColor: bgColor(group.color, hoveredDay === day.key),
              borderLeftColor: darkenHex(group.color, 0.35),
            }"
          >
            <p class="text-xs font-semibold leading-snug truncate" :style="{ color: darkenHex(group.color, 0.685) }">
              {{ group.subject }}
            </p>
            <p class="text-[0.6rem] tabular-nums mt-0.5" :style="{ color: darkenHex(group.color, 0.58) }">
              {{ fmt(group.startTime) }} – {{ fmt(group.endTime) }}
            </p>
          </div>

          <p v-if="!groupedByDay[day.key]?.length" class="text-[0.65rem] text-gray-300 text-center py-3">—</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

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

interface GroupedEntry {
  key: string
  subject: string
  color: string
  blockCount: number
  startTime: string
  endTime: string
}

const props = defineProps<{
  schedule: ClassScheduleEntry[]
  pending: boolean
}>()

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const jsDayToIndex: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 }
const todayDayIndex = jsDayToIndex[new Date().getDay()]

const hoveredDay = ref<string | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)
const dayRefMap = ref(new Map<string, HTMLElement>())

function setDayRef(el: HTMLElement | null, key: string) {
  if (el) dayRefMap.value.set(key, el)
  else dayRefMap.value.delete(key)
}

function scrollToToday() {
  const today = visibleDays.value.find(d => d.isToday)
  if (!today || !scrollContainer.value) return
  const el = dayRefMap.value.get(today.key)
  if (!el) return
  const container = scrollContainer.value
  container.scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
}

// Scroll to today once schedule data arrives
watch(() => props.pending, (isPending) => {
  if (!isPending) nextTick(scrollToToday)
})

const visibleDays = computed(() =>
  DAY_KEYS
    .map((key, i) => ({ key, label: DAY_LABELS[i], isToday: i === todayDayIndex }))
    .filter(day => props.schedule.some(e => e[day.key as keyof ClassScheduleEntry]))
)

// Groups consecutive same-subject entries per day into merged blocks
const groupedByDay = computed(() => {
  const map: Record<string, GroupedEntry[]> = {}
  for (const key of DAY_KEYS) {
    const sorted = props.schedule
      .filter(e => e[key as keyof ClassScheduleEntry])
      .sort((a, b) => a.start_time.localeCompare(b.start_time))

    const groups: GroupedEntry[] = []
    for (const entry of sorted) {
      const last = groups[groups.length - 1]
      if (last && last.subject === entry.subject) {
        last.blockCount++
        last.endTime = entry.end_time
        last.key += `-${entry.block_id}`
      } else {
        groups.push({
          key: `${entry.schedule_id}-${entry.block_id}`,
          subject: entry.subject,
          color: entry.color,
          blockCount: 1,
          startTime: entry.start_time,
          endTime: entry.end_time,
        })
      }
    }
    map[key] = groups
  }
  return map
})

// h-14 = 56px, space-y-1.5 gap = 6px
function blockHeight(count: number): string {
  if (count === 1) return '3.5rem'
  return `${count * 56 + (count - 1) * 6}px`
}

function bgColor(hex: string, hovered: boolean): string {
  const base = hovered ? darkenHex(hex, 0.30) : hex
  return hexToRgba(base, 0.20)
}

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

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
