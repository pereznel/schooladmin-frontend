<template>
  <div class="bg-white rounded-xl border border-gray-200 flex flex-col">
    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <h2 class="font-semibold text-gray-800">Últimos movimientos</h2>
      <NuxtLink to="/finance/movimientos" class="text-xs font-medium text-primary hover:underline">
        Ver todos →
      </NuxtLink>
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
                <span :class="movementTypeBadgeClass(mov.type)">{{ movementTypeLabel(mov.type) }}</span>
              </td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ monthName(mov.month) }}</td>
              <td
                class="px-4 py-3 text-right font-semibold whitespace-nowrap"
                :class="mov.type === 'expense' ? 'text-overdue' : 'text-paid'"
              >
                {{ mov.type === 'expense' ? '-' : '+' }}{{ formatClp(mov.amount) }}
              </td>
              <td class="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                {{ mov.description || '–' }}
              </td>
              <td class="px-4 py-3 text-gray-700 whitespace-nowrap">
                {{ mov.student_name || 'No aplica' }}
              </td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatShortDate(mov.date) }}</td>
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ formatShortDate(mov.created_at) }}</td>
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

const PAGE_SIZE = 20

const { fetchMovements } = useFinance()

const page = ref(1)

const { data: movements, pending } = useAsyncData(
  () => `finance-movements-${page.value}`,
  () => fetchMovements({ page: page.value, page_size: PAGE_SIZE }),
  { watch: [page] }
)

const totalPages = computed(() =>
  movements.value ? Math.max(1, Math.ceil(movements.value.count / PAGE_SIZE)) : 1
)
</script>
