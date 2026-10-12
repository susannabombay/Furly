// ─────────────────────────────────────────────────────────────────────────────
// EventSheet.jsx: the popup that slides up when you tap "Sign up" or
// "View ticket" on an event
//
// It has three states:
//   1. Not signed up yet → event details, "Who's going?" + "Confirm sign-up"
//   2. Just confirmed    → "You're going!" + add-to-calendar buttons
//   3. Already going     → your "ticket": details, change who's going,
//                          calendar buttons, and "Cancel registration"
//
// "Who's going?" lists every pet. Pets the event isn't for (e.g. a dog at
// the cat meet-up) are shown but can't be picked.
//
// The sliding, dimming and closing come from the shared <Sheet> (Sheet.jsx).
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { CalendarDays, MapPin, Users, Sparkles, Check, CalendarPlus, ExternalLink } from 'lucide-react'
import Sheet from './Sheet.jsx'
import { formatDate } from '../pages/Explore.jsx'
import { downloadIcs, googleCalendarUrl } from '../calendar.js'

// "Coco", "Coco & Lulu", "Coco, Lulu & Max"
const joinNames = (names) =>
  names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`

export default function EventSheet({ event, pets, pet, goingPetIds, confirmed, onConfirm, onCancelSignup, onClose }) {
  const going = goingPetIds.length > 0
  const canJoin = (p) => !event.forSpecies || event.forSpecies.includes(p.species)
  const eligible = pets.filter(canJoin)

  // Who's ticked in the picker. Starts with the pets already going, or else
  // the pet you're currently looking at (if it's allowed at this event).
  const [chosen, setChosen] = useState(() =>
    going ? goingPetIds : canJoin(pet) ? [pet.id] : eligible.slice(0, 1).map((p) => p.id),
  )
  const toggle = (id) =>
    setChosen(chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id])

  const chosenNames = joinNames(pets.filter((p) => chosen.includes(p.id)).map((p) => p.name))
  const goingNames = joinNames(pets.filter((p) => goingPetIds.includes(p.id)).map((p) => p.name))
  // Has the selection changed since signing up? (Order doesn't matter.)
  const changed = going && [...chosen].sort().join() !== [...goingPetIds].sort().join()
  const speciesNote = event.forSpecies && `${event.forSpecies.map((s) => s.toLowerCase() + 's').join(' & ')} only`

  // The "Who's going?" chips. Only shown when you have more than one pet.
  const picker = pets.length > 1 && (
    <fieldset className="who-going">
      <legend className="eyebrow">Who’s going?</legend>
      <div className="chips">
        {pets.map((p) => (
          <button
            key={p.id} type="button"
            className={'chip' + (chosen.includes(p.id) ? ' active' : '')}
            aria-pressed={chosen.includes(p.id)}
            disabled={!canJoin(p)}
            onClick={() => toggle(p.id)}
          >
            {p.name}{!canJoin(p) && ` (${speciesNote})`}
          </button>
        ))}
      </div>
    </fieldset>
  )

  // The calendar helpers expect an agenda item, so we describe the event as one.
  const calendarItem = { id: 'event-' + event.id, kind: 'event', event, title: event.title }
  const matches = event.tags.filter((t) => pet.likes.includes(t))

  // Buttons to put the event into the phone's calendar.
  const calendarButtons = (
    <div className="sheet-calendar">
      <button className="btn" onClick={() => downloadIcs(calendarItem)}>
        <CalendarPlus size={16} /> Apple / Outlook
      </button>
      <a className="btn" href={googleCalendarUrl(calendarItem)} target="_blank" rel="noreferrer">
        <ExternalLink size={16} /> Google Calendar
      </a>
    </div>
  )

  return (
    <Sheet title={event.title} onClose={onClose}>
      {/* State 2 (just confirmed) shows the success screen; otherwise the details */}
      {(close) => confirmed ? (
        <div className="sheet-success">
          <span className="success-badge" aria-hidden="true"><Check size={34} strokeWidth={3} /></span>
          <h2 id="sheet-title">You’re going!</h2>
          <p className="muted">
            {goingNames} {goingPetIds.length > 1 ? 'are' : 'is'} signed up for <strong>{event.title}</strong> on {formatDate(event.date)}.
            It’s now in “Coming up” on Home.
          </p>
          <p className="eyebrow" style={{ margin: '1.25rem 0 0.5rem' }}>Add to your calendar</p>
          {calendarButtons}
          <button className="btn primary block" onClick={close} style={{ marginTop: '0.75rem' }}>Done</button>
        </div>
      ) : (
        <>
          {/* Event details, shared by states 1 and 3 */}
          <div className="sheet-hero">
            <div className={'art ' + event.color}><event.icon size={40} strokeWidth={1.5} aria-hidden="true" /></div>
            <div>
              {going
                ? <span className="badge good"><Check size={12} /> {goingNames} {goingPetIds.length > 1 ? 'are' : 'is'} going</span>
                : matches.length > 0 && (
                  <span className="match"><Sparkles size={12} aria-hidden="true" /> {pet.name} loves {matches.join(' & ').toLowerCase()}</span>
                )}
              <h2 id="sheet-title" style={{ marginTop: '0.4rem' }}>{event.title}</h2>
            </div>
          </div>

          <ul className="rows sheet-facts">
            <li className="row-item">
              <span className="icon-tile"><CalendarDays size={20} /></span>
              <div className="grow"><span className="tiny muted">When</span><strong>{formatDate(event.date)}</strong></div>
            </li>
            <li className="row-item">
              <span className="icon-tile"><MapPin size={20} /></span>
              <div className="grow"><span className="tiny muted">Where</span><strong>{event.place}</strong></div>
            </li>
            <li className="row-item">
              <span className="icon-tile"><Users size={20} /></span>
              <div className="grow"><span className="tiny muted">Group size</span><strong>Up to {event.spots} pets</strong></div>
            </li>
          </ul>

          <p>{event.description}</p>

          {going ? (
            // State 3: already going: your "ticket"
            <>
              {picker}
              {changed && chosen.length > 0 && (
                <button className="btn primary block" onClick={() => onConfirm(chosen)} style={{ marginTop: '0.75rem' }}>
                  Update: {chosenNames} going
                </button>
              )}
              {chosen.length === 0 && (
                <p className="tiny muted" style={{ marginTop: '0.5rem' }}>Pick at least one pet, or cancel the registration below.</p>
              )}
              <p className="eyebrow" style={{ margin: '1.25rem 0 0.5rem' }}>Add to your calendar</p>
              {calendarButtons}
              {/* Asks first, so a stray tap can't cancel a registration */}
              <button
                className="btn danger block" style={{ marginTop: '0.75rem' }}
                onClick={() => {
                  if (confirm(`Cancel the registration for ${goingNames} at ${event.title}?`)) {
                    onCancelSignup()
                    close()
                  }
                }}
              >
                Cancel registration
              </button>
            </>
          ) : eligible.length === 0 ? (
            // None of your pets can join (e.g. only dogs, at a cat meet-up)
            <p className="needs tiny" style={{ padding: '0.75rem 0.9rem' }}>
              This event is for {speciesNote}, so none of your pets can join.
            </p>
          ) : (
            // State 1: not signed up yet
            <>
              {picker}
              <button
                className="btn primary block" style={{ marginTop: '0.75rem' }}
                disabled={chosen.length === 0}
                onClick={() => onConfirm(chosen)}
              >
                {chosen.length ? `Confirm sign-up for ${chosenNames}` : 'Choose who’s going'}
              </button>
            </>
          )}
        </>
      )}
    </Sheet>
  )
}
