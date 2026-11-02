<template>
  <div>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">Finanzas</h1>
    </div>

    <!-- Tabs: each one is its own route so it can be linked directly -->
    <div class="flex border-b border-gray-200 mb-6 overflow-x-auto">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        active-class="!border-primary !text-primary"
      >
        {{ tab.label }}
      </NuxtLink>
    </div>

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { to: '/finance/caja', label: 'Control de Caja' },
  { to: '/finance/movimientos', label: 'Movimientos' },
  { to: '/finance/datos-bancarios', label: 'Datos Bancarios' },
]
</script>
