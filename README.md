# 🐾 Furly

A social pet app **for Singapore**. Pet owners sign in, set up a profile for each pet, and get:

- **Health**: breed, age, weight, microchip, vaccinations with due-date reminders, vet, allergies and medications.
- **Travel**: flight and daycare checklists that tick themselves off from the pet's profile, plus Singapore rules: AVS licensing (PALS), HDB pet rules, export and import licences, and quarantine.
- **Coming up** (Home): a 7-day strip (expandable to a full month calendar) and agenda combining event sign-ups, vaccine due dates and your own repeating reminders (e.g. monthly tick prevention), each addable to Apple, Outlook or Google Calendar.
- **Explore**: pet events at Singapore parks and dog runs (pets that like swimming see swim events first), pet-friendly food places (tap for opening hours, address and Google Maps), and daycare & boarding with a badge showing whether your pet already meets each place's requirements.
- **Settings**: your emergency vet and a backup person (one-tap call), Singapore's 24-hour vets and the AVS hotline, step-by-step first aid (heatstroke first), and a quick Q&A.

> **Current stage: local first.** Everything is saved in your browser only. There are no real accounts or server yet, and the events and places are sample data. A real backend comes next.

---

## Running it

You need [Node.js](https://nodejs.org) installed (you already have it).

```bash
npm install      # first time only: downloads React and Vite into node_modules/
npm run dev      # starts the app at http://localhost:5173
```

Leave `npm run dev` running while you work. Every time you save a file, the browser updates by itself. Press `Ctrl + C` in the terminal to stop it.

**To see it on your phone:** run `npm run dev -- --host`, then open the "Network" address it prints (e.g. `http://192.168.x.x:5173`) on a phone connected to the same Wi-Fi.

---

## How the project is organised

```
Furly/
├── index.html          The single HTML page. React draws the whole app inside it.
├── package.json        Project name, scripts (npm run dev/build) and dependencies.
├── vite.config.js      Settings for Vite, the tool that runs and builds the app.
└── src/
    ├── main.jsx        Starting point: plugs <App /> into index.html.
    ├── App.jsx         The brain: holds all data, sign-in flow, top bar & tab bar.
    ├── storage.js      Saves/loads data (browser storage now, a real database later).
    ├── content.js      All fixed text: events, places, daycare listings, requirements, rules, first aid, Q&A.
    ├── calendar.js     Date logic: the agenda, repeating reminders, "Add to calendar" files/links.
    ├── styles.css      The look: colours at the top, phone-first layout, animations.
    ├── components/
    │   ├── PetCard.jsx     The pet ID card that expands when tapped (Singpass-style)
    │   ├── Sheet.jsx       Shared slide-up popup (dimmed background, close on X / tap outside / Escape)
    │   ├── EventSheet.jsx  Event popup: who's going, confirm sign-up, ticket, cancel registration
    │   ├── PlaceSheet.jsx  Food place popup: open now, opening hours, address, Google Maps
    │   └── Agenda.jsx      "Coming up" on Home: week strip, month calendar, agenda list, add-reminder form
    └── pages/          One file per screen:
        ├── SignIn.jsx      Name + email to get started
        ├── Home.jsx        Dashboard: pet ID cards, quick actions, reminders, recommendations
        ├── Pets.jsx        "Health" tab: pet profile form (with photo), vaccinations, medical notes
        ├── Travel.jsx      Flight & daycare checklists, destination rules
        ├── Explore.jsx     Events (with sign-up), food places, daycare & boarding
        └── Settings.jsx    Emergency contacts, hotlines, first aid, Q&A, sign out
```

### How data flows

1. `App.jsx` owns all the saved data: `user`, `pets`, `signups` and `emergency`.
2. It passes the data down to each screen as **props**, e.g. `<Travel pet={pet} />`.
3. When a screen changes something (saving a pet, signing up for an event), it calls a function it was given, such as `onSave(pet)`. `App.jsx` updates the data.
4. `useStoredState` in `storage.js` automatically writes every change to the browser's storage, so it's still there after a refresh.

### Common edits

| I want to… | Edit |
| --- | --- |
| Add or change an event, food place, first-aid guide or Q&A | `src/content.js` |
| Add a new activity a pet can like | `ACTIVITIES` in `src/content.js` |
| Add a travel checklist item | `FLIGHT_CHECKLIST` / `DAYCARE_CHECKLIST` in `src/content.js` |
| Add a daycare/boarding listing | `CARE_PLACES` in `src/content.js` (`requires` uses ids from `REQUIREMENTS`) |
| Add a quick reminder preset | `REMINDER_PRESETS` in `src/calendar.js` |
| Change the colours | The variables at the top of `src/styles.css` (`--forest`, `--lime`, …) |
| Change an icon | Pick one at [lucide.dev/icons](https://lucide.dev/icons) and swap the import |
| Add a field to the pet profile | `EMPTY_PET` and `PetForm` in `src/pages/Pets.jsx` |
| Add a new tab | `TABS` in `src/App.jsx`, plus a new file in `src/pages/` |

---

## Saving your work to GitHub

```bash
git add .
git commit -m "Describe what you changed"
git push
```

---

## Roadmap

- [ ] Real accounts and a database (e.g. Supabase), so data syncs across devices
- [ ] Real events and food places based on the user's location
- [ ] Owners can create their own events and see who's going
- [ ] Pet photos
- [ ] Push notifications for reminders (needs the backend; until then, "Add to calendar" does the reminding)
- [ ] Real, verified daycare & boarding providers with in-app booking
- [ ] Find the nearest open emergency vet automatically

⚠️ Rules and phone numbers in `src/content.js` were checked against AVS (avs.nparks.gov.sg) and each clinic's website in October 2026. Re-check them before launch. Travel rules and first-aid content are general guidance only: always confirm with AVS, the airline and a vet.
