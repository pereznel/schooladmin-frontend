<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-gray-900">Alumnos</h1>
      <NuxtLink
        to="/admin/students/new"
        class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Icon name="heroicons:plus" class="w-4 h-4" />
        Nuevo alumno
      </NuxtLink>
    </div>

    <!-- Search and filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-5">
      <div class="flex-1">
        <UiSearchInput v-model="searchQuery" placeholder="Buscar alumno..." />
      </div>

      <div class="flex gap-2">
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="graduated">Egresado</option>
        </select>
      </div>
    </div>

    <!-- Card grid -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-28 rounded-xl bg-gray-100 animate-pulse" />
    </div>

    <div v-else-if="filteredStudents.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <StudentsStudentCard
        v-for="student in filteredStudents"
        :key="student.id"
        :student="student"
        @click="navigateTo(`/admin/students/${student.id}`)"
      />
    </div>

    <UiEmptyState
      v-else
      title="Sin alumnos"
      :description="searchQuery ? `Sin resultados para «${searchQuery}»` : 'Aún no hay alumnos registrados'"
      icon="heroicons:users"
    >
      <NuxtLink
        v-if="!searchQuery"
        to="/admin/students/new"
        class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Icon name="heroicons:plus" class="w-4 h-4" />
        Agregar primer alumno
      </NuxtLink>
    </UiEmptyState>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth', breadcrumb: 'Alumnos' })

const searchQuery = ref('')
const statusFilter = ref('')

const { fetchStudents } = useStudents()

const { data: students, pending, refresh } = await useAsyncData(
  () => `students-${searchQuery.value}-${statusFilter.value}`,
  () => {
    const params: Record<string, string> = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (statusFilter.value) params.estado = statusFilter.value
    return fetchStudents(params)
  },
  { watch: [searchQuery, statusFilter] }
)

const filteredStudents = computed(() => students.value || [])
</script>
