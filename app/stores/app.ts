import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarOpen: false,
    sidebarCollapsed: false,
  }),
  actions: {
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen },
    closeSidebar() { this.sidebarOpen = false },
    toggleCollapsed() { this.sidebarCollapsed = !this.sidebarCollapsed },
  },
})
