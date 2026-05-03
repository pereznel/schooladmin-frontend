<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <NuxtLink to='/admin/students' class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <h1 class="text-xl font-bold text-gray-900">Nuevo alumno</h1>
      </div>
    </div>

    <div class="max-w-2xl">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <StudentsStudentForm
          :loading="saving"
          @submit="createStudentHandler"
          @cancel="navigateTo('/admin/students')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Student } from '~/composables/useStudents'

definePageMeta({ layout: 'admin', middleware: 'auth', breadcrumb: 'Nuevo alumno' })

const saving = ref(false)
const { createStudent } = useStudents()

async function createStudentHandler(data: Partial<Student>) {
  saving.value = true
  try {
    const newStudent = await createStudent(data)
    navigateTo(`/admin/students/${newStudent.id}`)
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>
