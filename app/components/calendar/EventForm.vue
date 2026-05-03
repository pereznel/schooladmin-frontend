<template>
  <Form @submit="onSubmit" :validation-schema="schema" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
      <Field name="title" :value="event?.title">
        <template #default="{ field, errorMessage }">
          <input
            v-bind="field"
            type="text"
            :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']"
            placeholder="Título del evento"
          />
          <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
        </template>
      </Field>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
        <Field name="type" :value="event?.type || 'clase'">
          <template #default="{ field }">
            <select v-bind="field" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option value="clase">Clase</option>
              <option value="examen">Examen</option>
              <option value="evento">Evento</option>
              <option value="feriado">Feriado</option>
            </select>
          </template>
        </Field>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio *</label>
        <Field name="start" :value="event?.start">
          <template #default="{ field, errorMessage }">
            <input
              v-bind="field"
              type="datetime-local"
              :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']"
            />
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </template>
        </Field>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
      <Field name="end" :value="event?.end">
        <template #default="{ field }">
          <input
            v-bind="field"
            type="datetime-local"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </template>
      </Field>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
      <Field name="description" :value="event?.description">
        <template #default="{ field }">
          <textarea
            v-bind="field"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            placeholder="Descripción del evento..."
          />
        </template>
      </Field>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
      >
        {{ loading ? 'Guardando...' : (event ? 'Guardar cambios' : 'Crear evento') }}
      </button>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as yup from 'yup'
import type { CalendarEvent } from '~/composables/useCalendar'

defineProps<{
  event?: CalendarEvent
  loading?: boolean
}>()

const schema = yup.object({
  title: yup.string().required('El título es requerido'),
  type: yup.string().required(),
  start: yup.string().required('La fecha de inicio es requerida'),
  end: yup.string().optional(),
  description: yup.string().optional(),
})

const emit = defineEmits<{
  submit: [data: Partial<CalendarEvent>]
  cancel: []
}>()

function onSubmit(values: Record<string, unknown>) {
  emit('submit', values as Partial<CalendarEvent>)
}
</script>
