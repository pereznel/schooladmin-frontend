<template>
  <div>
    <!-- Title -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Panel Principal - 6° Básico 2026</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ currentDate }}</p>
      </div>
    </div>

    <!-- KPIs -->
    <div v-if="pending" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="i in 4" :key="i" class="h-28 rounded-xl bg-gray-100 animate-pulse" />
    </div>

    <div v-else-if="summary" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <UiKpiCard
        title="Alumnos activos"
        :value="summary.active_students"
        icon="heroicons:users"
        color="blue"
      />
      <UiKpiCard
        title="Cobrado este mes"
        :value="formatAmount(summary.finance_kpis.collected)"
        icon="heroicons:check-circle"
        color="green"
      />
      <UiKpiCard
        title="Pendiente este mes"
        :value="formatAmount(summary.finance_kpis.pending)"
        icon="heroicons:clock"
        color="yellow"
      />
      <UiKpiCard
        title="Ingresos del año"
        :value="formatAmount(summary.finance_kpis.total_income)"
        icon="heroicons:currency-dollar"
        color="green"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Mini calendar -->
      <div class="bg-white rounded-xl border border-gray-200">
        <!-- Calendar header with month navigation -->
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <button
            class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            @click="calendarPrev"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
          </button>
          <h2 class="font-semibold text-gray-800 capitalize text-sm">{{ calendarTitle }}</h2>
          <button
            class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            @click="calendarNext"
          >
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </button>
        </div>
        <div class="p-2">
          <ClientOnly>
            <FullCalendar ref="calendarRef" :options="calendarOptions" class="fc-mini" />
          </ClientOnly>
        </div>
      </div>

      <!-- Upcoming events + chart -->
      <div class="space-y-4">
        <!-- Upcoming events -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-800">Próximos eventos</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="event in upcomingEvents"
              :key="event.id"
              class="flex items-start gap-3 px-5 py-3"
            >
              <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: event.color || '#78716C' }" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ event.title }}</p>
                <p class="text-xs text-gray-400">{{ formatDate(event.start) }}</p>
              </div>
            </div>
            <div v-if="!upcomingEvents.length" class="px-5 py-6 text-center text-sm text-gray-400">
              Sin próximos eventos
            </div>
          </div>
        </div>

        <!-- Bar chart -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="px-5 py-4 border-b border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <h2 class="font-semibold text-gray-800">Ingresos por mes</h2>
              <button
                v-if="selectedMonths.size > 0"
                class="text-xs text-gray-400 hover:text-primary transition-colors"
                @click="selectedMonths.clear()"
              >
                Limpiar
              </button>
            </div>
            <!-- Month filter chips -->
            <div class="flex flex-wrap gap-1">
              <button
                v-for="(label, i) in MONTH_LABELS"
                :key="i"
                :class="[
                  'px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
                  selectedMonths.has(i)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary hover:text-primary',
                ]"
                @click="toggleMonth(i)"
              >
                {{ label }}
              </button>
            </div>
          </div>
          <div class="p-4">
            <ClientOnly>
              <FinanceFinancialChart :chart="filteredChart" />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useCalendar } from '../composables/useCalendar'
import { useFinance } from '../composables/useFinance'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import type { CalendarOptions } from '@fullcalendar/core'
import type { CalendarEvent } from '../composables/useCalendar'

const MONTH_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const { fetchEvents } = useCalendar()
const { fetchChart } = useFinance()

const typeColors: Record<string, string> = {
  clase:   '#C1524A',
  examen:  '#A84040',
  evento:  '#D97706',
  feriado: '#78716C',
}

// Dashboard data
const { data: summary, pending } = await useAsyncData('dashboard-summary',
  () => useApi().apiFetch<{
    active_students: number
    finance_kpis: { collected: number; pending: number; balance: number; total_income: number }
  }>('/api/dashboard/summary/')
)

// Events (for upcoming list)
const { data: events } = await useAsyncData('dashboard-events', () => fetchEvents())

// Chart
const { data: chart } = await useAsyncData('dashboard-chart', () => fetchChart())

// Month filter (reactive Set so Vue tracks mutations)
const selectedMonths = reactive(new Set<number>())

function toggleMonth(i: number) {
  if (selectedMonths.has(i)) selectedMonths.delete(i)
  else selectedMonths.add(i)
}

const filteredChart = computed(() => {
  if (!chart.value) return null
  if (selectedMonths.size === 0) return chart.value
  const indices = Array.from(selectedMonths).sort((a, b) => a - b)
  return {
    labels: indices.map(i => chart.value!.labels[i]),
    income: indices.map(i => chart.value!.income[i]),
    expenses: indices.map(i => chart.value!.expenses[i]),
  }
})

// Mini calendar ref and displayed month tracking
const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const calendarDate = ref(new Date())

function calendarPrev() {
  calendarRef.value?.getApi().prev()
  calendarDate.value = new Date(calendarRef.value?.getApi().getDate() ?? calendarDate.value)
}

function calendarNext() {
  calendarRef.value?.getApi().next()
  calendarDate.value = new Date(calendarRef.value?.getApi().getDate() ?? calendarDate.value)
}

const calendarTitle = computed(() =>
  calendarDate.value.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
)

const calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: false,
  editable: false,
  selectable: false,
  eventClick: undefined,
  events: async (_info: unknown, successCallback: (e: object[]) => void, failureCallback: (e: Error) => void) => {
    try {
      const data = await fetchEvents()
      // Backend returns FullCalendar format; add white text color
      successCallback(data.map((e: CalendarEvent) => ({ ...e, textColor: '#ffffff' })))
    } catch (err) {
      failureCallback(err as Error)
    }
  },
  height: 'auto',
  locale: 'es',
  dayMaxEvents: true,
  fixedWeekCount: false,
}

const upcomingEvents = computed(() => {
  if (!events.value) return []
  const now = new Date()
  return events.value
    .filter(e => new Date(e.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5)
})

const typeDotColor: Record<string, string> = {
  clase:   'bg-blue-500',
  examen:  'bg-red-500',
  evento:  'bg-amber-500',
  feriado: 'bg-gray-400',
}

const currentDate = new Date().toLocaleDateString('es-AR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})

function formatAmount(n: number) {
  return '$' + n.toLocaleString('es-AR')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
  })
}
</script>

<style>
.fc-mini .fc-toolbar { display: none !important; }
.fc-mini .fc-daygrid-day-number { font-size: 0.7rem; }
.fc-mini .fc-col-header-cell-cushion { font-size: 0.7rem; padding: 4px 0; }
.fc-mini .fc-daygrid-day-frame { min-height: 2rem !important; }
.fc-mini .fc-scrollgrid-liquid { height: auto !important; }
.fc-mini .fc-daygrid-body-unbalanced .fc-daygrid-day-events { min-height: 1rem; }
.fc-mini .fc-daygrid-event { font-size: 0.56rem !important; }
.fc-mini .fc-event-title {
  white-space: normal !important;
  overflow: hidden !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
