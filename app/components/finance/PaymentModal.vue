<template>
  <ModalBase :open="open" title="Registrar pago" @close="$emit('close')">
    <Form @submit="onSubmit" :validation-schema="schema" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Alumno</label>
        <input
          type="text"
          :value="studentName"
          disabled
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
          <Field name="month" :value="month">
            <template #default="{ field }">
              <select v-bind="field" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                <option v-for="(m, i) in MONTHS" :key="i" :value="i + 1">{{ m }}</option>
              </select>
            </template>
          </Field>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <Field name="year" :value="year">
            <template #default="{ field }">
              <input v-bind="field" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </template>
          </Field>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
        <Field name="amount" :value="suggestedAmount">
          <template #default="{ field, errorMessage }">
            <input
              v-bind="field"
              type="number"
              min="0"
              :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', errorMessage ? 'border-red-400' : 'border-gray-300']"
            />
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </template>
        </Field>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <Field name="description">
          <template #default="{ field }">
            <input v-bind="field" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Opcional" />
          </template>
        </Field>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg" @click="$emit('close')">Cancelar</button>
        <button type="submit" :disabled="loading" class="px-5 py-2 text-sm font-medium text-white bg-paid hover:bg-green-700 rounded-lg disabled:opacity-50">
          {{ loading ? 'Registrando...' : 'Registrar pago' }}
        </button>
      </div>
    </Form>
  </ModalBase>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as yup from 'yup'

const props = withDefaults(defineProps<{
  open: boolean
  studentId?: number
  studentName?: string
  month?: number
  year?: number
  suggestedAmount?: number
  loading?: boolean
}>(), {
  year: () => new Date().getFullYear(),
  month: () => new Date().getMonth() + 1,
})

const emit = defineEmits<{
  close: []
  submit: [data: { student_id: number; month: number; year: number; amount: number; description?: string }]
}>()

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const schema = yup.object({
  amount: yup.number().required('El monto es requerido').min(1, 'El monto debe ser mayor a 0'),
})

function onSubmit(values: Record<string, unknown>) {
  if (!props.studentId) return
  emit('submit', {
    student_id: props.studentId,
    month: props.month!,
    year: props.year!,
    amount: values.amount as number,
    description: values.description as string | undefined,
  })
}
</script>
