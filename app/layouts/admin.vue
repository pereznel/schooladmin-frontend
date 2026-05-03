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
          v-for="item in allNav"
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
      </nav>

      <!-- Collapse toggle + logout -->
      <div class="border-t border-gray-100 pt-2 pb-3 flex flex-col items-center gap-1 px-2">
        <!-- Collapse toggle -->
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

        <!-- Logout -->
        <button
          :class="[
            'flex items-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors',
            appStore.sidebarCollapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full px-3 py-2 gap-3',
          ]"
          :title="appStore.sidebarCollapsed ? 'Cerrar sesión' : undefined"
          @click="auth.logout()"
        >
          <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 shrink-0" />
          <span v-if="!appStore.sidebarCollapsed" class="text-sm font-medium truncate">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 sticky top-0 z-10">
        <!-- Mobile toggle -->
        <button
          class="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 shrink-0"
          @click="mobileOpen = !mobileOpen"
        >
          <Icon name="heroicons:bars-3" class="w-5 h-5" />
        </button>

        <!-- Search -->
        <div class="flex-1 max-w-sm">
          <div class="relative">
            <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar..."
              class="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 ml-auto shrink-0">
          <span v-if="route.meta.breadcrumb" class="hidden sm:block text-sm text-gray-500 border-r border-gray-200 pr-3 mr-1">
            {{ route.meta.breadcrumb }}
          </span>
          <a
            href="https://colegioconfederacionsuiza.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden md:flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Icon name="heroicons:building-library" class="w-4 h-4 text-gray-400 group-hover:text-primary" />
            <span class="font-medium">Escuela</span>
          </a>
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {{ auth.user?.username?.charAt(0).toUpperCase() || 'A' }}
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-4 lg:p-6">
        <slot />
      </main>

      <!-- Mobile bottom nav -->
      <nav class="lg:hidden border-t border-gray-200 bg-white flex items-center justify-around h-14 shrink-0">
        <NuxtLink
          v-for="item in allNav.slice(0, 5)"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary transition-colors px-2"
          active-class="text-primary"
        >
          <Icon :name="item.icon" class="w-5 h-5" />
          <span class="text-[10px]">{{ item.shortLabel ?? item.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useAppStore } from '../stores/app'

const auth = useAuthStore()
const appStore = useAppStore()
const route = useRoute()
const mobileOpen = ref(false)

const allNav = [
  { to: '/', icon: 'heroicons:squares-2x2', label: 'Panel' },
  { to: '/calendar', icon: 'heroicons:calendar-days', label: 'Calendario' },
  { to: '/horario', icon: 'heroicons:clock', label: 'Horario' },
  { to: '/finance', icon: 'heroicons:chart-bar', label: 'Finanzas' },
]
</script>
