// ─────────────────────────────────────────────────────────────────────────────
// Pets.jsx: a pet's profile and health record
//
// This file exports three things:
//   • PetForm:       the form for creating/editing a pet (also used during sign-up)
//   • vaccineStatus: a helper that says if a vaccine is ok, due soon or overdue
//   • Pets (default): the "Health" tab screen
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { ACTIVITIES } from '../content.js'
import { newId } from '../storage.js'

// A blank pet, used as the starting point for the "add pet" form.
const EMPTY_PET = {
  name: '', species: 'Dog', breed: '', gender: 'Female', birthday: '',
  weight: '', microchip: '', likes: [],
  vetName: '', vetPhone: '', allergies: '', medications: '', conditions: '',
  vaccinations: [],
}

// ── Helpers ─────────────────────────────────────────────────────────────────

// Turns a birthday like "2021-04-02" into "4 yrs" or "7 mo".
export function ageFrom(birthday) {
  if (!birthday) return null
  const months = Math.floor((Date.now() - new Date(birthday)) / (1000 * 60 * 60 * 24 * 30.44))
  return months >= 12 ? `${Math.floor(months / 12)} yrs` : `${Math.max(months, 0)} mo`
}

// Looks at a vaccine's due date and returns a label + colour class.
// Each label starts with a symbol so the status is clear without seeing colour.
export function vaccineStatus(vaccine) {
  if (!vaccine.due) return { label: '– No due date', tone: 'neutral' }
  const days = (new Date(vaccine.due) - Date.now()) / (1000 * 60 * 60 * 24)
  if (days < 0) return { label: '✕ Overdue', tone: 'bad' }
  if (days < 30) return { label: '⚠ Due soon', tone: 'warn' }
  return { label: '✓ Up to date', tone: 'good' }
}

// ── PetForm: create or edit a pet's profile ─────────────────────────────────
export function PetForm({ initial = EMPTY_PET, onSave, onCancel }) {
  // `draft` is the in-progress copy. Nothing is saved until "Save" is pressed.
  const [draft, setDraft] = useState(initial)

  // One small helper so every input can update its own field:
  //   <input onChange={field('breed')} />
  const field = (key) => (e) => setDraft({ ...draft, [key]: e.target.value })

  // Tapping an activity chip adds or removes it from `likes`.
  function toggleLike(activity) {
    const likes = draft.likes.includes(activity)
      ? draft.likes.filter((a) => a !== activity)
      : [...draft.likes, activity]
    setDraft({ ...draft, likes })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...draft, id: draft.id || newId() })
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <label>Name<input value={draft.name} onChange={field('name')} required /></label>

      <div className="row">
        <label>Species
          <select value={draft.species} onChange={field('species')}>
            <option>Dog</option><option>Cat</option><option>Other</option>
          </select>
        </label>
        <label>Gender
          <select value={draft.gender} onChange={field('gender')}>
            <option>Female</option><option>Male</option>
          </select>
        </label>
      </div>

      <label>Breed<input value={draft.breed} onChange={field('breed')} placeholder="e.g. Golden Retriever" /></label>

      <div className="row">
        <label>Birthday<input type="date" value={draft.birthday} onChange={field('birthday')} /></label>
        <label>Weight (kg)<input type="number" step="0.1" min="0" value={draft.weight} onChange={field('weight')} /></label>
      </div>

      <label>Microchip number<input value={draft.microchip} onChange={field('microchip')} placeholder="15 digits" /></label>

      <fieldset>
        <legend>What does {draft.name || 'your pet'} love doing?</legend>
        <div className="chips">
          {ACTIVITIES.map((a) => (
            <button
              type="button" key={a}
              className={'chip' + (draft.likes.includes(a) ? ' active' : '')}
              aria-pressed={draft.likes.includes(a)} // tells screen readers it's on/off
              onClick={() => toggleLike(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>

      <h3>Health</h3>
      <div className="row">
        <label>Vet name<input value={draft.vetName} onChange={field('vetName')} /></label>
        <label>Vet phone<input type="tel" value={draft.vetPhone} onChange={field('vetPhone')} /></label>
      </div>
      <label>Allergies<input value={draft.allergies} onChange={field('allergies')} placeholder="e.g. chicken, flea bites" /></label>
      <label>Medications<input value={draft.medications} onChange={field('medications')} placeholder="name, dose, how often" /></label>
      <label>Conditions / notes<textarea rows="2" value={draft.conditions} onChange={field('conditions')} /></label>

      <div className="actions">
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn primary">Save</button>
      </div>
    </form>
  )
}

// ── Vaccinations: list + "add vaccine" mini-form ────────────────────────────
function Vaccinations({ pet, onSave }) {
  const [name, setName] = useState('')
  const [given, setGiven] = useState('')
  const [due, setDue] = useState('')

  function add(e) {
    e.preventDefault()
    const vaccine = { id: newId(), name, given, due }
    onSave({ ...pet, vaccinations: [...pet.vaccinations, vaccine] })
    setName(''); setGiven(''); setDue('')
  }

  function remove(id) {
    onSave({ ...pet, vaccinations: pet.vaccinations.filter((v) => v.id !== id) })
  }

  return (
    <section className="card">
      <h2>💉 Vaccinations</h2>
      {pet.vaccinations.length === 0 && <p className="muted">No vaccinations recorded yet.</p>}
      <ul className="list">
        {pet.vaccinations.map((v) => {
          const status = vaccineStatus(v)
          return (
            <li key={v.id}>
              <div>
                <strong>{v.name}</strong>
                <div className="tiny muted">
                  {v.given && `Given ${v.given}`}{v.given && v.due && ' · '}{v.due && `Due ${v.due}`}
                </div>
              </div>
              <span className={'badge ' + status.tone}>{status.label}</span>
              <button className="icon-btn" onClick={() => remove(v.id)} aria-label={`Remove ${v.name}`}>✕</button>
            </li>
          )
        })}
      </ul>

      <form className="form inline" onSubmit={add}>
        <label>Vaccine<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rabies" required /></label>
        <div className="row">
          <label>Given<input type="date" value={given} onChange={(e) => setGiven(e.target.value)} /></label>
          <label>Next due<input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
        </div>
        <button className="btn" type="submit">＋ Add vaccine</button>
      </form>
    </section>
  )
}

// ── The Health tab ──────────────────────────────────────────────────────────
export default function Pets({ pet, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <>
        <h1>Edit {pet.name}</h1>
        <PetForm
          initial={pet}
          onSave={(p) => { onSave(p); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
        <button
          className="btn danger"
          onClick={() => confirm(`Delete ${pet.name}'s profile?`) && onDelete(pet.id)}
        >
          Delete {pet.name}
        </button>
      </>
    )
  }

  // Small label/value pairs shown in the profile card. Empty values are skipped.
  const facts = [
    ['Breed', pet.breed], ['Gender', pet.gender], ['Age', ageFrom(pet.birthday)],
    ['Weight', pet.weight && `${pet.weight} kg`], ['Microchip', pet.microchip],
  ].filter(([, value]) => value)

  return (
    <>
      <div className="title-row">
        <h1>{pet.name}</h1>
        <button className="btn" onClick={() => setEditing(true)}>Edit</button>
      </div>

      <section className="card">
        <dl className="facts">
          {facts.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        {pet.likes.length > 0 && (
          <div className="chips">{pet.likes.map((l) => <span key={l} className="chip static">{l}</span>)}</div>
        )}
      </section>

      <Vaccinations pet={pet} onSave={onSave} />

      <section className="card">
        <h2>🩺 Medical notes</h2>
        <dl className="facts stacked">
          <div><dt>Vet</dt><dd>{pet.vetName || '-'}{pet.vetPhone && <> · <a href={`tel:${pet.vetPhone}`}>{pet.vetPhone}</a></>}</dd></div>
          <div><dt>Allergies</dt><dd>{pet.allergies || 'None recorded'}</dd></div>
          <div><dt>Medications</dt><dd>{pet.medications || 'None recorded'}</dd></div>
          <div><dt>Conditions</dt><dd>{pet.conditions || 'None recorded'}</dd></div>
        </dl>
      </section>
    </>
  )
}
