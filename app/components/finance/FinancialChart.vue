<template>
  <div>
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { TooltipItem } from 'chart.js'
import type { ChartData } from '~/composables/useFinance'

const props = defineProps<{
  chart: ChartData | null
}>()

const chartData = computed(() => {
  if (!props.chart) return null
  return {
    labels: props.chart.labels,
    datasets: [
      {
        label: 'Ingresos',
        data: props.chart.income,
        backgroundColor: 'rgba(22, 163, 74, 0.7)',
        borderColor: '#16A34A',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Egresos',
        data: props.chart.expenses,
        backgroundColor: 'rgba(220, 38, 38, 0.6)',
        borderColor: '#DC2626',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: 'top' as const },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) =>
          `${ctx.dataset.label ?? ''}: $${(ctx.parsed.y ?? 0).toLocaleString('es-AR')}`,
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (v: string | number) => '$' + Number(v).toLocaleString('es-AR'),
      },
    },
  },
}
</script>
