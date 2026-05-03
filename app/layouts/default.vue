<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Mobile overlay -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-20 bg-black/40 lg:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ease-in-out',
        'lg:translate-x-0 lg:static lg:z-auto',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        appStore.sidebarCollapsed ? 'w-14' : 'w-56',
      ]"
    >
      <!-- Logo -->
      <div
        :class="[
          'flex items-center h-16 border-b border-gray-100 shrink-0 overflow-hidden transition-all duration-200',
          appStore.sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3',
        ]"
      >
        <img src="/logo.png" alt="Logo Colegio" class="w-9 h-9 object-contain shrink-0" />
        <span v-if="!appStore.sidebarCollapsed" class="font-bold text-sm text-gray-800 leading-tight">Administrador<br>de curso</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 flex flex-col py-3 gap-0.5 overflow-y-auto overflow-x-hidden px-2">
        <NuxtLink
          v-for="item in publicNav"
          :key="item.to"
          :to="item.to"
          :title="appStore.sidebarCollapsed ? item.label : undefined"
          :class="[
            'flex items-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors shrink-0',
            appStore.sidebarCollapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full px-3 py-2 gap-3',
          ]"
          active-class="bg-primary/10 text-primary"
          @click="mobileOpen = false"
        >
          <Icon :name="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="!appStore.sidebarCollapsed" class="text-sm font-medium truncate">{{ item.label }}</span>
        </NuxtLink>

        <div class="my-1 mx-2 border-t border-gray-200" />

        <a
          href="http://127.0.0.1:8000/admin/"
          target="_blank"
          rel="noopener noreferrer"
          :title="appStore.sidebarCollapsed ? 'Administración' : undefined"
          :class="[
            'flex items-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors shrink-0',
            appStore.sidebarCollapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full px-3 py-2 gap-3',
          ]"
        >
          <Icon name="heroicons:lock-closed" class="w-5 h-5 shrink-0" />
          <span v-if="!appStore.sidebarCollapsed" class="text-sm font-medium truncate">Administración</span>
        </a>
      </nav>

      <!-- Collapse toggle -->
      <div class="border-t border-gray-100 pt-2 pb-3 px-2">
        <button
          :class="[
            'flex items-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors',
            appStore.sidebarCollapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full px-3 py-2 gap-3',
          ]"
          :title="appStore.sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'"
          @click="appStore.toggleCollapsed()"
        >
          <Icon
            :name="appStore.sidebarCollapsed ? 'heroicons:chevron-right' : 'heroicons:chevron-left'"
            class="w-4 h-4 shrink-0"
          />
          <span v-if="!appStore.sidebarCollapsed" class="text-sm font-medium truncate">Colapsar</span>
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 sticky top-0 z-10">
        <!-- Logo (mobile only) -->
        <div class="flex items-center gap-2 lg:hidden shrink-0">
          <img src="/logo.png" alt="Logo" class="w-8 h-8 object-contain" />
          <span class="font-bold text-sm text-gray-800 leading-tight">Administrador<br>de curso</span>
        </div>

        <!-- Search (desktop only) -->
        <div class="hidden lg:flex flex-1 max-w-sm">
          <div class="relative w-full">
            <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar..."
              class="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 ml-auto shrink-0">
          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg px-3 py-1.5 transition-colors"
          >
            <Icon name="heroicons:lock-closed" class="w-3.5 h-3.5" />
            <span>Administrar</span>
          </a>
          <a
            href="https://colegioconfederacionsuiza.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden md:flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Icon name="heroicons:building-library" class="w-4 h-4 text-gray-400" />
            <span class="font-medium">Escuela</span>
          </a>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-4 pb-20 lg:pb-6 lg:p-6">
        <slot />
      </main>

      <!-- Mobile bottom nav -->
      <nav class="lg:hidden fixed bottom-0 inset-x-0 z-20 border-t border-gray-200 bg-white flex items-center justify-around h-14">
        <NuxtLink
          v-for="item in publicNav"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary transition-colors px-3"
          active-class="text-primary"
        >
          <Icon :name="item.icon" class="w-5 h-5" />
          <span class="text-[10px]">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const mobileOpen = ref(false)

const publicNav = [
  { to: '/', icon: 'heroicons:squares-2x2', label: 'Panel' },
  { to: '/calendar', icon: 'heroicons:calendar-days', label: 'Calendario' },
  { to: '/horario', icon: 'heroicons:clock', label: 'Horario' },
  { to: '/recursos', icon: 'heroicons:book-open', label: 'Recursos' },
  { to: '/finance', icon: 'heroicons:chart-bar', label: 'Finanzas' },
]
</script>
