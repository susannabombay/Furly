// ─────────────────────────────────────────────────────────────────────────────
// Home.jsx: the dashboard you land on after signing in
//
// From top to bottom:
//   • greeting + your initial (tap it for Settings)
//   • pet ID cards: swipe between pets, tap one to expand it
//   • quick actions: Health, Travel, Events, Emergency
//   • health reminders (vaccines overdue or due soon)
//   • your upcoming events
//   • events recommended for your pet
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Stethoscope, Luggage, Compass, Siren, Plus, ChevronRight, CalendarDays, Syringe, Sparkles } from 'lucide-react'
import { EVENTS } from '../content.js'
import { vaccineStatus, formatDay } from './Pets.jsx'
import { formatDate, recommendEvents } from './Explore.jsx'
import { PetCard, ExpandedPetCard } from '../components/PetCard.jsx'

// "Good morning" / "Good afternoon" / "Good evening" based on the time.
function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Home({ user, pets, pet, onSelectPet, onAddPet, onEditPet, signups, emergency, goTo }) {
  // Which card is expanded, and where it started on screen (for the animation).
  const [open, setOpen] = useState(null) // { pet, rect } or null

  const alerts = pet.vaccinations
    .map((v) => ({ ...v, status: vaccineStatus(v) }))
    .filter((v) => v.status.tone === 'bad' || v.status.tone === 'warn')
  const myEvents = EVENTS.filter((e) => signups.includes(e.id))
  const recommended = recommendEvents(pet).filter((e) => !signups.includes(e.id)).slice(0, 4)
  const firstName = user.name.split(' ')[0]

  // The emergency button calls your saved vet straight away if there is one.
  function emergencyAction() {
    if (emergency.vetPhone) window.location.href = `tel:${emergency.vetPhone}`
    else goTo('settings')
  }

  return (
    <>
      <header className="greeting">
        <div>
          <div className="muted">{greeting()},</div>
          <h1>{firstName}</h1>
        </div>
        <button className="avatar" onClick={() => goTo('settings')} aria-label="Account and settings">
          {firstName[0].toUpperCase()}
        </button>
      </header>

      {/* Pet ID cards: one per pet, plus an "Add pet" card at the end */}
      <div className="carousel pet-cards">
        {pets.map((p) => (
          <PetCard
            key={p.id}
            pet={p}
            hidden={open?.pet.id === p.id}
            onOpen={(pet, rect) => { onSelectPet(pet.id); setOpen({ pet, rect }) }}
          />
        ))}
        <button className="pet-id add" onClick={onAddPet}>
          <Plus size={24} aria-hidden="true" />
          Add pet
        </button>
      </div>

      {open && (
        <ExpandedPetCard
          pet={open.pet}
          from={open.rect}
          onClose={() => setOpen(null)}
          onHealth={() => { setOpen(null); goTo('pets') }}
          onEdit={() => { setOpen(null); onEditPet() }}
        />
      )}

      <nav className="quick-actions" aria-label="Shortcuts">
        <button onClick={() => goTo('pets')}><span className="icon-circle"><Stethoscope size={22} /></span>Health</button>
        <button onClick={() => goTo('travel')}><span className="icon-circle"><Luggage size={22} /></span>Travel</button>
        <button onClick={() => goTo('explore')}><span className="icon-circle"><Compass size={22} /></span>Events</button>
        <button onClick={emergencyAction}><span className="icon-circle red"><Siren size={22} /></span>Emergency</button>
      </nav>

      {/* Health reminders */}
      <section className="section">
        <div className="section-head">
          <h2>Health reminders</h2>
          <button className="link-btn" onClick={() => goTo('pets')}>Record <ChevronRight size={16} /></button>
        </div>
        <div className="card">
          {alerts.length === 0 ? (
            <div className="row-item" style={{ padding: 0, border: 0 }}>
              <span className="icon-tile"><Syringe size={20} /></span>
              <p className="empty grow">
                {pet.vaccinations.length
                  ? `All of ${pet.name}’s vaccinations are up to date.`
                  : `Add ${pet.name}’s vaccinations to get reminders.`}
              </p>
            </div>
          ) : (
            <ul className="rows">
              {alerts.map((v) => (
                <li key={v.id} className="row-item">
                  <span className="icon-tile red"><Syringe size={20} /></span>
                  <div className="grow"><strong>{v.name}</strong><span className="tiny muted">Due {formatDay(v.due)}</span></div>
                  <span className={'badge ' + v.status.tone}>{v.status.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Upcoming events you've joined */}
      {myEvents.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>Your upcoming events</h2></div>
          <ul className="card rows">
            {myEvents.map((e) => (
              <li key={e.id} className="row-item">
                <span className={'icon-tile art ' + e.color}><e.icon size={20} /></span>
                <div className="grow"><strong>{e.title}</strong><span className="tiny muted">{formatDate(e.date)}</span></div>
                <CalendarDays size={18} color="var(--muted)" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recommended events, as a swipeable row */}
      {recommended.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>For {pet.name}</h2>
            <button className="link-btn" onClick={() => goTo('explore')}>See all <ChevronRight size={16} /></button>
          </div>
          <div className="carousel">
            {recommended.map((e) => (
              <button key={e.id} className="tile" onClick={() => goTo('explore')}>
                <div>
                  <div className={'art ' + e.color}><e.icon size={36} strokeWidth={1.5} /></div>
                  <h3>{e.title}</h3>
                  <p className="tiny muted" style={{ margin: '0.25rem 0 0' }}>{formatDate(e.date)}</p>
                </div>
                {e.matches.length > 0 && (
                  <span className="match"><Sparkles size={12} aria-hidden="true" /> Loves {e.matches[0].toLowerCase()}</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
