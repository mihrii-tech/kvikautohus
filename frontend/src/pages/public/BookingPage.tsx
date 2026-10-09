import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Check, Phone, Loader2, RotateCcw, Wrench, ShieldCheck, Disc3, CircleDot,
  Snowflake, Gauge, Droplets, Cog, CalendarDays, Clock, MapPin, ArrowRight,
} from 'lucide-react';
import { bookingService, vehicleLookupService } from '@/services';
import { useSettings } from '@/contexts/SettingsContext';
import Seo from '@/components/ui/Seo';
import type { VehicleLookupResult } from '@/types';
import './BookingPage.css';

const SERVICES = [
  { id: 'service', label: 'Serviceeftersyn', hint: 'Efter fabrikkens forskrifter', price: 'fra 1.195 kr.', icon: Wrench },
  { id: 'syn', label: 'Klargøring til syn', hint: 'Lygter, bremser, styretøj', price: 'fra 495 kr.', icon: ShieldCheck },
  { id: 'bremser', label: 'Bremser', hint: 'Klodser og skiver', price: 'fra 795 kr.', icon: Disc3 },
  { id: 'daek', label: 'Dæk- og hjulskift', hint: 'Inkl. afbalancering', price: 'fra 350 kr.', icon: CircleDot },
  { id: 'ac', label: 'Aircondition', hint: 'Service og påfyldning', price: 'fra 895 kr.', icon: Snowflake },
  { id: 'diagnose', label: 'Fejlfinding', hint: 'Computerdiagnose', price: 'fra 595 kr.', icon: Gauge },
  { id: 'olie', label: 'Olieskift', hint: 'Olie og filter', price: 'fra 695 kr.', icon: Droplets },
  { id: 'andet', label: 'Reparation / andet', hint: 'Kobling, tandrem m.m.', price: 'timepris 650 kr.', icon: Cog },
];

const WEEKDAYS = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** Åbne dage de næste ~3 uger (lørdag lukket). */
function getOpenDays(count = 14) {
  const days: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (days.length < count) {
    if (d.getDay() !== 6) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function slotsFor(date: Date | null) {
  if (!date) return [];
  const day = date.getDay();
  if (day === 0) return ['12:00', '13:00', '14:00', '15:00'];
  if (day === 5) return ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
  return ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
}

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatPlate = (v: string) => {
  const c = v.replace(/[^A-Za-z0-9ÆØÅæøå]/g, '').toUpperCase().slice(0, 7);
  // Danske plader: AB 12 345
  if (/^[A-ZÆØÅ]{2}\d+$/.test(c)) {
    return [c.slice(0, 2), c.slice(2, 4), c.slice(4)].filter(Boolean).join(' ');
  }
  return c;
};

export default function BookingPage() {
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const phone = settings.company_phone ?? '+45 50 29 08 74';
  const plateRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const [plate, setPlate] = useState('');
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle');
  const [vehicle, setVehicle] = useState<VehicleLookupResult | null>(null);
  const [manual, setManual] = useState({ make: '', model: '', year: '' });

  const [services, setServices] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const openDays = useMemo(() => getOpenDays(14), []);
  const slots = slotsFor(date);

  const hasCar = lookupState === 'found' || (lookupState === 'notfound' && manual.make.trim() !== '');
  const carLabel = vehicle
    ? `${vehicle.make} ${vehicle.model}${vehicle.year ? ` · ${vehicle.year}` : ''}`
    : `${manual.make} ${manual.model}${manual.year ? ` · ${manual.year}` : ''}`.trim();

  // Forudvalg fra URL (?service=...&plate=...)
  useEffect(() => {
    const s = searchParams.get('service');
    if (s) {
      const match = SERVICES.find((x) => s.toLowerCase().includes(x.label.toLowerCase().split(' ')[0]));
      setServices([match ? match.label : s]);
    }
    const p = searchParams.get('plate');
    if (p) {
      setPlate(formatPlate(p));
      void runLookup(p);
    } else {
      plateRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runLookup(value = plate) {
    const clean = value.replace(/\s+/g, '');
    if (clean.length < 2) {
      setError('Indtast din nummerplade');
      return;
    }
    setError('');
    setLookupState('loading');
    try {
      const res = await vehicleLookupService.lookup('registration', clean);
      if (res && res.found && res.make) {
        setVehicle(res);
        setLookupState('found');
      } else {
        setVehicle(null);
        setLookupState('notfound');
      }
    } catch {
      setVehicle(null);
      setLookupState('notfound');
    }
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }

  function resetCar() {
    setVehicle(null);
    setLookupState('idle');
    setManual({ make: '', model: '', year: '' });
    setTimeout(() => plateRef.current?.focus(), 50);
  }

  const toggleService = (label: string) =>
    setServices((prev) => (prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]));

  const mutation = useMutation({
    mutationFn: (fd: FormData) => bookingService.submit(fd),
    onSuccess: () => {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: () => setError('Noget gik galt. Prøv igen eller ring til os.'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasCar) return setError('Find din bil via nummerpladen først.');
    if (services.length === 0) return setError('Vælg mindst én ydelse.');
    if (!date || !slot) return setError('Vælg dato og tidspunkt.');
    if (!customer.name || !customer.phone || !customer.email) return setError('Udfyld navn, telefon og e-mail.');
    if (!consent) return setError('Du skal acceptere vores privatlivspolitik.');
    setError('');

    const fd = new FormData();
    fd.append('licensePlate', plate.replace(/\s+/g, ''));
    fd.append('carMake', vehicle?.make ?? manual.make);
    fd.append('carModel', [vehicle?.model ?? manual.model, vehicle?.variant].filter(Boolean).join(' '));
    const yr = vehicle?.year ?? manual.year;
    if (yr) fd.append('carYear', String(yr));
    fd.append('serviceDescription', services.join(', '));
    fd.append('taskDescription', note);
    fd.append('requestedDate', toIso(date));
    fd.append('requestedTimeSlot', slot);
    fd.append('customerName', customer.name);
    fd.append('customerPhone', customer.phone);
    fd.append('customerEmail', customer.email);
    fd.append('honeypotField', honeypot);
    mutation.mutate(fd);
  }

  const dateLabel = date
    ? `${WEEKDAYS[date.getDay()]}. ${date.getDate()}. ${MONTHS[date.getMonth()]}${slot ? ` kl. ${slot}` : ''}`
    : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Autoværksted – service og reparation',
    name: 'Book værkstedstid hos Autohus Kvik',
    provider: { '@id': 'https://autohusetkvik.dk/#business' },
    areaServed: { '@type': 'City', name: 'Hvidovre' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Værkstedsydelser',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.label },
        description: `${s.hint} – ${s.price}`,
      })),
    },
  };

  // ─── Kvittering ───
  if (submitted) {
    return (
      <div className="bk">
        <Seo title="Tak for din booking" description="Din værkstedsbooking er modtaget." path="/book-vaerksted" noindex />
        <section className="bk-done container">
          <div className="bk-done__icon"><Check size={34} strokeWidth={3} /></div>
          <h1>Tak, {customer.name.split(' ')[0]} – vi har din booking</h1>
          <p>
            {carLabel} ({plate}) · {services.join(', ')}<br />
            Ønsket tid: <strong>{dateLabel}</strong>
          </p>
          <p className="bk-done__sub">
            Vi bekræfter tiden på SMS eller e-mail – typisk inden for en time i vores åbningstid.
            Har du spørgsmål, så ring på <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>.
          </p>
          <div className="bk-done__actions">
            <Link to="/" className="btn btn-primary">Til forsiden</Link>
            <Link to="/biler" className="btn btn-secondary">Se vores biler</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bk">
      <Seo
        title="Book værksted i Hvidovre – indtast nummerplade"
        description="Book tid på Autohus Kviks værksted i Hvidovre på 1 minut. Indtast din nummerplade, vælg service, dato og tid. Serviceeftersyn, syn, bremser, dæk og reparation af alle bilmærker."
        path="/book-vaerksted"
        image="/images/workshop.jpg"
        jsonLd={jsonLd}
      />

      {/* ─── Hero med nummerplade ─── */}
      <section className="bk-hero">
        <div className="bk-hero__bg" aria-hidden="true" />
        <div className="container bk-hero__inner">
          <p className="bk-eyebrow">Værksted · Gammel Køge Landevej 477, Hvidovre</p>
          <h1 className="bk-hero__title">Book tid på værkstedet</h1>
          <p className="bk-hero__lead">Start med din nummerplade – så finder vi selv bilens oplysninger.</p>

          <form
            className={`bk-plate-form ${lookupState === 'found' ? 'is-done' : ''}`}
            onSubmit={(e) => { e.preventDefault(); void runLookup(); }}
          >
            <label htmlFor="booking-plate" className="sr-only">Nummerplade</label>
            <div className="bk-plate">
              <span className="bk-plate__eu" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const a = (i / 12) * Math.PI * 2;
                    return <circle key={i} cx={12 + Math.cos(a) * 8} cy={12 + Math.sin(a) * 8} r="1.3" fill="#FFCC00" />;
                  })}
                </svg>
                <b>DK</b>
              </span>
              <input
                id="booking-plate"
                ref={plateRef}
                className="bk-plate__input"
                value={plate}
                onChange={(e) => {
                  setPlate(formatPlate(e.target.value));
                  if (lookupState !== 'idle' && lookupState !== 'loading') resetCarSoft();
                }}
                placeholder="AB 12 345"
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
                maxLength={9}
                aria-describedby="plate-help"
              />
            </div>
            <button type="submit" className="bk-plate-btn" id="booking-lookup-btn" disabled={lookupState === 'loading'}>
              {lookupState === 'loading' ? <Loader2 size={18} className="spin" /> : <>Find bil <ArrowRight size={18} /></>}
            </button>
          </form>
          <p id="plate-help" className="bk-hero__help">
            Opslag i Motorregistret · Ingen bil? Ring på <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
          </p>
        </div>
      </section>

      {/* ─── Fortsættelse ─── */}
      <div ref={detailsRef} className="bk-scroll-anchor" />

      {lookupState === 'idle' || lookupState === 'loading' ? (
        <section className="bk-how container">
          <ol className="bk-how__list">
            <li><span>1</span><div><strong>Nummerplade</strong><p>Vi henter mærke, model og årgang automatisk.</p></div></li>
            <li><span>2</span><div><strong>Ydelse og tid</strong><p>Vælg hvad der skal laves, og hvornår det passer dig.</p></div></li>
            <li><span>3</span><div><strong>Bekræftelse</strong><p>Du får svar på SMS – pris aftales altid inden vi går i gang.</p></div></li>
          </ol>
        </section>
      ) : (
        <form className="container bk-layout" onSubmit={handleSubmit} noValidate>
          <div className="bk-main">
            {/* Bil */}
            <section className="bk-block">
              {lookupState === 'found' && vehicle ? (
                <div className="bk-car">
                  <div className="bk-car__check"><Check size={18} strokeWidth={3} /></div>
                  <div className="bk-car__info">
                    <span className="bk-car__label">Din bil</span>
                    <strong className="bk-car__name">{vehicle.make} {vehicle.model}</strong>
                    <span className="bk-car__meta">
                      {[vehicle.variant, vehicle.year, vehicle.fuelType].filter(Boolean).join(' · ')}
                    </span>
                    {vehicle.nextInspectionDate && (
                      <span className="bk-car__inspect">Næste syn ca. {new Date(vehicle.nextInspectionDate).toLocaleDateString('da-DK', { month: 'long', year: 'numeric' })}</span>
                    )}
                  </div>
                  <button type="button" className="bk-link" onClick={resetCar}><RotateCcw size={14} /> Skift bil</button>
                </div>
              ) : (
                <div className="bk-manual">
                  <p className="bk-manual__msg">
                    Vi kunne ikke finde <strong>{plate || 'nummerpladen'}</strong> automatisk. Skriv bilen ind herunder – så klarer vi resten.
                  </p>
                  <div className="bk-grid-3">
                    <Field label="Mærke" id="manual-make" value={manual.make} onChange={(v) => setManual({ ...manual, make: v })} placeholder="Fx Volkswagen" />
                    <Field label="Model" id="manual-model" value={manual.model} onChange={(v) => setManual({ ...manual, model: v })} placeholder="Fx Polo" />
                    <Field label="Årgang" id="manual-year" value={manual.year} onChange={(v) => setManual({ ...manual, year: v.replace(/\D/g, '').slice(0, 4) })} placeholder="Fx 2016" inputMode="numeric" />
                  </div>
                  <button type="button" className="bk-link" onClick={resetCar}><RotateCcw size={14} /> Prøv en anden nummerplade</button>
                </div>
              )}
            </section>

            {/* Ydelser */}
            <section className="bk-block" aria-labelledby="bk-services-h">
              <h2 id="bk-services-h" className="bk-h2"><span>1</span> Hvad skal laves?</h2>
              <div className="bk-services">
                {SERVICES.map((s) => {
                  const on = services.includes(s.label);
                  const Icon = s.icon;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      id={`service-${s.id}`}
                      className={`bk-service ${on ? 'on' : ''}`}
                      onClick={() => toggleService(s.label)}
                      aria-pressed={on}
                    >
                      <Icon size={20} className="bk-service__icon" />
                      <span className="bk-service__text">
                        <strong>{s.label}</strong>
                        <small>{s.hint}</small>
                      </span>
                      <span className="bk-service__price">{s.price}</span>
                      <span className="bk-service__tick">{on && <Check size={13} strokeWidth={3} />}</span>
                    </button>
                  );
                })}
              </div>
              <label htmlFor="booking-note" className="bk-label">Beskriv evt. problemet <em>(valgfrit)</em></label>
              <textarea
                id="booking-note"
                className="bk-input"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Fx: Bremserne hviner, når jeg bremser hårdt."
              />
            </section>

            {/* Dato & tid */}
            <section className="bk-block" aria-labelledby="bk-date-h">
              <h2 id="bk-date-h" className="bk-h2"><span>2</span> Hvornår passer det?</h2>
              <div className="bk-days" role="listbox" aria-label="Vælg dato">
                {openDays.map((d) => {
                  const on = date && toIso(d) === toIso(date);
                  return (
                    <button
                      type="button"
                      key={toIso(d)}
                      role="option"
                      aria-selected={!!on}
                      className={`bk-day ${on ? 'on' : ''}`}
                      onClick={() => { setDate(d); setSlot(''); }}
                    >
                      <small>{WEEKDAYS[d.getDay()]}</small>
                      <strong>{d.getDate()}</strong>
                      <small>{MONTHS[d.getMonth()]}</small>
                    </button>
                  );
                })}
              </div>
              {date && (
                <div className="bk-slots" role="listbox" aria-label="Vælg tidspunkt">
                  {slots.map((t) => (
                    <button
                      type="button"
                      key={t}
                      role="option"
                      aria-selected={slot === t}
                      className={`bk-slot ${slot === t ? 'on' : ''}`}
                      onClick={() => setSlot(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Kunde */}
            <section className="bk-block" aria-labelledby="bk-contact-h">
              <h2 id="bk-contact-h" className="bk-h2"><span>3</span> Dine oplysninger</h2>
              <div className="bk-grid-3">
                <Field label="Navn" id="booking-name" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} autoComplete="name" />
                <Field label="Telefon" id="booking-phone" type="tel" value={customer.phone} onChange={(v) => setCustomer({ ...customer, phone: v })} autoComplete="tel" inputMode="tel" />
                <Field label="E-mail" id="booking-email" type="email" value={customer.email} onChange={(v) => setCustomer({ ...customer, email: v })} autoComplete="email" />
              </div>
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="bk-hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                aria-hidden="true"
              />
              <label className="bk-consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} id="booking-consent" />
                <span>Jeg accepterer, at Autohus Kvik bruger mine oplysninger til at behandle bookingen. <Link to="/privatlivspolitik">Privatlivspolitik</Link></span>
              </label>
            </section>
          </div>

          {/* ─── Opsummering ─── */}
          <aside className="bk-summary" aria-label="Din booking">
            <div className="bk-summary__card">
              <div className="bk-summary__plate">
                <span className="bk-mini-eu">DK</span>{plate || '—'}
              </div>
              <dl className="bk-summary__list">
                <div><dt>Bil</dt><dd>{carLabel || '—'}</dd></div>
                <div><dt>Ydelse</dt><dd>{services.length ? services.join(', ') : '—'}</dd></div>
                <div><dt>Tid</dt><dd>{dateLabel || '—'}</dd></div>
              </dl>
              {error && <p className="bk-error" role="alert">{error}</p>}
              <button type="submit" className="bk-submit" id="booking-submit" disabled={mutation.isPending}>
                {mutation.isPending ? <><Loader2 size={18} className="spin" /> Sender…</> : 'Send booking'}
              </button>
              <p className="bk-summary__note">Gratis og uforpligtende. Pris aftales inden arbejdet starter.</p>
            </div>
            <div className="bk-summary__contact">
              <a href={`tel:${phone.replace(/\s/g, '')}`}><Phone size={15} /> {phone}</a>
              <span><MapPin size={15} /> Gl. Køge Landevej 477, Hvidovre</span>
              <span><Clock size={15} /> Man–tor 10–17 · fre 10–16 · søn 12–16</span>
              <span><CalendarDays size={15} /> Lørdag lukket</span>
            </div>
          </aside>
        </form>
      )}
    </div>
  );

  function resetCarSoft() {
    setVehicle(null);
    setLookupState('idle');
  }
}

function Field(props: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className="bk-field">
      <label htmlFor={props.id} className="bk-label">{props.label}</label>
      <input
        id={props.id}
        className="bk-input"
        type={props.type ?? 'text'}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
      />
    </div>
  );
}
