<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">Finanzas</h1>
      <select
        v-model="selectedYear"
        class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
      >
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <!-- KPIs -->
    <div v-if="pendingSummary" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="i in 4" :key="i" class="h-28 rounded-xl bg-gray-100 animate-pulse" />
    </div>

    <div v-else-if="summary" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <UiKpiCard title="Cobrado" :value="formatAmount(summary.total_collected)" icon="heroicons:check-circle" color="green" />
      <UiKpiCard title="Pendiente" :value="formatAmount(summary.total_pending)" icon="heroicons:clock" color="yellow" />
      <UiKpiCard title="Egresos" :value="formatAmount(summary.total_expenses)" icon="heroicons:arrow-trending-down" color="red" />
      <UiKpiCard title="Saldo neto" :value="formatAmount(summary.net_balance)" icon="heroicons:currency-dollar" color="green" />
    </div>

    <!-- Top row: income chart + movements table -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Income/expenses line chart with month filter -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="px-5 py-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-gray-800">Ingresos por mes</h2>
            <button
              v-if="selectedMonths.size > 0"
              class="text-xs text-gray-400 hover:text-primary transition-colors"
              @click="selectedMonths.clear()"
            >
              Limpiar
            </button>
          </div>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="(label, i) in MONTH_LABELS"
              :key="i"
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
                selectedMonths.has(i)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary hover:text-primary',
              ]"
              @click="toggleMonth(i)"
            >
              {{ label }}
            </button>
          </div>
        </div>
        <div class="p-4">
          <ClientOnly>
            <Line v-if="filteredLineChartData" :data="filteredLineChartData" :options="lineOptions" />
            <p v-else class="text-sm text-gray-400 text-center py-8">Sin datos</p>
          </ClientOnly>
        </div>
      </div>

      <!-- Recent movements table -->
      <FinanceMovementsTable />
    </div>

    <!-- Bottom: expenses by category donut -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="px-5 py-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-800">Egresos por categoría</h2>
      </div>
      <div class="p-4 flex items-center justify-center">
        <ClientOnly>
          <div class="w-64">
            <Doughnut v-if="donutChartData" :data="donutChartData" :options="donutOptions" />
            <p v-else class="text-sm text-gray-400 text-center py-8">Sin datos</p>
          </div>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import type { TooltipItem } from 'chart.js'
import { useFinance } from '../composables/useFinance'

const MONTH_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const now = new Date()
const selectedYear = ref(now.getFullYear())
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

const { fetchSummary, fetchChart } = useFinance()

const { data: summary, pending: pendingSummary, refresh: refreshSummary } = await useAsyncData(
  'finance-summary',
  () => fetchSummary(selectedYear.value)
)

const { data: chart, refresh: refreshChart } = await useAsyncData(
  'finance-chart',
  () => fetchChart(selectedYear.value)
)

watch(selectedYear, () => {
  refreshSummary()
  refreshChart()
})

// Month filter
const selectedMonths = reactive(new Set<number>())

function toggleMonth(i: number) {
  if (selectedMonths.has(i)) selectedMonths.delete(i)
  else selectedMonths.add(i)
}

const filteredLineChartData = computed(() => {
  if (!chart.value) return null
  const indices = selectedMonths.size > 0
    ? Array.from(selectedMonths).sort((a, b) => a - b)
    : Array.from({ length: 12 }, (_, i) => i)
  return {
    labels: indices.map(i => chart.value!.labels[i]),
    datasets: [
      {
        label: 'Ingresos',
        data: indices.map(i => chart.value!.income[i]),
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22,163,74,0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Egresos',
        data: indices.map(i => chart.value!.expenses[i]),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220,38,38,0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  }
})

const donutChartData = computed(() => {
  if (!chart.value?.expense_categories?.length) return null
  return {
    labels: chart.value.expense_categories.map(c => c.label),
    datasets: [{
      data: chart.value.expense_categories.map(c => c.valor),
      backgroundColor: ['#C1524A','#7C3AED','#DB2777','#A84040','#D97706','#EA580C','#78716C'],
      borderWidth: 0,
    }],
  }
})

const lineOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: 'top' as const },
    tooltip: { callbacks: { label: (ctx: TooltipItem<'line'>) => `${ctx.dataset.label ?? ''}: $${(ctx.parsed.y ?? 0).toLocaleString('es-AR')}` } },
  },
  scales: { y: { ticks: { callback: (v: string | number) => '$' + Number(v).toLocaleString('es-AR') } } },
}

const donutOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom' as const } },
}

function formatAmount(n: number) {
  return '$' + n.toLocaleString('es-AR')
}
</script>
