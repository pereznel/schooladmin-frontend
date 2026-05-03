<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-gray-900">Pagos</h1>
      <select
        v-model="selectedYear"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="pending" class="p-8 flex justify-center">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <FinancePaymentsTable
        v-else-if="payments"
        :students="payments.students"
        :year="selectedYear"
        :monthly-totals="payments.monthly_totals"
        @cell-click="openPaymentModal"
      />

      <UiEmptyState v-else title="Sin datos de pago" icon="heroicons:banknotes" />
    </div>

    <!-- Payment modal -->
    <FinancePaymentModal
      :open="paymentModalOpen"
      :student-id="currentPayment?.student?.id"
      :student-name="currentPayment?.student?.name"
      :month="currentPayment?.month"
      :year="selectedYear"
      :loading="savingPayment"
      @close="paymentModalOpen = false"
      @submit="registerPaymentHandler"
    />
  </div>
</template>

<script setup lang="ts">
import type { NewPayment } from '~/composables/useFinance'

definePageMeta({ layout: 'admin', middleware: 'auth', breadcrumb: 'Pagos' })

const now = new Date()
const selectedYear = ref(now.getFullYear())
const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i)

const { fetchPayments, registerPayment: apiRegisterPayment } = useFinance()

const { data: payments, pending, refresh } = await useAsyncData(
  () => `payments-${selectedYear.value}`,
  () => fetchPayments(selectedYear.value),
  { watch: [selectedYear] }
)

const paymentModalOpen = ref(false)
const currentPayment = ref<{ student: { id: number; name: string }; month: number } | null>(null)
const savingPayment = ref(false)

function openPaymentModal(payload: { student: { id: number; name: string }; month: number; year: number }) {
  currentPayment.value = payload
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
</script>
