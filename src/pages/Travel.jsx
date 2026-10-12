// ─────────────────────────────────────────────────────────────────────────────
// Travel.jsx: everything needed for flights and daycare
//
// Each checklist mixes two kinds of items (defined in content.js):
//   • automatic: Furly ticks them by reading the pet's profile
//     (e.g. "microchip recorded" is ticked once a microchip number exists)
//   • manual: the owner ticks them; these ticks are saved per pet
// Below the checklists is a summary of entry rules for popular destinations.
// ─────────────────────────────────────────────────────────────────────────────
import { Plane, House, ChevronRight, ExternalLink, Check } from 'lucide-react'
import { useStoredState } from '../storage.js'
import { FLIGHT_CHECKLIST, DAYCARE_CHECKLIST, REGULATIONS } from '../content.js'

function Checklist({ title, icon: Icon, items, pet, ticks, onTick }) {
  // Work out which items are done before drawing, so we can show a progress count.
  const rows = items.map((item) => ({
    ...item,
    auto: Boolean(item.check),
    done: item.check ? item.check(pet) : Boolean(ticks[item.id]),
  }))
  const doneCount = rows.filter((r) => r.done).length

  return (
    <section className="card">
      <div className="row-item" style={{ padding: 0, border: 0 }}>
        <span className="icon-tile lime"><Icon size={20} /></span>
        <h2 className="grow">{title}</h2>
        <span className={'badge ' + (doneCount === rows.length ? 'good' : 'neutral')}>
          {doneCount === rows.length ? '✓ ' : ''}{doneCount}/{rows.length} done
        </span>
      </div>
      {/* Progress bar: purely visual, the "x/y done" text above says the same thing */}
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${(doneCount / rows.length) * 100}%` }} />
      </div>
      <ul className="checklist">
        {rows.map((r) => (
          <li key={r.id}>
            <label>
              {/* Automatic items show a status dot instead of a checkbox,
                  because they're ticked from the pet's profile, not by hand. */}
              {r.auto ? (
                <span className={'auto-dot' + (r.done ? ' done' : '')} aria-hidden="true">
                  {r.done && <Check size={14} strokeWidth={3} />}
                </span>
              ) : (
                <input type="checkbox" checked={r.done} onChange={() => onTick(r.id)} />
              )}
              <span>
                {r.auto && <span className="sr-only">{r.done ? 'Done: ' : 'Not done: '}</span>}
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

export default function Travel({ pet, goTo }) {
  // Manual ticks are saved per pet, e.g. under the key "travel:ab12cd34".
  const [ticks, setTicks] = useStoredState(`travel:${pet.id}`, {})
  const toggle = (id) => setTicks({ ...ticks, [id]: !ticks[id] })

  return (
    <>
      <p className="eyebrow" style={{ margin: 0 }}>Travel & care</p>
      <h1>Ready to go, {pet.name}?</h1>

      <Checklist title="Flying" icon={Plane} items={FLIGHT_CHECKLIST} pet={pet} ticks={ticks} onTick={toggle} />
      <Checklist title="Daycare & boarding" icon={House} items={DAYCARE_CHECKLIST} pet={pet} ticks={ticks} onTick={toggle} />
      <button className="btn block" onClick={() => goTo('explore', 'care')}>
        Find daycare & boarding <ChevronRight size={18} />
      </button>

      <section className="section">
        <div className="section-head"><h2>Singapore rules</h2></div>
        {REGULATIONS.map((r) => (
          // <details> is a built-in HTML expandable section: no code needed.
          <details key={r.region} className="card">
            <summary>
              <span className="icon-tile"><r.icon size={20} /></span>
              {r.region}
              <ChevronRight className="chev" size={18} aria-hidden="true" />
            </summary>
            <ul>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
            {r.link && (
              <a href={r.link} target="_blank" rel="noreferrer">
                Official source <ExternalLink size={14} style={{ verticalAlign: '-2px' }} aria-hidden="true" />
              </a>
            )}
          </details>
        ))}
      </section>
      <p className="tiny muted">
        Rules change often. Always confirm with your airline, the destination’s official site and your vet before travelling.
      </p>
    </>
  )
}
