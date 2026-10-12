// ─────────────────────────────────────────────────────────────────────────────
// Explore.jsx: the social side of Furly
//
// Two views, switched with the toggle at the top:
//   • Events: pet activities you can sign up for, sorted so the ones that
//     match what your pet likes come first.
//   • Food places: pet-friendly cafés and restaurants.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { EVENTS, FOOD_PLACES } from '../content.js'

// "2026-10-17T07:30" → "Sat, 17 Oct, 7:30 am" (Singapore date style)
export function formatDate(iso) {
  return new Date(iso).toLocaleString('en-SG', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
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
      <h1>Explore</h1>

      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={view === 'events'} className={view === 'events' ? 'active' : ''} onClick={() => setView('events')}>Events</button>
        <button role="tab" aria-selected={view === 'food'} className={view === 'food' ? 'active' : ''} onClick={() => setView('food')}>Food places</button>
      </div>

      {view === 'events' && (
        <>
          {events.length === 0 && <p className="muted">No upcoming events right now. Check back soon!</p>}
          {events.map((e) => {
            const joined = signups.includes(e.id)
            return (
              <article key={e.id} className="card event">
                <div className="event-emoji" aria-hidden="true">{e.emoji}</div>
                <div className="grow">
                  <h3>{e.title}</h3>
                  <p className="tiny muted">{formatDate(e.date)} · {e.place}</p>
                  <p>{e.description}</p>
                  {e.matches.length > 0 && (
                    <p className="tiny match">✨ {pet.name} loves {e.matches.join(' & ').toLowerCase()}</p>
                  )}
                </div>
                <button className={'btn ' + (joined ? '' : 'primary')} onClick={() => onToggle(e.id)}>
                  {joined ? '✓ Going' : 'Sign up'}
                </button>
              </article>
            )
          })}
        </>
      )}

      {view === 'food' && FOOD_PLACES.map((p) => (
        <article key={p.id} className="card event">
          <div className="event-emoji" aria-hidden="true">{p.emoji}</div>
          <div className="grow">
            <h3>{p.name}</h3>
            <p className="tiny muted">{p.type} · {p.area}</p>
            <div className="chips">{p.perks.map((perk) => <span key={perk} className="chip static">{perk}</span>)}</div>
          </div>
        </article>
      ))}
    </>
  )
}
