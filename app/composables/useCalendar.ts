export const useCalendar = () => {
  const { apiFetch } = useApi()

  const fetchEvents = async (): Promise<CalendarEvent[]> => {
    const res = await apiFetch<{ results: CalendarEvent[] } | CalendarEvent[]>('/api/calendar/events/?page_size=100')
    return Array.isArray(res) ? res : res.results
  }

  const fetchEvent = (id: number | string) =>
    apiFetch<CalendarEventDetail>(`/api/calendar/events/${id}/`)

  const createEvent = (body: Partial<CalendarEventWrite>) =>
    apiFetch<CalendarEventDetail>('/api/calendar/events/', { method: 'POST', body })

  const updateEvent = (id: number | string, body: Partial<CalendarEventWrite>) =>
    apiFetch<CalendarEventDetail>(`/api/calendar/events/${id}/`, { method: 'PATCH', body })

  const deleteEvent = (id: number | string) =>
    apiFetch(`/api/calendar/events/${id}/`, { method: 'DELETE' })

  const fetchSchedule = () =>
    apiFetch<ClassScheduleEntry[]>('/api/calendar/schedule/')

  return { fetchEvents, fetchEvent, createEvent, updateEvent, deleteEvent, fetchSchedule }
}

/** Shape returned by the LIST endpoint (FullCalendar-compatible) */
export interface CalendarEvent {
  id: number
  title: string
  start: string
  end?: string
  allDay?: boolean
  color?: string
  extendedProps?: {
    event_type?: string
    description?: string
  }
}

/** Shape returned by the DETAIL endpoint */
export interface CalendarEventDetail {
  id: number
  title: string
  event_type?: { id: number; name: string; color: string; icon?: string }
  start_date: string
  end_date?: string
  all_day: boolean
  description?: string
  review?: string
  recurring?: boolean
  attachments?: { id: number; file: string; original_name: string; mime_type?: string }[]
}

export interface ClassScheduleEntry {
  schedule_id: number
  block_id: number
  subject: string
  color: string
  start_time: string
  end_time: string
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

/** Shape used when creating/updating */
export interface CalendarEventWrite {
  title: string
  event_type?: number
  start_date: string
  end_date?: string
  all_day?: boolean
  description?: string
  review?: string
  students?: number[]
}
