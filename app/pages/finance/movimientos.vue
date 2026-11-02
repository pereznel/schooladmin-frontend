<template>
  <div>
    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="font-semibold text-gray-800">Filtros</h2>
        <div class="flex flex-wrap items-center gap-2">
          <span v-if="downloadError" class="text-xs text-overdue">No se pudo descargar el archivo</span>
          <button
            v-if="hasActiveFilters"
            class="text-xs text-gray-400 hover:text-primary transition-colors"
            @click="clearFilters"
          >
            Limpiar filtros
          </button>
          <span class="h-5 w-px bg-gray-200" />
          <select v-model.number="exportYear" :class="inputClass" aria-label="Año a descargar">
            <option v-for="y in options?.years ?? [exportYear]" :key="y" :value="y">{{ y }}</option>
          </select>
          <button
            :disabled="downloading"
            class="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors"
            @click="downloadCsv"
          >
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
            {{ downloading ? 'Descargando…' : 'Descargar CSV' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <UiSearchInput v-model="filters.search" placeholder="Buscar descripción o alumno…" />

        <select v-model="filters.type" :class="inputClass" aria-label="Tipo">
          <option value="">Todos los tipos</option>
          <option value="income">Solo ingresos</option>
          <option value="expense">Solo egresos</option>
          <option value="monthly_payment">Mensualidades</option>
          <option value="manual_payment">Ingresos manuales</option>
        </select>

        <select v-model="filters.student" :class="inputClass" aria-label="Alumno">
          <option value="">Todos los alumnos</option>
          <option v-for="s in options?.students" :key="s.id" :value="String(s.id)">{{ s.full_name }}</option>
        </select>

        <select v-model="filters.category" :class="inputClass" aria-label="Categoría de egreso">
          <option value="">Todas las categorías de egreso</option>
          <option v-for="c in options?.categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
        </select>

        <select v-model="filters.method" :class="inputClass" aria-label="Método de pago">
          <option value="">Todos los métodos</option>
          <option v-for="m in options?.methods" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>

        <label class="flex items-center gap-2 text-sm text-gray-500">
          <span class="shrink-0 w-12">Desde</span>
          <input v-model="filters.date_from" type="date" :class="[inputClass, 'w-full']" />
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-500">
          <span class="shrink-0 w-12">Hasta</span>
          <input v-model="filters.date_to" type="date" :min="filters.date_from || undefined" :class="[inputClass, 'w-full']" />
        </label>

        <div class="flex gap-2">
          <select v-model="filters.fee_month" :class="[inputClass, 'flex-1 min-w-0']" aria-label="Mes de la mensualidad">
            <option value="">Mensualidad: mes</option>
            <option v-for="(name, i) in MONTH_LABELS" :key="i" :value="String(i + 1)">{{ name }}</option>
          </select>
          <select v-model="filters.fee_year" :class="[inputClass, 'w-24']" aria-label="Año de la mensualidad">
            <option value="">Año</option>
            <option v-for="y in options?.years" :key="y" :value="String(y)">{{ y }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Totals of the filtered movements -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <UiKpiCard title="Ingresos" :value="formatClp(movements?.totals.income ?? 0)" icon="heroicons:arrow-trending-up" color="green" />
      <UiKpiCard title="Egresos" :value="formatClp(movements?.totals.expenses ?? 0)" icon="heroicons:arrow-trending-down" color="red" />
      <UiKpiCard
        title="Neto"
        :value="formatClp(movements?.totals.net ?? 0)"
        icon="heroicons:currency-dollar"
        :color="(movements?.totals.net ?? 0) < 0 ? 'red' : 'green'"
        :subtitle="hasActiveFilters ? 'Según los filtros aplicados' : 'Todos los movimientos'"
      />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 flex flex-col">
      <div class="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-semibold text-gray-800">Movimientos</h2>
        <select v-model="filters.ordering" :class="inputClass" aria-label="Ordenar por">
          <option value="-date">Más recientes primero</option>
          <option value="date">Más antiguos primero</option>
          <option value="-amount">Mayor monto primero</option>
          <option value="amount">Menor monto primero</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <div v-if="pending" class="p-8 flex justify-center">
          <div class="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>

        <table v-else-if="movements?.results?.length" class="min-w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th v-for="col in COLUMNS" :key="col.label" :class="[thClass, col.right ? 'text-right' : 'text-left']">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="mov in movements.results"
              :key="`${mov.type}-${mov.id}`"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatShortDate(mov.date) }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="movementTypeBadgeClass(mov.type)">{{ movementTypeLabel(mov.type) }}</span>
              </td>
              <td class="px-4 py-3 text-gray-600 max-w-[240px] truncate" :title="mov.description">
                {{ mov.description || '–' }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap" :class="mov.student_name ? 'text-gray-700' : 'text-gray-400'">
                {{ mov.student_name || 'No aplica' }}
              </td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ mov.category || '–' }}</td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ methodLabel(mov.method) }}</td>
              <td
                class="px-4 py-3 text-right font-semibold whitespace-nowrap"
                :class="mov.type === 'expense' ? 'text-overdue' : 'text-paid'"
              >
                {{ mov.type === 'expense' ? '-' : '+' }}{{ formatClp(mov.amount) }}
              </td>
            </tr>
          </tbody>
        </table>

        <UiEmptyState
          v-else
          title="Sin movimientos"
          :description="hasActiveFilters ? 'Ningún movimiento coincide con los filtros.' : undefined"
          icon="heroicons:arrow-path"
        />
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 text-xs text-gray-500">
          <label class="flex items-center gap-1.5">
            Mostrar
            <select v-model.number="pageSize" class="px-2 py-1 border border-gray-200 rounded text-xs bg-white">
              <option v-for="size in PAGE_SIZES" :key="size" :value="size">{{ size }}</option>
            </select>
          </label>
          <span v-if="movements?.count">Pág. {{ page }} de {{ totalPages }} · {{ movements.count }} movimientos</span>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useFinance, type MovementFilters } from '../../composables/useFinance'

const MONTH_LABELS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const PAGE_SIZES = [10, 20, 50, 100]
const DEFAULT_PAGE_SIZE = 20
const DEFAULT_ORDERING = '-date'
const COLUMNS = [
  { label: 'Fecha' }, { label: 'Tipo' }, { label: 'Descripción' }, { label: 'Alumno' },
  { label: 'Categoría' }, { label: 'Método' }, { label: 'Monto', right: true },
]
const FILTER_KEYS = ['search', 'type', 'student', 'category', 'method', 'date_from', 'date_to', 'fee_month', 'fee_year', 'ordering'] as const

type FilterState = Record<typeof FILTER_KEYS[number], string>

const inputClass = 'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30'
const thClass = 'px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap'

const route = useRoute()
const router = useRouter()
const { fetchMovements, fetchMovementFilterOptions, downloadMovementsCsv } = useFinance()

// Filters live in the URL so any filtered view can be linked directly.
function queryString(key: string) {
  const value = route.query[key]
  return typeof value === 'string' ? value : ''
}

const filters = reactive(Object.fromEntries(FILTER_KEYS.map(k => [k, queryString(k)])) as FilterState)
if (!filters.ordering) filters.ordering = DEFAULT_ORDERING

const page = ref(Number(queryString('page')) || 1)
const pageSize = ref(PAGE_SIZES.includes(Number(queryString('page_size'))) ? Number(queryString('page_size')) : DEFAULT_PAGE_SIZE)

const hasActiveFilters = computed(() =>
  FILTER_KEYS.some(k => k !== 'ordering' && filters[k] !== ''),
)

function clearFilters() {
  for (const k of FILTER_KEYS) filters[k] = ''
  filters.ordering = DEFAULT_ORDERING
}

watch(filters, () => { page.value = 1 })
watch(pageSize, () => { page.value = 1 })

const apiParams = computed(() => ({
  ...(filters as MovementFilters),
  page: page.value,
  page_size: pageSize.value,
}))

watch(apiParams, (params) => {
  const query: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v === undefined) continue
    if (k === 'page' && v === 1) continue
    if (k === 'page_size' && v === DEFAULT_PAGE_SIZE) continue
    if (k === 'ordering' && v === DEFAULT_ORDERING) continue
    query[k] = String(v)
  }
  router.replace({ query })
})

const { data: movements, pending } = useAsyncData(
  'finance-movements-explorer',
  () => fetchMovements(apiParams.value),
  { watch: [apiParams] },
)

const { data: options } = useAsyncData('finance-movement-filters', () => fetchMovementFilterOptions())

const totalPages = computed(() =>
  movements.value ? Math.max(1, Math.ceil(movements.value.count / pageSize.value)) : 1,
)

const methodLabels = computed(() =>
  Object.fromEntries((options.value?.methods ?? []).map(m => [m.value, m.label])),
)

function methodLabel(method: string | null | undefined) {
  return (method && methodLabels.value[method]) || '–'
}

// CSV export of a whole year
const exportYear = ref(new Date().getFullYear())
const downloading = ref(false)
const downloadError = ref(false)

async function downloadCsv() {
  downloading.value = true
  downloadError.value = false
  try {
    await downloadMovementsCsv(exportYear.value)
  } catch {
    downloadError.value = true
  } finally {
    downloading.value = false
  }
}
</script>
