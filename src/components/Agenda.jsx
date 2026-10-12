// ─────────────────────────────────────────────────────────────────────────────
// Agenda.jsx: the "Coming up" section on Home
//
//   • A strip of the next 7 days. A dot means something is planned.
//     Tap a day to see just that day, tap it again to see everything.
//   • "View full month" swaps the strip for a month calendar with ‹ ›
//     arrows, for things planned further ahead.
//   • A list grouped into Overdue / Today / This week / Later.
//     Tap an item to add it to your phone's calendar (or delete a reminder).
//   • "+ Reminder" opens a small form for your own (repeating) reminders.
//
// The date logic lives in calendar.js; this file only draws it.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Plus, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, CalendarPlus, ExternalLink, Trash2, Compass } from 'lucide-react'
import { newId } from '../storage.js'
import {
  buildAgenda, todayKey, addDays, parseDay, dayKey, monthGrid,
  REPEATS, REMINDER_PRESETS, downloadIcs, googleCalendarUrl,
} from '../calendar.js'

const DAYS_AHEAD = 60 // how far ahead the list looks

// "07:30" → "7:30 am"
function formatTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit' })
}

// "2026-10-17" → "Sat 17 Oct"
function formatShortDay(key) {
  return parseDay(key).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })
}

// ── Form for a new reminder ─────────────────────────────────────────────────
function ReminderForm({ pets, defaultPetId, defaultDate, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    title: '', petId: defaultPetId, date: defaultDate, time: '', repeat: 'none',
  })
  const field = (key) => (e) => setDraft({ ...draft, [key]: e.target.value })

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...draft, id: newId() })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>New reminder</h3>
      {/* Tapping a preset fills in the name and a sensible repeat */}
      <div className="chips">
        {REMINDER_PRESETS.map((p) => (
          <button
            type="button" key={p.title}
            className={'chip' + (draft.title === p.title ? ' active' : '')}
            aria-pressed={draft.title === p.title}
            onClick={() => setDraft({ ...draft, title: p.title, repeat: p.repeat })}
          >
            {p.title}
          </button>
        ))}
      </div>
      <label>What<input value={draft.title} onChange={field('title')} placeholder="e.g. Tick & flea prevention" required /></label>
      {pets.length > 1 && (
        <label>For
          <select value={draft.petId} onChange={field('petId')}>
            {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}
      <div className="row">
        <label>Date<input type="date" value={draft.date} onChange={field('date')} required /></label>
        <label>Time (optional)<input type="time" value={draft.time} onChange={field('time')} /></label>
      </div>
      <label>Repeat
        <select value={draft.repeat} onChange={field('repeat')}>
          {Object.entries(REPEATS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn primary">Save reminder</button>
      </div>
    </form>
  )
}

// ── One row in the list ─────────────────────────────────────────────────────
function AgendaItem({ item, open, onToggle, onDeleteReminder, onOpenEvent }) {
  return (
    <li className="agenda-item">
      <button className="row-item" onClick={onToggle} aria-expanded={open}>
        <span className={'icon-tile art ' + item.color}><item.icon size={20} /></span>
        <span className="grow">
          <strong>{item.title}</strong>
          <span className="tiny muted">
            {[formatShortDay(item.date), formatTime(item.time), item.subtitle].filter(Boolean).join(' · ')}
          </span>
        </span>
        {item.overdue && <span className="badge bad">✕ Overdue</span>}
        <ChevronRight className="chev" size={18} aria-hidden="true" style={{ transform: open ? 'rotate(90deg)' : 'none' }} />
      </button>

      {open && (
        <div className="agenda-actions">
          <button className="btn" onClick={() => downloadIcs(item)}>
            <CalendarPlus size={16} /> Apple / Outlook
          </button>
          <a className="btn" href={googleCalendarUrl(item)} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Google Calendar
          </a>
          {item.kind === 'event' && (
            <button className="btn" onClick={() => onOpenEvent(item.event)}><Compass size={16} /> View event</button>
          )}
          {item.kind === 'reminder' && (
            <button
              className="btn danger"
              onClick={() => confirm(`Delete “${item.title}”${item.reminder.repeat !== 'none' ? ' and all its repeats' : ''}?`) && onDeleteReminder(item.reminder.id)}
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      )}
    </li>
  )
}

// ── Month calendar ──────────────────────────────────────────────────────────
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function MonthCalendar({ year, month, items, today, selectedDay, onSelect, onChangeMonth }) {
  const title = new Date(year, month, 1).toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })
  return (
    <div className="card month">
      <div className="month-head">
        <button className="icon-btn" onClick={() => onChangeMonth(-1)} aria-label="Previous month"><ChevronLeft size={20} /></button>
        <h3 aria-live="polite">{title}</h3>
        <button className="icon-btn" onClick={() => onChangeMonth(1)} aria-label="Next month"><ChevronRight size={20} /></button>
      </div>
      <div className="month-grid" role="grid" aria-label={title}>
        {WEEKDAYS.map((d) => <span key={d} className="month-weekday" aria-hidden="true">{d}</span>)}
        {monthGrid(year, month).flat().map((key, i) => {
          if (!key) return <span key={'blank' + i} />
          const count = items.filter((it) => it.date === key).length
          return (
            <button
              key={key}
              className={'month-day' + (selectedDay === key ? ' selected' : '') + (key === today ? ' today' : '') + (key < today ? ' past' : '')}
              aria-pressed={selectedDay === key}
              aria-label={`${formatShortDay(key)}, ${count ? `${count} planned` : 'nothing planned'}`}
              onClick={() => onSelect(selectedDay === key ? null : key)}
            >
              {parseDay(key).getDate()}
              <span className={'day-dot' + (count ? ' on' : '')} aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── The whole section ───────────────────────────────────────────────────────
export default function Agenda({ pets, pet, signups, reminders, onAddReminder, onDeleteReminder, onOpenEvent }) {
  const [selectedDay, setSelectedDay] = useState(null) // null = show everything
  const [openId, setOpenId] = useState(null)           // which row shows its buttons
  const [adding, setAdding] = useState(false)
  const [monthView, setMonthView] = useState(false)    // week strip or full month?
  const now = new Date()
  const [shown, setShown] = useState({ year: now.getFullYear(), month: now.getMonth() }) // month on screen

  const today = todayKey()
  const items = buildAgenda({ pets, signups, reminders, from: today, to: addDays(today, DAYS_AHEAD) })
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i))
  const endOfWeek = week[6]

  // Everything in the month currently shown in the month calendar.
  const monthName = new Date(shown.year, shown.month, 1).toLocaleDateString('en-SG', { month: 'long' })
  const monthItems = buildAgenda({
    pets, signups, reminders, includeOverdue: false,
    from: dayKey(new Date(shown.year, shown.month, 1)),
    to: dayKey(new Date(shown.year, shown.month + 1, 0)), // day 0 of next month = last day of this one
  })

  // ‹ › arrows: move one month back or forward (Date handles the year change).
  function changeMonth(step) {
    const d = new Date(shown.year, shown.month + step, 1)
    setShown({ year: d.getFullYear(), month: d.getMonth() })
    setSelectedDay(null)
  }

  function toggleMonthView() {
    // Going back to the week strip: forget a selected day that isn't in it.
    if (monthView && selectedDay && !week.includes(selectedDay)) setSelectedDay(null)
    setMonthView(!monthView)
  }

  // Group the items for the list (or filter to one day if a day is tapped).
  const source = monthView ? monthItems : items
  const groups = selectedDay
    ? [{ label: formatShortDay(selectedDay), items: source.filter((i) => i.date === selectedDay) }]
    : monthView
    ? [{ label: `All in ${monthName}`, items: monthItems }].filter((g) => g.items.length)
    : [
        { label: 'Overdue', items: items.filter((i) => i.overdue) },
        { label: 'Today', items: items.filter((i) => !i.overdue && i.date === today) },
        { label: 'This week', items: items.filter((i) => i.date > today && i.date <= endOfWeek) },
        { label: 'Later', items: items.filter((i) => i.date > endOfWeek) },
      ].filter((g) => g.items.length)

  return (
    <section className="section">
      <div className="section-head">
        <h2>Coming up</h2>
        {!adding && <button className="link-btn" onClick={() => setAdding(true)}><Plus size={16} /> Reminder</button>}
      </div>

      {/* Full month calendar, or the next 7 days */}
      {monthView && (
        <MonthCalendar
          year={shown.year} month={shown.month} items={monthItems} today={today}
          selectedDay={selectedDay} onSelect={setSelectedDay} onChangeMonth={changeMonth}
        />
      )}
      {!monthView && <div className="week" role="group" aria-label="Next 7 days">
        {week.map((key) => {
          const count = items.filter((i) => i.date === key).length
          const d = parseDay(key)
          return (
            <button
              key={key}
              className={'day' + (selectedDay === key ? ' selected' : '') + (key === today ? ' today' : '')}
              aria-pressed={selectedDay === key}
              aria-label={`${formatShortDay(key)}, ${count ? `${count} planned` : 'nothing planned'}`}
              onClick={() => setSelectedDay(selectedDay === key ? null : key)}
            >
              <span className="day-name">{key === today ? 'Today' : d.toLocaleDateString('en-SG', { weekday: 'short' })}</span>
              <span className="day-num">{d.getDate()}</span>
              <span className={'day-dot' + (count ? ' on' : '')} aria-hidden="true" />
            </button>
          )
        })}
      </div>}

      <button className="expand-btn" onClick={toggleMonthView} aria-expanded={monthView}>
        {monthView ? <>Show less <ChevronUp size={16} /></> : <>View full month <ChevronDown size={16} /></>}
      </button>

      <div className="card">
        {adding && (
          <ReminderForm
            pets={pets} defaultPetId={pet.id} defaultDate={selectedDay || today}
            onSave={(r) => { onAddReminder(r); setAdding(false) }}
            onCancel={() => setAdding(false)}
          />
        )}

        {!adding && groups.length === 0 && (
          <p className="empty">
            {selectedDay
              ? 'Nothing planned this day.'
              : monthView
              ? `Nothing planned in ${monthName}.`
              : 'Nothing coming up. Sign up for an event or add a reminder.'}
          </p>
        )}

        {!adding && groups.map((g) => (
          <div key={g.label} className="agenda-group">
            <p className="eyebrow">{g.label}</p>
            <ul className="rows">
              {g.items.map((item) => (
                <AgendaItem
                  key={item.id} item={item}
                  open={openId === item.id}
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  onDeleteReminder={onDeleteReminder}
                  onOpenEvent={onOpenEvent}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
