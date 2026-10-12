// ─────────────────────────────────────────────────────────────────────────────
// Sheet.jsx: a reusable popup that slides up from the bottom of the screen
//
// Used for events (EventSheet.jsx) and food places (Explore.jsx). It handles
// everything a popup needs, so each use only supplies its content:
//   • dims and blurs the page behind it
//   • slides in, and slides out before disappearing
//   • closes on the X, a tap on the background, or the Escape key
//   • stops the page behind from scrolling while it's open
//
// Usage: the content is a function that receives `close`, so buttons inside
// can close the sheet with the same slide-out animation:
//   <Sheet title="Kopi & Paws" onClose={...}>
//     {(close) => <button onClick={close}>Done</button>}
//   </Sheet>
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const ANIMATION_MS = 300 // keep in sync with the .sheet transition in styles.css

export default function Sheet({ title, onClose, children }) {
  const [open, setOpen] = useState(false)
  const sheetRef = useRef(null)

  // Slide in: draw the sheet below the screen first, then move it up on the
  // next tick so the CSS transition animates it (same trick as PetCard).
  useEffect(() => {
    sheetRef.current.getBoundingClientRect()
    const timer = setTimeout(() => setOpen(true), 16)
    return () => clearTimeout(timer)
  }, [])

  // Slide out, then tell the parent to remove the sheet.
  function close() {
    setOpen(false)
    setTimeout(onClose, ANIMATION_MS)
  }

  // Escape closes it, and the page behind can't scroll while it's open.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      <div className={'overlay' + (open ? ' open' : '')} onClick={close} />
      <div
        ref={sheetRef}
        className={'sheet' + (open ? ' open' : '')}
        role="dialog" aria-modal="true" aria-label={title}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <button className="icon-btn sheet-close" onClick={close} aria-label="Close" autoFocus><X size={20} /></button>
        {children(close)}
      </div>
    </>
  )
}
