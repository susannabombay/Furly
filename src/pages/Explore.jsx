// ─────────────────────────────────────────────────────────────────────────────
// Explore.jsx: the social side of Furly
//
// Two views, switched with the toggle at the top:
//   • Events: pet activities you can sign up for, sorted so the ones that
//     match what your pet likes come first.
//   • Food places: pet-friendly cafés and restaurants.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { CalendarDays, MapPin, Sparkles, Check } from 'lucide-react'
import { EVENTS, FOOD_PLACES } from '../content.js'

// "2026-10-17T07:30" → "Sat, 17 Oct, 7:30 am" (Singapore date style)
export function formatDate(iso) {
  return new Date(iso).toLocaleString('en-SG', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  })
}

// Sorts upcoming events so the best match for this pet is first.
// An event's "score" = how many of its tags the pet likes.
export function recommendEvents(pet) {
  return EVENTS
    .filter((e) => new Date(e.date) > new Date()) // hide events that already happened
    .map((e) => ({ ...e, matches: e.tags.filter((t) => pet.likes.includes(t)) }))
    .sort((a, b) => b.matches.length - a.matches.length || new Date(a.date) - new Date(b.date))
}

export default function Explore({ pet, signups, onToggle }) {
  const [view, setView] = useState('events')
  const events = recommendEvents(pet)

  return (
    <>
      <p className="eyebrow" style={{ margin: 0 }}>Singapore</p>
      <h1>Explore</h1>

      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={view === 'events'} className={view === 'events' ? 'active' : ''} onClick={() => setView('events')}>Events</button>
        <button role="tab" aria-selected={view === 'food'} className={view === 'food' ? 'active' : ''} onClick={() => setView('food')}>Food places</button>
      </div>

      {view === 'events' && (
        <>
          {events.length === 0 && <p className="empty">No upcoming events right now. Check back soon!</p>}
          {events.map((e) => {
            const joined = signups.includes(e.id)
            return (
              <article key={e.id} className="card event-card">
                <div className={'art ' + e.color}><e.icon size={34} strokeWidth={1.5} aria-hidden="true" /></div>
                <div className="body">
                  {e.matches.length > 0 && (
                    <span className="match"><Sparkles size={12} aria-hidden="true" /> {pet.name} loves {e.matches.join(' & ').toLowerCase()}</span>
                  )}
                  <h3>{e.title}</h3>
                  <span className="meta"><CalendarDays size={14} aria-hidden="true" /> {formatDate(e.date)}</span>
                  <span className="meta"><MapPin size={14} aria-hidden="true" /> {e.place}</span>
                  <p className="tiny muted" style={{ margin: '0.2rem 0 0' }}>{e.description}</p>
                  <div className="actions">
                    <button className={'btn ' + (joined ? '' : 'primary')} onClick={() => onToggle(e.id)} aria-pressed={joined}>
                      {joined ? <><Check size={16} /> Going</> : 'Sign up'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </>
      )}

      {view === 'food' && FOOD_PLACES.map((p) => (
        <article key={p.id} className="card event-card">
          <div className={'art ' + p.color}><p.icon size={34} strokeWidth={1.5} aria-hidden="true" /></div>
          <div className="body">
            <h3>{p.name}</h3>
            <span className="meta"><MapPin size={14} aria-hidden="true" /> {p.type} · {p.area}</span>
            <div className="chips" style={{ marginTop: '0.35rem' }}>
              {p.perks.map((perk) => <span key={perk} className="chip static">{perk}</span>)}
            </div>
          </div>
        </article>
      ))}
    </>
  )
}
