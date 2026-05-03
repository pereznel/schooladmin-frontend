<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold text-gray-900">Calendario</h1>
      <!-- New event button (admin only) -->
      <button
        v-if="auth.isAuthenticated"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        @click="openNewEvent()"
      >
        <Icon name="heroicons:plus" class="w-4 h-4" />
        Nuevo evento
      </button>
    </div>

    <!-- Calendar -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <ClientOnly>
        <FullCalendar ref="calendarRef" :options="calendarOptions" />
        <template #fallback>
          <div class="h-96 flex items-center justify-center">
            <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Event detail panel -->
    <UiSlideOver :open="!!selectedEvent" :title="selectedEvent?.title || 'Evento'" @close="selectedEvent = null">
      <CalendarEventPanel
        :event="selectedEvent"
        @edit="openEditEvent"
      />
    </UiSlideOver>

    <!-- Create/edit event modal (admin only) -->
    <UiModalBase
      v-if="auth.isAuthenticated"
      :open="eventModalOpen"
      :title="editingEvent ? 'Editar evento' : 'Nuevo evento'"
      @close="closeEventModal()"
    >
      <CalendarEventForm
        :event="editingEvent || undefined"
        :loading="savingEvent"
        @submit="saveEvent"
        @cancel="closeEventModal()"
      />
    </UiModalBase>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCalendar } from '../composables/useCalendar'
import { useAuthStore } from '../stores/auth'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventClickArg, Calendar } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'

// Inline types to avoid stale TS server issues with auto-generated aliases
interface EventDetail {
  id: number
  title: string
  event_type?: { id: number; name: string; color: string }
  start_date: string
  end_date?: string
  all_day: boolean
  description?: string
  review?: string
  recurring?: boolean
  attachments?: { id: number; file: string; original_name: string }[]
}

const auth = useAuthStore()
const { fetchEvents, fetchEvent, createEvent, updateEvent } = useCalendar()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedEvent = ref<EventDetail | null>(null)
const eventModalOpen = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const editingEvent = ref<EventDetail | null>(null)
const savingEvent = ref(false)
const calendarRef = ref<{ getApi(): Calendar } | null>(null)

function handleEventClick(info: EventClickArg) {
  fetchEvent(info.event.id).then(e => { selectedEvent.value = e as EventDetail })
}

function handleDateClick(_info: DateClickArg) {
  if (!auth.isAuthenticated) return
  editingEvent.value = null
  eventModalOpen.value = true
}

function openNewEvent() {
  editingEvent.value = null
  selectedEvent.value = null
  eventModalOpen.value = true
}

function openEditEvent(event: EventDetail) {
  editingEvent.value = event
  selectedEvent.value = null
  eventModalOpen.value = true
}

function closeEventModal() {
  eventModalOpen.value = false
  editingEvent.value = null
}

async function saveEvent(data: Record<string, unknown>) {
  savingEvent.value = true
  try {
    if (editingEvent.value) {
      await updateEvent(editingEvent.value.id, data as Parameters<typeof updateEvent>[1])
    } else {
      await createEvent(data as Parameters<typeof createEvent>[0])
    }
    closeEventModal()
    calendarRef.value?.getApi().refetchEvents()
  } finally {
    savingEvent.value = false
  }
}

const calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: 'es',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listMonth',
  },
  buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', list: 'Lista' },
  events: async (_info, successCallback, failureCallback) => {
    try {
      const data = await fetchEvents()
      // Backend returns FullCalendar-compatible format directly
      successCallback(data as unknown as Parameters<typeof successCallback>[0])
    } catch (err) {
      failureCallback(err as Error)
    }
  },
  eventClick: handleEventClick,
  dateClick: auth.isAuthenticated ? handleDateClick : undefined,
  height: 'auto',
  eventDisplay: 'block',
}
</script>
