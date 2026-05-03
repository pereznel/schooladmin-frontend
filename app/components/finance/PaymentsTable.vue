<template>
  <div class="overflow-x-auto">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="sticky left-0 z-10 bg-white text-left font-semibold text-gray-700 px-4 py-3 min-w-[160px]">
            Alumno
          </th>
          <th
            v-for="month in months"
            :key="month"
            class="text-center font-semibold text-gray-700 px-3 py-3 min-w-[80px]"
          >
            {{ SHORT_MONTHS[month - 1] }}
          </th>
          <th class="text-right font-semibold text-gray-700 px-4 py-3">Total</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50 transition-colors">
          <!-- Sticky name -->
          <td class="sticky left-0 z-10 bg-white hover:bg-gray-50 px-4 py-3 font-medium text-gray-900 truncate max-w-[160px]">
            {{ student.name }}
          </td>

          <!-- Payment cells -->
          <td
            v-for="month in months"
            :key="month"
            class="px-1 py-1.5 text-center"
          >
            <button
              :class="['w-full rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors', cellClasses(getCell(student, month))]"
              @click="$emit('cell-click', { student, month, year })"
            >
              {{ formatCell(getCell(student, month)) }}
            </button>
          </td>

          <!-- Row total -->
          <td class="px-4 py-3 text-right font-semibold text-gray-800">
            {{ formatAmount(studentTotal(student)) }}
          </td>
        </tr>

        <!-- Totals row -->
        <tr class="bg-gray-50 border-t-2 border-gray-200 font-semibold">
          <td class="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-gray-700">Total</td>
          <td
            v-for="month in months"
            :key="month"
            class="px-3 py-3 text-center text-gray-700"
          >
            {{ formatAmount(monthlyTotals[month - 1] || 0) }}
          </td>
          <td class="px-4 py-3 text-right text-gray-800">
            {{ formatAmount(monthlyTotals.reduce((a, b) => a + b, 0)) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { PaymentCell } from '~/composables/useFinance'

const props = withDefaults(defineProps<{
  students: { id: number; name: string; months: PaymentCell[] }[]
  year: number
  months?: number[]
  monthlyTotals?: number[]
}>(), {
  months: () => Array.from({ length: 12 }, (_, i) => i + 1),
  monthlyTotals: () => new Array(12).fill(0),
})

defineEmits<{
  'cell-click': [payload: { student: { id: number; name: string }, month: number, year: number }]
}>()

const SHORT_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function getCell(student: { months: PaymentCell[] }, month: number): PaymentCell | undefined {
  return student.months.find(m => m.month === month)
}

function cellClasses(cell: PaymentCell | undefined) {
  if (!cell || !cell.status) return 'bg-gray-100 text-gray-400 hover:bg-gray-200'
  return {
    paid:     'bg-green-100 text-green-700 hover:bg-green-200',
    partial:  'bg-amber-100 text-amber-700 hover:bg-amber-200',
    overdue:  'bg-red-100 text-red-600 hover:bg-red-200',
    pending:  'bg-gray-100 text-gray-500 hover:bg-gray-200',
  }[cell.status] || 'bg-gray-100 text-gray-400'
}

function formatCell(cell: PaymentCell | undefined) {
  if (!cell || !cell.amount) return '–'
  return formatAmount(cell.amount)
}

function formatAmount(n: number) {
  if (!n) return '–'
  return '$' + n.toLocaleString('es-AR')
}

function studentTotal(student: { months: PaymentCell[] }) {
  return student.months.reduce((sum, m) => sum + (m.amount || 0), 0)
}
</script>
