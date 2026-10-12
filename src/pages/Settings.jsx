// ─────────────────────────────────────────────────────────────────────────────
// Settings.jsx: account, emergency contacts and quick help
//
// Sections:
//   1. Emergency contacts: your emergency vet + a person to call (saved)
//   2. 24-hour vets in Singapore: always-available numbers
//   3. Emergency guides: step-by-step first aid
//   4. Quick Q&A: common questions
//   5. Account: who's signed in, and sign out
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { EMERGENCY_GUIDES, HOTLINES, FAQ } from '../content.js'

function EmergencyContacts({ emergency, onSave }) {
  const [draft, setDraft] = useState(emergency)
  const [saved, setSaved] = useState(false)
  const field = (key) => (e) => { setDraft({ ...draft, [key]: e.target.value }); setSaved(false) }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(draft)
    setSaved(true)
  }

  return (
    <section className="card emergency-card">
      <h2>🚨 Emergency</h2>

      {/* Big call buttons appear once numbers are saved. tel: links dial on phones. */}
      {emergency.vetPhone && (
        <a className="btn emergency" href={`tel:${emergency.vetPhone}`}>
          Call {emergency.vetName || 'emergency vet'} · {emergency.vetPhone}
        </a>
      )}
      {emergency.vetAddress && (
        <a
          className="btn"
          href={`https://maps.google.com/?q=${encodeURIComponent(emergency.vetAddress)}`}
          target="_blank" rel="noreferrer"
        >
          📍 Directions to vet
        </a>
      )}
      {emergency.contactPhone && (
        <a className="btn" href={`tel:${emergency.contactPhone}`}>
          📞 Call {emergency.contactName || 'emergency contact'}
        </a>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <h3>24/7 emergency vet</h3>
        <label>Clinic name<input value={draft.vetName} onChange={field('vetName')} /></label>
        <label>Phone<input type="tel" value={draft.vetPhone} onChange={field('vetPhone')} placeholder="e.g. 6266 0232" /></label>
        <label>Address<input value={draft.vetAddress} onChange={field('vetAddress')} placeholder="Street and postal code" /></label>

        <h3>Backup person</h3>
        <p className="tiny muted">Someone who can help with your pet if you can’t.</p>
        <div className="row">
          <label>Name<input value={draft.contactName} onChange={field('contactName')} /></label>
          <label>Phone<input type="tel" value={draft.contactPhone} onChange={field('contactPhone')} /></label>
        </div>
        <button className="btn primary" type="submit">{saved ? '✓ Saved' : 'Save emergency details'}</button>
      </form>
    </section>
  )
}

export default function Settings({ user, emergency, onSaveEmergency, onSignOut }) {
  return (
    <>
      <h1>Settings</h1>

      <EmergencyContacts emergency={emergency} onSave={onSaveEmergency} />

      <section className="card">
        <h2>☎️ 24-hour help in Singapore</h2>
        <ul className="list">
          {HOTLINES.map((h) => (
            <li key={h.name}>
              <div>
                <strong>{h.name}</strong>
                <div className="tiny muted">{h.address}</div>
              </div>
              {/* +65 is Singapore's country code, so the link also works from a foreign SIM */}
              <a className="btn" href={`tel:+65${h.phone.replace(/\s/g, '')}`}>📞 {h.phone}</a>
            </li>
          ))}
        </ul>
        <p className="tiny muted">Call ahead so the clinic can prepare for your pet.</p>
      </section>

      <h2 className="section-title">🩹 What to do if…</h2>
      {EMERGENCY_GUIDES.map((g) => (
        <details key={g.title} className="card">
          <summary>{g.title}</summary>
          <ol>{g.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        </details>
      ))}

      <h2 className="section-title">💬 Quick Q&A</h2>
      {FAQ.map((f) => (
        <details key={f.q} className="card">
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
      <p className="tiny muted">This guidance doesn’t replace a vet. If in doubt, call one.</p>

      <section className="card">
        <h2>👤 Account</h2>
        <p>{user.name}<br /><span className="muted">{user.email}</span></p>
        <button
          className="btn danger"
          onClick={() => confirm('This removes all your Furly data from this device. Continue?') && onSignOut()}
        >
          Sign out & clear data
        </button>
      </section>
    </>
  )
}
