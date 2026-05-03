<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-gray-900">Egresos</h1>
      <button
        class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        @click="openNewExpense()"
      >
        <Icon name="heroicons:plus" class="w-4 h-4" />
        Nuevo egreso
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-5">
      <select
        v-model="categoryFilter"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Todas las categorías</option>
        <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
      </select>
      <input
        v-model="dateFrom"
        type="date"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <input
        v-model="dateTo"
        type="date"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>

    <!-- Monthly total -->
    <div class="bg-white rounded-xl border border-gray-200 p-5 mb-5">
      <p class="text-sm text-gray-500 mb-1">Total egresos del mes</p>
      <p class="text-3xl font-bold text-overdue">{{ formatAmount(monthlyTotal) }}</p>
    </div>

    <!-- Expenses list -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="pending" class="p-8 flex justify-center">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="expenses?.length">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 text-left">
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Monto</th>
              <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="expense in expenses" :key="expense.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-3 text-gray-600 whitespace-nowrap">{{ formatDate(expense.date) }}</td>
              <td class="px-5 py-3 text-gray-800">{{ expense.description }}</td>
              <td class="px-5 py-3">
                <span class="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {{ expense.category }}
                </span>
              </td>
              <td class="px-5 py-3 text-right font-semibold text-overdue">{{ formatAmount(expense.amount) }}</td>
              <td class="px-5 py-3">
                <button
                  class="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                  @click="openEditExpense(expense)"
                >
                  <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                </button>
                <button
                  class="p-1.5 text-gray-400 hover:text-overdue hover:bg-red-50 rounded-lg transition-colors ml-1"
                  @click="confirmDelete(expense)"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiEmptyState v-else title="Sin egresos" description="Sin egresos para los filtros seleccionados" icon="heroicons:arrow-trending-down" />
    </div>

    <!-- New/edit expense modal -->
    <UiModalBase
      :open="modalOpen"
      :title="editingExpense ? 'Editar egreso' : 'Nuevo egreso'"
      @close="closeModal()"
    >
      <FinanceExpenseForm
        :expense="editingExpense || undefined"
        :loading="savingExpense"
        @submit="saveExpense"
        @cancel="closeModal()"
      />
    </UiModalBase>
  </div>
</template>

<script setup lang="ts">
import type { Expense } from '~/composables/useFinance'

definePageMeta({ layout: 'admin', middleware: 'auth', breadcrumb: 'Egresos' })

const CATEGORIES = [
  { value: 'Materials', label: 'Materiales' },
  { value: 'Rent', label: 'Alquiler' },
  { value: 'Services', label: 'Servicios' },
  { value: 'Equipment', label: 'Equipamiento' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Other', label: 'Otro' },
]

const categoryFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const { fetchExpenses, createExpense, updateExpense, deleteExpense } = useFinance()

const { data: expenses, pending, refresh } = await useAsyncData(
  () => `expenses-${categoryFilter.value}-${dateFrom.value}-${dateTo.value}`,
  () => {
    const params: Record<string, string> = {}
    if (categoryFilter.value) params.categoria = categoryFilter.value
    if (dateFrom.value) params.desde = dateFrom.value
    if (dateTo.value) params.hasta = dateTo.value
    return fetchExpenses(params)
  },
  { watch: [categoryFilter, dateFrom, dateTo] }
)

const monthlyTotal = computed(() =>
  (expenses.value || []).reduce((sum, e) => sum + e.amount, 0)
)

const modalOpen = ref(false)
const editingExpense = ref<Expense | null>(null)
const savingExpense = ref(false)

function openNewExpense() {
  editingExpense.value = null
  modalOpen.value = true
}

function openEditExpense(expense: Expense) {
  editingExpense.value = expense
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingExpense.value = null
}

async function saveExpense(data: Partial<Expense>) {
  savingExpense.value = true
  try {
    if (editingExpense.value) {
      await updateExpense(editingExpense.value.id, data)
    } else {
      await createExpense(data)
    }
    await refresh()
    closeModal()
  } finally {
    savingExpense.value = false
  }
}

async function confirmDelete(expense: Expense) {
  if (!confirm(`¿Eliminar el egreso "${expense.description}"?`)) return
  await deleteExpense(expense.id)
  await refresh()
}

function formatAmount(n: number) {
  return '$' + n.toLocaleString('es-AR')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
</script>
