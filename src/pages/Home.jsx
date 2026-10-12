// ─────────────────────────────────────────────────────────────────────────────
// Home.jsx: the dashboard you land on after signing in
//
// It doesn't store anything itself. It just pulls the most important bits
// from the other sections into one glance:
//   • health alerts (vaccines overdue or due soon)
//   • events you've signed up for, plus one recommended for your pet
//   • a shortcut to emergency help
// ─────────────────────────────────────────────────────────────────────────────
import { EVENTS } from '../content.js'
import { ageFrom, vaccineStatus } from './Pets.jsx'
import { formatDate, recommendEvents } from './Explore.jsx'

export default function Home({ user, pet, signups, emergency, goTo }) {
  // Vaccines that need attention, for the alerts card.
  const alerts = pet.vaccinations
    .map((v) => ({ ...v, status: vaccineStatus(v) }))
    .filter((v) => v.status.tone === 'bad' || v.status.tone === 'warn')

  const myEvents = EVENTS.filter((e) => signups.includes(e.id))
  const suggestion = recommendEvents(pet).find((e) => !signups.includes(e.id))

  return (
    <>
      <p className="muted">Hi {user.name.split(' ')[0]} 👋</p>
      <h1>How’s {pet.name} today?</h1>

      {/* Pet summary: tap to open the full health record */}
      <button className="card pet-card" onClick={() => goTo('pets')}>
        <span className="pet-avatar" aria-hidden="true">
          {pet.species === 'Cat' ? '🐱' : pet.species === 'Dog' ? '🐶' : '🐾'}
        </span>
        <span>
          <strong>{pet.name}</strong>
          <span className="tiny muted block">
            {[pet.breed, pet.gender, ageFrom(pet.birthday), pet.weight && `${pet.weight} kg`]
              .filter(Boolean).join(' · ')}
          </span>
        </span>
        <span className="chev" aria-hidden="true">›</span>
      </button>

      {/* Health alerts */}
      <section className="card">
        <h2>🩺 Health</h2>
        {alerts.length === 0 ? (
          <p className="muted">
            {pet.vaccinations.length
              ? 'All vaccinations are up to date. 🎉'
              : 'Add vaccinations in the Health tab to get reminders.'}
          </p>
        ) : (
          <ul className="list">
            {alerts.map((v) => (
              <li key={v.id}>
                <span>{v.name}{v.due && <span className="tiny muted"> · due {v.due}</span>}</span>
                <span className={'badge ' + v.status.tone}>{v.status.label}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Events */}
      <section className="card">
        <h2>🎉 Your events</h2>
        {myEvents.length === 0 && <p className="muted">You haven’t signed up for anything yet.</p>}
        <ul className="list">
          {myEvents.map((e) => (
            <li key={e.id}><span>{e.emoji} {e.title}</span><span className="tiny muted">{formatDate(e.date)}</span></li>
          ))}
        </ul>
        {suggestion && (
          <p className="tiny">
            ✨ {pet.name} might enjoy <strong>{suggestion.title}</strong> ({formatDate(suggestion.date)})
          </p>
        )}
        <button className="btn" onClick={() => goTo('explore')}>Browse events & places</button>
      </section>

      {/* Emergency shortcut: calls the saved vet directly if there is one */}
      {emergency.vetPhone ? (
        <a className="btn emergency" href={`tel:${emergency.vetPhone}`}>
          🚨 Call emergency vet{emergency.vetName && `: ${emergency.vetName}`}
        </a>
      ) : (
        <button className="btn emergency" onClick={() => goTo('settings')}>
          🚨 Set up your emergency vet
        </button>
      )}
    </>
  )
}
