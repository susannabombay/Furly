// ─────────────────────────────────────────────────────────────────────────────
// PlaceSheet.jsx: the popup for a pet-friendly food place
//
// Shows whether it's open right now, the full week's opening hours, the
// address, and buttons that open the place in Google Maps.
//
// Opening hours are always worked out in Singapore time, so "Open now" is
// right even if your phone is set to another timezone.
// ─────────────────────────────────────────────────────────────────────────────
import { MapPin, Clock, Navigation, ExternalLink } from 'lucide-react'
import Sheet from './Sheet.jsx'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // show Monday first, like Singapore calendars

// "17:00" → "5 pm", "08:30" → "8:30 am"
function formatHour(time) {
  const [h, m] = time.split(':').map(Number)
  const suffix = h < 12 ? 'am' : 'pm'
  const hour12 = h % 12 || 12
  return m ? `${hour12}:${String(m).padStart(2, '0')} ${suffix}` : `${hour12} ${suffix}`
}

// The current day (0 = Sunday) and time ("14:05") in Singapore.
function singaporeNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Singapore', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map((p) => [p.type, p.value]),
  )
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday)
  return { day, time: `${parts.hour}:${parts.minute}` }
}

// Is the place open right now? Returns { open, text }, e.g.
//   { open: true,  text: 'Open now · closes 5 pm' }
//   { open: false, text: 'Closed · opens tomorrow 8 am' }
// ("HH:MM" times compare correctly as text, so no maths is needed.)
export function openStatus(hours) {
  const { day, time } = singaporeNow()
  const today = hours[day]
  if (today && time >= today[0] && time < today[1]) {
    return { open: true, text: `Open now · closes ${formatHour(today[1])}` }
  }
  if (today && time < today[0]) {
    return { open: false, text: `Closed · opens ${formatHour(today[0])}` }
  }
  // Look ahead for the next day it opens.
  for (let i = 1; i <= 7; i++) {
    const next = hours[(day + i) % 7]
    if (next) {
      const when = i === 1 ? 'tomorrow' : DAY_NAMES[(day + i) % 7]
      return { open: false, text: `Closed · opens ${when} ${formatHour(next[0])}` }
    }
  }
  return { open: false, text: 'Closed' }
}

// Google Maps links: one to look the place up, one for directions.
const query = (place) => encodeURIComponent(`${place.name}, ${place.address}, Singapore`)
const mapsUrl = (place) => `https://www.google.com/maps/search/?api=1&query=${query(place)}`
const directionsUrl = (place) => `https://www.google.com/maps/dir/?api=1&destination=${query(place)}`

export default function PlaceSheet({ place, onClose }) {
  const status = openStatus(place.hours)
  const today = singaporeNow().day

  return (
    <Sheet title={place.name} onClose={onClose}>
      {() => (
        <>
          <div className="sheet-hero">
            <div className={'art ' + place.color}><place.icon size={40} strokeWidth={1.5} aria-hidden="true" /></div>
            <div>
              {/* Words + symbol, so the status doesn't rely on colour */}
              <span className={'badge ' + (status.open ? 'good' : 'neutral')}>
                {status.open ? '● ' : '○ '}{status.text}
              </span>
              <h2 style={{ marginTop: '0.4rem' }}>{place.name}</h2>
              <span className="tiny muted">{place.type} · {place.area}</span>
            </div>
          </div>

          <p>{place.about}</p>
          <div className="chips" style={{ marginBottom: '1.25rem' }}>
            {place.perks.map((perk) => <span key={perk} className="chip static">{perk}</span>)}
          </div>

          <ul className="rows sheet-facts">
            <li className="row-item">
              <span className="icon-tile"><MapPin size={20} /></span>
              <div className="grow"><span className="tiny muted">Address</span><strong>{place.address}</strong></div>
            </li>
            <li className="row-item" style={{ alignItems: 'flex-start' }}>
              <span className="icon-tile"><Clock size={20} /></span>
              <div className="grow">
                <span className="tiny muted">Opening hours</span>
                <dl className="hours">
                  {DISPLAY_ORDER.map((d) => (
                    <div key={d} className={d === today ? 'today' : ''}>
                      <dt>{DAY_NAMES[d]}{d === today && ' (today)'}</dt>
                      <dd>{place.hours[d] ? `${formatHour(place.hours[d][0])} – ${formatHour(place.hours[d][1])}` : 'Closed'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          </ul>

          <div className="sheet-calendar">
            <a className="btn primary" href={mapsUrl(place)} target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> Open in Google Maps
            </a>
            <a className="btn" href={directionsUrl(place)} target="_blank" rel="noreferrer">
              <Navigation size={16} /> Directions
            </a>
          </div>
        </>
      )}
    </Sheet>
  )
}
