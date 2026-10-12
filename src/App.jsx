// ─────────────────────────────────────────────────────────────────────────────
// App.jsx: the "brain" of Furly
//
// It does three jobs:
//   1. Holds all saved data (the user, their pets, event sign-ups, settings).
//   2. Decides what to show: sign-in → add first pet → the main app.
//   3. Draws the frame around every screen: pet switcher and floating tab bar.
//
// Each screen lives in src/pages/ and receives the data it needs as "props"
// (inputs passed in like HTML attributes, e.g. <Home pet={pet} />).
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { House, Stethoscope, Luggage, Compass, Settings as SettingsIcon } from 'lucide-react'
import { useStoredState, clearAllData } from './storage.js'
import SignIn from './pages/SignIn.jsx'
import Home from './pages/Home.jsx'
import Pets, { PetForm } from './pages/Pets.jsx'
import Travel from './pages/Travel.jsx'
import Explore from './pages/Explore.jsx'
import Settings from './pages/Settings.jsx'
import EventSheet from './components/EventSheet.jsx'

// The bottom tab bar. `id` is used internally, `label` and `icon` are shown.
const TABS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'pets', label: 'Health', icon: Stethoscope },
  { id: 'travel', label: 'Travel', icon: Luggage },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function App() {
  // ── Saved data (survives page refresh, see storage.js) ──
  const [user, setUser] = useStoredState('user', null)          // { name, email }
  const [pets, setPets] = useStoredState('pets', [])            // list of pet objects
  const [activePetId, setActivePetId] = useStoredState('activePet', null)
  const [savedSignups, setSignups] = useStoredState('signups', {}) // which pets go to which event
  const [reminders, setReminders] = useStoredState('reminders', []) // { id, petId, title, date, time, repeat }
  const [emergency, setEmergency] = useStoredState('emergency', {
    contactName: '', contactPhone: '', vetName: '', vetPhone: '', vetAddress: '',
  })

  // ── Temporary screen state (resets on refresh, which is fine) ──
  const [tab, setTab] = useState('home')
  const [addingPet, setAddingPet] = useState(false)
  const [editingPet, setEditingPet] = useState(false) // opens the Health tab straight into "Edit"

  const [exploreView, setExploreView] = useState('events') // Events / Food / Care
  const [selectedEvent, setSelectedEvent] = useState(null)        // event shown in the popup, or null
  const [showConfirmation, setShowConfirmation] = useState(false) // popup shows "You're going!"

  // Switch tab and scroll back to the top, like a real app.
  // `view` optionally opens Explore on a specific toggle, e.g. goTo('explore', 'care').
  function goTo(id, view = 'events') {
    setTab(id)
    setEditingPet(false)
    if (id === 'explore') setExploreView(view)
    window.scrollTo(0, 0)
  }

  // The pet currently selected in the switcher (falls back to the first one).
  const pet = pets.find((p) => p.id === activePetId) || pets[0]

  // Event sign-ups, as { eventId: [petId, petId, ...] }, e.g. { ev1: ['a1', 'b2'] }.
  // Older versions saved a plain list of event ids, so we convert those
  // ("your first pet is going"). We also drop pets that have been deleted.
  const signups = {}
  const entries = Array.isArray(savedSignups)
    ? savedSignups.map((id) => [id, pets[0] ? [pets[0].id] : []])
    : Object.entries(savedSignups)
  for (const [eventId, petIds] of entries) {
    const stillHere = petIds.filter((id) => pets.some((p) => p.id === id))
    if (stillHere.length) signups[eventId] = stillHere
  }

  // Adds a new pet, or replaces an existing one with the same id.
  function savePet(updated) {
    setPets((list) =>
      list.some((p) => p.id === updated.id)
        ? list.map((p) => (p.id === updated.id ? updated : p))
        : [...list, updated],
    )
    setActivePetId(updated.id)
    setAddingPet(false)
  }

  function deletePet(id) {
    setPets((list) => list.filter((p) => p.id !== id))
  }

  function addReminder(reminder) {
    setReminders((list) => [...list, reminder])
  }

  function deleteReminder(id) {
    setReminders((list) => list.filter((r) => r.id !== id))
  }

  function signOut() {
    clearAllData()
    window.location.reload() // simplest way to reset every piece of state
  }

  // ── Event popup (EventSheet) ──
  // Opens the popup for an event. It floats over the page, so there's no
  // need to scroll to the top.
  function openEvent(event) {
    setSelectedEvent(event)
    setShowConfirmation(false)
  }

  function closeEvent() {
    setSelectedEvent(null)
    setShowConfirmation(false)
  }

  // Saves who's going to the open event (also used to change who's going).
  function registerForEvent(petIds) {
    setSignups({ ...signups, [selectedEvent.id]: petIds })
    setShowConfirmation(true)
  }

  // Removes the open event from your sign-ups ("Cancel registration").
  function cancelRegistration() {
    const { [selectedEvent.id]: _cancelled, ...rest } = signups
    setSignups(rest)
  }

  // ── Step 1: not signed in yet ──
  if (!user) return <SignIn onSignIn={setUser} />

  // ── Step 2: signed in but no pets yet, or adding another pet ──
  if (pets.length === 0 || addingPet) {
    return (
      <main className="page narrow">
        <p className="eyebrow">{pets.length === 0 ? 'Step 2 of 2' : 'New pet'}</p>
        <h1>{pets.length === 0 ? `Welcome, ${user.name.split(' ')[0]}. Who’s your pet?` : 'Add a pet'}</h1>
        <PetForm onSave={savePet} onCancel={pets.length ? () => setAddingPet(false) : null} />
      </main>
    )
  }

  // ── Step 3: the main app ──
  return (
    <div className="app">
      <main className="page">
        {/* On every tab except Home (which has the swipeable pet cards),
            show a small switcher when there's more than one pet. */}
        {tab !== 'home' && tab !== 'settings' && pets.length > 1 && (
          <nav className="chips" aria-label="Choose pet" style={{ marginBottom: '1rem' }}>
            {pets.map((p) => (
              <button
                key={p.id}
                className={'chip' + (p.id === pet.id ? ' active' : '')}
                aria-pressed={p.id === pet.id}
                onClick={() => setActivePetId(p.id)}
              >
                {p.name}
              </button>
            ))}
          </nav>
        )}

        {/* Show only the screen that matches the selected tab.
            key={pet.id} tells React "this is a different pet": when you switch
            pets, the screen starts fresh instead of keeping the old pet's form. */}
        {tab === 'home' && (
          <Home
            user={user} pets={pets} pet={pet}
            onSelectPet={setActivePetId}
            onAddPet={() => setAddingPet(true)}
            onEditPet={() => { setTab('pets'); setEditingPet(true) }}
            signups={signups} reminders={reminders}
            onAddReminder={addReminder} onDeleteReminder={deleteReminder} onOpenEvent={openEvent}
            emergency={emergency} goTo={goTo}
          />
        )}
        {tab === 'pets' && (
          <Pets key={pet.id + editingPet} pet={pet} startEditing={editingPet} onSave={savePet} onDelete={deletePet} />
        )}
        {tab === 'travel' && <Travel key={pet.id} pet={pet} goTo={goTo} />}
        {tab === 'explore' && (
          <Explore
            key={pet.id + exploreView}
            pet={pet}
            signups={signups}
            onOpenEvent={openEvent}
            initialView={exploreView}
            goTo={goTo}
          />
        )}
        {tab === 'settings' && (
          <Settings user={user} emergency={emergency} onSaveEmergency={setEmergency} onSignOut={signOut} />
        )}
      </main>

      {/* The event popup, shown on top of any tab when an event is selected */}
      {selectedEvent && (
        <EventSheet
          event={selectedEvent}
          pets={pets}
          pet={pet}
          goingPetIds={signups[selectedEvent.id] || []}
          confirmed={showConfirmation}
          onConfirm={registerForEvent}
          onCancelSignup={cancelRegistration}
          onClose={closeEvent}
        />
      )}

      <nav className="tabbar" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            aria-current={tab === t.id ? 'page' : undefined} // announces the current tab
            onClick={() => goTo(t.id)}
          >
            <t.icon size={22} strokeWidth={tab === t.id ? 2.4 : 1.8} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
