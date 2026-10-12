// ─────────────────────────────────────────────────────────────────────────────
// PetCard.jsx: the pet's digital ID card (inspired by the Singpass card)
//
// • <PetCard> is the compact card shown on Home.
// • Tapping it opens <ExpandedPetCard>: the background dims and blurs, and
//   the card grows from where it was into the centre of the screen,
//   revealing the pet's full details.
//
// How the "grow" animation works (a technique called FLIP):
//   1. When tapped, we measure where the small card is on screen.
//   2. The expanded card starts at exactly that position and size...
//   3. ...then on the next frame we give it its final, bigger position.
//      CSS transitions (in styles.css) animate the change smoothly.
//   Closing runs the same steps in reverse.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { Dog, Cat, PawPrint, X, ChevronRight, ShieldCheck, TriangleAlert, Info, Stethoscope, Pencil } from 'lucide-react'
import { ageFrom, vaccineStatus, formatDay } from '../pages/Pets.jsx'

const ANIMATION_MS = 400 // keep in sync with the transition time in styles.css

// The right icon for the pet's species.
export function SpeciesIcon({ species, ...props }) {
  const Icon = species === 'Cat' ? Cat : species === 'Dog' ? Dog : PawPrint
  return <Icon aria-hidden="true" {...props} />
}

// The pet's photo, or the first letter of its name if there's no photo yet.
export function PetPhoto({ pet, size = 72 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 }
  return pet.photo
    ? <img className="pet-photo" src={pet.photo} alt="" style={style} />
    : <span className="pet-photo" style={style} aria-hidden="true">{(pet.name || '?')[0].toUpperCase()}</span>
}

// Shows only the last 4 digits, like a bank card: "•••• 4821".
function maskChip(chip) {
  return chip ? `•••• ${chip.slice(-4)}` : 'Not added'
}

// One-line vaccination summary for the expanded card. The words themselves
// say the status, and the icon (shield or warning) backs it up visually.
function vaccineSummary(pet) {
  const statuses = pet.vaccinations.map(vaccineStatus)
  const overdue = statuses.filter((s) => s.tone === 'bad').length
  const soon = statuses.filter((s) => s.tone === 'warn').length
  if (!statuses.length) return { icon: Info, text: 'No vaccinations recorded yet' }
  if (overdue) return { icon: TriangleAlert, text: `${overdue} vaccination${overdue > 1 ? 's' : ''} overdue` }
  if (soon) return { icon: TriangleAlert, text: `${soon} vaccination${soon > 1 ? 's' : ''} due soon` }
  return { icon: ShieldCheck, text: 'Vaccinations up to date' }
}

// The top half of the card, shared by the compact and expanded versions.
function CardFace({ pet, corner }) {
  return (
    <>
      <PawPrint className="watermark" size={170} aria-hidden="true" />
      <div className="pet-id-top">
        <span className="pet-id-label">FURLY PET ID</span>
        {corner}
      </div>
      <div className="pet-id-main">
        <PetPhoto pet={pet} />
        <div>
          <div className="pet-id-name">{pet.name}</div>
          <div className="pet-id-sub">{[pet.breed || pet.species, pet.gender].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
    </>
  )
}

// ── Compact card on Home ────────────────────────────────────────────────────
export function PetCard({ pet, hidden, onOpen }) {
  const ref = useRef(null)
  return (
    <button
      ref={ref}
      className="pet-id"
      // While the expanded copy is showing, hide this one so it looks like it "lifted off".
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
      onClick={() => onOpen(pet, ref.current.getBoundingClientRect())}
      aria-label={`${pet.name}'s pet ID. Tap to view details`}
    >
      <CardFace pet={pet} corner={<SpeciesIcon species={pet.species} size={22} color="var(--lime)" />} />
      <div className="pet-id-bottom">
        <div><small>Microchip</small><span>{maskChip(pet.microchip)}</span></div>
        <div><small>Age</small><span>{ageFrom(pet.birthday) || '-'}</span></div>
        <span className="tap-hint">View <ChevronRight size={14} /></span>
      </div>
    </button>
  )
}

// ── Expanded card (overlay) ─────────────────────────────────────────────────
export function ExpandedPetCard({ pet, from, onClose, onHealth, onEdit }) {
  const [grown, setGrown] = useState(false)

  // Where the card ends up: centred, up to 440px wide, near the top.
  const width = Math.min(window.innerWidth - 32, 440)
  const target = {
    top: Math.max(24, window.innerHeight * 0.08),
    left: (window.innerWidth - width) / 2,
    width,
  }
  const style = grown
    ? { ...target, maxHeight: window.innerHeight - target.top - 24 }
    : { top: from.top, left: from.left, width: from.width, maxHeight: from.height }

  // Step 3 of FLIP: make sure the browser has laid out the start position
  // (reading its size forces that), then on the next tick switch to the
  // final position and let CSS animate between the two.
  const cardRef = useRef(null)
  useEffect(() => {
    cardRef.current.getBoundingClientRect()
    const timer = setTimeout(() => setGrown(true), 16)
    return () => clearTimeout(timer)
  }, [])

  function close() {
    setGrown(false)                       // animate back to the small card...
    setTimeout(onClose, ANIMATION_MS)     // ...then remove the overlay
  }

  // Close with the Escape key, and stop the page behind from scrolling.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [])

  const summary = vaccineSummary(pet)
  const born = formatDay(pet.birthday) || '-'
  const facts = [
    ['Species', pet.species], ['Sex', pet.gender],
    ['Born', born], ['Age', ageFrom(pet.birthday) || '-'],
    ['Weight', pet.weight ? `${pet.weight} kg` : '-'], ['Microchip', pet.microchip || '-'],
    ['AVS licence', pet.licence || '-'], ['Vet', pet.vetName || '-'],
  ]

  return (
    <>
      {/* Dimmed, blurred background. Tapping it closes the card. */}
      <div className={'overlay' + (grown ? ' open' : '')} onClick={close} />

      <div
        ref={cardRef}
        className={'pet-id expanded' + (grown ? ' grown' : '')}
        style={style}
        role="dialog" aria-modal="true" aria-label={`${pet.name}'s pet ID`}
      >
        <CardFace
          pet={pet}
          corner={<button className="close-btn" onClick={close} aria-label="Close" autoFocus><X size={20} /></button>}
        />

        <div className="pet-id-details">
          <dl className="facts">
            {facts.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>

          <div className="status-strip">
            <summary.icon size={18} color="var(--lime)" aria-hidden="true" />
            {summary.text}
          </div>

          {pet.allergies && (
            <div className="status-strip">
              <TriangleAlert size={18} color="var(--lime)" aria-hidden="true" />
              Allergies: {pet.allergies}
            </div>
          )}

          <div className="pet-id-actions">
            <button className="btn lime" onClick={onHealth}><Stethoscope size={18} /> Health record</button>
            <button className="btn ghost-light" onClick={onEdit}><Pencil size={18} /> Edit</button>
          </div>
        </div>
      </div>
    </>
  )
}
