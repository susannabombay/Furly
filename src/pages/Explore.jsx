// ─────────────────────────────────────────────────────────────────────────────
// Explore.jsx: the social side of Furly
//
// Three views, switched with the toggle at the top:
//   • Events: pet activities you can sign up for, sorted so the ones that
//     match what your pet likes come first.
//   • Food: pet-friendly cafés and restaurants.
//   • Care: daycare & boarding, each with a badge saying whether your pet
//     already meets that place's requirements (checked from its profile).
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { CalendarDays, MapPin, Sparkles, Check, TriangleAlert, ChevronRight } from 'lucide-react'
import { EVENTS, FOOD_PLACES, CARE_PLACES, REQUIREMENTS } from '../content.js'

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

// Which of a place's requirements this pet doesn't meet yet.
function missingFor(place, pet) {
  return place.requires.filter((id) => !REQUIREMENTS[id].check(pet)).map((id) => REQUIREMENTS[id].label)
}

// The three toggle options.
const VIEWS = [
  { id: 'events', label: 'Events' },
  { id: 'food', label: 'Food' },
  { id: 'care', label: 'Care' },
]

export default function Explore({ pet, signups, onToggle, initialView = 'events', goTo }) {
  const [view, setView] = useState(initialView)
  const events = recommendEvents(pet)
  // Only show care places that accept this kind of pet.
  const carePlaces = CARE_PLACES.filter((p) => p.species.includes(pet.species))

  return (
    <>
      <p className="eyebrow" style={{ margin: 0 }}>Singapore</p>
      <h1>Explore</h1>

      <div className="segmented" role="tablist">
        {VIEWS.map((v) => (
          <button
            key={v.id} role="tab" aria-selected={view === v.id}
            className={view === v.id ? 'active' : ''} onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
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

      {view === 'care' && (
        <>
          <p className="tiny muted">
            Daycare & boarding for {pet.species === 'Other' ? 'your pet' : `${pet.species.toLowerCase()}s`}. Sample listings for now.
          </p>
          {carePlaces.length === 0 && <p className="empty">No listings for this kind of pet yet.</p>}
          {carePlaces.map((p) => {
            const missing = missingFor(p, pet)
            return (
              <article key={p.id} className="card event-card">
                <div className={'art ' + p.color}><p.icon size={34} strokeWidth={1.5} aria-hidden="true" /></div>
                <div className="body">
                  {/* Readiness badge: words + symbol, so it doesn't rely on colour */}
                  {missing.length === 0
                    ? <span className="badge good" style={{ alignSelf: 'flex-start' }}><Check size={12} /> {pet.name} is ready</span>
                    : <span className="badge warn" style={{ alignSelf: 'flex-start' }}><TriangleAlert size={12} /> {missing.length} thing{missing.length > 1 ? 's' : ''} to sort out</span>}
                  <h3>{p.name}</h3>
                  <span className="meta"><MapPin size={14} aria-hidden="true" /> {p.type} · {p.area}</span>
                  <span className="meta" style={{ color: 'var(--text)', fontWeight: 700 }}>{p.price}</span>
                  <div className="chips" style={{ marginTop: '0.35rem' }}>
                    {p.perks.map((perk) => <span key={perk} className="chip static">{perk}</span>)}
                  </div>
                  {missing.length > 0 && (
                    <div className="needs">
                      <strong className="tiny">Needs:</strong>
                      <ul>{missing.map((m) => <li key={m} className="tiny">{m}</li>)}</ul>
                      <button className="link-btn" onClick={() => goTo('pets')}>
                        Update {pet.name}’s profile <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </>
      )}
    </>
  )
}
