// ─────────────────────────────────────────────────────────────────────────────
// App.jsx: the "brain" of Furly
//
// It does three jobs:
//   1. Holds all saved data (the user, their pets, event sign-ups, settings).
//   2. Decides what to show: sign-in → add first pet → the main app.
//   3. Draws the frame around every screen: top bar, pet switcher, tab bar.
//
// Each screen lives in src/pages/ and receives the data it needs as "props"
// (inputs passed in like HTML attributes, e.g. <Home pet={pet} />).
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useStoredState, clearAllData } from './storage.js'
import SignIn from './pages/SignIn.jsx'
import Home from './pages/Home.jsx'
import Pets, { PetForm } from './pages/Pets.jsx'
import Travel from './pages/Travel.jsx'
import Explore from './pages/Explore.jsx'
import Settings from './pages/Settings.jsx'

// The bottom tab bar. `id` is used internally, `label` and `icon` are shown.
const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'pets', label: 'Health', icon: '🩺' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'explore', label: 'Explore', icon: '🎉' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function App() {
  // ── Saved data (survives page refresh, see storage.js) ──
  const [user, setUser] = useStoredState('user', null)          // { name, email }
  const [pets, setPets] = useStoredState('pets', [])            // list of pet objects
  const [activePetId, setActivePetId] = useStoredState('activePet', null)
  const [signups, setSignups] = useStoredState('signups', [])   // list of event ids
  const [emergency, setEmergency] = useStoredState('emergency', {
    contactName: '', contactPhone: '', vetName: '', vetPhone: '', vetAddress: '',
  })

  // ── Temporary screen state (resets on refresh, which is fine) ──
  const [tab, setTab] = useState('home')
  const [addingPet, setAddingPet] = useState(false)

  // The pet currently selected in the switcher (falls back to the first one).
  const pet = pets.find((p) => p.id === activePetId) || pets[0]

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

  // Tapping "Sign up" again on the same event cancels it (a toggle).
  function toggleSignup(eventId) {
    setSignups((list) =>
      list.includes(eventId) ? list.filter((id) => id !== eventId) : [...list, eventId],
    )
  }

  function signOut() {
    clearAllData()
    window.location.reload() // simplest way to reset every piece of state
  }

  // ── Step 1: not signed in yet ──
  if (!user) return <SignIn onSignIn={setUser} />

  // ── Step 2: signed in but no pets yet, or adding another pet ──
  if (pets.length === 0 || addingPet) {
    return (
      <main className="page narrow">
        <h1>{pets.length === 0 ? `Welcome, ${user.name}! 👋` : 'Add a pet'}</h1>
        <p className="muted">Tell us about your pet so Furly can personalise everything.</p>
        <PetForm onSave={savePet} onCancel={pets.length ? () => setAddingPet(false) : null} />
      </main>
    )
  }

  // ── Step 3: the main app ──
  return (
    <div className="app">
      <header className="topbar">
        <span className="logo">🐾 Furly</span>

        {/* Pet switcher: one chip per pet, plus "+" to add another */}
        <nav className="pet-switcher" aria-label="Choose pet">
          {pets.map((p) => (
            <button
              key={p.id}
              className={'chip' + (p.id === pet.id ? ' active' : '')}
              aria-pressed={p.id === pet.id}
              onClick={() => setActivePetId(p.id)}
            >
              {p.species === 'Cat' ? '🐱' : p.species === 'Dog' ? '🐶' : '🐾'} {p.name}
            </button>
          ))}
          <button className="chip" onClick={() => setAddingPet(true)} aria-label="Add pet">＋</button>
        </nav>
      </header>

      <main className="page">
        {/* Show only the screen that matches the selected tab.
            key={pet.id} tells React "this is a different pet": when you switch
            pets, the screen starts fresh instead of keeping the old pet's form. */}
        {tab === 'home' && (
          <Home user={user} pet={pet} signups={signups} emergency={emergency} goTo={setTab} />
        )}
        {tab === 'pets' && <Pets key={pet.id} pet={pet} onSave={savePet} onDelete={deletePet} />}
        {tab === 'travel' && <Travel key={pet.id} pet={pet} />}
        {tab === 'explore' && <Explore pet={pet} signups={signups} onToggle={toggleSignup} />}
        {tab === 'settings' && (
          <Settings user={user} emergency={emergency} onSaveEmergency={setEmergency} onSignOut={signOut} />
        )}
      </main>

      <nav className="tabbar" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            aria-current={tab === t.id ? 'page' : undefined} // announces the current tab
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
