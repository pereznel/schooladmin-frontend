<template>
  <Form @submit="onSubmit" :validation-schema="schema" class="space-y-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Nombre -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <Field name="first_name" :value="student?.first_name">
          <template #default="{ field, errorMessage }">
            <input
              v-bind="field"
              type="text"
              :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']"
              placeholder="Nombre"
            />
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </template>
        </Field>
      </div>

      <!-- Apellido -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
        <Field name="last_name" :value="student?.last_name">
          <template #default="{ field, errorMessage }">
            <input
              v-bind="field"
              type="text"
              :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']"
              placeholder="Apellido"
            />
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </template>
        </Field>
      </div>

      <!-- Correo -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
        <Field name="email" :value="student?.email">
          <template #default="{ field, errorMessage }">
            <input
              v-bind="field"
              type="email"
              :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']"
              placeholder="correo@ejemplo.com"
            />
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </template>
        </Field>
      </div>

      <!-- Teléfono -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <Field name="phone" :value="student?.phone">
          <template #default="{ field }">
            <input
              v-bind="field"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="+54 9 11 1234 5678"
            />
          </template>
        </Field>
      </div>

      <!-- Estado -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
        <Field name="status" :value="student?.status || 'active'">
          <template #default="{ field, errorMessage }">
            <select
              v-bind="field"
              :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="graduated">Egresado</option>
            </select>
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </template>
        </Field>
      </div>

      <!-- Cuota mensual -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Cuota mensual *</label>
        <Field name="monthly_fee" :value="student?.monthly_fee">
          <template #default="{ field, errorMessage }">
            <input
              v-bind="field"
              type="number"
              min="0"
              :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']"
              placeholder="25000"
            />
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </template>
        </Field>
      </div>
    </div>

    <!-- Notas -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Notas privadas</label>
      <Field name="notes" :value="student?.notes">
        <template #default="{ field }">
          <textarea
            v-bind="field"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            placeholder="Notas internas sobre el alumno..."
          />
        </template>
      </Field>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">Guardando...</span>
        <span v-else>{{ student ? 'Guardar cambios' : 'Crear alumno' }}</span>
      </button>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as yup from 'yup'
import type { Student } from '~/composables/useStudents'

const props = defineProps<{
  student?: Student
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: Partial<Student>]
  cancel: []
}>()

const schema = yup.object({
  first_name: yup.string().required('El nombre es requerido'),
  last_name: yup.string().required('El apellido es requerido'),
  email: yup.string().email('Correo inválido').optional(),
  phone: yup.string().optional(),
  status: yup.string().required(),
  monthly_fee: yup.number().required('La cuota mensual es requerida').min(0),
  notes: yup.string().optional(),
})

function onSubmit(values: Record<string, unknown>) {
  emit('submit', values as Partial<Student>)
}
</script>
