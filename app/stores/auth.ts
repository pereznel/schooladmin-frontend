import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    refreshToken: null as string | null,
    user: null as { username: string } | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(username: string, password: string) {
      const config = useRuntimeConfig()
      const data = await $fetch<{ access: string; refresh: string }>('/api/auth/login/', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: { username, password },
      })
      this.token = data.access
      this.refreshToken = data.refresh
      this.user = { username }
      if (import.meta.client) {
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
      }
    },
    logout() {
      this.token = null
      this.refreshToken = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
      navigateTo('/login')
    },
    initFromStorage() {
      if (import.meta.client) {
        this.token = localStorage.getItem('access_token')
        this.refreshToken = localStorage.getItem('refresh_token')
      }
    },
  },
})
