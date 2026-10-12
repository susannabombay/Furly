// ─────────────────────────────────────────────────────────────────────────────
// content.js: all the fixed text and sample listings Furly shows
//
// Furly is Singapore-based: events, places, rules and emergency numbers are
// all for Singapore.
//
// Keeping content separate from screens means you can edit an event, a food
// place or an emergency tip here without touching any layout code.
// Later, events and places will come from a database instead of this file.
//
// ⚠️  Rules and phone numbers were checked in October 2026 against AVS
//     (avs.nparks.gov.sg) and each clinic's own website. They change, so
//     re-check them before launch, and always confirm with AVS, the
//     airline and a vet.
// ─────────────────────────────────────────────────────────────────────────────
// Icons come from lucide-react, a library of clean line icons.
// Each one is a React component, e.g. <Footprints size={24} />.
import {
  Footprints, Waves, Target, Mountain, Cat, GraduationCap,
  Coffee, UtensilsCrossed, Croissant, Soup,
  Building2, PlaneTakeoff, PlaneLanding, Plane,
  Thermometer, Pill, Wind, Bandage, Zap, PawPrint,
} from 'lucide-react'

// Activities a pet can "like". Shown as tappable chips on the pet form and
// used to recommend matching events.
export const ACTIVITIES = [
  'Walks', 'Running', 'Swimming', 'Fetch', 'Hiking', 'Agility',
  'Socialising', 'Cuddles', 'Training', 'Car rides', 'Beach', 'Puzzles',
]

// ── Social: events pets can sign up for ─────────────────────────────────────
// SAMPLE DATA: the venues are real Singapore parks, but the events and
// organisers are made up until real ones come from the database.
// `tags` are matched against a pet's liked activities to recommend events.
// `icon` + `color` draw the event's artwork (colours are defined in styles.css).
// Events are early morning or evening on purpose: Singapore's midday heat
// and hot pavements are hard on paws.
export const EVENTS = [
  {
    id: 'ev1', icon: Footprints, color: 'sage', title: 'Sunrise Pack Walk',
    date: '2026-10-17T07:30', place: 'Bishan-Ang Mo Kio Park (dog run)',
    tags: ['Walks', 'Socialising'], spots: 20,
    description: 'Easy 4 km loop along the river before it gets hot. All sizes welcome, leads required.',
  },
  {
    id: 'ev2', icon: Waves, color: 'sky', title: 'Doggy Splash Session',
    date: '2026-10-18T09:00', place: 'Dog swimming pool, Pasir Ris',
    tags: ['Swimming', 'Beach', 'Fetch'], spots: 15,
    description: 'Supervised swim with life jackets available. The best way to cool off in this weather!',
  },
  {
    id: 'ev3', icon: Target, color: 'lime', title: 'Beginner Agility Class',
    date: '2026-10-21T19:00', place: 'West Coast Park (dog run)',
    tags: ['Agility', 'Training', 'Running'], spots: 8,
    description: 'Tunnels, jumps and weave poles with a trainer, after sunset when it’s cooler.',
  },
  {
    id: 'ev4', icon: Mountain, color: 'sand', title: 'Southern Ridges Morning Hike',
    date: '2026-10-24T07:00', place: 'Henderson Waves, Southern Ridges',
    tags: ['Hiking', 'Walks', 'Running'], spots: 12,
    description: 'Shaded 6 km route with water stops. Fit adult dogs only, leashed throughout.',
  },
  {
    id: 'ev5', icon: Cat, color: 'lilac', title: 'Cat Owners’ Meet-up',
    date: '2026-10-25T15:00', place: 'Community club, Tampines',
    tags: ['Socialising', 'Cuddles', 'Puzzles'], spots: 10,
    description: 'Calm indoor meet-up for cats and their humans, with a talk on cat licensing. Carriers required.',
  },
  {
    id: 'ev6', icon: GraduationCap, color: 'blush', title: 'Puppy Manners Workshop',
    date: '2026-10-28T19:30', place: 'Sengkang Riverside Park (dog run)',
    tags: ['Training', 'Socialising'], spots: 10,
    description: 'Sit, stay, loose-lead walking, and lift and void-deck etiquette for HDB living.',
  },
]

// ── Pet-friendly food places ────────────────────────────────────────────────
// SAMPLE DATA: real neighbourhoods, made-up venue names.
export const FOOD_PLACES = [
  { id: 'fp1', icon: Coffee, color: 'sand', name: 'Kopi & Paws', type: 'Café',
    area: 'Tiong Bahru', perks: ['Water bowls', 'Pup cups', 'Alfresco seating'] },
  { id: 'fp2', icon: UtensilsCrossed, color: 'blush', name: 'The Barking Burger', type: 'Restaurant',
    area: 'Dempsey Hill', perks: ['Dog menu', 'Shaded garden', 'Fans outside'] },
  { id: 'fp3', icon: Croissant, color: 'lime', name: 'Paw & Crust Bakery', type: 'Bakery',
    area: 'Katong', perks: ['Fresh dog treats', 'Birthday pup-cakes'] },
  { id: 'fp4', icon: Soup, color: 'sky', name: 'Wag Bowl', type: 'Casual dining',
    area: 'Holland Village', perks: ['Air-conditioned pet area', 'Treat jar at the counter'] },
]

// ── Travel: checklists and regulations ──────────────────────────────────────
// Each checklist item has a `check` function. It looks at the pet's saved
// details and returns true/false, so Furly can tick items off automatically.
// Items without `check` are things the owner ticks manually.
export const FLIGHT_CHECKLIST = [
  { id: 'chip', label: 'Microchip (ISO 11784/11785) recorded',
    check: (pet) => Boolean(pet.microchip) },
  { id: 'rabies', label: 'Rabies vaccination up to date (most destinations require it)',
    check: (pet) => (pet.vaccinations || []).some(
      (v) => /rabies/i.test(v.name) && (!v.due || new Date(v.due) > new Date())) },
  { id: 'weight', label: 'Current weight recorded (sets the crate size and cargo fee)',
    check: (pet) => Boolean(pet.weight) },
  { id: 'export', label: 'AVS export licence via GoBusiness (apply within 90 days of departure, S$50)' },
  { id: 'cert', label: 'Vet health certificate endorsed by AVS (if the destination requires one)' },
  { id: 'crate', label: 'IATA-approved crate: pet can stand, turn around and lie down' },
  { id: 'booking', label: 'Pet booked as cargo with the airline or a pet relocation agent' },
  { id: 'rules', label: 'Destination country’s entry rules checked' },
  { id: 'pals', label: 'Dog licence cancelled on PALS once your dog has left (if moving away)' },
]

export const DAYCARE_CHECKLIST = [
  { id: 'core', label: 'Core vaccinations up to date (e.g. 5-in-1 for dogs, 3-in-1 for cats)',
    check: (pet) => (pet.vaccinations || []).length > 0 &&
      (pet.vaccinations || []).every((v) => !v.due || new Date(v.due) > new Date()) },
  { id: 'vet', label: 'Your vet’s name and phone number on file',
    check: (pet) => Boolean(pet.vetName && pet.vetPhone) },
  { id: 'meds', label: 'Medications and allergies written down',
    check: (pet) => Boolean(pet.medications || pet.allergies) },
  { id: 'licence', label: 'AVS pet licence (PALS) valid: most daycares ask for it' },
  { id: 'kennel', label: 'Kennel cough vaccine, required by most daycares and boarders' },
  { id: 'tick', label: 'Tick and flea prevention current (tick fever is common in Singapore)' },
  { id: 'temperament', label: 'Temperament assessment or trial day booked' },
]

// Short summaries with a link to the official source for each topic.
export const REGULATIONS = [
  {
    icon: Building2, region: 'Owning a pet in Singapore',
    points: [
      'Dogs over 3 months must be microchipped and licensed with AVS on PALS.',
      'Pet cats must also be microchipped and licensed on PALS.',
      'First-time licence applicants complete a free online pet ownership course.',
      'HDB flats: 1 dog from the HDB-approved breed list, and up to 2 cats.',
      'Some breeds are banned, e.g. Pit Bull types, Akita, Tosa and Dogo Argentino.',
    ],
    link: 'https://pals.avs.gov.sg',
  },
  {
    icon: PlaneTakeoff, region: 'Taking your pet out of Singapore',
    points: [
      'Get an AVS export licence on the GoBusiness Licensing Portal: S$50, issued about 2 working days after you submit everything, valid 90 days.',
      'If the destination needs a health certificate, get one from a licensed vet and have AVS endorse it.',
      'On the day, bring a copy of the export licence and the original health certificate to the airline’s ground handler.',
      'Check the destination’s own rules too. Some, like Australia, take months of preparation.',
    ],
    link: 'https://avs.nparks.gov.sg/pets/importing-exporting-a-pet/export/dogs-and-cats/',
  },
  {
    icon: PlaneLanding, region: 'Bringing a pet into Singapore',
    points: [
      'License the pet on PALS first, then get an AVS import licence before arrival (S$50, or S$100 express; valid 90 days).',
      'ISO microchip, core vaccinations, and pet at least 12 weeks old.',
      'Schedule I countries (Australia, NZ, Ireland, UK): no quarantine if all conditions are met.',
      'Schedule II (e.g. USA, Canada, Japan, Hong Kong, most of the EU): rabies vaccine and a blood test of at least 0.5 IU/ml; usually 10 days’ quarantine, waived in some cases.',
      'All other countries (Schedule III): at least 30 days’ quarantine at the Animal Quarantine Centre.',
    ],
    link: 'https://avs.nparks.gov.sg/pets/importing-exporting-a-pet/import/dogs-and-cats/',
  },
  {
    icon: Plane, region: 'Flying from Changi',
    points: [
      'Most airlines flying from Singapore don’t allow pets in the cabin. Pets travel in the hold as checked baggage or cargo, and some airlines don’t carry pets at all.',
      'Many airlines won’t carry snub-nosed breeds (pugs, French bulldogs, Persians) because of heat and breathing risks.',
      'Book early and use a pet relocation agent if you’re unsure: cargo space and paperwork take time.',
    ],
    link: null,
  },
]

// ── Emergency: first-aid guides ─────────────────────────────────────────────
export const EMERGENCY_GUIDES = [
  {
    icon: Thermometer, title: 'Heatstroke (most common in Singapore)',
    steps: [
      'Signs: heavy panting, drooling, bright red gums, wobbliness, collapse.',
      'Move to shade or air conditioning immediately.',
      'Cool with cool (not ice-cold) water, especially paws, belly and neck.',
      'Offer small sips of water and head to a vet, even if they seem better.',
      'Prevent it: walk before 8am or after 7pm, and test the pavement with your hand for 5 seconds.',
    ],
  },
  {
    icon: Pill, title: 'Ate something toxic',
    steps: [
      'Remove any remaining item and keep the packaging.',
      'Do NOT make your pet vomit unless a vet tells you to.',
      'Call a 24-hour vet right away (see the list above).',
      'Common toxins: chocolate, grapes/raisins, xylitol (sugar-free gum), onions, lilies (cats), ibuprofen/paracetamol.',
    ],
  },
  {
    icon: Wind, title: 'Choking',
    steps: [
      'Open the mouth and look. Remove the object only if you can see it and grab it easily.',
      'Small pets: hold them with head down and give firm back blows between the shoulders.',
      'Larger dogs: abdominal thrusts just behind the ribcage.',
      'Go to a vet straight away, even if the object comes out.',
    ],
  },
  {
    icon: Bandage, title: 'Bleeding',
    steps: [
      'Press a clean cloth or gauze firmly on the wound for at least 3 minutes.',
      'If blood soaks through, add more layers. Don’t remove the first one.',
      'Keep your pet calm and still, then go to a vet.',
    ],
  },
  {
    icon: Zap, title: 'Seizure',
    steps: [
      'Keep hands away from the mouth. Pets don’t swallow their tongue.',
      'Move furniture away and dim lights and noise.',
      'Time the seizure. Over 5 minutes, or several in a row, is an emergency.',
      'Keep them warm and quiet afterwards and call your vet.',
    ],
  },
  {
    icon: PawPrint, title: 'Found an injured or lost animal',
    steps: [
      'Keep a safe distance if the animal is scared: injured animals may bite.',
      'Call the AVS Animal Response Centre (24 hours): 1800 476 1600.',
      'If it has a collar or you can get it to a vet, a vet can scan for a microchip.',
    ],
  },
]

// 24-hour emergency vets in Singapore. Hours and phone numbers were checked
// on each clinic's own website (or SOSD's list) in October 2026.
export const HOTLINES = [
  { name: 'AVS Animal Response Centre (24h)', phone: '1800 476 1600',
    address: 'Lost, injured or abused animals' },
  { name: 'Veterinary Emergency & Specialty (VES) Hospital', phone: '6266 0232',
    address: '232 Whitley Road, S297824' },
  { name: 'Westside Emergency Vet', phone: '6931 0095',
    address: '86 Serangoon Garden Way, S555982' },
  { name: 'Advanced VetCare (Bedok)', phone: '6636 1788',
    address: '26 Jalan Pari Burong, S488692' },
  { name: 'Beecroft Animal Specialists & Emergency Hospital', phone: '6996 1812',
    address: '991E Alexandra Road, #01-27, S119973' },
  { name: 'Pet A&E, Landon Veterinary Specialists', phone: '6463 7228',
    address: '41 Eng Kong Terrace, S599013' },
]

// ── Quick Q&A ───────────────────────────────────────────────────────────────
export const FAQ = [
  { q: 'Can I keep a dog or cat in an HDB flat?',
    a: 'Yes: one dog from the HDB-approved breed list, and up to two cats. All of them must be microchipped and licensed on PALS.' },
  { q: 'When is it safe to walk my dog in Singapore’s heat?',
    a: 'Before 8am or after 7pm. Press the back of your hand on the pavement for 5 seconds: if it’s too hot for you, it’s too hot for paws. Bring water every time.' },
  { q: 'Which vaccinations does my pet need?',
    a: 'Dogs: core 5-in-1 (distemper, hepatitis, parvovirus, parainfluenza, leptospirosis), plus kennel cough for daycare. Cats: core 3-in-1. Your vet will set the boosters.' },
  { q: 'What is tick fever, and how do I prevent it?',
    a: 'A blood infection spread by ticks, common in Singapore dogs. Signs include tiredness, fever, pale gums and loss of appetite. Use monthly tick prevention and check your dog after walks.' },
  { q: 'What is a normal temperature for dogs and cats?',
    a: 'Roughly 38–39.2 °C. Above 39.7 °C, call your vet.' },
  { q: 'Can I give my pet human painkillers?',
    a: 'No. Ibuprofen, paracetamol and aspirin can be very dangerous to pets, especially cats. Only give medicine your vet prescribes.' },
  { q: 'Can my pet fly in the cabin with me?',
    a: 'Usually not from Singapore. Most airlines here carry pets as cargo. Plan early and consider a pet relocation agent.' },
]
