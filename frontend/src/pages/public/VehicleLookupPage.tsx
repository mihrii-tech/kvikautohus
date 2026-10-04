import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search, Car, ShieldCheck, Calendar, Fuel, Gauge, Info,
  CheckCircle, AlertCircle, Wrench, FileText, Phone,
  Send, ClipboardCheck, Eye, Weight, Palette
} from 'lucide-react';
import { vehicleLookupService } from '@/services';
import type { VehicleLookupResult, VehicleLookupLeadPayload } from '@/types';
import heroBg from '@/assets/hero_bg.jpg';
import './VehicleLookupPage.css';

type LookupMode = 'registration' | 'vin';

export default function VehicleLookupPage() {
  const [mode, setMode] = useState<LookupMode>('registration');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VehicleLookupResult | null>(null);

  // Lead-formular
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadHoneypot, setLeadHoneypot] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = input.replace(/\s+/g, '').replace(/-/g, '').toUpperCase();

    if (!cleaned) {
      setError(mode === 'registration' ? 'Indtast en nummerplade' : 'Indtast et stelnummer');
      return;
    }

    if (mode === 'registration' && (cleaned.length > 7 || cleaned.length < 2)) {
      setError('Danske nummerplader er mellem 2 og 7 tegn');
      return;
    }

    if (mode === 'vin' && cleaned.length !== 17) {
      setError('Et stelnummer (VIN) skal være præcis 17 tegn');
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const data = await vehicleLookupService.lookup(mode, cleaned);
      if (data && data.found !== false && data.make) {
        setResult(data);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      } else {
        setError(data?.message || 'Bilen blev ikke fundet. Tjek nummerpladen eller kontakt os, så hjælper vi dig.');
      }
    } catch {
      setError('Vi kunne ikke finde bilen. Tjek nummerpladen eller kontakt os, så hjælper vi dig.');
    } finally {
      setIsLoading(false);
    }
  };

  const runDirectLookup = async (plate: string) => {
    setInput(plate);
    setMode('registration');
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const data = await vehicleLookupService.lookup('registration', plate);
      if (data && data.found !== false && data.make) {
        setResult(data);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      } else {
        setError(data?.message || 'Bilen blev ikke fundet.');
      }
    } catch {
      setError('Vi kunne ikke finde bilen. Tjek nummerpladen eller kontakt os, så hjælper vi dig.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadConsent) {
      setLeadError('Du skal acceptere privatlivspolitikken for at fortsætte.');
      return;
    }

    setLeadError(null);
    setLeadSubmitting(true);

    const payload: VehicleLookupLeadPayload = {
      customerName: leadName,
      customerEmail: leadEmail,
      customerPhone: leadPhone || undefined,
      message: leadMessage || undefined,
      licensePlate: result?.registrationNumber || input.toUpperCase().replace(/\s+/g, ''),
      privacyConsent: leadConsent,
      honeypotField: leadHoneypot || undefined,
    };

    try {
      await vehicleLookupService.submitLead(payload);
      setLeadSuccess(true);
    } catch {
      setLeadError('Der opstod en fejl. Prøv venligst igen.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Format dato
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Syn-resultat badge
  const getInspectionBadge = (result?: string) => {
    if (!result) return null;
    const lower = result.toLowerCase();
    if (lower.includes('godkendt') || lower.includes('approved'))
      return <span className="vehicle-badge vehicle-badge--success"><CheckCircle size={12} /> Godkendt</span>;
    if (lower.includes('betinget') || lower.includes('conditional'))
      return <span className="vehicle-badge vehicle-badge--warning"><AlertCircle size={12} /> Betinget godkendt</span>;
    if (lower.includes('ikke') || lower.includes('rejected') || lower.includes('failed'))
      return <span className="vehicle-badge vehicle-badge--error"><AlertCircle size={12} /> Ikke godkendt</span>;
    return <span className="vehicle-badge vehicle-badge--neutral">{result}</span>;
  };

  return (
    <>
      <Helmet>
        <title>Tjek din bil – Nummerplade-opslag | Autohus Kvik</title>
        <meta name="description" content="Tjek din bil på få sekunder. Indtast nummerplade eller stelnummer og få hurtigt overblik over bilens oplysninger, syn og tekniske data." />
        <meta property="og:title" content="Nummerpladeopslag – Autohus Kvik" />
        <meta property="og:description" content="Gratis bilopslag. Se bilens data, synsstatus og tekniske oplysninger." />
        <link rel="canonical" href={`${window.location.origin}/tjek-bil`} />
      </Helmet>

      {/* ═══ HERO ═══ */}
      <section className="lookup-hero" aria-label="Nummerpladeopslag">
        <div className="lookup-hero__bg">
          <img src={heroBg} alt="" className="lookup-hero__bg-img" aria-hidden="true" />
          <div className="lookup-hero__overlay" />
        </div>

        <div className="container">
          <div className="lookup-hero__content">
            <span className="lookup-hero__badge">
              <Search size={14} />
              Gratis bilopslag
            </span>

            <h1 className="lookup-hero__title">
              Tjek din bil <span className="lookup-hero__title-accent">på få sekunder</span>
            </h1>

            <p className="lookup-hero__subtitle">
              Indtast nummerplade eller stelnummer og få hurtigt overblik over bilens
              oplysninger, syn og tekniske data.
            </p>

            {/* Søgeboks */}
            <div className="lookup-search">
              {/* Toggle */}
              <div className="lookup-toggle">
                <button
                  type="button"
                  className={`lookup-toggle__btn ${mode === 'registration' ? 'active' : ''}`}
                  onClick={() => { setMode('registration'); setInput(''); setError(null); }}
                  id="toggle-registration"
                >
                  Nummerplade
                </button>
                <button
                  type="button"
                  className={`lookup-toggle__btn ${mode === 'vin' ? 'active' : ''}`}
                  onClick={() => { setMode('vin'); setInput(''); setError(null); }}
                  id="toggle-vin"
                >
                  Stelnummer
                </button>
              </div>

              <form onSubmit={handleLookup}>
                <div className="plate-input-wrapper">
                  {mode === 'registration' ? (
                    <div className="plate-input-container">
                      <div className="plate-eu-stripe" aria-hidden="true">
                        <span className="plate-eu-stripe__stars">★★★</span>
                        <span className="plate-eu-stripe__country">DK</span>
                      </div>
                      <input
                        type="text"
                        className="plate-input"
                        placeholder="fx AB 12 345"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        maxLength={10}
                        autoComplete="off"
                        id="plate-input"
                        aria-label="Nummerplade"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="vin-input"
                      placeholder="fx WVWZZZ3CZWE123456"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      maxLength={20}
                      autoComplete="off"
                      id="vin-input"
                      aria-label="Stelnummer (VIN)"
                    />
                  )}

                  <button
                    type="submit"
                    className="lookup-search-btn"
                    disabled={isLoading || !input.trim()}
                    id="lookup-submit"
                  >
                    {isLoading ? (
                      <>
                        <div className="lookup-loading__spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                        Søger...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Tjek bil
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Hurtige test-eksempler */}
              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>
                <span>💡 Prøv f.eks.:</span>
                {[
                  { plate: 'AB 12 345', label: 'VW Golf (Benzin)' },
                  { plate: 'CW 88 921', label: 'Audi A4 (Diesel)' },
                  { plate: 'EF 67 890', label: 'Mercedes C220' },
                  { plate: 'DK 99 111', label: 'Toyota Yaris (Hybrid)' },
                ].map((item) => (
                  <button
                    key={item.plate}
                    type="button"
                    onClick={() => runDirectLookup(item.plate)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                  >
                    🚗 {item.plate} ({item.label})
                  </button>
                ))}
              </div>

              {error && (
                <div className="lookup-error" role="alert" id="lookup-error">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LOADING ═══ */}
      {isLoading && (
        <div className="lookup-loading">
          <div className="lookup-loading__spinner" />
          <span className="lookup-loading__text">Henter biloplysninger...</span>
        </div>
      )}

      {/* ═══ RESULTAT ═══ */}
      {result && !isLoading && (
        <section className="lookup-result" ref={resultRef}>
          <div className="container">
            <div className="lookup-result__header">
              <span className="lookup-result__success-badge">
                <CheckCircle size={14} />
                Bil fundet
              </span>
              <h2 className="lookup-result__title">
                {result.make} {result.model}
                {result.variant && <span className="lookup-result__title-accent"> {result.variant}</span>}
              </h2>
              <p className="lookup-result__subtitle">
                {result.registrationNumber && `${result.registrationNumber} · `}
                {result.year && `Årgang ${result.year}`}
                {result.fuelType && ` · ${result.fuelType}`}
              </p>
            </div>

            <div className="vehicle-card">
              <div className="vehicle-card__grid">
                {/* Stamoplysninger */}
                <div className="vehicle-card__section">
                  <div className="vehicle-card__section-title">
                    <Car size={16} />
                    Stamoplysninger
                  </div>
                  {result.make && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label">Mærke</span>
                      <span className="vehicle-card__value">{result.make}</span>
                    </div>
                  )}
                  {result.model && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label">Model</span>
                      <span className="vehicle-card__value">{result.model}</span>
                    </div>
                  )}
                  {result.variant && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label">Variant</span>
                      <span className="vehicle-card__value">{result.variant}</span>
                    </div>
                  )}
                  {(result.year || result.firstRegistrationDate) && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label">Første registrering</span>
                      <span className="vehicle-card__value">
                        {formatDate(result.firstRegistrationDate) || result.year}
                      </span>
                    </div>
                  )}
                  {result.color && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label"><Palette size={13} /> Farve</span>
                      <span className="vehicle-card__value">{result.color}</span>
                    </div>
                  )}
                  {result.bodyType && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label">Karosseri</span>
                      <span className="vehicle-card__value">{result.bodyType}</span>
                    </div>
                  )}
                  {result.status && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label">Registreringsstatus</span>
                      <span className="vehicle-card__value">
                        <span className={`vehicle-badge ${result.status.toLowerCase().includes('registreret') ? 'vehicle-badge--success' : 'vehicle-badge--neutral'}`}>
                          {result.status}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Tekniske data & Syn */}
                <div className="vehicle-card__section">
                  <div className="vehicle-card__section-title">
                    <Wrench size={16} />
                    Teknisk & Syn
                  </div>
                  {result.fuelType && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label"><Fuel size={13} /> Brændstof</span>
                      <span className="vehicle-card__value">{result.fuelType}</span>
                    </div>
                  )}
                  {result.mileage != null && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label"><Gauge size={13} /> Kilometerstand</span>
                      <span className="vehicle-card__value">{result.mileage.toLocaleString('da-DK')} km</span>
                    </div>
                  )}
                  {result.engineSize && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label">Motor</span>
                      <span className="vehicle-card__value">{result.engineSize}</span>
                    </div>
                  )}
                  {result.horsepower && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label">Hestekræfter</span>
                      <span className="vehicle-card__value">{result.horsepower} hk</span>
                    </div>
                  )}
                  {result.totalWeight && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label"><Weight size={13} /> Totalvægt</span>
                      <span className="vehicle-card__value">{result.totalWeight.toLocaleString('da-DK')} kg</span>
                    </div>
                  )}
                  {result.lastInspectionDate && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label"><Calendar size={13} /> Seneste syn</span>
                      <span className="vehicle-card__value">{formatDate(result.lastInspectionDate)}</span>
                    </div>
                  )}
                  {result.lastInspectionResult && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label"><ShieldCheck size={13} /> Synsresultat</span>
                      <span className="vehicle-card__value">{getInspectionBadge(result.lastInspectionResult)}</span>
                    </div>
                  )}
                  {result.nextInspectionDate && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label"><Eye size={13} /> Næste syn</span>
                      <span className="vehicle-card__value">{formatDate(result.nextInspectionDate)}</span>
                    </div>
                  )}
                  {result.inspectionPdfUrl && (
                    <div className="vehicle-card__row">
                      <span className="vehicle-card__label"><FileText size={13} /> Synsrapport</span>
                      <span className="vehicle-card__value">
                        <a href={result.inspectionPdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ff6600', textDecoration: 'underline', fontWeight: 600 }}>
                          Åbn officiel PDF ↗
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTA-knapper */}
            <div className="lookup-cta">
              <Link to="/book-vaerksted" className="lookup-cta__btn lookup-cta__btn--primary" id="cta-book-workshop">
                <Wrench size={20} />
                Book værkstedstid
              </Link>
              <button
                type="button"
                className="lookup-cta__btn lookup-cta__btn--secondary"
                onClick={scrollToContact}
                id="cta-get-offer"
              >
                <FileText size={20} />
                Få tilbud på denne bil
              </button>
              <Link to="/kontakt" className="lookup-cta__btn lookup-cta__btn--outline" id="cta-contact">
                <Phone size={20} />
                Kontakt Kvik Autohus
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ KONTAKTFORMULAR ═══ */}
      {result && !isLoading && (
        <section className="lookup-contact" ref={contactRef}>
          <div className="container">
            <div className="lookup-contact__wrapper">
              <div className="lookup-contact__header">
                <h2>Har du spørgsmål til denne bil?</h2>
                <p>Udfyld formularen, og vi vender tilbage hurtigst muligt.</p>
              </div>

              {leadSuccess ? (
                <div className="lookup-contact__success">
                  <div className="lookup-contact__success-icon">
                    <CheckCircle size={32} />
                  </div>
                  <h3>Tak for din henvendelse!</h3>
                  <p>Vi har sendt en bekræftelse til din e-mail og kontakter dig hurtigst muligt.</p>
                </div>
              ) : (
                <form className="lookup-contact__form" onSubmit={handleLeadSubmit}>
                  <div className="lookup-contact__grid">
                    <div className="form-group">
                      <label className="form-label required" htmlFor="lead-name">Navn</label>
                      <input
                        type="text"
                        id="lead-name"
                        className="form-input"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        required
                        placeholder="Dit fulde navn"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required" htmlFor="lead-phone">Telefon</label>
                      <input
                        type="tel"
                        id="lead-phone"
                        className="form-input"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        placeholder="fx 50 29 08 74"
                      />
                    </div>

                    <div className="form-group lookup-contact__field--full">
                      <label className="form-label required" htmlFor="lead-email">E-mail</label>
                      <input
                        type="email"
                        id="lead-email"
                        className="form-input"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        required
                        placeholder="din@email.dk"
                      />
                    </div>

                    <div className="form-group lookup-contact__field--full">
                      <label className="form-label" htmlFor="lead-plate">Nummerplade</label>
                      <input
                        type="text"
                        id="lead-plate"
                        className="form-input"
                        value={result?.registrationNumber || input.toUpperCase().replace(/\s+/g, '')}
                        readOnly
                        style={{ background: 'var(--color-surface)', fontWeight: 600 }}
                      />
                    </div>

                    <div className="form-group lookup-contact__field--full">
                      <label className="form-label" htmlFor="lead-message">Besked</label>
                      <textarea
                        id="lead-message"
                        className="form-textarea"
                        value={leadMessage}
                        onChange={(e) => setLeadMessage(e.target.value)}
                        rows={4}
                        placeholder="Beskriv hvad du har brug for – fx service, reparation, tilbud mv."
                      />
                    </div>
                  </div>

                  {/* Honeypot */}
                  <div className="lookup-contact__hp" aria-hidden="true">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={leadHoneypot}
                      onChange={(e) => setLeadHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="lookup-contact__consent">
                    <input
                      type="checkbox"
                      id="lead-consent"
                      checked={leadConsent}
                      onChange={(e) => setLeadConsent(e.target.checked)}
                    />
                    <label htmlFor="lead-consent">
                      Jeg accepterer <Link to="/privatlivspolitik">privatlivspolitikken</Link> og
                      giver samtykke til at Autohus Kvik kontakter mig vedr. min henvendelse.
                    </label>
                  </div>

                  {leadError && (
                    <div className="lookup-error" role="alert" style={{ marginTop: 'var(--spacing-4)' }}>
                      <AlertCircle size={18} />
                      {leadError}
                    </div>
                  )}

                  <div className="lookup-contact__submit">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg btn-full"
                      disabled={leadSubmitting}
                      id="lead-submit"
                    >
                      {leadSubmitting ? (
                        <>
                          <div className="lookup-loading__spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                          Sender...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Send henvendelse
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FORDELE ═══ */}
      <section className="lookup-benefits">
        <div className="container">
          <div className="lookup-benefits__grid">
            <div className="lookup-benefit">
              <div className="lookup-benefit__icon">
                <ClipboardCheck size={28} />
              </div>
              <h3 className="lookup-benefit__title">Tjek bilen før køb</h3>
              <p className="lookup-benefit__desc">
                Se syn, registreringsstatus og tekniske data – gratis og uforpligtende.
              </p>
            </div>
            <div className="lookup-benefit">
              <div className="lookup-benefit__icon">
                <Wrench size={28} />
              </div>
              <h3 className="lookup-benefit__title">Book værkstedstid</h3>
              <p className="lookup-benefit__desc">
                Vores erfarne mekanikere står klar til service, reparation og syn.
              </p>
            </div>
            <div className="lookup-benefit">
              <div className="lookup-benefit__icon">
                <ShieldCheck size={28} />
              </div>
              <h3 className="lookup-benefit__title">Få tilbud</h3>
              <p className="lookup-benefit__desc">
                Få et uforpligtende tilbud på service eller reparation af din bil.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
