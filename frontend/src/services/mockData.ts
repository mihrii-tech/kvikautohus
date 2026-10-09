import type { CarDetail } from '@/types';
import realCars from './realCars.json';

// Rigtige biler fra Autohus Kvik (eksporteret fra databasen / DBA-annoncer).
// Billederne ligger i /public/uploads/cars/<slug>/
export const MOCK_CARS: CarDetail[] = realCars as unknown as CarDetail[];

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
