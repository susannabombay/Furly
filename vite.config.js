// Vite is the tool that runs Furly while you develop (`npm run dev`)
// and bundles it into plain HTML/CSS/JS for the internet (`npm run build`).
// The React plugin teaches Vite to understand JSX (the HTML-like syntax in our .jsx files).
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
