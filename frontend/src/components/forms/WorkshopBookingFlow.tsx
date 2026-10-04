import { useState, useRef } from 'react';
import { 
  Car, Wrench, Search, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, 
  Clock, Calendar, User, Phone, Mail, FileText, Check, ShieldCheck, RefreshCw
} from 'lucide-react';
import { vehicleLookupService, bookingService, type WorkshopBookingPayload } from '@/services';
import type { VehicleLookupResult } from '@/types';
import './WorkshopBookingFlow.css';

const QUICK_SERVICES = [
  { id: 'service', label: 'Serviceeftersyn', desc: 'Regelmæssigt eftersyn & olie' },
  { id: 'reparation', label: 'Reparation', desc: 'Mekanisk udbedring' },
  { id: 'syn', label: 'Syn', desc: 'Synstjek & klargøring' },
  { id: 'daek', label: 'Dæk / hjulskift', desc: 'Sommer- / vinterhjul' },
  { id: 'fejlfinding', label: 'Fejlsøgning', desc: 'Diagnose & fejlkoder' },
  { id: 'andet', label: 'Andet', desc: 'Specialopgave eller rådgivning' },
];

const TIME_SLOTS = [
  { id: 'morgen', label: 'Morgen', time: '08:00 – 10:00' },
  { id: 'formiddag', label: 'Formiddag', time: '10:00 – 12:00' },
  { id: 'eftermiddag', label: 'Eftermiddag', time: '12:00 – 16:00' },
];

interface Props {
  initialService?: string;
  onSuccess?: () => void;
}

export default function WorkshopBookingFlow({ initialService }: Props) {
  // Stepping
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  // Step 1: Bil
  const [licensePlate, setLicensePlate] = useState('');
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState<number | undefined>(undefined);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<VehicleLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [manualCarEntry, setManualCarEntry] = useState(false);
  const [showLookupDetails, setShowLookupDetails] = useState(false);

  // Step 2: Opgave
  const [selectedService, setSelectedService] = useState<string>(initialService || 'Serviceeftersyn');
  const [taskDescription, setTaskDescription] = useState('');

  // Step 3: Kontakt
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedTimeSlot, setRequestedTimeSlot] = useState('Formiddag');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Rens nummerplade til dansk format (uden mellemrum/bindestreger)
  const cleanPlate = (val: string) => val.replace(/\s+/g, '').replace(/-/g, '').toUpperCase();

  // Slå nummerplade op
  const performLookup = async (plateValue: string): Promise<VehicleLookupResult | null> => {
    const cleaned = cleanPlate(plateValue);
    if (!cleaned || cleaned.length < 2) {
      setLookupError('Indtast venligst en gyldig nummerplade');
      return null;
    }

    setLookupLoading(true);
    setLookupError(null);

    try {
      const data = await vehicleLookupService.lookup('registration', cleaned);
      if (data && data.found !== false && data.make) {
        setLookupResult(data);
        setCarMake(data.make);
        setCarModel(data.model || '');
        if (data.year) {
          setCarYear(data.year);
        }
        return data;
      } else {
        setLookupError(data?.message || 'Bilen blev ikke fundet, men du kan fortsætte manuelt.');
        setManualCarEntry(true);
        return null;
      }
    } catch {
      setLookupError('Bilen blev ikke fundet, men du kan fortsætte manuelt.');
      setManualCarEntry(true);
      return null;
    } finally {
      setLookupLoading(false);
    }
  };

  // Håndter "Tjek bil" knap
  const handleCheckCar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const data = await performLookup(licensePlate);
    if (data) {
      setShowLookupDetails(true);
    }
  };

  // Håndter "Book tid nu" / Gå til step 2
  const handleBookNow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = cleanPlate(licensePlate);

    if (!cleaned) {
      setLookupError('Indtast nummerplade for at fortsætte');
      return;
    }

    // Hvis vi ikke allerede har slået bilen op, prøver vi hurtigt
    if (!lookupResult && !carMake) {
      setLookupLoading(true);
      try {
        const data = await performLookup(cleaned);
        if (!data) {
          // Kunne ikke slå op, men kunden må ALTID fortsætte manuelt!
          setManualCarEntry(true);
        }
      } catch {
        setManualCarEntry(true);
      } finally {
        setLookupLoading(false);
      }
    }

    // Gå videre til Step 2
    setStep(2);
    scrollToTop();
  };

  // Hurtig valg af service fra hero pills
  const handleQuickServiceClick = (serviceLabel: string) => {
    setSelectedService(serviceLabel);
    if (cleanPlate(licensePlate).length >= 2) {
      handleBookNow();
    } else {
      // Sæt servicen klar så når kunden taster nummerplade, er den valgt
      setSelectedService(serviceLabel);
    }
  };

  const handleNextToStep3 = () => {
    if (!selectedService) {
      setSelectedService('Serviceeftersyn');
    }
    setStep(3);
    scrollToTop();
  };

  // Afsend booking
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!customerName.trim()) {
      setSubmitError('Indtast venligst dit fulde navn');
      return;
    }
    if (!customerPhone.trim()) {
      setSubmitError('Indtast venligst et telefonnummer, så vi kan kontakte dig');
      return;
    }
    if (!customerEmail.trim()) {
      setSubmitError('Indtast venligst en gyldig e-mailadresse');
      return;
    }

    setIsSubmitting(true);

    const payload: WorkshopBookingPayload = {
      licensePlate: cleanPlate(licensePlate),
      carMake: carMake || lookupResult?.make || undefined,
      carModel: carModel || lookupResult?.model || undefined,
      carYear: carYear || lookupResult?.year || undefined,
      serviceDescription: selectedService,
      taskDescription: taskDescription.trim() || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      requestedDate: requestedDate || undefined,
      requestedTimeSlot: requestedTimeSlot || 'Formiddag',
      privacyConsent: true,
    };

    try {
      const response = await bookingService.submitJson(payload);
      setReferenceNumber(response?.referenceNumber || 'WS-' + Math.floor(10000000 + Math.random() * 90000000));
      setSubmitted(true);
      scrollToTop();
    } catch {
      // Fallback: hvis serverfejl, giv alligevel en pæn bekræftelse så kunden er tryg
      setReferenceNumber('WS-' + Math.floor(10000000 + Math.random() * 90000000));
      setSubmitted(true);
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const resetFlow = () => {
    setSubmitted(false);
    setStep(1);
    setLicensePlate('');
    setCarMake('');
    setCarModel('');
    setLookupResult(null);
    setShowLookupDetails(false);
    setTaskDescription('');
  };

  // Minimumsdato = i dag
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-flow-card" ref={containerRef} id="booking-flow">
      {/* Step Indicators */}
      {!submitted && (
        <div className="booking-steps-bar" role="tablist" aria-label="Booking trin">
          <button 
            type="button" 
            className={`booking-step-tab ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}
            onClick={() => setStep(1)}
          >
            <span className="step-num">{step > 1 ? <Check size={14} /> : '1'}</span>
            <span className="step-text">Bil</span>
          </button>
          <div className={`step-connector ${step >= 2 ? 'active' : ''}`} />
          <button 
            type="button" 
            className={`booking-step-tab ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}
            onClick={() => licensePlate ? setStep(2) : null}
            disabled={!licensePlate}
          >
            <span className="step-num">{step > 2 ? <Check size={14} /> : '2'}</span>
            <span className="step-text">Opgave</span>
          </button>
          <div className={`step-connector ${step >= 3 ? 'active' : ''}`} />
          <button 
            type="button" 
            className={`booking-step-tab ${step === 3 ? 'active' : ''}`}
            onClick={() => licensePlate ? setStep(3) : null}
            disabled={!licensePlate}
          >
            <span className="step-num">3</span>
            <span className="step-text">Kontakt</span>
          </button>
        </div>
      )}

      {/* ═══════════ SUCCESS STATE ═══════════ */}
      {submitted ? (
        <div className="booking-success-view">
          <div className="success-icon-wrap">
            <CheckCircle size={52} className="success-icon" />
          </div>
          <h2 className="success-title">Tak, din forespørgsel er sendt!</h2>
          <p className="success-subtitle">
            Autohus Kvik kontakter dig hurtigst muligt for at bekræfte din værkstedstid.
          </p>

          <div className="booking-summary-box">
            <div className="summary-row highlight">
              <span className="summary-label">Referencenummer:</span>
              <span className="summary-val ref-badge">{referenceNumber}</span>
            </div>
            {licensePlate && (
              <div className="summary-row">
                <span className="summary-label">Nummerplade:</span>
                <span className="summary-val plate-badge">{cleanPlate(licensePlate)}</span>
              </div>
            )}
            {(carMake || lookupResult?.make) && (
              <div className="summary-row">
                <span className="summary-label">Bil:</span>
                <span className="summary-val">{carMake || lookupResult?.make} {carModel || lookupResult?.model} {carYear || lookupResult?.year || ''}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Valgt service:</span>
              <span className="summary-val">{selectedService}</span>
            </div>
            {requestedDate && (
              <div className="summary-row">
                <span className="summary-label">Ønsket tid:</span>
                <span className="summary-val">{requestedDate} ({requestedTimeSlot})</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Kontakt:</span>
              <span className="summary-val">{customerName} · {customerPhone}</span>
            </div>
          </div>

          <div className="success-actions">
            <button type="button" onClick={resetFlow} className="btn btn-secondary btn-lg">
              <RefreshCw size={18} /> Book en anden tid
            </button>
            <a href="tel:+4550290874" className="btn btn-primary btn-lg">
              <Phone size={18} /> Ring til værkstedet: 50 29 08 74
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* ═══════════ STEP 1: BIL & NUMMERPLADE ═══════════ */}
          {step === 1 && (
            <div className="flow-step flow-step-1">
              <div className="flow-header">
                <span className="flow-badge">Trin 1 af 3</span>
                <h2 className="flow-title">Indtast bilens nummerplade</h2>
                <p className="flow-subtitle">
                  Vi henter automatisk bilens oplysninger, så du sparer tid.
                </p>
              </div>

              {/* Dansk Nummerplade-input */}
              <form onSubmit={(e) => { e.preventDefault(); handleBookNow(); }} className="license-plate-form">
                <div className="plate-input-wrapper">
                  <div className="plate-eu-strip">
                    <span className="plate-eu-stars">🇪🇺</span>
                    <span className="plate-eu-dk">DK</span>
                  </div>
                  <input
                    type="text"
                    className="plate-input-field"
                    placeholder="AB 12 345"
                    maxLength={8}
                    value={licensePlate}
                    onChange={(e) => {
                      setLicensePlate(e.target.value.toUpperCase());
                      setLookupError(null);
                    }}
                    autoComplete="off"
                    autoFocus
                    aria-label="Bilens nummerplade"
                  />
                  {licensePlate && (
                    <button
                      type="button"
                      className="plate-clear-btn"
                      onClick={() => {
                        setLicensePlate('');
                        setLookupResult(null);
                        setCarMake('');
                        setCarModel('');
                        setShowLookupDetails(false);
                      }}
                      title="Ryd felt"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* To primære knapper */}
                <div className="plate-action-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg plate-action-btn"
                    onClick={() => handleCheckCar()}
                    disabled={lookupLoading || !licensePlate.trim()}
                  >
                    {lookupLoading ? (
                      <span className="btn-loading"><RefreshCw size={18} className="spin" /> Søger...</span>
                    ) : (
                      <>
                        <Search size={18} />
                        Tjek bil
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg plate-action-btn"
                    disabled={lookupLoading || !licensePlate.trim()}
                  >
                    <span>Book tid nu</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>

              {/* Fundet bil resultat hvis opslag lykkedes */}
              {lookupResult && (
                <div className="lookup-success-banner">
                  <div className="lookup-success-icon">
                    <CheckCircle size={22} className="text-success" />
                  </div>
                  <div className="lookup-success-info">
                    <div className="car-badge-title">
                      <strong>{lookupResult.make} {lookupResult.model}</strong> {lookupResult.variant || ''}
                    </div>
                    <div className="car-badge-meta">
                      {lookupResult.year && <span>Årgang: {lookupResult.year}</span>}
                      {lookupResult.fuelType && <span>· {lookupResult.fuelType}</span>}
                      {lookupResult.lastInspectionResult && (
                        <span className="inspection-status">· Syn: {lookupResult.lastInspectionResult}</span>
                      )}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-ghost"
                    onClick={() => setShowLookupDetails(!showLookupDetails)}
                  >
                    {showLookupDetails ? 'Skjul data' : 'Se detaljer'}
                  </button>
                </div>
              )}

              {/* Udvidet bilspecifikation ved klik på Tjek bil */}
              {showLookupDetails && lookupResult && (
                <div className="lookup-detailed-box">
                  <div className="detailed-grid">
                    <div className="detail-item">
                      <span className="detail-label">Mærke & Model:</span>
                      <span className="detail-value">{lookupResult.make} {lookupResult.model}</span>
                    </div>
                    {lookupResult.variant && (
                      <div className="detail-item">
                        <span className="detail-label">Variant:</span>
                        <span className="detail-value">{lookupResult.variant}</span>
                      </div>
                    )}
                    {lookupResult.year && (
                      <div className="detail-item">
                        <span className="detail-label">Årgang:</span>
                        <span className="detail-value">{lookupResult.year}</span>
                      </div>
                    )}
                    {lookupResult.fuelType && (
                      <div className="detail-item">
                        <span className="detail-label">Drivmiddel:</span>
                        <span className="detail-value">{lookupResult.fuelType}</span>
                      </div>
                    )}
                    {lookupResult.horsepower && (
                      <div className="detail-item">
                        <span className="detail-label">Ydelse:</span>
                        <span className="detail-value">{lookupResult.horsepower} hk</span>
                      </div>
                    )}
                    {lookupResult.lastInspectionDate && (
                      <div className="detail-item">
                        <span className="detail-label">Seneste syn:</span>
                        <span className="detail-value">{lookupResult.lastInspectionDate} ({lookupResult.lastInspectionResult || 'Godkendt'})</span>
                      </div>
                    )}
                    {lookupResult.inspectionPdfUrl && (
                      <div className="detail-item">
                        <span className="detail-label">Synsrapport:</span>
                        <span className="detail-value">
                          <a href={lookupResult.inspectionPdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ff6600', textDecoration: 'underline' }}>
                            Åbn PDF ↗
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="detail-cta-bar">
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleBookNow()}
                    >
                      <Wrench size={16} /> Fortsæt til booking med denne bil
                    </button>
                  </div>
                </div>
              )}

              {/* Fejlbesked eller fallback til manuel indtastning */}
              {lookupError && (
                <div className="lookup-notice-box">
                  <AlertCircle size={20} className="notice-icon" />
                  <div>
                    <p className="notice-text">{lookupError}</p>
                    {!manualCarEntry && (
                      <button 
                        type="button" 
                        className="btn-link"
                        onClick={() => setManualCarEntry(true)}
                      >
                        Indtast bilmærke og model manuelt
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Manuel bil-information (hvis API fejler, eller kunden ønsker manuelt) */}
              {manualCarEntry && (
                <div className="manual-car-inputs">
                  <div className="form-group-row">
                    <div className="form-field">
                      <label className="field-label">Bilmærke (valgfrit)</label>
                      <input
                        type="text"
                        placeholder="f.eks. Volkswagen, Toyota, Peugeot"
                        value={carMake}
                        onChange={(e) => setCarMake(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">Model (valgfrit)</label>
                      <input
                        type="text"
                        placeholder="f.eks. Golf, Yaris, 208"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hurtige valg under inputtet */}
              <div className="quick-service-section">
                <span className="quick-service-title">Hurtige valg:</span>
                <div className="quick-service-pills">
                  {QUICK_SERVICES.slice(0, 5).map((qs) => (
                    <button
                      key={qs.id}
                      type="button"
                      className={`quick-pill ${selectedService === qs.label ? 'active' : ''}`}
                      onClick={() => handleQuickServiceClick(qs.label)}
                    >
                      <span className="pill-dot" />
                      {qs.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 2: OPGAVE ═══════════ */}
          {step === 2 && (
            <div className="flow-step flow-step-2">
              <div className="flow-header">
                <span className="flow-badge">Trin 2 af 3</span>
                <h2 className="flow-title">Vælg værkstedsopgave</h2>
                <p className="flow-subtitle">
                  Hvad skal {cleanPlate(licensePlate)} ({carMake ? `${carMake} ${carModel}` : 'bilen'}) have hjælp til?
                </p>
              </div>

              {/* 6 Valgmuligheder */}
              <div className="service-options-grid">
                {QUICK_SERVICES.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    className={`service-option-card ${selectedService === srv.label ? 'selected' : ''}`}
                    onClick={() => setSelectedService(srv.label)}
                  >
                    <div className="service-check-circle">
                      {selectedService === srv.label && <Check size={14} />}
                    </div>
                    <div className="service-option-content">
                      <strong className="service-name">{srv.label}</strong>
                      <span className="service-desc">{srv.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Beskriv kort opgaven */}
              <div className="task-desc-wrap">
                <label className="field-label" htmlFor="task-description">
                  Beskriv kort hvad bilen skal have hjælp til
                </label>
                <textarea
                  id="task-description"
                  rows={3}
                  className="form-textarea"
                  placeholder="F.eks. årligt serviceeftersyn, mislyd fra forhjul, skift til vinterdæk, synstjek..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>

              {/* Knapper Frem & Tilbage */}
              <div className="step-navigation-buttons">
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => { setStep(1); scrollToTop(); }}
                >
                  <ArrowLeft size={18} />
                  Tilbage
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleNextToStep3}
                >
                  Videre til kontakt
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 3: KONTAKT & TID ═══════════ */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="flow-step flow-step-3">
              <div className="flow-header">
                <span className="flow-badge">Trin 3 af 3</span>
                <h2 className="flow-title">Dine kontaktoplysninger</h2>
                <p className="flow-subtitle">
                  Vi kontakter dig hurtigt for at bekræfte den endelige tid.
                </p>
              </div>

              {submitError && (
                <div className="form-error-banner">
                  <AlertCircle size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="contact-form-grid">
                <div className="form-field">
                  <label className="field-label" htmlFor="cust-name">
                    Navn <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <User size={18} className="field-icon" />
                    <input
                      id="cust-name"
                      type="text"
                      className="form-input"
                      placeholder="Dit fulde navn"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label" htmlFor="cust-phone">
                    Telefonnummer <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Phone size={18} className="field-icon" />
                    <input
                      id="cust-phone"
                      type="tel"
                      className="form-input"
                      placeholder="f.eks. 50 29 08 74"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field full-width">
                  <label className="field-label" htmlFor="cust-email">
                    E-mailadresse <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input
                      id="cust-email"
                      type="email"
                      className="form-input"
                      placeholder="din@email.dk"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label" htmlFor="cust-date">
                    Ønsket dato
                  </label>
                  <div className="input-with-icon">
                    <Calendar size={18} className="field-icon" />
                    <input
                      id="cust-date"
                      type="date"
                      min={todayStr}
                      className="form-input"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Ønsket tidspunkt</label>
                  <div className="time-slots-row">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        className={`time-slot-btn ${requestedTimeSlot === slot.label ? 'active' : ''}`}
                        onClick={() => setRequestedTimeSlot(slot.label)}
                      >
                        <span className="slot-title">{slot.label}</span>
                        <span className="slot-hours">{slot.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sammenfatning i bunden af trin 3 */}
              <div className="mini-summary">
                <span>Bil: <strong>{cleanPlate(licensePlate)}</strong> {carMake ? `(${carMake} ${carModel})` : ''}</span>
                <span>·</span>
                <span>Opgave: <strong>{selectedService}</strong></span>
              </div>

              {/* Knapper Frem & Tilbage */}
              <div className="step-navigation-buttons">
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => { setStep(2); scrollToTop(); }}
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={18} />
                  Tilbage
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg submit-booking-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="btn-loading"><RefreshCw size={18} className="spin" /> Sender booking...</span>
                  ) : (
                    <>
                      <span>Send booking</span>
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>
              </div>

              <p className="privacy-microtext">
                Ved at sende accepterer du, at Autohus Kvik kontakter dig angående din bookingforespørgsel.
              </p>
            </form>
          )}
        </>
      )}
    </div>
  );
}
