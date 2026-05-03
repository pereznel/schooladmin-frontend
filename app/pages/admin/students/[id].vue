<template>
  <div>
    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <div class="h-24 rounded-xl bg-gray-100 animate-pulse" />
      <div class="h-48 rounded-xl bg-gray-100 animate-pulse" />
    </div>

    <template v-else-if="student">
      <!-- Student header -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <div class="flex items-start gap-4 flex-wrap">
          <StudentsStudentAvatar :student="student" size="xl" />

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ student.first_name }} {{ student.last_name }}
                </h1>
                <div class="flex flex-wrap gap-2 mt-2">
                  <UiStatusBadge :status="student.status" />
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  @click="editingStudent = true"
                >
                  <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
              <span v-if="student.email" class="flex items-center gap-1">
                <Icon name="heroicons:envelope" class="w-4 h-4" />
                {{ student.email }}
              </span>
              <span v-if="student.phone" class="flex items-center gap-1">
                <Icon name="heroicons:phone" class="w-4 h-4" />
                {{ student.phone }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="heroicons:banknotes" class="w-4 h-4" />
                Cuota mensual: {{ formatAmount(student.monthly_fee) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h2 class="font-semibold text-gray-800 mb-3">Notas privadas</h2>
        <textarea
          v-model="editedNotes"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          placeholder="Notas internas..."
          @blur="saveNotes"
        />
        <p v-if="savingNotes" class="text-xs text-gray-400 mt-1">Guardando...</p>
      </div>

      <!-- Annual payments -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Pagos anuales</h2>
          <select
            v-model="selectedYear"
            class="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 text-left">
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mes</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Esperado</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pagado</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="payment in filteredPayments" :key="payment.month">
                <td class="px-5 py-3 font-medium text-gray-800">{{ MONTHS[payment.month - 1] }}</td>
                <td class="px-5 py-3 text-gray-600">{{ formatAmount(payment.expected_amount) }}</td>
                <td class="px-5 py-3 text-gray-600">{{ formatAmount(payment.paid_amount) }}</td>
                <td class="px-5 py-3">
                  <UiStatusBadge :status="payment.status" />
                </td>
                <td class="px-5 py-3">
                  <button
                    v-if="payment.status !== 'paid'"
                    class="text-sm font-medium text-primary hover:underline"
                    @click="openPayment(payment)"
                  >
                    Cobrar
                  </button>
                  <span v-else class="text-gray-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Edit student modal -->
    <UiModalBase :open="editingStudent" title="Editar alumno" size="lg" @close="editingStudent = false">
      <StudentsStudentForm
        :student="student || undefined"
        :loading="savingStudent"
        @submit="saveStudent"
        @cancel="editingStudent = false"
      />
    </UiModalBase>

    <!-- Payment modal -->
    <FinancePaymentModal
      :open="paymentModalOpen"
      :student-id="student?.id"
      :student-name="`${student?.first_name} ${student?.last_name}`"
      :month="selectedPayment?.month"
      :year="selectedYear"
      :suggested-amount="student?.monthly_fee"
      :loading="savingPayment"
      @close="paymentModalOpen = false"
      @submit="registerPaymentHandler"
    />
  </div>
</template>

<script setup lang="ts">
import type { Student, StudentPayment } from '~/composables/useStudents'
import type { NewPayment } from '~/composables/useFinance'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { fetchStudent, updateStudent } = useStudents()
const { registerPayment: apiRegisterPayment } = useFinance()

const now = new Date()
const selectedYear = ref(now.getFullYear())
const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i)

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const { data: student, pending, refresh } = await useAsyncData(
  `student-${id.value}`,
  () => fetchStudent(id.value)
)

useHead({ title: computed(() => student.value ? `${student.value.first_name} ${student.value.last_name}` : 'Alumno') })

const editedNotes = ref(student.value?.notes || '')
const savingNotes = ref(false)
const editingStudent = ref(false)
const savingStudent = ref(false)
const paymentModalOpen = ref(false)
const selectedPayment = ref<StudentPayment | null>(null)
const savingPayment = ref(false)

const filteredPayments = computed(() =>
  (student.value?.payments || []).filter(p => p.year === selectedYear.value)
)

async function saveNotes() {
  if (!student.value || editedNotes.value === student.value.notes) return
  savingNotes.value = true
  try {
    await updateStudent(student.value.id, { notes: editedNotes.value })
  } finally {
    savingNotes.value = false
  }
}

async function saveStudent(data: Partial<Student>) {
  if (!student.value) return
  savingStudent.value = true
  try {
    await updateStudent(student.value.id, data)
    await refresh()
    editingStudent.value = false
  } finally {
    savingStudent.value = false
  }
}

function openPayment(payment: StudentPayment) {
  selectedPayment.value = payment
  paymentModalOpen.value = true
}

async function registerPaymentHandler(data: NewPayment) {
  savingPayment.value = true
  try {
    await apiRegisterPayment(data)
    await refresh()
    paymentModalOpen.value = false
  } finally {
    savingPayment.value = false
  }
}

function formatAmount(n: number) {
  return '$' + n.toLocaleString('es-AR')
}
</script>
