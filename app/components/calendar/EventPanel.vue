<template>
  <div>
    <div v-if="event" class="space-y-4">
      <!-- Type badge -->
      <span
        v-if="event.event_type"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        :style="{ backgroundColor: (event.event_type.color || '#C1524A') + '20', color: event.event_type.color || '#C1524A' }"
      >
        {{ event.event_type.name }}
      </span>

      <!-- Date -->
      <div class="flex items-start gap-2 text-sm text-gray-600">
        <Icon name="heroicons:calendar" class="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
        <span>
          {{ formatDate(event.start_date) }}
          <span v-if="event.end_date && event.end_date !== event.start_date"> – {{ formatDate(event.end_date) }}</span>
        </span>
      </div>

      <!-- All day -->
      <div v-if="event.all_day" class="flex items-center gap-2 text-xs text-gray-400">
        <Icon name="heroicons:sun" class="w-4 h-4" />
        Todo el día
      </div>

      <!-- Description -->
      <div v-if="event.description" class="text-sm text-gray-700 leading-relaxed">
        {{ event.description }}
      </div>

      <!-- Attachments -->
      <div v-if="event.attachments?.length">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Archivos adjuntos</p>
        <ul class="space-y-1">
          <li v-for="attachment in event.attachments" :key="attachment.id">
            <a
              :href="attachment.file"
              target="_blank"
              class="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Icon name="heroicons:paper-clip" class="w-4 h-4 shrink-0" />
              {{ attachment.original_name }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Review -->
      <div v-if="event.review">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reseña</p>
        <p class="text-sm text-gray-700 leading-relaxed">{{ event.review }}</p>
      </div>

      <!-- Admin action -->
      <div v-if="auth.isAuthenticated" class="pt-2">
        <button
          class="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          @click="$emit('edit', event)"
        >
          <Icon name="heroicons:pencil-square" class="w-4 h-4" />
          Editar evento
        </button>
      </div>
    </div>

    <UiEmptyState v-else title="Selecciona un evento" icon="heroicons:calendar" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

interface EventDetail {
  id: number
  title: string
  event_type?: { id: number; name: string; color: string; icon?: string }
  start_date: string
  end_date?: string
  all_day: boolean
  description?: string
  review?: string
  recurring?: boolean
  attachments?: { id: number; file: string; original_name: string; mime_type?: string }[]
}

defineProps<{
  event: EventDetail | null
}>()

defineEmits<{ edit: [event: EventDetail] }>()

const auth = useAuthStore()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
