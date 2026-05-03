export const useStudents = () => {
  const { apiFetch } = useApi()

  const fetchStudents = (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiFetch<Student[]>(`/api/students/${query}`)
  }

  const fetchStudent = (id: number | string) =>
    apiFetch<Student>(`/api/students/${id}/`)

  const createStudent = (body: Partial<Student>) =>
    apiFetch<Student>('/api/students/', { method: 'POST', body })

  const updateStudent = (id: number | string, body: Partial<Student>) =>
    apiFetch<Student>(`/api/students/${id}/`, { method: 'PATCH', body })

  const deleteStudent = (id: number | string) =>
    apiFetch(`/api/students/${id}/`, { method: 'DELETE' })

  return { fetchStudents, fetchStudent, createStudent, updateStudent, deleteStudent }
}

export interface Student {
  id: number
  first_name: string
  last_name: string
  email?: string
  phone?: string
  photo?: string
  status: 'active' | 'inactive' | 'graduated'
  monthly_fee: number
  notes?: string
  payments?: StudentPayment[]
}

export interface StudentPayment {
  month: number
  year: number
  expected_amount: number
  paid_amount: number
  status: 'paid' | 'partial' | 'overdue' | 'pending'
}
