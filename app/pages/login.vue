<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
          <Icon name="heroicons:academic-cap" class="w-9 h-9 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Administrador de curso</h1>
        <p class="text-sm text-gray-500 mt-1">Acceso de administrador</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <Form @submit="onSubmit" :validation-schema="schema" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
            <Field name="username">
              <template #default="{ field, errorMessage }">
                <input
                  v-bind="field"
                  type="text"
                  autocomplete="username"
                  :class="['w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors', errorMessage ? 'border-red-400' : 'border-gray-300']"
                  placeholder="usuario"
                />
                <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
              </template>
            </Field>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
            <Field name="password">
              <template #default="{ field, errorMessage }">
                <input
                  v-bind="field"
                  type="password"
                  autocomplete="current-password"
                  :class="['w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors', errorMessage ? 'border-red-400' : 'border-gray-300']"
                  placeholder="••••••••"
                />
                <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
              </template>
            </Field>
          </div>

          <!-- Login error -->
          <div v-if="loginError" class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4 text-red-500 shrink-0" />
            <p class="text-sm text-red-600">{{ loginError }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon v-if="loading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </Form>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">
        <NuxtLink to="/" class="hover:text-primary transition-colors">← Volver al inicio</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: false })

const auth = useAuthStore()
const router = useRouter()

// Redirect if already authenticated
if (auth.isAuthenticated) {
  navigateTo('/admin/students')
}

const loading = ref(false)
const loginError = ref('')

const schema = yup.object({
  username: yup.string().required('El usuario es requerido'),
  password: yup.string().required('La contraseña es requerida'),
})

async function onSubmit(values: Record<string, unknown>) {
  loading.value = true
  loginError.value = ''
  try {
    await auth.login(values.username as string, values.password as string)
    await router.push('/admin/students')
  } catch (e: unknown) {
    const err = e as { data?: { detail?: string } }
    loginError.value = err?.data?.detail || 'Usuario o contraseña incorrectos'
  } finally {
    loading.value = false
  }
}
</script>
