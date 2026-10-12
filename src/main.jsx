// The starting point of the app. index.html loads this file, and it tells
// React to draw our <App /> inside the empty <div id="root">.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  // StrictMode only runs in development: it double-checks our components
  // and warns in the browser console about common mistakes.
  <StrictMode>
    <App />
  </StrictMode>,
)
