import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import {
  CheckCircle, ArrowRight, ArrowLeft, Clock
} from 'lucide-react';
import { bookingService } from '@/services';
import { useSettings } from '@/contexts/SettingsContext';
import './BookingPage.css';

const AVAILABLE_SERVICES = [
  { id: 'service', label: 'Almindeligt serviceeftersyn', price: 'Fra 1.195 kr.' },
  { id: 'syn', label: 'Klargøring til syn / Synstjek', price: 'Fra 495 kr.' },
  { id: 'bremser', label: 'Bremseservice & udskiftning', price: 'Fra 795 kr.' },
  { id: 'daek', label: 'Hjulskift / Dækskifte', price: 'Fra 350 kr.' },
  { id: 'ac', label: 'Aircondition & Klimaservice', price: 'Fra 895 kr.' },
  { id: 'diagnose', label: 'Fejlfinding / Computerdiagnose', price: 'Fra 595 kr.' },
  { id: 'olie', label: 'Olieskift & Oliefilter', price: 'Fra 695 kr.' },
  { id: 'andet', label: 'Mekanisk reparation / Andet', price: 'Timepris 650 kr.' },
];

export default function BookingPage() {
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Car
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear() - 4,
    mileage: '',
    fuelType: 'Benzin',
    // Step 2: Services
    selectedServices: [] as string[],
    // Step 3: Description
    description: '',
    // Step 4: Loaner car
    needsLoanerCar: false,
    // Step 5: Date & Time
    preferredDate: '',
    preferredTimeSlot: 'morning', // 'morning' | 'afternoon'
    // Step 6: Customer
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
  });

  // Pre-select service from URL query
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      setFormData((prev) => ({
        ...prev,
        selectedServices: [serviceParam],
      }));
    }
  }, [searchParams]);

  const toggleService = (label: string) => {
    setFormData((prev) => {
      const exists = prev.selectedServices.includes(label);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((s) => s !== label)
          : [...prev.selectedServices, label],
      };
    });
  };

  const mutation = useMutation({
    mutationFn: (fd: FormData) => bookingService.submit(fd),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'selectedServices') {
        fd.append(k, JSON.stringify(v));
      } else {
        fd.append(k, String(v));
      }
    });
    mutation.mutate(fd);
  };

  return (
    <div className="booking-page">
      <Helmet>
        <title>Book værkstedstid online i Hvidovre {settings.seo_title_suffix || '| Autohus Kvik'}</title>
        <meta
          name="description"
          content="Bestil tid på vores værksted i Hvidovre online. Vælg ydelser, dato og eventuel lånebil på få minutter."
        />
      </Helmet>

      {/* Hero Header */}
      <section className="booking-hero">
        <div className="container">
          <span className="section-label">Online tidsbestilling</span>
          <h1 className="booking-hero__title">Book tid på værkstedet</h1>
          <p className="booking-hero__sub">
            Gennemfør bestillingen trin for trin. Vi bekræfter din værkstedstid hurtigt på SMS eller e-mail.
          </p>
        </div>
      </section>

      <div className="container booking-container">
        {submitted ? (
          <div className="booking-success-box">
            <CheckCircle size={56} className="success-icon" />
            <h2>Tak for din tidsbestilling!</h2>
            <p>
              Vi har modtaget din værkstedsbooking til d. <strong>{formData.preferredDate}</strong> ({formData.preferredTimeSlot === 'morning' ? 'Formiddag 08:00 - 12:00' : 'Eftermiddag 12:00 - 16:00'}).
            </p>
            <p className="success-sub">
              En mekaniker gennemgår bookingen og sender en bekræftelse på <strong>{formData.customerPhone}</strong> eller <strong>{formData.customerEmail}</strong>.
            </p>
            <div className="success-actions">
              <Link to="/" className="btn btn-primary">Tilbage til forsiden</Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(1);
                }}
                className="btn btn-secondary"
              >
                Book endnu en tid
              </button>
            </div>
          </div>
        ) : (
          <div className="booking-card">
            {/* Step Progress Bar */}
            <div className="step-bar">
              {[
                { n: 1, label: 'Bil' },
                { n: 2, label: 'Ydelse' },
                { n: 3, label: 'Beskrivelse' },
                { n: 4, label: 'Lånebil' },
                { n: 5, label: 'Dato & tid' },
                { n: 6, label: 'Kunde' },
                { n: 7, label: 'Bekræft' },
              ].map((s) => (
                <div key={s.n} className={`step-dot-wrap ${currentStep >= s.n ? 'active' : ''} ${currentStep === s.n ? 'current' : ''}`}>
                  <div className="step-dot">{s.n}</div>
                  <span className="step-name">{s.label}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Trin 1: Biloplysninger */}
              {currentStep === 1 && (
                <div className="step-content">
                  <h2>Trin 1: Bilens oplysninger</h2>
                  <p className="step-desc">Hvilken bil skal på værkstedet?</p>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Nummerplade (valgfrit)</label>
                      <input
                        type="text"
                        placeholder="f.eks. AB 12 345"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mærke *</label>
                      <input
                        type="text"
                        placeholder="f.eks. Volkswagen, Ford, Peugeot"
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Model *</label>
                      <input
                        type="text"
                        placeholder="f.eks. Polo 1.2 TSI"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Årgang</label>
                      <input
                        type="number"
                        min={1995}
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Kilometertal (ca.)</label>
                      <input
                        type="number"
                        placeholder="f.eks. 110000"
                        value={formData.mileage}
                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Brændstof</label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      >
                        <option value="Benzin">Benzin</option>
                        <option value="Diesel">Diesel</option>
                        <option value="El">El</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div className="step-footer right">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (!formData.make || !formData.model) {
                          alert('Indtast venligst bilens mærke og model.');
                          return;
                        }
                        setCurrentStep(2);
                      }}
                    >
                      Næste: Vælg ydelse <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Trin 2: Ydelser */}
              {currentStep === 2 && (
                <div className="step-content">
                  <h2>Trin 2: Hvad skal vi hjælpe med?</h2>
                  <p className="step-desc">Vælg én eller flere ydelser.</p>

                  <div className="services-selection-grid">
                    {AVAILABLE_SERVICES.map((s) => {
                      const isSelected = formData.selectedServices.includes(s.label);
                      return (
                        <div
                          key={s.id}
                          className={`service-select-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleService(s.label)}
                        >
                          <div className="select-check">
                            {isSelected ? <CheckCircle size={20} /> : <div className="empty-circle" />}
                          </div>
                          <div className="select-info">
                            <strong>{s.label}</strong>
                            <span>{s.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="step-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (formData.selectedServices.length === 0) {
                          alert('Vælg venligst mindst én ydelse.');
                          return;
                        }
                        setCurrentStep(3);
                      }}
                    >
                      Næste: Beskrivelse <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Trin 3: Beskrivelse */}
              {currentStep === 3 && (
                <div className="step-content">
                  <h2>Trin 3: Beskriv dit ønske eller problem</h2>
                  <p className="step-desc">Har du specifikke symptomer, lyde eller ekstra ønsker?</p>

                  <div className="form-group">
                    <label>Uddybende beskrivelse (valgfrit)</label>
                    <textarea
                      rows={5}
                      placeholder="f.eks.: Bremsen piber lidt ved hård opbremsning. Tjek også gerne lygterne, da den snart skal til syn."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="step-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(4)}>
                      Næste: Lånebil <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Trin 4: Lånebil */}
              {currentStep === 4 && (
                <div className="step-content">
                  <h2>Trin 4: Har du brug for en lånebil?</h2>
                  <p className="step-desc">Vi tilbyder udlejning/lånebil, mens din egen bil er på værkstedet.</p>

                  <div className="loaner-options">
                    <label className={`loaner-card ${!formData.needsLoanerCar ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="loaner"
                        checked={!formData.needsLoanerCar}
                        onChange={() => setFormData({ ...formData, needsLoanerCar: false })}
                      />
                      <div>
                        <strong>Nej tak</strong>
                        <p>Jeg finder selv transport eller venter hos jer.</p>
                      </div>
                    </label>

                    <label className={`loaner-card ${formData.needsLoanerCar ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="loaner"
                        checked={formData.needsLoanerCar}
                        onChange={() => setFormData({ ...formData, needsLoanerCar: true })}
                      />
                      <div>
                        <strong>Ja tak, jeg ønsker en lånebil</strong>
                        <p>Vi reserverer en bil til dig i reparationsperioden.</p>
                      </div>
                    </label>
                  </div>

                  <div className="step-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(3)}>
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(5)}>
                      Næste: Dato og tid <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Trin 5: Dato & tid */}
              {currentStep === 5 && (
                <div className="step-content">
                  <h2>Trin 5: Vælg dato og tidspunkt</h2>
                  <p className="step-desc">Hvornår passer det dig bedst at indlevere bilen?</p>

                  <div className="form-group">
                    <label>Ønsket indleveringsdato *</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tidspunkt på dagen</label>
                    <div className="timeslot-grid">
                      <label className={`timeslot-card ${formData.preferredTimeSlot === 'morning' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="timeSlot"
                          checked={formData.preferredTimeSlot === 'morning'}
                          onChange={() => setFormData({ ...formData, preferredTimeSlot: 'morning' })}
                        />
                        <Clock size={18} />
                        <div>
                          <strong>Formiddag</strong>
                          <span>08:00 - 12:00</span>
                        </div>
                      </label>

                      <label className={`timeslot-card ${formData.preferredTimeSlot === 'afternoon' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="timeSlot"
                          checked={formData.preferredTimeSlot === 'afternoon'}
                          onChange={() => setFormData({ ...formData, preferredTimeSlot: 'afternoon' })}
                        />
                        <Clock size={18} />
                        <div>
                          <strong>Eftermiddag</strong>
                          <span>12:00 - 16:00</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="step-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(4)}>
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (!formData.preferredDate) {
                          alert('Vælg venligst en dato.');
                          return;
                        }
                        setCurrentStep(6);
                      }}
                    >
                      Næste: Oplysninger <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Trin 6: Kundeoplysninger */}
              {currentStep === 6 && (
                <div className="step-content">
                  <h2>Trin 6: Dine kontaktoplysninger</h2>
                  <p className="step-desc">Hvem skal have bekræftelsen og afhentningsbeskeden?</p>

                  <div className="form-group">
                    <label>Dit fulde navn *</label>
                    <input
                      type="text"
                      placeholder="f.eks. Mette Frederiksen"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Telefonnummer *</label>
                      <input
                        type="tel"
                        placeholder="f.eks. 20123456"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>E-mail *</label>
                      <input
                        type="email"
                        placeholder="f.eks. mette@mail.dk"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Adresse og by (valgfrit)</label>
                    <input
                      type="text"
                      placeholder="f.eks. Hvidovrevej 10, 2650 Hvidovre"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    />
                  </div>

                  <div className="step-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(5)}>
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (!formData.customerName || !formData.customerPhone || !formData.customerEmail) {
                          alert('Udfyld venligst navn, telefon og e-mail.');
                          return;
                        }
                        setCurrentStep(7);
                      }}
                    >
                      Næste: Opsummering <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Trin 7: Opsummering & Bekræftelse */}
              {currentStep === 7 && (
                <div className="step-content">
                  <h2>Trin 7: Tjek og bekræft din booking</h2>
                  <p className="step-desc">Gennemgå oplysningerne inden du indsender.</p>

                  <div className="summary-box">
                    <div className="summary-row">
                      <span>Bil:</span>
                      <strong>{formData.make} {formData.model} ({formData.year}) {formData.registrationNumber && `· ${formData.registrationNumber}`}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Ydelser:</span>
                      <strong>{formData.selectedServices.join(', ')}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Dato & tid:</span>
                      <strong>{formData.preferredDate} ({formData.preferredTimeSlot === 'morning' ? 'Formiddag' : 'Eftermiddag'})</strong>
                    </div>
                    <div className="summary-row">
                      <span>Lånebil:</span>
                      <strong>{formData.needsLoanerCar ? 'Ja, ønskes' : 'Nej'}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Kontakt:</span>
                      <strong>{formData.customerName} · {formData.customerPhone} · {formData.customerEmail}</strong>
                    </div>
                    {formData.description && (
                      <div className="summary-row">
                        <span>Note:</span>
                        <span>{formData.description}</span>
                      </div>
                    )}
                  </div>

                  <div className="step-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(6)}>
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="btn btn-primary btn-lg"
                    >
                      {mutation.isPending ? 'Bekræfter booking...' : 'Bekræft og send tidsbestilling'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
