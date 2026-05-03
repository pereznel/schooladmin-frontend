export const useResources = () => {
  const { apiFetch } = useApi()

  const fetchReadingList = () =>
    apiFetch<ReadingItem[]>('/api/reading/')

  return { fetchReadingList }
}

export interface ReadingItem {
  id: number
  title: string
  author: string
  pdf_url: string
  month: number
  month_display: string
  teacher_name: string
}
