export const useApi = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (auth.token) {
        options.headers = new Headers({
          ...(options.headers instanceof Headers
            ? Object.fromEntries(options.headers.entries())
            : (options.headers as Record<string, string> || {})),
          Authorization: `Bearer ${auth.token}`,
        })
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        const route = useRoute()
        if (route.path.startsWith('/admin')) {
          auth.logout()
          navigateTo('/login')
        }
      }
    },
  })

  return { apiFetch }
}
