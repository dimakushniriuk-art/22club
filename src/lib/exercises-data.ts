/**
 * Lista completa di gruppi muscolari basata sulla classificazione professionale
 */
export const MUSCLE_GROUPS = [
  'Abduttori',
  'Adduttori',
  'Addominali',
  'Avambracci',
  'Bicipiti',
  'Braccia',
  'Cardio',
  'Deltoidi',
  'Dorsali',
  'Femorali',
  'Full Body',
  'Gambe',
  'Glutei',
  'Lombari',
  'Multipli',
  'Obliqui',
  'Petto',
  'Polpacci',
  'Quadricipiti',
  'Romboidi',
  'Schiena',
  'Spalle',
  'Tibiale',
  'Trapezio',
  'Tricipiti',
] as const

/**
 * Struttura attrezzi organizzata per categoria
 */
export const EQUIPMENT_BY_CATEGORY = {
  'Pesi liberi': [
    'Manubri',
    'Bilanciere Safety Squat',
    'Bilanciere olimpico 20kg',
    'Bilanciere olimpico 15kg',
    'Bilanciere EZ',
    'Bilanciere 10kg',
    'Bilanciere 13kg',
    'Trap bar',
    'Dischi',
  ],
  'Panche e supporti': [
    'Panca piana',
    'Panca inclinata',
    'Panca declinata',
    'Panca addominali',
    'Panca Scott',
    'Squat rack',
    'Power rack',
    'Multipower',
    'Hyperextension Bench',
  ],
  'Macchine isotoniche / guidate': [
    'Cavi',
    'Chest press',
    'Shoulder press',
    'Lat machine',
    'Pulley',
    'Seated row',
    'Pec fly',
    'Reverse fly',
    'Leg press 45°',
    'Hack squat',
    'Leg extension',
    'Leg curl',
    'Calf raise machine',
    'Glute machine',
    'Abductor',
    'Adductor',
    'Cable station',
    'Dip station',
    'Shoulder lateral raise machine',
    'Hip thrust',
    'Triceps machine',
    'Dip machine',
  ],
  'Attrezzature cardio': [
    'Tapis roulant',
    'Assoult runner',
    'Bike',
    'Assoult bike',
    'Stair climber',
    'Ellittica',
    'Vogatore',
    'Ski erg',
  ],
  'Funzionale & Cross training': [
    'Kettlebell',
    'Slam ball',
    'Wall ball',
    'Sandbag',
    'Battle rope',
    'Power sled',
    'Tire',
    'Plyo box / jump box',
  ],
  'Corpo libero, mobilità e stabilità': [
    'Tappetino',
    'Mini band',
    'Power band',
    'TRX / suspension trainer',
    'Fitball / Swiss ball',
    'Foam roller',
    'Bastone mobilità',
    'Balance board',
    'Cuscino propriocettivo',
    'Anello Pilates',
    'Yoga block',
    'Bosu',
  ],
  'Agilità, coordinazione e conditioning': [
    'Corda per saltare',
    'Scaletta agility',
    'Coni',
    'Reaction ball',
    'Sacco da boxe',
    'Punching ball',
    'Step',
  ],
  'Accessori per esercizi specifici': [
    'Cavigliere pesate',
    'Polsini pesati',
    'Cintura zavorra',
    'Maniglie pulley',
    'Corda tricipiti',
    'Barra trazioni',
    'Impugnature varie',
    'Ab wheel',
  ],
} as const

/**
 * Lista di tutte le categorie
 */
export const EQUIPMENT_CATEGORIES = Object.keys(EQUIPMENT_BY_CATEGORY) as Array<
  keyof typeof EQUIPMENT_BY_CATEGORY
>

/**
 * Lista completa di tutti gli attrezzi (per compatibilità con codice esistente)
 */
export const EQUIPMENT = Object.values(EQUIPMENT_BY_CATEGORY).flat() as readonly string[]
