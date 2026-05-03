<template>
  <div class="bg-white rounded-xl border border-gray-200 flex flex-col">
    <div class="px-5 py-4 border-b border-gray-100">
      <h2 class="font-semibold text-gray-800">Últimos movimientos</h2>
    </div>

    <div class="flex-1 overflow-x-auto">
      <div v-if="pending" class="p-8 flex justify-center">
        <div class="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <template v-else-if="movements?.results?.length">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">Tipo</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">Mes</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Monto</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">Descripción</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">Alumno</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">Fecha pago</th>
              <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">Registrado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="mov in movements.results"
              :key="`${mov.type}-${mov.id}`"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="typeBadgeClass(mov.type)">{{ typeLabel(mov.type) }}</span>
              </td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ monthName(mov.month) }}</td>
              <td
                class="px-4 py-3 text-right font-semibold whitespace-nowrap"
                :class="mov.type === 'expense' ? 'text-overdue' : 'text-paid'"
              >
                {{ mov.type === 'expense' ? '-' : '+' }}{{ formatAmount(mov.amount) }}
              </td>
              <td class="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                {{ mov.description || '–' }}
              </td>
              <td class="px-4 py-3 text-gray-700 whitespace-nowrap">
                {{ mov.student_name || '–' }}
              </td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDate(mov.date) }}</td>
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ formatDate(mov.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </template>

      <UiEmptyState v-else title="Sin movimientos" icon="heroicons:arrow-path" />
    </div>

    <!-- Pagination -->
    <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
      <p class="text-xs text-gray-500">
        <template v-if="movements?.count">
          Pág. {{ page }} de {{ totalPages }} · {{ movements.count }} movimientos
        </template>
      </p>
      <div class="flex gap-1">
        <button
          :disabled="page === 1 || pending"
          class="px-2 py-1 text-xs rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:enabled:bg-gray-50 transition-colors"
          @click="page--"
        >
          ‹ Anterior
        </button>
        <button
          :disabled="page >= totalPages || pending"
          class="px-2 py-1 text-xs rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:enabled:bg-gray-50 transition-colors"
          @click="page++"
        >
          Siguiente ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Movement } from '~/composables/useFinance'

const PAGE_SIZE = 20

const { fetchMovements } = useFinance()

const page = ref(1)

const { data: movements, pending } = useAsyncData(
  () => `finance-movements-${page.value}`,
  () => fetchMovements(page.value, PAGE_SIZE),
  { watch: [page] }
)

const totalPages = computed(() =>
  movements.value ? Math.max(1, Math.ceil(movements.value.count / PAGE_SIZE)) : 1
)

function typeLabel(type: Movement['type']) {
  return { monthly_payment: 'Mensualidad', manual_payment: 'Pago manual', expense: 'Egreso' }[type] ?? type
}

function typeBadgeClass(type: Movement['type']) {
  const base = 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium'
  return {
    monthly_payment: `${base} bg-green-100 text-green-700`,
    manual_payment:  `${base} bg-blue-100 text-blue-700`,
    expense:         `${base} bg-red-100 text-red-600`,
  }[type] ?? `${base} bg-gray-100 text-gray-600`
}

function formatAmount(n: number) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function monthName(month: number | undefined) {
  if (!month) return '–'
  return MONTHS[month - 1] ?? '–'
}

function formatDate(iso: string) {
  if (!iso) return '–'
  const [year, month, day] = iso.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
