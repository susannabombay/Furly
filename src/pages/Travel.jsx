// ─────────────────────────────────────────────────────────────────────────────
// Travel.jsx: everything needed for flights and daycare
//
// Each checklist mixes two kinds of items (defined in content.js):
//   • automatic: Furly ticks them by reading the pet's profile
//     (e.g. "microchip recorded" is ticked once a microchip number exists)
//   • manual: the owner ticks them; these ticks are saved per pet
// Below the checklists is a summary of entry rules for popular destinations.
// ─────────────────────────────────────────────────────────────────────────────
import { useStoredState } from '../storage.js'
import { FLIGHT_CHECKLIST, DAYCARE_CHECKLIST, REGULATIONS } from '../content.js'

function Checklist({ title, items, pet, ticks, onTick }) {
  // Work out which items are done before drawing, so we can show a progress count.
  const rows = items.map((item) => ({
    ...item,
    auto: Boolean(item.check),
    done: item.check ? item.check(pet) : Boolean(ticks[item.id]),
  }))
  const doneCount = rows.filter((r) => r.done).length

  return (
    <section className="card">
      <div className="title-row">
        <h2>{title}</h2>
        <span className={'badge ' + (doneCount === rows.length ? 'good' : 'neutral')}>
          {doneCount === rows.length ? '✓ ' : ''}{doneCount}/{rows.length} done
        </span>
      </div>
      <ul className="checklist">
        {rows.map((r) => (
          <li key={r.id}>
            <label>
              <input
                type="checkbox"
                checked={r.done}
                disabled={r.auto} // automatic items can't be ticked by hand
                onChange={() => onTick(r.id)}
              />
              <span>
                {r.label}
                {r.auto && <span className="tiny muted block">
                  {r.done ? 'From your pet’s profile' : 'Add this in the Health tab'}
                </span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Travel({ pet }) {
  // Manual ticks are saved per pet, e.g. under the key "travel:ab12cd34".
  const [ticks, setTicks] = useStoredState(`travel:${pet.id}`, {})
  const toggle = (id) => setTicks({ ...ticks, [id]: !ticks[id] })

  return (
    <>
      <h1>Travel & care</h1>
      <p className="muted">What {pet.name} needs before flying or staying at daycare.</p>

      <Checklist title="✈️ Flying" items={FLIGHT_CHECKLIST} pet={pet} ticks={ticks} onTick={toggle} />
      <Checklist title="🏡 Daycare & boarding" items={DAYCARE_CHECKLIST} pet={pet} ticks={ticks} onTick={toggle} />

      <h2 className="section-title">📜 Entry rules by destination</h2>
      {REGULATIONS.map((r) => (
        // <details> is a built-in HTML expandable section: no code needed.
        <details key={r.region} className="card">
          <summary>{r.region}</summary>
          <ul>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
          {r.link && <a href={r.link} target="_blank" rel="noreferrer">Official rules ↗</a>}
        </details>
      ))}
      <p className="tiny muted">
        Rules change often. Always confirm with your airline, the destination’s official site and your vet before travelling.
      </p>
    </>
  )
}
