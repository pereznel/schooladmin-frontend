<template>
  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', config.classes]">
    <span :class="['w-1.5 h-1.5 rounded-full', config.dot]" />
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: 'paid' | 'partial' | 'overdue' | 'pending' | 'active' | 'inactive' | 'graduated'
}>()

const statusConfig = {
  paid:      { label: 'Pagado',   classes: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
  partial:   { label: 'Parcial',  classes: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500'  },
  overdue:   { label: 'Vencido',  classes: 'bg-red-100 text-red-700',      dot: 'bg-red-500'    },
  pending:   { label: 'Pendiente',classes: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400'   },
  active:    { label: 'Activo',   classes: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
  inactive:  { label: 'Inactivo', classes: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400'   },
  graduated: { label: 'Egresado', classes: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'   },
}

const config = computed(() => statusConfig[props.status] || statusConfig.pending)
</script>
