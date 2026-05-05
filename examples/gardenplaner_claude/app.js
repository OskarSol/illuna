'use strict';

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════

const MONTHS = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
];

const TASK_TYPES = {
  sow:       { label: 'Aussäen',     icon: '🌱', color: '#40916c', bg: '#d8f3dc' },
  plant:     { label: 'Pflanzen',    icon: '🌿', color: '#2d6a4f', bg: '#b7e4c7' },
  harvest:   { label: 'Ernten',      icon: '🧺', color: '#d97706', bg: '#fef3c7' },
  water:     { label: 'Gießen',      icon: '💧', color: '#0284c7', bg: '#e0f2fe' },
  fertilize: { label: 'Düngen',      icon: '💚', color: '#4d7c0f', bg: '#ecfccb' },
  prune:     { label: 'Schneiden',   icon: '✂️', color: '#92400e', bg: '#fef9c3' },
  mow:       { label: 'Rasenmähen',  icon: '🌾', color: '#15803d', bg: '#dcfce7' },
  care:      { label: 'Pflege',      icon: '🔧', color: '#475569', bg: '#f1f5f9' },
  reminder:  { label: 'Erinnerung',  icon: '🔔', color: '#b45309', bg: '#fffbeb' },
};

const CATEGORIES = {
  'gemüse':    { label: 'Gemüse',    icon: '🥬', color: '#16a34a' },
  'kräuter':   { label: 'Kräuter',   icon: '🌿', color: '#15803d' },
  'obst':      { label: 'Obst',      icon: '🍓', color: '#dc2626' },
  'blumen':    { label: 'Blumen',    icon: '🌸', color: '#db2777' },
  'sträucher': { label: 'Sträucher', icon: '🫐', color: '#7c3aed' },
  'bäume':     { label: 'Bäume',     icon: '🌳', color: '#166534' },
  'sonstiges': { label: 'Sonstiges', icon: '🌱', color: '#64748b' },
};

const WATER_NEEDS = {
  gering: { label: 'Gering',  icon: '💧' },
  mittel: { label: 'Mittel',  icon: '💧💧' },
  hoch:   { label: 'Hoch',    icon: '💧💧💧' },
};

const LOCATIONS = {
  sonne:        { label: 'Sonne',        icon: '☀️' },
  halbschatten: { label: 'Halbschatten', icon: '⛅' },
  schatten:     { label: 'Schatten',     icon: '🌑' },
  kübel:        { label: 'Kübel',        icon: '🪴' },
};

const GARDEN_ICONS = [
  '🌿','🌱','🌾','🌻','🌹','🍀','🌲','🌳',
  '🏡','🥕','🍅','🌸','🌺','🌼','🍃','🪴',
  '🫐','🌵','🍄','🦋','🐝','🌈','☀️','🌿',
];

// ═══════════════════════════════════════════
//  PLANT KNOWLEDGE BASE
// ═══════════════════════════════════════════

const PLANT_DB = {
  'Tomate': {
    icon: '🍅', category: 'gemüse', water: 'hoch', location: 'sonne',
    tasks: [
      { month:  2, title: 'Tomaten aussäen (indoor, 20–22 °C)', type: 'sow' },
      { month:  3, title: 'Tomatensetzlinge pikieren', type: 'care' },
      { month:  5, title: 'Tomaten auspflanzen (nach den Eisheiligen, ab 15. Mai)', type: 'plant' },
      { month:  6, title: 'Tomaten ausgeizen & Stützen setzen', type: 'care' },
      { month:  7, title: 'Tomaten regelmäßig gießen & kaliumreich düngen', type: 'fertilize' },
      { month:  8, title: 'Tomatenernte – Hochsaison', type: 'harvest' },
      { month:  9, title: 'Letzte Tomaten ernten, vor Frost schützen', type: 'harvest' },
    ],
    tip: 'Tomaten brauchen einen windgeschützten, warmen Platz. Regelmäßiges Ausgeizen (Seitentriebe entfernen) fördert den Ertrag. Nie über die Blätter gießen – fördert Krautfäule!',
  },
  'Gurke': {
    icon: '🥒', category: 'gemüse', water: 'hoch', location: 'sonne',
    tasks: [
      { month:  4, title: 'Gurken aussäen (indoor, 22–25 °C)', type: 'sow' },
      { month:  5, title: 'Gurken auspflanzen (nach den Eisheiligen)', type: 'plant' },
      { month:  6, title: 'Gurkennetz / Klettergerüst aufstellen', type: 'care' },
      { month:  7, title: 'Gurken täglich gießen & frühzeitig ernten', type: 'harvest' },
      { month:  8, title: 'Gurkenernte Hochsaison – nicht überreifen lassen', type: 'harvest' },
    ],
    tip: 'Gurken lieben Wärme und gleichmäßige Feuchtigkeit. Regelmäßige Ernte fördert den Ertrag. Vergilbte Blätter sofort entfernen.',
  },
  'Zucchini': {
    icon: '🥬', category: 'gemüse', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  4, title: 'Zucchini aussäen (indoor)', type: 'sow' },
      { month:  5, title: 'Zucchini auspflanzen (viel Platz einplanen!)', type: 'plant' },
      { month:  6, title: 'Zucchini ernten (15–20 cm, jung schmeckt besser)', type: 'harvest' },
      { month:  7, title: 'Zucchini-Hochsaison – täglich kontrollieren', type: 'harvest' },
      { month:  8, title: 'Zucchini weiter ernten', type: 'harvest' },
    ],
    tip: 'Zucchini früh ernten (15–20 cm) – zu groß gewordene Früchte schmecken fade und hemmen neue Blüten.',
  },
  'Karotte': {
    icon: '🥕', category: 'gemüse', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  3, title: 'Karotten direkt aussäen (Frühbeet möglich)', type: 'sow' },
      { month:  4, title: 'Karotten vereinzeln (5–8 cm Abstand)', type: 'care' },
      { month:  5, title: 'Zweite Karottensaat für Herbsternte', type: 'sow' },
      { month:  7, title: 'Frühe Karotten ernten', type: 'harvest' },
      { month:  8, title: 'Karotten ernten', type: 'harvest' },
      { month: 10, title: 'Späte Karotten ernten und kühl einlagern', type: 'harvest' },
    ],
    tip: 'Karotten mögen lockeren, tiefen, steinfreien Boden. Gute Nachbarn: Zwiebeln und Lauch – sie schrecken die Möhrenfliege ab.',
  },
  'Salat': {
    icon: '🥗', category: 'gemüse', water: 'mittel', location: 'halbschatten',
    tasks: [
      { month:  3, title: 'Salat aussäen (Frühbeet oder Indoor)', type: 'sow' },
      { month:  4, title: 'Salat ins Freie pflanzen', type: 'plant' },
      { month:  5, title: 'Salat ernten (vor dem Schossen!)', type: 'harvest' },
      { month:  8, title: 'Herbstsalat aussäen', type: 'sow' },
      { month:  9, title: 'Herbstsalat ernten', type: 'harvest' },
    ],
    tip: 'Salat bolzt (schießt) bei Hitze und langen Tagen. Im Sommer schattigere Lage wählen oder hitzetolerante Sorten (z.B. Batavia) verwenden.',
  },
  'Spinat': {
    icon: '🥬', category: 'gemüse', water: 'mittel', location: 'halbschatten',
    tasks: [
      { month:  3, title: 'Frühjahrsspinats aussäen', type: 'sow' },
      { month:  4, title: 'Spinat ernten (vor Wärme)', type: 'harvest' },
      { month:  8, title: 'Herbstspinats aussäen', type: 'sow' },
      { month:  9, title: 'Herbstspinats ernten', type: 'harvest' },
      { month: 10, title: 'Späten Spinat ernten – verträgt leichten Frost', type: 'harvest' },
    ],
    tip: 'Spinat ist schnell: von der Saat zur Ernte in 6–8 Wochen. Schießt bei Wärme schnell – Frühjahr und Herbst sind die besten Zeiten.',
  },
  'Kürbis': {
    icon: '🎃', category: 'gemüse', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  4, title: 'Kürbis aussäen (indoor, warm)', type: 'sow' },
      { month:  5, title: 'Kürbis auspflanzen (viel Platz!)', type: 'plant' },
      { month:  9, title: 'Kürbis ernten (vor dem ersten Frost)', type: 'harvest' },
      { month: 10, title: 'Kürbis einlagern (kühl, trocken)', type: 'care' },
    ],
    tip: 'Kürbis braucht viel Platz (2–3 m²) und nährstoffreichen Boden. Direkt auf dem Komposthaufen pflanzen – er liebt Nährstoffe!',
  },
  'Bohnen': {
    icon: '🫘', category: 'gemüse', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  5, title: 'Bohnen direkt säen (erst ab 12 °C Bodentemperatur)', type: 'sow' },
      { month:  6, title: 'Bohnen: Stangenbohnen aufleiten', type: 'care' },
      { month:  7, title: 'Bohnen ernten (jung = zarter)', type: 'harvest' },
      { month:  8, title: 'Bohnen weiter ernten', type: 'harvest' },
    ],
    tip: 'Bohnen bereichern den Boden mit Stickstoff – ideal als Vorkultur für Blattgemüse. Nicht zu früh säen (Kältempfindlich).',
  },
  'Erdbeere': {
    icon: '🍓', category: 'obst', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  3, title: 'Erdbeerpflanzen setzen oder teilen', type: 'plant' },
      { month:  4, title: 'Erdbeeren düngen (Kaliumbetonter Dünger)', type: 'fertilize' },
      { month:  5, title: 'Stroh unter Erdbeerpflanzen legen', type: 'care' },
      { month:  6, title: 'Erdbeeren ernten! 🍓', type: 'harvest' },
      { month:  7, title: 'Ausläufer für neue Pflanzen einwurzeln lassen', type: 'care' },
      { month:  8, title: 'Neue Erdbeerpflanzen aus Ausläufern setzen', type: 'plant' },
    ],
    tip: 'Erdbeerpflanzen nach 3–4 Jahren durch Jungpflanzen aus Ausläufern ersetzen. Stroh hält Früchte sauber und feucht.',
  },
  'Himbeere': {
    icon: '🍇', category: 'obst', water: 'mittel', location: 'halbschatten',
    tasks: [
      { month:  2, title: 'Himbeere: alte Ruten zurückschneiden', type: 'prune' },
      { month:  3, title: 'Himbeere düngen', type: 'fertilize' },
      { month:  7, title: 'Himbeeren ernten', type: 'harvest' },
      { month:  8, title: 'Herbsthimbeeren ernten', type: 'harvest' },
      { month: 10, title: 'Fruchttragende Ruten nach Ernte abschneiden', type: 'prune' },
    ],
    tip: 'Himbeeren tragen nur an vorjährigen Trieben (außer Herbstsorten). Die abgeerneten Ruten werden nach der Ernte ganz abgeschnitten.',
  },
  'Basilikum': {
    icon: '🌿', category: 'kräuter', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  3, title: 'Basilikum aussäen (indoor, 20–22 °C)', type: 'sow' },
      { month:  5, title: 'Basilikum auspflanzen (sehr wärmeliebend!)', type: 'plant' },
      { month:  6, title: 'Basilikum regelmäßig entspitzen (Blüten entfernen)', type: 'care' },
      { month:  7, title: 'Basilikum ernten und ggf. trocknen', type: 'harvest' },
      { month:  9, title: 'Basilikum vor Frost reinholen oder Samen sammeln', type: 'care' },
    ],
    tip: 'Basilikum nie kalt gießen und keine Temperaturen unter 12 °C. Blüten regelmäßig entfernen für mehr Blattmasse. Nicht neben Fenchel pflanzen.',
  },
  'Petersilie': {
    icon: '🌿', category: 'kräuter', water: 'mittel', location: 'halbschatten',
    tasks: [
      { month:  3, title: 'Petersilie aussäen (Keimzeit 3–4 Wochen)', type: 'sow' },
      { month:  5, title: 'Petersilie vereinzeln und pflegen', type: 'care' },
      { month:  6, title: 'Petersilie ernten (von außen nach innen)', type: 'harvest' },
      { month: 10, title: 'Zweijährige Petersilie überwintern', type: 'care' },
    ],
    tip: 'Petersilie keimt sehr langsam – 2–3 Wochen Geduld! Vorquellen des Saatguts in lauwarmem Wasser beschleunigt die Keimung.',
  },
  'Schnittlauch': {
    icon: '🌿', category: 'kräuter', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  3, title: 'Schnittlauch aussäen oder Horste teilen', type: 'sow' },
      { month:  4, title: 'Schnittlauch düngen', type: 'fertilize' },
      { month:  5, title: 'Schnittlauch ernten', type: 'harvest' },
      { month:  9, title: 'Schnittlauch auf 5 cm zurückschneiden', type: 'prune' },
    ],
    tip: 'Schnittlauch ist robust, mehrjährig und pflegeleicht. Horste alle 3–4 Jahre teilen und neu pflanzen.',
  },
  'Rosmarin': {
    icon: '🌿', category: 'kräuter', water: 'gering', location: 'sonne',
    tasks: [
      { month:  4, title: 'Rosmarin nach der Blüte leicht schneiden', type: 'prune' },
      { month:  5, title: 'Kübel-Rosmarin nach draußen stellen', type: 'plant' },
      { month: 10, title: 'Rosmarin (Kübel) frostfrei überwintern', type: 'care' },
    ],
    tip: 'Rosmarin mag es trocken und sonnig – nie staunass. Im Kübel einfacher zu kultivieren und zu überwintern.',
  },
  'Minze': {
    icon: '🌿', category: 'kräuter', water: 'mittel', location: 'halbschatten',
    tasks: [
      { month:  3, title: 'Minze teilen oder stecken', type: 'plant' },
      { month:  5, title: 'Minze: Ausbreitung begrenzen (Topf im Beet)', type: 'care' },
      { month:  6, title: 'Minze ernten und trocknen', type: 'harvest' },
      { month:  9, title: 'Minze zurückschneiden', type: 'prune' },
    ],
    tip: 'Minze breitet sich aggressiv aus. In einem eingesenkten Topf pflanzen, um das Wuchern zu begrenzen.',
  },
  'Thymian': {
    icon: '🌿', category: 'kräuter', water: 'gering', location: 'sonne',
    tasks: [
      { month:  4, title: 'Thymian teilen oder stecken', type: 'plant' },
      { month:  6, title: 'Thymian ernten (vor der Blüte aromatischsten)', type: 'harvest' },
      { month:  8, title: 'Thymian nach Blüte zurückschneiden', type: 'prune' },
    ],
    tip: 'Thymian liebt trockene, kalkhaltige Böden. Wenig gießen – verträgt Trockenheit gut.',
  },
  'Tulpe': {
    icon: '🌷', category: 'blumen', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  4, title: 'Tulpen blühen – genießen!', type: 'care' },
      { month:  5, title: 'Tulpenblätter natürlich einziehen lassen (nicht abschneiden!)', type: 'care' },
      { month: 10, title: 'Tulpenzwiebeln pflanzen (15–20 cm tief)', type: 'plant' },
      { month: 11, title: 'Tulpenzwiebeln pflanzen (letzter Termin)', type: 'plant' },
    ],
    tip: 'Tulpenzwiebeln tief pflanzen (15–20 cm). Blätter nach der Blüte nicht abschneiden – sie speichern Energie für die nächste Saison.',
  },
  'Rose': {
    icon: '🌹', category: 'blumen', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  3, title: 'Rosen zurückschneiden (Frühjahrsschnitt)', type: 'prune' },
      { month:  4, title: 'Rosen düngen & Erde auflockern', type: 'fertilize' },
      { month:  5, title: 'Rosen auf Schädlinge & Pilzkrankheiten kontrollieren', type: 'care' },
      { month:  6, title: 'Verblühte Rosenblüten entfernen (Remontierschnitt)', type: 'care' },
      { month:  7, title: 'Rosen im Sommer düngen', type: 'fertilize' },
      { month: 10, title: 'Rosen für Winter vorbereiten (anhäufeln)', type: 'care' },
      { month: 11, title: 'Rosen mit Fichtenreisig oder Vlies schützen', type: 'care' },
    ],
    tip: 'Rosen am Morgen gießen, nie über die Blätter. Regelmäßiger Remontierschnitt fördert Nachblüte. Rosen mögen Gesellschaft von Lavendel.',
  },
  'Sonnenblume': {
    icon: '🌻', category: 'blumen', water: 'gering', location: 'sonne',
    tasks: [
      { month:  4, title: 'Sonnenblumen aussäen (indoor oder direkt)', type: 'sow' },
      { month:  5, title: 'Sonnenblumen auspflanzen', type: 'plant' },
      { month:  8, title: 'Sonnenblumen blühen', type: 'care' },
      { month:  9, title: 'Sonnenblumenkerne ernten (wenn Rückseite gelb/braun)', type: 'harvest' },
    ],
    tip: 'Sonnenblumen mögen tiefgründigen Boden und viel Sonne. Hohe Sorten (>1,5 m) abstützen. Kerne im Herbst für Vögel hängen lassen.',
  },
  'Lavendel': {
    icon: '💜', category: 'blumen', water: 'gering', location: 'sonne',
    tasks: [
      { month:  3, title: 'Lavendel teilen oder Stecklinge nehmen', type: 'plant' },
      { month:  7, title: 'Lavendel nach der Blüte zurückschneiden (ins alte Holz)', type: 'prune' },
      { month:  9, title: 'Lavendel leicht schneiden für kompakten Wuchs', type: 'prune' },
    ],
    tip: 'Lavendel liebt Trockenheit, Sonne und kalkigen Boden. Nach der Blüte immer schneiden – sonst verholzt er und blüht weniger.',
  },
  'Ringelblume': {
    icon: '🌼', category: 'blumen', water: 'gering', location: 'sonne',
    tasks: [
      { month:  3, title: 'Ringelblumen aussäen (direkt oder indoor)', type: 'sow' },
      { month:  5, title: 'Ringelblumen auspflanzen', type: 'plant' },
      { month:  6, title: 'Ringelblumen blühen – Schädlinge abwehren', type: 'care' },
      { month:  9, title: 'Ringelblumensamen ernten für nächstes Jahr', type: 'harvest' },
    ],
    tip: 'Ringelblumen sind natürliche Schädlingsabwehrer. Neben Tomaten gepflanzt, halten sie Weiße Fliege und Nematoden fern.',
  },
  'Heidelbeere': {
    icon: '🫐', category: 'sträucher', water: 'mittel', location: 'halbschatten',
    tasks: [
      { month:  3, title: 'Heidelbeere düngen (Rhododendron-Dünger, sauer)', type: 'fertilize' },
      { month:  4, title: 'Heidelbeere mulchen (saures Milieu erhalten)', type: 'care' },
      { month:  7, title: 'Heidelbeeren ernten', type: 'harvest' },
      { month:  8, title: 'Heidelbeerernte Hochsaison', type: 'harvest' },
      { month: 10, title: 'Heidelbeere für Winter mulchen', type: 'care' },
    ],
    tip: 'Heidelbeeren brauchen sauren Boden (pH 4–5). Rhododendronerde verwenden. Vögel mit einem Netz fernhalten – die lieben Heidelbeeren auch!',
  },
  'Johannisbeere': {
    icon: '🍇', category: 'sträucher', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  2, title: 'Johannisbeere zurückschneiden (Winterschnitt)', type: 'prune' },
      { month:  3, title: 'Johannisbeere düngen', type: 'fertilize' },
      { month:  7, title: 'Johannisbeeren ernten', type: 'harvest' },
    ],
    tip: 'Johannisbeeren tragen am 2- und 3-jährigen Holz am besten. Altes Holz (>3 Jahre) beim Winterschnitt entfernen.',
  },
  'Stachelbeere': {
    icon: '🍈', category: 'sträucher', water: 'mittel', location: 'sonne',
    tasks: [
      { month:  2, title: 'Stachelbeere zurückschneiden', type: 'prune' },
      { month:  3, title: 'Stachelbeere düngen', type: 'fertilize' },
      { month:  6, title: 'Stachelbeeren früh ernten (für Kompott)', type: 'harvest' },
      { month:  7, title: 'Reife Stachelbeeren ernten', type: 'harvest' },
    ],
    tip: 'Stachelbeere mag luftige, sonnige Standorte – Mehltau ist das größte Problem. Gut auslichten für Luftzirkulation.',
  },
};

// Category fallback tasks (for plants not in PLANT_DB)
const CATEGORY_TASKS = {
  'gemüse': [
    { month:  2, title: 'Gemüse-Saatgut sichten & nachbestellen', type: 'care' },
    { month:  3, title: 'Gemüsebeete vorbereiten & Kompost einarbeiten', type: 'fertilize' },
    { month:  4, title: 'Gemüsebeet umgraben & ersten Aussaaten starten', type: 'sow' },
    { month:  5, title: 'Gemüse nach den Eisheiligen auspflanzen', type: 'plant' },
    { month:  9, title: 'Herbstgemüse aussäen (Feldsalat, Spinat)', type: 'sow' },
  ],
  'kräuter': [
    { month:  3, title: 'Kräuter aussäen (indoor) oder kaufen', type: 'sow' },
    { month:  5, title: 'Kräuter auspflanzen', type: 'plant' },
    { month:  7, title: 'Kräuter ernten & trocknen', type: 'harvest' },
    { month: 10, title: 'Einjährige Kräuter entfernen, mehrjährige schützen', type: 'care' },
  ],
  'obst': [
    { month:  2, title: 'Obstgehölze zurückschneiden (Winterschnitt)', type: 'prune' },
    { month:  3, title: 'Obstgehölze düngen', type: 'fertilize' },
    { month:  5, title: 'Früchte ausdünnen für bessere Qualität', type: 'care' },
    { month:  8, title: 'Frühobst ernten', type: 'harvest' },
    { month:  9, title: 'Haupternte & Einlagerung', type: 'harvest' },
  ],
  'blumen': [
    { month:  3, title: 'Stauden teilen und neu pflanzen', type: 'plant' },
    { month:  4, title: 'Sommerblumen aussäen (indoor)', type: 'sow' },
    { month:  5, title: 'Sommerblumen auspflanzen', type: 'plant' },
    { month: 10, title: 'Zwiebeln für Frühjahrsblüher pflanzen', type: 'plant' },
  ],
  'sträucher': [
    { month:  2, title: 'Sträucher winterschneiden', type: 'prune' },
    { month:  3, title: 'Sträucher düngen', type: 'fertilize' },
    { month:  8, title: 'Beerenobst ernten', type: 'harvest' },
  ],
  'bäume': [
    { month:  2, title: 'Obstbäume schneiden (Winterschnitt)', type: 'prune' },
    { month:  3, title: 'Bäume düngen', type: 'fertilize' },
    { month:  8, title: 'Frühobst ernten', type: 'harvest' },
    { month:  9, title: 'Haupternte & Einlagerung', type: 'harvest' },
  ],
  'sonstiges': [],
};

// General tasks always shown
const GENERAL_TASKS = [
  { month:  1, title: 'Saatkalender planen, Saatgut & Kataloge sichten', type: 'care' },
  { month:  1, title: 'Gartenwerkzeug reinigen, schärfen & ölen', type: 'care' },
  { month:  2, title: 'Garten auf Winterschäden kontrollieren', type: 'care' },
  { month:  3, title: 'Boden auflockern & Unkraut entfernen', type: 'care' },
  { month:  3, title: 'Kompost auf Beete auftragen & einarbeiten', type: 'fertilize' },
  { month:  4, title: 'Schädlingskontrolle starten (Blattläuse, Schnecken)', type: 'care' },
  { month:  5, title: 'Eisheiligen (11.–15. Mai) abwarten vor dem Auspflanzen', type: 'plant' },
  { month:  6, title: 'Regelmäßig wässern bei Trockenheit', type: 'water' },
  { month:  7, title: 'Beregnung & Mulchen bei sommerlicher Hitze', type: 'water' },
  { month:  8, title: 'Ernte verarbeiten: einfrieren, einkochen, trocknen', type: 'harvest' },
  { month:  9, title: 'Herbstdüngung vorbereiten', type: 'fertilize' },
  { month: 10, title: 'Frostempfindliche Pflanzen in Sicherheit bringen', type: 'care' },
  { month: 11, title: 'Gartenpflanzen einwintern & schützen', type: 'care' },
  { month: 11, title: 'Bewässerungsanlage / Wasserleitungen entleeren', type: 'care' },
  { month: 12, title: 'Gartenjahr Revue passieren & nächstes Jahr planen', type: 'care' },
];

// Lawn tasks shown when garden has lawn
const LAWN_TASKS = [
  { month:  3, title: 'Rasen: Winterschäden begutachten, Erde auflockern', type: 'care' },
  { month:  4, title: 'Rasen: Erster Schnitt der Saison (5–7 cm Schnitthöhe)', type: 'mow' },
  { month:  4, title: 'Rasen: Frühjahrsdüngung (Stickstoffbetont)', type: 'fertilize' },
  { month:  4, title: 'Rasen: Vertikutieren & kahle Stellen nachsäen', type: 'care' },
  { month:  5, title: 'Rasen: Regelmäßig mähen (alle 1–2 Wochen)', type: 'mow' },
  { month:  6, title: 'Rasen: Bei Trockenheit früh morgens wässern', type: 'water' },
  { month:  7, title: 'Rasen: Schnitthöhe bei Hitze erhöhen (6–8 cm)', type: 'mow' },
  { month:  8, title: 'Rasen: Sommerdüngung (Kaliumbetonter Dünger)', type: 'fertilize' },
  { month:  9, title: 'Rasen: Vertikutieren & nachsäen', type: 'care' },
  { month:  9, title: 'Rasen: Herbstdüngung', type: 'fertilize' },
  { month: 10, title: 'Rasen: Letzter Schnitt der Saison', type: 'mow' },
  { month: 10, title: 'Rasen: Laub sofort entfernen (verhindert Kahlstellen)', type: 'care' },
  { month: 11, title: 'Rasen: Bei Frost nicht betreten', type: 'care' },
];

// Tips knowledge base
const TIPS_DB = {
  frühling: {
    title: 'Frühling (März–Mai)',
    icon: '🌸',
    tips: [
      'Boden erst bearbeiten, wenn er nicht mehr gefroren ist und beim Zusammendrücken nicht klebt – sonst verdichtet er.',
      'Eisheiligen (11.–15. Mai) beachten: Erst danach frostempfindliche Pflanzen (Tomaten, Paprika, Basilikum) ins Freie.',
      'Kompost jetzt auftragen und einarbeiten – ideal für die Nährstoffversorgung der gesamten Saison.',
      'Nützlinge fördern: Insektenhotel aufstellen, eine Wildkräuterecke anlegen, auf chemische Mittel verzichten.',
      'Frühbeete nutzen für Vorsprung: Salat, Radieschen, Spinat, Karotten – 4–6 Wochen früher als draußen.',
    ],
  },
  sommer: {
    title: 'Sommer (Juni–August)',
    icon: '☀️',
    tips: [
      'Morgens oder abends gießen – nie mittags, da das Wasser sonst sofort verdunstet und Verbrennungen entstehen.',
      'Mulchen hält Feuchtigkeit im Boden und reduziert Unkrautwachstum. Rindenmulch oder Stroh eignen sich gut.',
      'Regelmäßige Ernte fördert den Ertrag: Zucchini, Bohnen und Gurken täglich prüfen – unreife Früchte stimulieren neue Blüten.',
      'Rankpflanzen täglich kontrollieren: Tomaten ausgeizen, Gurken hochbinden, Bohnen aufrankeln lassen.',
      'Hitzestress: Pflanzenwurzeln mit Mulch schützen, frisch gepflanzte Setzlinge mit Schatten abschirmen.',
    ],
  },
  herbst: {
    title: 'Herbst (September–November)',
    icon: '🍂',
    tips: [
      'Ernte richtig einlagern: Keller für Kartoffeln und Möhren, Äpfel GETRENNT von anderen Früchten lagern (geben Reifegas ab).',
      'Beete mit Kompost oder Mulch abdecken – schützt den Boden und hält Würmer und Mikroorganismen aktiv.',
      'Zwiebeln für Frühjahrsblüher jetzt pflanzen: Tulpen, Narzissen, Hyazinthen – je nach Sorte 10–20 cm tief.',
      'Frostempfindliche Kübelpflanzen (Rosmarin, Lorbeer, Pelargonien) rechtzeitig reinholen, bevor Frost einsetzt.',
      'Laub nicht wegwerfen: Als Mulch zwischen Stauden nutzen oder zu wertvollem Laubkompost verarbeiten.',
    ],
  },
  winter: {
    title: 'Winter (Dezember–Februar)',
    icon: '❄️',
    tips: [
      'Gartenkataloge studieren und Saatgut für das nächste Jahr bestellen – beliebte Sorten sind früh ausverkauft.',
      'Werkzeug reinigen, schärfen (Hacken, Schaufeln) und mit Leinöl einreiben – verlängert die Lebensdauer.',
      'Frostschutz kontrollieren: Kübelpflanzen im Keller bei 5–10 °C überwintern, gelegentlich leicht angießen.',
      'Vögel im Winter mit Fett-Futter unterstützen – sie danken es mit Schädlingsbekämpfung im Sommer.',
      'Schnee von Ästen schütteln, bevor er abbricht – besonders bei immergrünen Sträuchern und Hecken.',
    ],
  },
  wasser: {
    title: 'Bewässerung',
    icon: '💧',
    tips: [
      'Tröpfchenbewässerung spart bis zu 50 % Wasser gegenüber Rasensprengern und reduziert Pilzkrankheiten.',
      'Regenwasser sammeln – kostenlos, kalkfrei und angewärmt: Pflanzen lieben es mehr als kaltes Leitungswasser.',
      'Tief gießen, aber seltener: Das fördert tiefes Wurzelwachstum und erhöht die Trockenheitstoleranz.',
      'Kübelpflanzen täglich prüfen – sie trocknen viel schneller aus als Beet-Pflanzen.',
      'Mulch aus Stroh oder Rindenmulch hält Feuchtigkeit bis zu 3× länger im Boden.',
    ],
  },
  boden: {
    title: 'Bodengesundheit',
    icon: '🌱',
    tips: [
      'Regenwürmer sind die besten Bodenverbesserer – niemals vertreiben, chemische Mittel meiden.',
      'Gründüngung (Phacelia, Senf, Klee) zwischen zwei Kulturen lockert den Boden und spart Stickstoff.',
      'Boden-pH messen: Die meisten Gemüse mögen pH 6–7. Saure Böden mit Kalk korrigieren.',
      'Frischen Mist nie direkt auf Beete – mindestens 6 Monate kompostieren. Sonst verbrennt er die Wurzeln.',
      'Mischkultur nutzen: Karotten + Zwiebeln, Tomaten + Basilikum, Bohnen + Sommersavory schützen sich gegenseitig.',
    ],
  },
};

// ═══════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════

const DEFAULT_GARDEN = {
  title: 'Mein Garten',
  icon: '🌿',
  location: '',
  soil: 'Gemischt',
  hasLawn: true,
  description: '',
};

let state = {
  garden: { ...DEFAULT_GARDEN },
  plants: [],
  reminders: [],
};

function loadState() {
  try {
    const saved = localStorage.getItem('gartenplaner_claude_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    }
  } catch (e) {
    console.error('Fehler beim Laden:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem('gartenplaner_claude_v1', JSON.stringify(state));
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
  }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ═══════════════════════════════════════════
//  TASK GENERATION
// ═══════════════════════════════════════════

function getAutoTasksForMonth(month) {
  const tasks = [];

  // General tasks
  GENERAL_TASKS
    .filter(t => t.month === month)
    .forEach(t => tasks.push({ ...t, source: 'allgemein', plantName: null }));

  // Lawn tasks
  if (state.garden.hasLawn) {
    LAWN_TASKS
      .filter(t => t.month === month)
      .forEach(t => tasks.push({ ...t, source: 'rasen', plantName: 'Rasen' }));
  }

  // Per-plant tasks
  const addedCategories = new Set();
  state.plants.forEach(plant => {
    const dbEntry = PLANT_DB[plant.name];
    if (dbEntry) {
      dbEntry.tasks
        .filter(t => t.month === month)
        .forEach(t => tasks.push({
          ...t,
          source: 'pflanze',
          plantName: plant.name,
          plantIcon: plant.icon || dbEntry.icon,
        }));
    } else {
      // Category fallback – only once per category
      const catKey = plant.category || 'sonstiges';
      if (!addedCategories.has(catKey)) {
        const catTasks = CATEGORY_TASKS[catKey] || [];
        catTasks.filter(t => t.month === month).forEach(t => tasks.push({
          ...t,
          source: 'kategorie',
          plantName: CATEGORIES[catKey]?.label || catKey,
          plantIcon: CATEGORIES[catKey]?.icon,
        }));
        addedCategories.add(catKey);
      }
    }
  });

  // Deduplicate by title
  const seen = new Set();
  return tasks.filter(t => {
    if (seen.has(t.title)) return false;
    seen.add(t.title);
    return true;
  });
}

function getAllTasksForMonth(month) {
  const auto = getAutoTasksForMonth(month);
  const custom = state.reminders
    .filter(r => r.month === month)
    .map(r => ({ ...r, type: r.type || 'reminder', source: 'custom' }));
  return [...auto, ...custom];
}

// ═══════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════

let currentView = 'garten';

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.toggle('active', section.id === `view-${view}`);
  });
  renderCurrentView();
}

function renderCurrentView() {
  switch (currentView) {
    case 'garten':   renderGartenView();   break;
    case 'pflanzen': renderPflanzenView(); break;
    case 'planer':   renderPlanerView();   break;
    case 'tipps':    renderTippsView();    break;
  }
  updateHeader();
}

function updateHeader() {
  document.getElementById('header-icon').textContent = state.garden.icon || '🌿';
  document.getElementById('header-title').textContent = state.garden.title || 'Mein Garten';
  document.getElementById('header-location').textContent = state.garden.location || '';
  const now = new Date();
  document.getElementById('current-month-badge').textContent =
    MONTHS[now.getMonth()] + ' ' + now.getFullYear();
}

// ── Garden View ──

function renderGartenView() {
  const g = state.garden;
  document.getElementById('garden-title-input').value = g.title || '';
  document.getElementById('garden-icon-display').textContent = g.icon || '🌿';
  document.getElementById('garden-location-input').value = g.location || '';
  document.getElementById('garden-soil-select').value = g.soil || 'Gemischt';
  document.getElementById('garden-lawn-toggle').checked = !!g.hasLawn;
  document.getElementById('garden-desc-input').value = g.description || '';
  updateLawnLabel();
}

function updateLawnLabel() {
  const has = document.getElementById('garden-lawn-toggle').checked;
  document.getElementById('lawn-label').textContent = has ? 'Ja ✓' : 'Nein';
}

function saveGarden() {
  state.garden = {
    title:       document.getElementById('garden-title-input').value.trim() || 'Mein Garten',
    icon:        document.getElementById('garden-icon-display').textContent,
    location:    document.getElementById('garden-location-input').value.trim(),
    soil:        document.getElementById('garden-soil-select').value,
    hasLawn:     document.getElementById('garden-lawn-toggle').checked,
    description: document.getElementById('garden-desc-input').value.trim(),
  };
  saveState();
  updateHeader();

  const btn = document.getElementById('save-garden-btn');
  const orig = btn.textContent;
  btn.textContent = '✓ Gespeichert!';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2000);
}

// ── Plants View ──

function renderPflanzenView() {
  const container = document.getElementById('plants-list');
  const filterCat = document.getElementById('plants-filter-cat').value;

  let plants = state.plants;
  if (filterCat !== 'alle') plants = plants.filter(p => p.category === filterCat);

  if (plants.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌱</div>
        <p>Noch keine Pflanzen hinzugefügt.</p>
        <p class="empty-sub">Klicke auf „+ Pflanze", um loszulegen.</p>
      </div>`;
    return;
  }

  container.innerHTML = plants.map(plant => {
    const cat   = CATEGORIES[plant.category] || CATEGORIES['sonstiges'];
    const water = WATER_NEEDS[plant.water]   || WATER_NEEDS.mittel;
    const loc   = LOCATIONS[plant.location]  || LOCATIONS.sonne;
    const hasDbEntry = !!PLANT_DB[plant.name];

    return `
      <div class="plant-card">
        <div class="plant-icon">${esc(plant.icon || cat.icon)}</div>
        <div class="plant-info">
          <div class="plant-name">${esc(plant.name)}</div>
          <div class="plant-badges">
            <span class="badge" style="background:${cat.color}20;color:${cat.color}">${cat.icon} ${cat.label}</span>
            <span class="badge" style="background:#e0f2fe;color:#0284c7">${water.icon} ${water.label}</span>
            <span class="badge" style="background:#f1f5f9;color:#475569">${loc.icon} ${loc.label}</span>
          </div>
          ${plant.notes ? `<div class="plant-notes">${esc(plant.notes)}</div>` : ''}
          ${hasDbEntry ? `<div class="plant-tip-hint">💡 Pflegetipps & Monatsaufgaben verfügbar</div>` : ''}
        </div>
        <div class="plant-actions">
          <button class="icon-btn" onclick="openPlantModal('${plant.id}')" title="Bearbeiten">✏️</button>
          <button class="icon-btn danger" onclick="deletePlant('${plant.id}')" title="Löschen">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

// ── Planer View ──

function renderPlanerView() {
  const container = document.getElementById('planer-months');
  const currentMonthNum = new Date().getMonth() + 1;

  container.innerHTML = MONTHS.map((monthName, idx) => {
    const monthNum = idx + 1;
    const tasks = getAllTasksForMonth(monthNum);
    const isCurrent = monthNum === currentMonthNum;

    const preview = tasks.slice(0, 2).map(t => {
      const tt = TASK_TYPES[t.type] || TASK_TYPES.care;
      const label = t.title.length > 32 ? t.title.slice(0, 32) + '…' : t.title;
      return `<div class="task-preview" style="background:${tt.bg}">
        <span class="task-icon">${tt.icon}</span>
        <span>${esc(label)}</span>
      </div>`;
    }).join('');

    return `
      <div class="month-card${isCurrent ? ' current-month' : ''}" onclick="openMonthModal(${monthNum})">
        <div class="month-header">
          <span class="month-name">${monthName}</span>
          ${isCurrent ? '<span class="now-badge">Jetzt</span>' : ''}
          <span class="month-badge">${tasks.length}</span>
        </div>
        ${tasks.length > 0
          ? `<div class="task-previews">${preview}</div>
             ${tasks.length > 2 ? `<div class="more-tasks">+${tasks.length - 2} weitere</div>` : ''}`
          : '<div class="no-tasks">Keine Aufgaben</div>'
        }
      </div>`;
  }).join('');
}

// ── Tipps View ──

function renderTippsView() {
  const container = document.getElementById('tipps-container');

  const plantTips = state.plants
    .filter(p => PLANT_DB[p.name]?.tip)
    .map(p => ({
      title: `${p.icon || PLANT_DB[p.name].icon} ${p.name}`,
      tip:   PLANT_DB[p.name].tip,
    }));

  let html = '';

  if (plantTips.length > 0) {
    html += `<div class="tips-section">
      <h3>🌱 Tipps zu deinen Pflanzen</h3>
      ${plantTips.map(pt => `
        <div class="tip-card">
          <div class="tip-title">${pt.title}</div>
          <div class="tip-text">${esc(pt.tip)}</div>
        </div>`).join('')}
    </div>`;
  }

  Object.values(TIPS_DB).forEach(section => {
    html += `<div class="tips-section">
      <h3>${section.icon} ${section.title}</h3>
      ${section.tips.map(tip => `
        <div class="tip-card">
          <div class="tip-text">${esc(tip)}</div>
        </div>`).join('')}
    </div>`;
  });

  container.innerHTML = html;
}

// ═══════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════

let editingPlantId = null;
let activeMonthModal = null;

// ── Plant Modal ──

function openPlantModal(plantId = null) {
  editingPlantId = plantId;
  const form = document.getElementById('plant-form');
  form.reset();
  document.getElementById('pf-icon').value = '';
  document.getElementById('plant-icon-preview').textContent = '🌱';
  document.getElementById('plant-modal-title').textContent = plantId ? 'Pflanze bearbeiten' : 'Neue Pflanze';
  document.getElementById('plant-suggestions').classList.remove('open');

  if (plantId) {
    const p = state.plants.find(x => x.id === plantId);
    if (p) {
      document.getElementById('pf-name').value         = p.name     || '';
      document.getElementById('pf-icon').value         = p.icon     || '';
      document.getElementById('plant-icon-preview').textContent = p.icon || CATEGORIES[p.category]?.icon || '🌱';
      document.getElementById('pf-category').value     = p.category || 'gemüse';
      document.getElementById('pf-water').value        = p.water    || 'mittel';
      document.getElementById('pf-location').value     = p.location || 'sonne';
      document.getElementById('pf-notes').value        = p.notes    || '';
    }
  }

  document.getElementById('modal-plant').classList.add('open');
  document.getElementById('pf-name').focus();
}

function closePlantModal() {
  document.getElementById('modal-plant').classList.remove('open');
  editingPlantId = null;
}

function savePlant() {
  const name = document.getElementById('pf-name').value.trim();
  if (!name) { document.getElementById('pf-name').focus(); return; }

  const category  = document.getElementById('pf-category').value;
  const iconInput = document.getElementById('pf-icon').value.trim();
  const dbEntry   = PLANT_DB[name];
  const icon      = iconInput || dbEntry?.icon || CATEGORIES[category]?.icon || '🌱';

  const plant = {
    id:       editingPlantId || genId(),
    name,
    icon,
    category,
    water:    document.getElementById('pf-water').value,
    location: document.getElementById('pf-location').value,
    notes:    document.getElementById('pf-notes').value.trim(),
  };

  if (editingPlantId) {
    const idx = state.plants.findIndex(p => p.id === editingPlantId);
    if (idx > -1) state.plants[idx] = plant;
  } else {
    state.plants.push(plant);
  }

  saveState();
  closePlantModal();
  renderPflanzenView();
  if (currentView === 'planer') renderPlanerView();
}

function deletePlant(id) {
  if (!confirm('Pflanze wirklich löschen?')) return;
  state.plants = state.plants.filter(p => p.id !== id);
  saveState();
  renderPflanzenView();
  if (currentView === 'planer') renderPlanerView();
}

// ── Reminder Modal ──

function openReminderModal(month = null) {
  document.getElementById('reminder-form').reset();
  if (month) document.getElementById('rm-month').value = month;
  document.getElementById('modal-reminder').classList.add('open');
  document.getElementById('rm-title').focus();
}

function closeReminderModal() {
  document.getElementById('modal-reminder').classList.remove('open');
}

function saveReminder() {
  const title = document.getElementById('rm-title').value.trim();
  const month = parseInt(document.getElementById('rm-month').value, 10);
  if (!title || !month) return;

  state.reminders.push({
    id:          genId(),
    month,
    title,
    description: document.getElementById('rm-desc').value.trim(),
    type:        document.getElementById('rm-type').value,
  });

  saveState();
  closeReminderModal();
  if (currentView === 'planer') renderPlanerView();
  if (activeMonthModal === month) openMonthModal(month);
}

function deleteReminder(id) {
  const reminder = state.reminders.find(r => r.id === id);
  state.reminders = state.reminders.filter(r => r.id !== id);
  saveState();
  const prevMonth = reminder?.month;
  if (activeMonthModal) openMonthModal(activeMonthModal);
  if (currentView === 'planer') renderPlanerView();
}

// ── Month Modal ──

function openMonthModal(month) {
  activeMonthModal = month;
  const tasks = getAllTasksForMonth(month);

  document.getElementById('month-modal-title').textContent = MONTHS[month - 1];

  const auto   = tasks.filter(t => t.source !== 'custom');
  const custom = tasks.filter(t => t.source === 'custom');

  let html = '';

  if (auto.length > 0) {
    html += `<div class="month-task-group">
      <div class="task-group-label">Automatische Aufgaben (${auto.length})</div>
      ${auto.map(t => renderTaskItem(t, false)).join('')}
    </div>`;
  }

  if (custom.length > 0) {
    html += `<div class="month-task-group">
      <div class="task-group-label">Meine Erinnerungen (${custom.length})</div>
      ${custom.map(t => renderTaskItem(t, true)).join('')}
    </div>`;
  }

  if (tasks.length === 0) {
    html = `<div class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Keine Aufgaben für diesen Monat.</p>
      <p class="empty-sub">Füge Pflanzen hinzu oder erstelle eine eigene Erinnerung.</p>
    </div>`;
  }

  document.getElementById('month-tasks-list').innerHTML = html;
  document.getElementById('modal-month').classList.add('open');
}

function renderTaskItem(task, canDelete) {
  const tt = TASK_TYPES[task.type] || TASK_TYPES.care;
  const deleteBtn = canDelete
    ? `<button class="icon-btn danger small" onclick="deleteReminder('${task.id}')" title="Löschen">🗑️</button>`
    : '';
  const plantBadge = task.plantName
    ? `<span class="task-plant-badge">${task.plantIcon || ''} ${esc(task.plantName)}</span>`
    : '';

  return `
    <div class="task-item" style="border-left:3px solid ${tt.color};background:${tt.bg}">
      <div class="task-item-header">
        <span class="task-type-badge" style="background:${tt.color}20;color:${tt.color}">${tt.icon} ${tt.label}</span>
        ${plantBadge}
        ${deleteBtn}
      </div>
      <div class="task-title">${esc(task.title)}</div>
      ${task.description ? `<div class="task-desc">${esc(task.description)}</div>` : ''}
    </div>`;
}

function closeMonthModal() {
  document.getElementById('modal-month').classList.remove('open');
  activeMonthModal = null;
}

// ── Icon Picker ──

let iconPickerTarget = 'garden';

function openIconPicker(target) {
  iconPickerTarget = target;
  document.getElementById('icon-picker').classList.add('open');
}

function closeIconPicker() {
  document.getElementById('icon-picker').classList.remove('open');
}

function selectIcon(icon) {
  if (iconPickerTarget === 'garden') {
    document.getElementById('garden-icon-display').textContent = icon;
  } else if (iconPickerTarget === 'plant') {
    document.getElementById('plant-icon-preview').textContent = icon;
    document.getElementById('pf-icon').value = icon;
  }
  closeIconPicker();
}

// ── Plant Name Autocomplete ──

function onPlantNameInput() {
  const input = document.getElementById('pf-name').value.trim();
  const suggestions = document.getElementById('plant-suggestions');

  if (input.length < 1) {
    suggestions.classList.remove('open');
    suggestions.innerHTML = '';
    return;
  }

  const matches = Object.keys(PLANT_DB)
    .filter(name => name.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 7);

  if (matches.length === 0) {
    suggestions.classList.remove('open');
    return;
  }

  suggestions.innerHTML = matches.map(name => {
    const db = PLANT_DB[name];
    return `<div class="suggestion-item" onclick="selectPlantSuggestion('${name.replace(/'/g, "\\'")}')">${db.icon} ${esc(name)}</div>`;
  }).join('');
  suggestions.classList.add('open');
}

function selectPlantSuggestion(name) {
  const db = PLANT_DB[name];
  if (!db) return;
  document.getElementById('pf-name').value                    = name;
  document.getElementById('pf-icon').value                    = db.icon;
  document.getElementById('plant-icon-preview').textContent   = db.icon;
  document.getElementById('pf-category').value                = db.category;
  document.getElementById('pf-water').value                   = db.water;
  document.getElementById('pf-location').value                = db.location;
  document.getElementById('plant-suggestions').classList.remove('open');
}

// ═══════════════════════════════════════════
//  UTIL
// ═══════════════════════════════════════════

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════

function init() {
  loadState();

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        if (overlay.id === 'modal-month') activeMonthModal = null;
      }
    });
  });

  // Garden
  document.getElementById('save-garden-btn').addEventListener('click', saveGarden);
  document.getElementById('garden-lawn-toggle').addEventListener('change', updateLawnLabel);
  document.getElementById('garden-icon-btn').addEventListener('click', () => openIconPicker('garden'));

  // Plants
  document.getElementById('add-plant-btn').addEventListener('click', () => openPlantModal());
  document.getElementById('plant-modal-close').addEventListener('click', closePlantModal);
  document.getElementById('plant-save-btn').addEventListener('click', savePlant);
  document.getElementById('plant-cancel-btn').addEventListener('click', closePlantModal);
  document.getElementById('plants-filter-cat').addEventListener('change', renderPflanzenView);
  document.getElementById('pf-name').addEventListener('input', onPlantNameInput);
  document.getElementById('pf-icon-btn').addEventListener('click', () => openIconPicker('plant'));
  document.getElementById('pf-icon').addEventListener('input', () => {
    const v = document.getElementById('pf-icon').value;
    if (v) document.getElementById('plant-icon-preview').textContent = v;
  });

  // Close autocomplete on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#pf-name') && !e.target.closest('#plant-suggestions')) {
      document.getElementById('plant-suggestions').classList.remove('open');
    }
  });

  // Reminders
  document.getElementById('add-reminder-btn').addEventListener('click', () => {
    const m = new Date().getMonth() + 1;
    openReminderModal(m);
  });
  document.getElementById('reminder-modal-close').addEventListener('click', closeReminderModal);
  document.getElementById('reminder-save-btn').addEventListener('click', saveReminder);
  document.getElementById('reminder-cancel-btn').addEventListener('click', closeReminderModal);

  // Month modal
  document.getElementById('month-modal-close').addEventListener('click', closeMonthModal);
  document.getElementById('month-close-btn').addEventListener('click', closeMonthModal);
  document.getElementById('month-add-reminder-btn').addEventListener('click', () => {
    const m = activeMonthModal;
    closeMonthModal();
    openReminderModal(m);
  });

  // Icon picker
  document.getElementById('icon-picker-close').addEventListener('click', closeIconPicker);
  const pickerGrid = document.getElementById('icon-picker-grid');
  pickerGrid.innerHTML = GARDEN_ICONS.map(icon =>
    `<button class="icon-option" onclick="selectIcon('${icon}')" type="button">${icon}</button>`
  ).join('');

  // Initial render
  switchView('garten');
}

document.addEventListener('DOMContentLoaded', init);
