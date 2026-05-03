<template>
  <Form @submit="onSubmit" :validation-schema="schema" class="space-y-4">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
        <Field name="date" :value="expense?.date">
          <template #default="{ field, errorMessage }">
            <input v-bind="field" type="date" :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']" />
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </template>
        </Field>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
        <Field name="category" :value="expense?.category">
          <template #default="{ field, errorMessage }">
            <select v-bind="field" :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']">
              <option value="">Seleccionar...</option>
              <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </template>
        </Field>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
      <Field name="description" :value="expense?.description">
        <template #default="{ field, errorMessage }">
          <input v-bind="field" type="text" :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']" placeholder="Descripción del egreso" />
          <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
        </template>
      </Field>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
      <Field name="amount" :value="expense?.amount">
        <template #default="{ field, errorMessage }">
          <input v-bind="field" type="number" min="0" :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']" placeholder="0" />
          <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
        </template>
      </Field>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <button type="button" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" :disabled="loading" class="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg disabled:opacity-50">
        {{ loading ? 'Guardando...' : (expense ? 'Guardar cambios' : 'Registrar egreso') }}
      </button>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as yup from 'yup'
import type { Expense } from '~/composables/useFinance'

defineProps<{
  expense?: Expense
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: Partial<Expense>]
  cancel: []
}>()

const CATEGORIES = [
  { value: 'Materials', label: 'Materiales' },
  { value: 'Rent', label: 'Alquiler' },
  { value: 'Services', label: 'Servicios' },
  { value: 'Equipment', label: 'Equipamiento' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Other', label: 'Otro' },
]

const schema = yup.object({
  date: yup.string().required('La fecha es requerida'),
  category: yup.string().required('La categoría es requerida'),
  description: yup.string().required('La descripción es requerida'),
  amount: yup.number().required('El monto es requerido').min(1, 'El monto debe ser mayor a 0'),
})

function onSubmit(values: Record<string, unknown>) {
  emit('submit', values as Partial<Expense>)
}
</script>
