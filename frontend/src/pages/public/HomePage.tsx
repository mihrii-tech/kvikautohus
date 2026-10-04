import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  Car, Wrench, Phone, MapPin, Clock, ShieldCheck, CheckCircle2,
  AlertCircle, ArrowRight, Shield, Star, Award, Cog
} from 'lucide-react';
import { carsService, contentService } from '@/services';
import { useSettings } from '@/contexts/SettingsContext';
import CarCard from '@/components/cars/CarCard';
import WorkshopBookingFlow from '@/components/forms/WorkshopBookingFlow';
import './HomePage.css';

const WORKSHOP_SERVICES = [
  {
    id: 'serviceeftersyn',
    title: 'Serviceeftersyn',
    desc: 'Komplet eftersyn efter fabrikantens forskrifter. Fabriksgarantien bevares altid.',
    icon: <Wrench size={26} />,
    slug: 'serviceeftersyn',
  },
  {
    id: 'reparation',
    title: 'Reparation & udbedring',
    desc: 'Mekaniske reparationer af bremser, kobling, tandrem, ophæng og udstødning.',
    icon: <Cog size={26} />,
    slug: 'reparation-fejlfinding',
  },
  {
    id: 'syn',
    title: 'Synstjek & klargøring',
    desc: 'Grundig gennemgang forud for bilsyn, så du undgår omsyn og ekstra gebyrer.',
    icon: <CheckCircle2 size={26} />,
    slug: 'synstjek',
  },
  {
    id: 'daek',
    title: 'Dækskifte & hjulskift',
    desc: 'Skift mellem sommer- og vinterhjul, professionel afbalancering og dæktjek.',
    icon: <Car size={26} />,
    slug: 'daekskifte',
  },
  {
    id: 'fejlfinding',
    title: 'Fejlsøgning & diagnose',
    desc: 'Avanceret computertest og udlæsning af fejlkoder for hurtig lokalisering af problemer.',
    icon: <ShieldCheck size={26} />,
    slug: 'reparation-fejlfinding',
  },
  {
    id: 'aircondition',
    title: 'Aircondition & klima',
    desc: 'Trykprøvning, påfyldning af kølemiddel og antibakteriel rensning.',
    icon: <Award size={26} />,
    slug: 'serviceeftersyn',
  },
];

export default function HomePage() {
  const { settings } = useSettings();
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<string>('Serviceeftersyn');
  const heroRef = useRef<HTMLDivElement>(null);

  // Udvalgte biler (kort sektion, kun 3 biler, INGEN prisfiltre på forsiden)
  const { data: featuredCarsData, isLoading: carsLoading } = useQuery({
    queryKey: ['featured-cars-home'],
    queryFn: () => carsService.getCars({ pageSize: 3, sort: 'newest' }),
  });

  const displayedCars = featuredCarsData?.cars?.slice(0, 3) ?? [];

  // Vælg service og scroll blødt til booking boks
  const handleSelectServiceAndScroll = (serviceTitle: string) => {
    setSelectedServiceForBooking(serviceTitle);
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const titleSuffix = settings.seo_title_suffix ?? '| Autohus Kvik – Hvidovre';
  const description = settings.seo_default_description ?? 'Book værkstedstid online hos Autohus Kvik i Hvidovre. Indtast nummerplade, vælg service og få hurtig betjening.';

  const companyPhone = settings.company_phone ?? '+45 50 29 08 74';
  const cleanPhone = companyPhone.replace(/\s/g, '');

  return (
    <div className="home-page-light">
      <Helmet>
        <title>Autohus Kvik – Værksted & Bilsalg i Hvidovre {titleSuffix}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content="Autohus Kvik – Book værkstedstid online" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      {/* ═══════════════════════════════════════════════
          1. HERO MED BOOKING + NUMMERPLADE (LYS & REN)
          ═══════════════════════════════════════════════ */}
      <section className="hero-light-section" ref={heroRef} aria-label="Book værkstedstid">
        <div className="container">
          <div className="hero-light-grid">
            
            {/* Tekst og Hovedbudskab */}
            <div className="hero-light-intro">
              <div className="hero-pill-badge">
                <span className="pill-pulse" />
                <span>Autoværksted i Hvidovre</span>
              </div>

              <h1 className="hero-main-title">
                Book værkstedstid <br />
                <span className="text-accent">på få sekunder</span>
              </h1>

              <p className="hero-main-subtitle">
                Indtast nummerpladen, vælg service og send din booking. Vi kontakter dig hurtigt.
              </p>

              {/* Fordele / Tryghedspunkter */}
              <div className="hero-highlights-list">
                <div className="hero-highlight-item">
                  <div className="highlight-icon"><ShieldCheck size={20} /></div>
                  <div>
                    <strong>Autoriseret ekspertise</strong>
                    <span>Alle bilmærker serviceres efter forskrifterne</span>
                  </div>
                </div>
                <div className="hero-highlight-item">
                  <div className="highlight-icon"><Clock size={20} /></div>
                  <div>
                    <strong>Hurtig bekræftelse</strong>
                    <span>Vi vender tilbage med tid hurtigst muligt</span>
                  </div>
                </div>
                <div className="hero-highlight-item">
                  <div className="highlight-icon"><Award size={20} /></div>
                  <div>
                    <strong>Fabriksgarantien bevares</strong>
                    <span>Kvalitetsreservedele & professionelt stempel</span>
                  </div>
                </div>
              </div>

              {/* Hurtig opkald CTA */}
              <div className="hero-direct-call-bar">
                <span className="call-prompt">Har du en akut opgave?</span>
                <a href={`tel:${cleanPhone}`} className="hero-phone-link">
                  <Phone size={18} />
                  <span>Ring direkte: <strong>{companyPhone}</strong></span>
                </a>
              </div>
            </div>

            {/* Booking & Nummerplade Boks (Kommer først på mobil!) */}
            <div className="hero-booking-column">
              <WorkshopBookingFlow initialService={selectedServiceForBooking} />
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. HURTIGE VÆRKSTEDSYDELSER
          ═══════════════════════════════════════════════ */}
      <section className="section-services-light" aria-labelledby="services-title">
        <div className="container">
          <div className="section-head-center">
            <span className="section-tag">Vores ydelser</span>
            <h2 id="services-title" className="section-title-dark">Hurtige værkstedsydelser</h2>
            <p className="section-subtitle-neutral">
              Vi klarer alt fra almindeligt serviceeftersyn og dækskifte til avanceret fejlsøgning og mekaniske reparationer.
            </p>
          </div>

          <div className="services-cards-grid">
            {WORKSHOP_SERVICES.map((srv) => (
              <div key={srv.id} className="service-feature-card">
                <div className="service-card-icon-wrap">
                  {srv.icon}
                </div>
                <h3 className="service-card-heading">{srv.title}</h3>
                <p className="service-card-text">{srv.desc}</p>
                <div className="service-card-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-accent-outline"
                    onClick={() => handleSelectServiceAndScroll(srv.title)}
                  >
                    Vælg opgave &amp; book
                  </button>
                  <Link to={`/vaerksted/${srv.slug}`} className="service-more-link">
                    Læs mere →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="services-bottom-cta">
            <Link to="/vaerksted" className="btn btn-secondary btn-lg">
              <Wrench size={18} />
              Se alle værkstedsydelser
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. HVORFOR VÆLGE AUTOHUS KVIK
          ═══════════════════════════════════════════════ */}
      <section className="section-why-us" aria-labelledby="why-title">
        <div className="container">
          <div className="section-head-center">
            <span className="section-tag">Glade kunder fra start til slut</span>
            <h2 id="why-title" className="section-title-dark">Det tilbyder Autohuset Kvik</h2>
            <p className="section-subtitle-neutral">
              Hos Autohuset Kvik har vi et stort udvalg af gode brugte biler og står klar til at hjælpe med at finde den bil, der passer til netop dit behov.
            </p>
          </div>

          <div className="why-us-grid">
            <div className="why-us-card">
              <div className="why-icon-box"><CheckCircle2 size={28} /></div>
              <h3 className="why-title">Konkurrencedygtige priser</h3>
              <p className="why-text">
                Vi har faste, gennemskuelige og fair priser på alle vores nysynede og klargjorte brugtbiler.
              </p>
            </div>

            <div className="why-us-card">
              <div className="why-icon-box"><ShieldCheck size={28} /></div>
              <h3 className="why-title">God pris for din brugte bil</h3>
              <p className="why-text">
                Vi tager alle biler i bytte uanset mærke, model og stand. Kontakt os for et uforpligtende byttetilbud.
              </p>
            </div>

            <div className="why-us-card">
              <div className="why-icon-box"><Clock size={28} /></div>
              <h3 className="why-title">Attraktiv forsikring &amp; finansiering</h3>
              <p className="why-text">
                Skræddersyede finansieringsløsninger med eller uden udbetaling samt tryg bilforsikring.
              </p>
            </div>

            <div className="why-us-card">
              <div className="why-icon-box"><Wrench size={28} /></div>
              <h3 className="why-title">Ekstraordinær service</h3>
              <p className="why-text">
                Vores eget værksted i Hvidovre sikrer, at din bil løbende serviceres og holdes topkørende.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. BRUGTE BILER (KORT SEKTION, IKKE HOVEDFOKUS)
          ═══════════════════════════════════════════════ */}
      <section className="section-cars-compact" aria-labelledby="cars-compact-title">
        <div className="container">
          <div className="cars-compact-header">
            <div>
              <span className="section-tag">Biler til salg</span>
              <h2 id="cars-compact-title" className="section-title-dark">Udvalgte biler på lager</h2>
              <p className="section-subtitle-neutral">
                Alle vores salgsbiler er klargjorte og gennemgåede på vores eget værksted.
              </p>
            </div>
            <Link to="/biler" className="btn btn-secondary">
              Se alle biler <ArrowRight size={16} />
            </Link>
          </div>

          {carsLoading ? (
            <div className="cars-compact-skeleton">
              {[1, 2, 3].map((n) => (
                <div key={n} className="car-card-skeleton" />
              ))}
            </div>
          ) : displayedCars.length > 0 ? (
            <div className="cars-compact-grid">
              {displayedCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="cars-empty-state">
              <Car size={40} />
              <p>Nye biler er på vej til vores showroom. Kontakt os for mere information.</p>
              <Link to="/kontakt" className="btn btn-primary btn-sm">Kontakt os</Link>
            </div>
          )}

          <div className="cars-view-all-mobile">
            <Link to="/biler" className="btn btn-secondary btn-full">
              Se alle biler til salg ({displayedCars.length > 0 ? 'Flere på lager' : 'Se lager'})
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. KONTAKT / ÅBNINGSTIDER
          ═══════════════════════════════════════════════ */}
      <section className="section-contact-light" aria-labelledby="contact-home-title">
        <div className="container">
          <div className="contact-home-wrapper">
            
            <div className="contact-home-details">
              <span className="section-tag">Find os</span>
              <h2 id="contact-home-title" className="section-title-dark">Kontakt Autohus Kvik</h2>
              <p className="contact-lead-text">
                Har du spørgsmål til en værkstedsopgave eller vil du aftale en tid? 
                Ring eller kom forbi vores værksted i Hvidovre.
              </p>

              <div className="contact-info-cards-list">
                <a href={`tel:${cleanPhone}`} className="contact-info-card">
                  <div className="contact-icon-bubble">
                    <Phone size={22} />
                  </div>
                  <div>
                    <span className="contact-card-label">Telefon (Værksted &amp; Salg)</span>
                    <strong className="contact-card-val">{companyPhone}</strong>
                  </div>
                </a>

                <div className="contact-info-card">
                  <div className="contact-icon-bubble">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <span className="contact-card-label">Adresse</span>
                    <strong className="contact-card-val">{settings.company_address ?? 'Gammel Køge Landevej 477, 2650 Hvidovre'}</strong>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-icon-bubble">
                    <Clock size={22} />
                  </div>
                  <div>
                    <span className="contact-card-label">Åbningstider</span>
                    <strong className="contact-card-val">Mandag – torsdag: 10:00 – 17:00</strong>
                    <span className="contact-card-sub">Fredag: 10:00 – 16:00 · Søndag: 12:00 – 16:00 (Lørdag lukket)</span>
                  </div>
                </div>

                <div className="contact-info-card emergency-style">
                  <div className="contact-icon-bubble emergency-bubble">
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <span className="contact-card-label">Døgnvagt – Autohjælp</span>
                    <a href={`tel:${(settings.company_emergency_phone ?? '+4550290874').replace(/\s/g, '')}`} className="emergency-number-link">
                      <strong>{settings.company_emergency_phone ?? '+45 50 29 08 74'}</strong>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Kort / Rutevejledning Boks */}
            <div className="contact-map-card">
              <div className="map-inner-content">
                <MapPin size={38} className="map-pin-icon" />
                <h3 className="map-card-title">Autohus Kvik</h3>
                <p className="map-card-address">
                  Gammel Køge Landevej 477<br />
                  2650 Hvidovre
                </p>
                <a
                  href="https://maps.google.com/?q=Gammel+Køge+Landevej+477,+2650+Hvidovre"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-full map-nav-btn"
                >
                  Åbn rutevejledning i Google Maps →
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
