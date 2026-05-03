export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
  ],
  plugins: ['~/plugins/chartjs'],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000',
    },
  },
  experimental: {
    viteEnvironmentApi: true,
  },
})
