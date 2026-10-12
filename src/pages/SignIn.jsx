// ─────────────────────────────────────────────────────────────────────────────
// SignIn.jsx: the first screen a new user sees
//
// For this local-first version, "signing in" just saves your name and email
// in the browser. There is no password because there is no server to check
// it against yet. When we add a real backend, this screen will call its
// sign-in function instead and the rest of the app stays the same.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'

export default function SignIn({ onSignIn }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page on submit
    onSignIn({ name: name.trim(), email: email.trim() })
  }

  return (
    <main className="page narrow signin">
      <div className="hero-paw" aria-hidden="true">🐾</div>
      <h1>Furly</h1>
      <p className="muted">Health, travel and friends for your pet, all in one place.</p>

      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Your name
          <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="btn primary" type="submit">Get started</button>
        <p className="tiny muted">Your data stays on this device for now.</p>
      </form>
    </main>
  )
}
