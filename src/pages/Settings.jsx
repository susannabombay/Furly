// ─────────────────────────────────────────────────────────────────────────────
// Settings.jsx: account, emergency contacts and quick help
//
// Sections:
//   1. Account: who's signed in
//   2. Emergency contacts: your emergency vet + a person to call (saved)
//   3. 24-hour help in Singapore: always-available numbers
//   4. Emergency guides: step-by-step first aid
//   5. Quick Q&A: common questions
//   6. Sign out
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Siren, Phone, MapPin, UserRound, Pencil, ChevronRight, MessageCircleQuestion, LogOut } from 'lucide-react'
import { EMERGENCY_GUIDES, HOTLINES, FAQ } from '../content.js'

// Turns a Singapore number into a link that also dials correctly from a
// foreign SIM: "6266 0232" → "tel:+6562660232". (+65 is Singapore's code.)
const telLink = (phone) => {
  const digits = phone.replace(/[^\d+]/g, '')
  return 'tel:' + (digits.startsWith('+') ? digits : '+65' + digits)
}

function EmergencyContacts({ emergency, onSave }) {
  const hasDetails = Boolean(emergency.vetPhone || emergency.contactPhone)
  const [editing, setEditing] = useState(!hasDetails) // show the form straight away if empty
  const [draft, setDraft] = useState(emergency)
  const field = (key) => (e) => setDraft({ ...draft, [key]: e.target.value })

  function handleSubmit(e) {
    e.preventDefault()
    onSave(draft)
    setEditing(false)
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Emergency contacts</h2>
        {!editing && <button className="link-btn" onClick={() => setEditing(true)}><Pencil size={16} /> Edit</button>}
      </div>

      <div className="card">
        {/* Saved contacts, each with a one-tap call button */}
        {!editing && (
          <ul className="rows">
            {emergency.vetPhone && (
              <li className="row-item">
                <span className="icon-tile red"><Siren size={20} /></span>
                <div className="grow"><span className="tiny muted">Emergency vet</span><strong>{emergency.vetName || emergency.vetPhone}</strong></div>
                {emergency.vetAddress && (
                  <a
                    className="icon-btn"
                    href={`https://maps.google.com/?q=${encodeURIComponent(emergency.vetAddress)}`}
                    target="_blank" rel="noreferrer" aria-label="Directions to vet"
                  >
                    <MapPin size={20} />
                  </a>
                )}
                <a className="btn emergency" style={{ width: 'auto' }} href={telLink(emergency.vetPhone)}><Phone size={16} /> Call</a>
              </li>
            )}
            {emergency.contactPhone && (
              <li className="row-item">
                <span className="icon-tile"><UserRound size={20} /></span>
                <div className="grow"><span className="tiny muted">Backup person</span><strong>{emergency.contactName || emergency.contactPhone}</strong></div>
                <a className="btn" href={telLink(emergency.contactPhone)}><Phone size={16} /> Call</a>
              </li>
            )}
          </ul>
        )}

        {editing && (
          <form className="form" onSubmit={handleSubmit}>
            <h3>Your emergency vet</h3>
            <label>Clinic name<input value={draft.vetName} onChange={field('vetName')} /></label>
            <label>Phone<input type="tel" value={draft.vetPhone} onChange={field('vetPhone')} placeholder="e.g. 6266 0232" /></label>
            <label>Address<input value={draft.vetAddress} onChange={field('vetAddress')} placeholder="Street and postal code" /></label>

            <div className="form-section form">
              <h3>Backup person</h3>
              <p className="tiny muted" style={{ margin: 0 }}>Someone who can help with your pet if you can’t.</p>
              <div className="row">
                <label>Name<input value={draft.contactName} onChange={field('contactName')} /></label>
                <label>Phone<input type="tel" value={draft.contactPhone} onChange={field('contactPhone')} /></label>
              </div>
            </div>
            <div className="actions">
              {hasDetails && <button type="button" className="btn" onClick={() => setEditing(false)}>Cancel</button>}
              <button className="btn primary" type="submit">Save</button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default function Settings({ user, emergency, onSaveEmergency, onSignOut }) {
  return (
    <>
      <h1>Settings</h1>

      <section className="card">
        <div className="row-item" style={{ padding: 0, border: 0 }}>
          <span className="avatar" aria-hidden="true">{user.name[0].toUpperCase()}</span>
          <div className="grow"><strong>{user.name}</strong><span className="tiny muted">{user.email}</span></div>
        </div>
      </section>

      <EmergencyContacts emergency={emergency} onSave={onSaveEmergency} />

      <section className="section">
        <div className="section-head"><h2>24-hour help in Singapore</h2></div>
        <ul className="card rows">
          {HOTLINES.map((h) => (
            <li key={h.name} className="row-item">
              <div className="grow">
                <strong>{h.name}</strong>
                <span className="tiny muted">{h.phone} · {h.address}</span>
              </div>
              <a className="btn" href={telLink(h.phone)} aria-label={`Call ${h.name}, ${h.phone}`}><Phone size={16} /> Call</a>
            </li>
          ))}
        </ul>
        <p className="tiny muted">Call ahead so the clinic can prepare for your pet.</p>
      </section>

      <section className="section">
        <div className="section-head"><h2>What to do if…</h2></div>
        {EMERGENCY_GUIDES.map((g) => (
          <details key={g.title} className="card">
            <summary>
              <span className="icon-tile"><g.icon size={20} /></span>
              {g.title}
              <ChevronRight className="chev" size={18} aria-hidden="true" />
            </summary>
            <ol>{g.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          </details>
        ))}
      </section>

      <section className="section">
        <div className="section-head"><h2>Quick Q&A</h2></div>
        {FAQ.map((f) => (
          <details key={f.q} className="card">
            <summary>
              <span className="icon-tile"><MessageCircleQuestion size={20} /></span>
              {f.q}
              <ChevronRight className="chev" size={18} aria-hidden="true" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
        <p className="tiny muted">This guidance doesn’t replace a vet. If in doubt, call one.</p>
      </section>

      <button
        className="btn danger block section"
        onClick={() => confirm('This removes all your Furly data from this device. Continue?') && onSignOut()}
      >
        <LogOut size={18} /> Sign out & clear data
      </button>
    </>
  )
}
