// ─────────────────────────────────────────────────────────────────────────────
// storage.js: where Furly keeps its data (for now)
//
// "Local first" means every user's data lives in their own browser, in
// something called localStorage: a small key → value store that survives
// page reloads. Nothing is sent to a server yet.
//
// This is the ONLY file that knows where data is stored. When we move to a
// real backend (e.g. Supabase), we swap the inside of this file and the rest
// of the app keeps working unchanged.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'

// Every key we save is prefixed so Furly's data never clashes with other
// sites you open on localhost during development.
const PREFIX = 'furly:'

// useStoredState works exactly like React's useState, except the value is also
// saved to localStorage, so it is still there after you refresh the page.
//
//   const [pets, setPets] = useStoredState('pets', [])
//
// - On first load it reads the saved value (or uses `initialValue` if none).
// - Whenever the value changes, it writes the new value back.
export function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(PREFIX + key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch {
      // Private browsing or blocked storage: just start fresh.
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // Storage full or blocked: the app still works, it just won't remember.
    }
  }, [key, value])

  return [value, setValue]
}

// Wipes everything Furly saved. Used by "Sign out & clear data" in Settings.
export function clearAllData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k))
}

// Creates a reasonably unique id for new pets, vaccinations, etc.
export function newId() {
  return Math.random().toString(36).slice(2, 10)
}
