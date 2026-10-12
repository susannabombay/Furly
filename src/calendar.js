// ─────────────────────────────────────────────────────────────────────────────
// calendar.js: everything to do with dates for the "Coming up" agenda
//
// 1. buildAgenda() gathers everything with a date into one sorted list:
//      • events you signed up for
//      • vaccines that are due (or overdue)
//      • your own reminders, including repeating ones
// 2. downloadIcs() and googleCalendarUrl() put an item into the phone's own
//    calendar. Furly can't send notifications by itself yet (that needs a
//    server), so the phone's calendar does the reminding for now.
//
// Dates are stored as "day keys" like "2026-10-17", in the phone's local
// time. Comparing two day keys as text gives the right order, which keeps
// the code simple.
// ─────────────────────────────────────────────────────────────────────────────
import { Syringe, Bell } from 'lucide-react'
import { EVENTS } from './content.js'

// ── Day helpers ─────────────────────────────────────────────────────────────

// Date → "2026-10-17" (local time, not UTC)
export function dayKey(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// "2026-10-17" → Date at local midnight
export function parseDay(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key, days) {
  const d = parseDay(key)
  d.setDate(d.getDate() + days)
  return dayKey(d)
}

export const todayKey = () => dayKey(new Date())

// The month grid for a calendar view, as a list of weeks (Monday first,
// as in Singapore). Days outside the month are null, so the grid lines up:
//   [[null, null, '2026-10-01', '2026-10-02', ...], [...], ...]
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const blanks = (first.getDay() + 6) % 7 // Sunday = 0 in JS, so shift to Monday = 0
  const cells = [
    ...Array(blanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => dayKey(new Date(year, month, i + 1))),
  ]
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
}

// ── Repeating reminders ─────────────────────────────────────────────────────
export const REPEATS = {
  none: 'Does not repeat',
  weekly: 'Every week',
  monthly: 'Every month',
  yearly: 'Every year',
}

// Ready-made reminder ideas shown as chips on the "add reminder" form.
export const REMINDER_PRESETS = [
  { title: 'Tick & flea prevention', repeat: 'monthly' },
  { title: 'Heartworm medicine', repeat: 'monthly' },
  { title: 'Deworming', repeat: 'none' },
  { title: 'Grooming', repeat: 'none' },
  { title: 'Nail trim', repeat: 'none' },
  { title: 'Vet check-up', repeat: 'yearly' },
]

// Every date a reminder happens on between `from` and `to` (inclusive).
// We always count from the original start date (start + 1 month, start + 2
// months…) so a reminder on the 31st doesn't drift to the 28th forever after
// February.
function occurrences(reminder, from, to) {
  const start = parseDay(reminder.date)
  if (reminder.repeat === 'none' || !REPEATS[reminder.repeat]) {
    return reminder.date >= from && reminder.date <= to ? [reminder.date] : []
  }
  const dates = []
  for (let i = 0; i < 1000; i++) {
    let d
    if (reminder.repeat === 'weekly') {
      d = new Date(start); d.setDate(start.getDate() + 7 * i)
    } else {
      const months = reminder.repeat === 'monthly' ? i : 12 * i
      const lastDay = new Date(start.getFullYear(), start.getMonth() + months + 1, 0).getDate()
      d = new Date(start.getFullYear(), start.getMonth() + months, Math.min(start.getDate(), lastDay))
    }
    const key = dayKey(d)
    if (key > to) break
    if (key >= from) dates.push(key)
  }
  return dates
}

// ── The agenda ──────────────────────────────────────────────────────────────
// Returns items sorted by date, each shaped like:
//   { id, kind: 'event' | 'vaccine' | 'reminder', date, time, title, subtitle, icon, color, ... }
// `includeOverdue` also adds vaccines that were due before `from` (used by
// the "Coming up" list, but not by the month calendar).
export function buildAgenda({ pets, signups, reminders, from, to, includeOverdue = true }) {
  const items = []
  const many = pets.length > 1 // only mention the pet's name if there's a choice

  // Events you've signed up for
  for (const e of EVENTS) {
    const date = e.date.slice(0, 10)
    const going = signups[e.id] // ids of the pets going, if any
    if (going && date >= from && date <= to) {
      const names = pets.filter((p) => going.includes(p.id)).map((p) => p.name).join(' & ')
      items.push({
        id: 'event-' + e.id, kind: 'event', event: e, date, time: e.date.slice(11, 16),
        title: e.title, subtitle: many ? `${e.place} · ${names}` : e.place, icon: e.icon, color: e.color,
      })
    }
  }

  for (const pet of pets) {
    // Vaccines due in the window (plus any already overdue, if asked for)
    for (const v of pet.vaccinations || []) {
      if (v.due && v.due <= to && (v.due >= from || includeOverdue)) {
        items.push({
          id: `vaccine-${pet.id}-${v.id}`, kind: 'vaccine', date: v.due, overdue: v.due < todayKey(),
          title: `${v.name} vaccine due`, subtitle: many ? pet.name : '', icon: Syringe, color: 'blush',
        })
      }
    }
  }

  // Your own reminders
  for (const r of reminders) {
    const pet = pets.find((p) => p.id === r.petId)
    if (!pet) continue // the pet was deleted
    for (const date of occurrences(r, from, to)) {
      items.push({
        id: `reminder-${r.id}-${date}`, kind: 'reminder', reminder: r, date, time: r.time,
        title: r.title,
        subtitle: [many && pet.name, r.repeat !== 'none' && REPEATS[r.repeat]].filter(Boolean).join(' · '),
        icon: Bell, color: 'lime',
      })
    }
  }

  // Sort by day, then by time (items without a time come first that day)
  return items.sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
}

// ── Adding to the phone's calendar ──────────────────────────────────────────

// Turns an agenda item into a simple description of a calendar entry.
function toCalendarEntry(item) {
  if (item.kind === 'event') {
    // Event times are Singapore time, so we say so explicitly (+08:00).
    const start = new Date(`${item.event.date}:00+08:00`)
    return {
      title: item.title, location: item.event.place, details: item.event.description,
      start, end: new Date(start.getTime() + 2 * 60 * 60 * 1000), allDay: false, repeat: 'none',
    }
  }
  if (item.kind === 'reminder' && item.time) {
    const [h, m] = item.time.split(':').map(Number)
    const start = parseDay(item.reminder.date)
    start.setHours(h, m)
    return {
      title: item.title, details: 'Reminder from Furly',
      start, end: new Date(start.getTime() + 30 * 60 * 1000), allDay: false, repeat: item.reminder.repeat,
    }
  }
  // Vaccines and reminders without a time become all-day entries.
  const date = item.kind === 'reminder' ? item.reminder.date : item.date
  return {
    title: item.title, details: 'Reminder from Furly',
    start: parseDay(date), allDay: true, repeat: item.reminder?.repeat || 'none',
  }
}

const RRULE = { weekly: 'FREQ=WEEKLY', monthly: 'FREQ=MONTHLY', yearly: 'FREQ=YEARLY' }

// Date → "20261016T233000Z" (UTC), the format calendar files use
const utcStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
// Date → "20261017" for all-day entries
const dayStamp = (d) => dayKey(d).replace(/-/g, '')

// Calendar files need commas, semicolons and line breaks "escaped".
const esc = (text = '') => text.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n')

// Creates and downloads an .ics file. Opening it adds the entry to Apple
// Calendar, Outlook, and most other calendar apps.
export function downloadIcs(item) {
  const e = toCalendarEntry(item)
  const nextDay = new Date(e.start); nextDay.setDate(nextDay.getDate() + 1)
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Furly//EN',
    'BEGIN:VEVENT',
    `UID:${item.id}@furly`,
    `DTSTAMP:${utcStamp(new Date())}`,
    e.allDay ? `DTSTART;VALUE=DATE:${dayStamp(e.start)}` : `DTSTART:${utcStamp(e.start)}`,
    e.allDay ? `DTEND;VALUE=DATE:${dayStamp(nextDay)}` : `DTEND:${utcStamp(e.end)}`,
    `SUMMARY:${esc(e.title)}`,
    e.location && `LOCATION:${esc(e.location)}`,
    `DESCRIPTION:${esc(e.details)}`,
    RRULE[e.repeat] && `RRULE:${RRULE[e.repeat]}`,
    // A notification: 1 hour before timed entries, 9am the day before all-day ones.
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(e.title)}`,
    `TRIGGER:${e.allDay ? '-PT15H' : '-PT1H'}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean)

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = e.title.replace(/[^\w]+/g, '-').toLowerCase() + '.ics'
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}

// A link that opens Google Calendar with the entry filled in.
export function googleCalendarUrl(item) {
  const e = toCalendarEntry(item)
  const nextDay = new Date(e.start); nextDay.setDate(nextDay.getDate() + 1)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: e.allDay
      ? `${dayStamp(e.start)}/${dayStamp(nextDay)}`
      : `${utcStamp(e.start)}/${utcStamp(e.end)}`,
    details: e.details || '',
    location: e.location || '',
  })
  if (RRULE[e.repeat]) params.set('recur', `RRULE:${RRULE[e.repeat]}`)
  return 'https://calendar.google.com/calendar/render?' + params
}
