// ─────────────────────────────────────────────────────────────────────────────
// Home.jsx: the dashboard you land on after signing in
//
// From top to bottom:
//   • greeting + your initial (tap it for Settings)
//   • pet ID cards: swipe between pets, tap one to expand it
//   • quick actions: Health, Travel, Events, Emergency
//   • "Coming up": week strip + agenda of events, vaccines and reminders
//   • events recommended for your pet
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Stethoscope, Luggage, Compass, Siren, Plus, ChevronRight, Sparkles } from 'lucide-react'
import { formatDate, recommendEvents } from './Explore.jsx'
import { PetCard, ExpandedPetCard } from '../components/PetCard.jsx'
import Agenda from '../components/Agenda.jsx'

// "Good morning" / "Good afternoon" / "Good evening" based on the time.
function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Home({
  user, pets, pet, onSelectPet, onAddPet, onEditPet,
  signups, reminders, onAddReminder, onDeleteReminder, emergency, goTo,
}) {
  // Which card is expanded, and where it started on screen (for the animation).
  const [open, setOpen] = useState(null) // { pet, rect } or null

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

      {/* Events, vaccines and reminders on one timeline */}
      <Agenda
        pets={pets} pet={pet} signups={signups} reminders={reminders}
        onAddReminder={onAddReminder} onDeleteReminder={onDeleteReminder} goTo={goTo}
      />

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
