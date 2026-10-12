// ─────────────────────────────────────────────────────────────────────────────
// Pets.jsx: a pet's profile and health record
//
// This file exports:
//   • PetForm:       the form for creating/editing a pet (also used during sign-up)
//   • ageFrom, vaccineStatus: small helpers used across the app
//   • Pets (default): the "Health" tab screen
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Camera, Pencil, Syringe, Stethoscope, TriangleAlert, Pill, NotebookPen, Plus, X, Phone } from 'lucide-react'
import { ACTIVITIES } from '../content.js'
import { newId } from '../storage.js'
import { PetPhoto } from '../components/PetCard.jsx'

// A blank pet, used as the starting point for the "add pet" form.
const EMPTY_PET = {
  name: '', species: 'Dog', breed: '', gender: 'Female', birthday: '',
  weight: '', microchip: '', licence: '', photo: '', likes: [],
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

// "2025-10-20" → "20 Oct 2025"
export function formatDay(iso) {
  return iso ? new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
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

// Shrinks a photo from the phone's camera roll to 320px and turns it into
// text (a "data URL") so it can be saved in browser storage. Full-size
// phone photos are several MB and would quickly fill the storage up.
function resizePhoto(file) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const size = 320
      const scale = size / Math.min(img.width, img.height) // crop to a square
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      canvas.getContext('2d').drawImage(
        img,
        (size - img.width * scale) / 2, (size - img.height * scale) / 2,
        img.width * scale, img.height * scale,
      )
      URL.revokeObjectURL(img.src)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = URL.createObjectURL(file)
  })
}

// ── PetForm: create or edit a pet's profile ─────────────────────────────────
export function PetForm({ initial = EMPTY_PET, onSave, onCancel }) {
  // `draft` is the in-progress copy. Nothing is saved until "Save" is pressed.
  // Spreading EMPTY_PET first means pets saved before a new field existed
  // (like `licence`) still get a sensible empty value.
  const [draft, setDraft] = useState({ ...EMPTY_PET, ...initial })

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

  async function pickPhoto(e) {
    const file = e.target.files[0]
    if (file) setDraft({ ...draft, photo: await resizePhoto(file) })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...draft, id: draft.id || newId() })
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      {/* The whole row is a <label>, so tapping anywhere opens the photo picker */}
      <label className="photo-picker">
        <PetPhoto pet={draft} size={72} />
        <span className="btn"><Camera size={18} /> {draft.photo ? 'Change photo' : 'Add photo'}</span>
        <input type="file" accept="image/*" onChange={pickPhoto} />
      </label>

      <label>Name<input value={draft.name} onChange={field('name')} required /></label>

      <div className="row">
        <label>Species
          <select value={draft.species} onChange={field('species')}>
            <option>Dog</option><option>Cat</option><option>Other</option>
          </select>
        </label>
        <label>Sex
          <select value={draft.gender} onChange={field('gender')}>
            <option>Female</option><option>Male</option>
          </select>
        </label>
      </div>

      <label>Breed<input value={draft.breed} onChange={field('breed')} placeholder="e.g. Toy Poodle" /></label>

      <div className="row">
        <label>Birthday<input type="date" value={draft.birthday} onChange={field('birthday')} /></label>
        <label>Weight (kg)<input type="number" step="0.1" min="0" value={draft.weight} onChange={field('weight')} /></label>
      </div>

      <div className="row">
        <label>Microchip no.<input value={draft.microchip} onChange={field('microchip')} placeholder="15 digits" inputMode="numeric" /></label>
        <label>AVS licence no.<input value={draft.licence} onChange={field('licence')} placeholder="From PALS" /></label>
      </div>

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

      <div className="form-section form">
        <h3>Health</h3>
        <div className="row">
          <label>Vet name<input value={draft.vetName} onChange={field('vetName')} /></label>
          <label>Vet phone<input type="tel" value={draft.vetPhone} onChange={field('vetPhone')} /></label>
        </div>
        <label>Allergies<input value={draft.allergies} onChange={field('allergies')} placeholder="e.g. chicken, flea bites" /></label>
        <label>Medications<input value={draft.medications} onChange={field('medications')} placeholder="Name, dose, how often" /></label>
        <label>Conditions / notes<textarea rows="2" value={draft.conditions} onChange={field('conditions')} /></label>
      </div>

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
  const [adding, setAdding] = useState(false)

  function add(e) {
    e.preventDefault()
    const vaccine = { id: newId(), name, given, due }
    onSave({ ...pet, vaccinations: [...pet.vaccinations, vaccine] })
    setName(''); setGiven(''); setDue(''); setAdding(false)
  }

  function remove(id) {
    onSave({ ...pet, vaccinations: pet.vaccinations.filter((v) => v.id !== id) })
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Vaccinations</h2>
        {!adding && <button className="link-btn" onClick={() => setAdding(true)}><Plus size={16} /> Add</button>}
      </div>
      <div className="card">
        {pet.vaccinations.length === 0 && !adding && <p className="empty">No vaccinations recorded yet.</p>}
        <ul className="rows">
          {pet.vaccinations.map((v) => {
            const status = vaccineStatus(v)
            return (
              <li key={v.id} className="row-item">
                <span className="icon-tile"><Syringe size={20} /></span>
                <div className="grow">
                  <strong>{v.name}</strong>
                  <span className="tiny muted block">
                    {v.given && `Given ${formatDay(v.given)}`}{v.given && v.due && ' · '}{v.due && `Due ${formatDay(v.due)}`}
                  </span>
                  <span className={'badge ' + status.tone} style={{ marginTop: '0.35rem' }}>{status.label}</span>
                </div>
                <button className="icon-btn" onClick={() => remove(v.id)} aria-label={`Remove ${v.name}`}><X size={18} /></button>
              </li>
            )
          })}
        </ul>

        {adding && (
          <form className="form inline" onSubmit={add}>
            <label>Vaccine<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rabies, 5-in-1" required autoFocus /></label>
            <div className="row">
              <label>Given<input type="date" value={given} onChange={(e) => setGiven(e.target.value)} /></label>
              <label>Next due<input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
            </div>
            <div className="actions">
              <button type="button" className="btn" onClick={() => setAdding(false)}>Cancel</button>
              <button className="btn primary" type="submit">Save vaccine</button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

// ── The Health tab ──────────────────────────────────────────────────────────
export default function Pets({ pet, startEditing = false, onSave, onDelete }) {
  const [editing, setEditing] = useState(startEditing)

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
          className="btn danger block"
          onClick={() => confirm(`Delete ${pet.name}'s profile?`) && onDelete(pet.id)}
        >
          Delete {pet.name}
        </button>
      </>
    )
  }

  // Small label/value pairs shown in the profile card. Empty values are skipped.
  const facts = [
    ['Breed', pet.breed], ['Sex', pet.gender], ['Age', ageFrom(pet.birthday)],
    ['Weight', pet.weight && `${pet.weight} kg`], ['Microchip', pet.microchip], ['AVS licence', pet.licence],
  ].filter(([, value]) => value)

  // Medical notes as icon rows.
  const notes = [
    { icon: TriangleAlert, label: 'Allergies', value: pet.allergies },
    { icon: Pill, label: 'Medications', value: pet.medications },
    { icon: NotebookPen, label: 'Conditions', value: pet.conditions },
  ]

  return (
    <>
      <div className="title-row">
        <div className="row-item" style={{ padding: 0, border: 0 }}>
          <PetPhoto pet={pet} size={56} />
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Health record</p>
            <h1>{pet.name}</h1>
          </div>
        </div>
        <button className="btn" onClick={() => setEditing(true)}><Pencil size={16} /> Edit</button>
      </div>

      <section className="card">
        <dl className="facts">
          {facts.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        {pet.likes.length > 0 && (
          <div className="chips" style={{ marginTop: '1rem' }}>
            {pet.likes.map((l) => <span key={l} className="chip static">{l}</span>)}
          </div>
        )}
      </section>

      <Vaccinations pet={pet} onSave={onSave} />

      <section className="section">
        <div className="section-head"><h2>Medical notes</h2></div>
        <ul className="card rows">
          <li className="row-item">
            <span className="icon-tile"><Stethoscope size={20} /></span>
            <div className="grow"><span className="tiny muted">Vet</span><strong>{pet.vetName || 'Not added'}</strong></div>
            {pet.vetPhone && (
              <a className="btn" href={`tel:${pet.vetPhone}`} aria-label={`Call ${pet.vetName || 'vet'}`}><Phone size={16} /> Call</a>
            )}
          </li>
          {notes.map((n) => (
            <li key={n.label} className="row-item">
              <span className="icon-tile"><n.icon size={20} /></span>
              <div className="grow"><span className="tiny muted">{n.label}</span><strong>{n.value || 'None recorded'}</strong></div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
