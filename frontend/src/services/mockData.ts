import type { CarDetail, CarFeatureGroup, CarImage, CarSummary } from '@/types';

const defaultFeatures: CarFeatureGroup[] = [
  { category: 'Sikkerhed', items: ['Adaptiv fartpilot', 'Automatisk nødbremsesystem', 'Isofix', 'Vejbaneassistent'] },
  { category: 'Komfort', items: ['Digitalt cockpit', '2-zoners klimaanlæg', 'Sædevarme for', 'Multifunktionslæderrat'] },
  { category: 'Infotainment', items: ['Apple CarPlay / Android Auto', 'Navigation', 'Bluetooth håndfri', 'DAB+ radio'] }
];

export const MOCK_CARS: CarDetail[] = [
  {
    id: 1,
    title: 'Volkswagen Golf 1.4 TSI R-Line DSG',
    slug: 'volkswagen-golf-1-4-tsi-r-line-dsg-2021',
    make: 'Volkswagen',
    model: 'Golf',
    variant: '1.4 TSI R-Line DSG 150HK',
    year: 2021,
    price: 189900,
    monthlyPayment: 2195,
    mileage: 58000,
    fuelType: 'Benzin',
    transmission: 'Automatisk',
    bodyType: 'Hatchback',
    color: 'Pure White',
    horsepower: 150,
    fuelConsumption: 18.2,
    fuelConsumptionKmPerL: 18.2,
    status: 'for_sale',
    isFeatured: true,
    isNew: true,
    badge: 'FREMHÆVET',
    hasWarranty: true,
    warrantyDetails: '12 måneders udvidet mekanisk garanti inkluderet',
    isPrepared: true,
    hasServiceHistory: true,
    isInspected: true,
    description: 'Utrolig velholdt VW Golf R-Line med alt det rigtige udstyr! Bilen fremstår nærmest som fabriksny og er passet med alle serviceeftersyn til punkt og prikke.\n\nUdstyret inkluderer adaptiv fartpilot, fuld digitalt cockpit, sportsæder i R-Line design, bakkamera, parkeringsassistent for og bag samt fuld LED-lygter.',
    createdAt: '2026-01-15T10:00:00Z',
    images: [
      { id: 1, filePath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', thumbnailPath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', webPPath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 },
      { id: 2, filePath: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', thumbnailPath: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', webPPath: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 2 }
    ],
    coverImage: {
      thumbnailPath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
      webPPath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
      altText: 'Volkswagen Golf 1.4 TSI R-Line DSG'
    },
    features: defaultFeatures,
    relatedCars: []
  },
  {
    id: 2,
    title: 'Audi A4 2.0 TDI Avant S-Line S-tronic',
    slug: 'audi-a4-2-0-tdi-avant-s-line-s-tronic-2020',
    make: 'Audi',
    model: 'A4',
    variant: '2.0 TDI Avant S-Line 190HK',
    year: 2020,
    price: 249900,
    monthlyPayment: 2795,
    mileage: 89000,
    fuelType: 'Diesel',
    transmission: 'Automatisk',
    bodyType: 'Stationcar',
    color: 'Mythossort Metallak',
    horsepower: 190,
    fuelConsumption: 21.3,
    fuelConsumptionKmPerL: 21.3,
    status: 'for_sale',
    isFeatured: true,
    isNew: false,
    badge: 'POPULÆR',
    hasWarranty: true,
    warrantyDetails: 'Mulighed for 24 mdr. CarGarantie',
    isPrepared: true,
    hasServiceHistory: true,
    isInspected: true,
    description: 'Komfortabel og luksuriøs Audi A4 Avant S-Line med den stærke og økonomiske 190 hk dieselmotor. Perfekt pendler- eller familiebil med fantastiske køreegenskaber.',
    createdAt: '2026-01-14T10:00:00Z',
    images: [
      { id: 3, filePath: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=1200&q=80', thumbnailPath: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=1200&q=80', webPPath: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 }
    ],
    coverImage: {
      thumbnailPath: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=1200&q=80',
      webPPath: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=1200&q=80',
      altText: 'Audi A4 2.0 TDI Avant S-Line S-tronic'
    },
    features: defaultFeatures,
    relatedCars: []
  },
  {
    id: 3,
    title: 'Mercedes-Benz C220d AMG Line Stationcar',
    slug: 'mercedes-benz-c220d-amg-line-2019',
    make: 'Mercedes-Benz',
    model: 'C220',
    variant: 'd 2.0 AMG Line 9G-Tronic 194HK',
    year: 2019,
    price: 269000,
    monthlyPayment: 2995,
    mileage: 104000,
    fuelType: 'Diesel',
    transmission: 'Automatisk',
    bodyType: 'Stationcar',
    color: 'Selenitgrå Metallak',
    horsepower: 194,
    fuelConsumption: 20.4,
    fuelConsumptionKmPerL: 20.4,
    status: 'for_sale',
    isFeatured: true,
    isNew: false,
    badge: 'LUKSUS',
    hasWarranty: true,
    isPrepared: true,
    hasServiceHistory: true,
    isInspected: true,
    description: 'En ægte perle af en Mercedes C-Klasse med fuld AMG Line pakke inde og ude! 9G-Tronic automatgear sikrer uovertruffen kørekomfort og lavt støjniveau.',
    createdAt: '2026-01-12T10:00:00Z',
    images: [
      { id: 5, filePath: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', thumbnailPath: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', webPPath: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 }
    ],
    coverImage: {
      thumbnailPath: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
      webPPath: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
      altText: 'Mercedes-Benz C220d AMG Line Stationcar'
    },
    features: defaultFeatures,
    relatedCars: []
  },
  {
    id: 4,
    title: 'BMW 320d 2.0 Touring M-Sport Steptronic',
    slug: 'bmw-320d-touring-m-sport-2021',
    make: 'BMW',
    model: '320d',
    variant: 'Touring M-Sport Steptronic 190HK',
    year: 2021,
    price: 295000,
    monthlyPayment: 3295,
    mileage: 65000,
    fuelType: 'Diesel',
    transmission: 'Automatisk',
    bodyType: 'Stationcar',
    color: 'Alpinweiss',
    horsepower: 190,
    fuelConsumption: 21.0,
    fuelConsumptionKmPerL: 21.0,
    status: 'for_sale',
    isFeatured: true,
    isNew: true,
    badge: 'NYHED',
    hasWarranty: true,
    isPrepared: true,
    hasServiceHistory: true,
    isInspected: true,
    description: 'Sporty og elegant BMW 320d Touring i den populære M-Sport udgave. Kører som en drøm og leverer ren køreglæde hver eneste kilometer.',
    createdAt: '2026-01-10T10:00:00Z',
    images: [
      { id: 6, filePath: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', thumbnailPath: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', webPPath: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 }
    ],
    coverImage: {
      thumbnailPath: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
      webPPath: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
      altText: 'BMW 320d 2.0 Touring M-Sport'
    },
    features: defaultFeatures,
    relatedCars: []
  },
  {
    id: 5,
    title: 'Peugeot 208 1.2 PureTech Allure Sky',
    slug: 'peugeot-208-1-2-puretech-allure-sky-2022',
    make: 'Peugeot',
    model: '208',
    variant: '1.2 PureTech Allure Sky 100HK EAT8',
    year: 2022,
    price: 144900,
    monthlyPayment: 1695,
    mileage: 34000,
    fuelType: 'Benzin',
    transmission: 'Automatisk',
    bodyType: 'Hatchback',
    color: 'Faro Gul',
    horsepower: 100,
    fuelConsumption: 22.7,
    fuelConsumptionKmPerL: 22.7,
    status: 'for_sale',
    isFeatured: true,
    isNew: false,
    badge: 'ØKONOMISK',
    hasWarranty: true,
    isPrepared: true,
    hasServiceHistory: true,
    isInspected: true,
    description: 'Super frisk og økonomisk Peugeot 208 med 8-trins automatgear og panoramaglastag! Lav ejerafgift og fantastisk brændstoføkonomi på næsten 23 km/l.',
    createdAt: '2026-01-08T10:00:00Z',
    images: [
      { id: 7, filePath: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', thumbnailPath: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', webPPath: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 }
    ],
    coverImage: {
      thumbnailPath: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      webPPath: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      altText: 'Peugeot 208 1.2 PureTech Allure Sky'
    },
    features: defaultFeatures,
    relatedCars: []
  },
  {
    id: 6,
    title: 'Toyota Yaris 1.5 Hybrid H3 Comfort',
    slug: 'toyota-yaris-1-5-hybrid-h3-comfort-2021',
    make: 'Toyota',
    model: 'Yaris',
    variant: '1.5 Hybrid H3 e-CVT 116HK',
    year: 2021,
    price: 159900,
    monthlyPayment: 1895,
    mileage: 42000,
    fuelType: 'Hybrid',
    transmission: 'Automatisk',
    bodyType: 'Hatchback',
    color: 'Shuriken Grå',
    horsepower: 116,
    fuelConsumption: 26.3,
    fuelConsumptionKmPerL: 26.3,
    status: 'for_sale',
    isFeatured: true,
    isNew: false,
    badge: 'HYBRID',
    hasWarranty: true,
    isPrepared: true,
    hasServiceHistory: true,
    isInspected: true,
    description: 'Driftsikker og utrolig økonomisk Toyota Yaris Hybrid, der kører over 26 km/l! Oplader automatisk under kørsel og bremser, så du aldrig skal tænke på ladekabel.',
    createdAt: '2026-01-05T10:00:00Z',
    images: [
      { id: 8, filePath: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80', thumbnailPath: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80', webPPath: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 }
    ],
    coverImage: {
      thumbnailPath: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
      webPPath: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
      altText: 'Toyota Yaris 1.5 Hybrid H3 Comfort'
    },
    features: defaultFeatures,
    relatedCars: []
  }
];

export const MOCK_SERVICES = [
  { id: 1, slug: 'serviceeftersyn', title: 'Serviceeftersyn & Eftersyn', shortDescription: 'Fuldstændigt eftersyn efter bilens forskrifter, så du bevarer fabriksgarantien.', fromPrice: 'Fra 1.195 kr.', icon: 'Wrench' },
  { id: 2, slug: 'klargoering-til-syn', title: 'Klargøring til syn & Synstjek', shortDescription: 'Gennemgang af lygter, bremser, styretøj og udstødning.', fromPrice: 'Fra 495 kr.', icon: 'CheckCircle' },
  { id: 3, slug: 'bremseservice', title: 'Bremseservice & Bremseudskiftning', shortDescription: 'Kontrol, rensning og udskiftning af bremseskiver og bremseklodser.', fromPrice: 'Fra 795 kr.', icon: 'Shield' },
  { id: 4, slug: 'daekskifte-hjulskift', title: 'Dækskifte & Hjulskift', shortDescription: 'Skift mellem sommer- og vinterhjul, afbalancering og mulighed for dækhotel.', fromPrice: 'Fra 350 kr.', icon: 'Car' },
  { id: 5, slug: 'aircondition-klimaanlaeg', title: 'Aircondition & Klimaservice', shortDescription: 'Trykprøvning, påfyldning af kølemiddel og desinficering for et sundt indeklima.', fromPrice: 'Fra 895 kr.', icon: 'Clock' },
  { id: 6, slug: 'fejlfinding-diagnose', title: 'Fejlfinding & Computerdiagnose', shortDescription: 'Udlæsning af fejlkoder med avanceret testudstyr til alle bilmærker.', fromPrice: 'Fra 595 kr.', icon: 'Settings' },
  { id: 7, slug: 'olieskift-filterskift', title: 'Olieskift & Oliefilter', shortDescription: 'Hurtigt skift af motorolie og nyt kvalitetsfilter for optimal motorsmøring.', fromPrice: 'Fra 695 kr.', icon: 'Wrench' },
  { id: 8, slug: 'reparation-skader', title: 'Mekanisk reparation & Skader', shortDescription: 'Udbedring af mekaniske defekter, koblingsskift, tandrem og forsikringsskader.', fromPrice: 'Timepris 650 kr.', icon: 'Tool' }
];

export const MOCK_TESTIMONIALS = [
  { id: 1, authorName: 'Martin Lindegaard', authorTitle: 'Købte VW Golf', content: 'Fremragende oplevelse hos Autohus Kvik! Ærlig og reel rådgivning hele vejen igennem, og bilen blev leveret nyserviceret og skinnende ren.', rating: 5, isActive: true, sortOrder: 1 },
  { id: 2, authorName: 'Camilla & Søren', authorTitle: 'Byttede familiebilen', content: 'Vi fik en super fair byttepris for vores gamle bil og kørte derfra i en næsten ny Audi A4. Hurtig ekspedition og ingen bøvl med papirarbejdet.', rating: 5, isActive: true, sortOrder: 2 },
  { id: 3, authorName: 'Henrik Jørgensen', authorTitle: 'Fast værkstedskunde', content: 'Bruger deres værksted til både privatbilen og firmaets varevogn. Priserne holder altid det aftalte, og serviceniveauet er i top!', rating: 5, isActive: true, sortOrder: 3 }
];

export const MOCK_SETTINGS = {
  company_name: 'Autohus Kvik',
  company_cvr: '44047470',
  company_phone: '+45 50 29 08 74',
  company_emergency_phone: '+45 50 29 08 74',
  company_email: 'kontakt@autohusetkvik.dk',
  company_address: 'Gammel Køge Landevej 477, 2650 Hvidovre',
  opening_hours: '{"monday":"10:00 - 17:00","tuesday":"10:00 - 17:00","wednesday":"10:00 - 17:00","thursday":"10:00 - 17:00","friday":"10:00 - 16:00","saturday":"Lukket","sunday":"12:00 - 16:00"}',
  show_testimonials: 'true',
  google_rating_text: '4.9 ud af 5 baseret på glade bilkøbere i Hvidovre',
  seo_title_suffix: '| Autohus Kvik – Hvidovre',
  seo_default_description: 'Autohus Kvik i Hvidovre tilbyder salg af kvalitetsbiler, byttebiler, kontant bilkøb, attraktiv finansiering og eget autoriseret autoværksted.'
};
