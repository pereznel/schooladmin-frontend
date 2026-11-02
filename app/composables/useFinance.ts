export const useFinance = () => {
  const { apiFetch } = useApi()

  const fetchSummary = (year?: number) =>
    apiFetch<FinancialSummary>(`/api/finance/summary/${year ? `?year=${year}` : ''}`)

  const fetchChart = async (year?: number): Promise<ChartData> => {
    const query = year ? `?year=${year}` : ''
    const raw = await apiFetch<{ month: string; income: number; expenses: number }[]>(`/api/finance/chart/${query}`)
    return {
      labels: raw.map(r => r.month),
      income: raw.map(r => r.income),
      expenses: raw.map(r => r.expenses),
    }
  }

  const fetchExpensesByCategory = (year?: number) =>
    apiFetch<ExpenseCategoryTotal[]>('/api/finance/expenses-by-category/', { query: year ? { year } : {} })

  const fetchPayments = (year: number) =>
    apiFetch<PaymentsTableData>(`/api/finance/payments/?year=${year}`)

  const registerPayment = (body: NewPayment) =>
    apiFetch('/api/finance/payments/', { method: 'POST', body })

  const fetchExpenses = (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiFetch<Expense[]>(`/api/finance/expenses/${query}`)
  }

  const createExpense = (body: Partial<Expense>) =>
    apiFetch<Expense>('/api/finance/expenses/', { method: 'POST', body })

  const updateExpense = (id: number | string, body: Partial<Expense>) =>
    apiFetch<Expense>(`/api/finance/expenses/${id}/`, { method: 'PATCH', body })

  const deleteExpense = (id: number | string) =>
    apiFetch(`/api/finance/expenses/${id}/`, { method: 'DELETE' })

  const fetchMovements = (params: MovementFilters & { page?: number; page_size?: number } = {}) =>
    apiFetch<MovementsPage>('/api/finance/movements/', { query: withoutEmpty(params) })

  const fetchMovementFilterOptions = () =>
    apiFetch<MovementFilterOptions>('/api/finance/movements/filters/')

  const downloadMovementsCsv = async (year: number) => {
    const blob = await apiFetch<Blob>('/api/finance/movements/export/', { query: { year }, responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `movimientos-${year}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const fetchBankAccounts = () =>
    apiFetch<BankAccount[]>('/api/finance/bank-accounts/')

  return { fetchSummary, fetchChart, fetchExpensesByCategory, fetchPayments, registerPayment, fetchExpenses, createExpense, updateExpense, deleteExpense, fetchMovements, fetchMovementFilterOptions, downloadMovementsCsv, fetchBankAccounts }
}

function withoutEmpty(params: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
}

// Shared display helpers for movements

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export function movementTypeLabel(type: Movement['type']) {
  return { monthly_payment: 'Mensualidad', manual_payment: 'Ingreso manual', expense: 'Egreso' }[type] ?? type
}

export function movementTypeBadgeClass(type: Movement['type']) {
  const base = 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium'
  return {
    monthly_payment: `${base} bg-green-100 text-green-700`,
    manual_payment:  `${base} bg-blue-100 text-blue-700`,
    expense:         `${base} bg-red-100 text-red-600`,
  }[type] ?? `${base} bg-gray-100 text-gray-600`
}

export function formatClp(n: number | string) {
  const value = Math.round(Number(n))
  const digits = Math.abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return (value < 0 ? '-$' : '$') + digits
}

export function monthName(month: number | null | undefined) {
  if (!month) return '–'
  return MONTH_NAMES[month - 1] ?? '–'
}

export function formatShortDate(iso: string | null | undefined) {
  if (!iso) return '–'
  const [year, month, day] = iso.split('T')[0]!.split('-').map(Number)
  return new Date(year!, month! - 1, day).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export interface FinancialSummary {
  total_collected: number
  total_income: number
  total_expenses: number
  net_balance: number
}

export interface ChartData {
  labels: string[]
  income: number[]
  expenses: number[]
}

export interface ExpenseCategoryTotal {
  label: string
  color: string
  total: number
}

export interface PaymentsTableData {
  students: { id: number; name: string; months: PaymentCell[] }[]
  monthly_totals: number[]
}

export interface PaymentCell {
  month: number
  amount: number
  status: 'paid' | 'partial' | 'overdue' | 'pending' | null
}

export interface NewPayment {
  student_id: number
  month: number
  year: number
  amount: number
  description?: string
}

export interface Expense {
  id: number
  date: string
  description: string
  category: string
  amount: number
}

export interface Movement {
  id: number
  type: 'manual_payment' | 'monthly_payment' | 'expense'
  amount: number
  date: string
  created_at: string
  description?: string
  student_id?: number | null
  student_name?: string | null
  month?: number | null
  year?: number | null
  category?: string | null
  method?: 'cash' | 'bank_transfer' | 'other' | null
}

export interface MovementsPage {
  count: number
  next: string | null
  previous: string | null
  results: Movement[]
  totals: { income: number; expenses: number; net: number }
}

export interface MovementFilters {
  type?: 'income' | 'expense' | 'monthly_payment' | 'manual_payment' | ''
  student?: number | string
  category?: number | string
  method?: string
  date_from?: string
  date_to?: string
  fee_month?: number | string
  fee_year?: number | string
  search?: string
  ordering?: 'date' | '-date' | 'amount' | '-amount'
}

export interface MovementFilterOptions {
  students: { id: number; full_name: string }[]
  categories: { id: number; name: string; color: string }[]
  methods: { value: string; label: string }[]
  years: number[]
}

export interface BankAccount {
  id: number
  name: string
  rut: string
  bank: string
  account_type: 'corriente' | 'vista' | 'ahorro'
  account_type_display: string
  account_number: string
  email: string
  is_favorite: boolean
}
