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
      expense_categories: [],
    }
  }

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

  const fetchMovements = (page = 1, pageSize = 20) =>
    apiFetch<MovementsPage>(`/api/finance/movements/?page=${page}&page_size=${pageSize}`)

  return { fetchSummary, fetchChart, fetchPayments, registerPayment, fetchExpenses, createExpense, updateExpense, deleteExpense, fetchMovements }
}

export interface FinancialSummary {
  total_collected: number
  total_pending: number
  total_expenses: number
  net_balance: number
}

export interface ChartData {
  labels: string[]
  income: number[]
  expenses: number[]
  expense_categories?: { label: string; valor: number }[]
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
  student_name?: string
  month?: number
  year?: number
  category?: string
}

export interface MovementsPage {
  count: number
  next: string | null
  previous: string | null
  results: Movement[]
}
