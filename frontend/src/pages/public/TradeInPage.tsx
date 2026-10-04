import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import {
  CheckCircle, UploadCloud, ArrowRight, ArrowLeft,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { tradeInService } from '@/services';
import { useSettings } from '@/contexts/SettingsContext';
import tradeInHeroBg from '@/assets/trade_in.jpg';
import './TradeInPage.css';

export default function TradeInPage() {
  const { settings } = useSettings();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear() - 5,
    mileage: '',
    fuelType: 'Benzin',
    transmission: 'Automatisk',
    condition: 'God',
    intent: 'sell', // 'sell' | 'trade'
    desiredCarId: '',
    name: '',
    phone: '',
    email: '',
    postalCode: '',
    notes: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (fd: FormData) => tradeInService.submit(fd),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setFilePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      fd.append(key, String(val));
    });
    files.forEach((file) => {
      fd.append('photos', file);
    });
    mutation.mutate(fd);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Hvordan foregår prissætningen af min bil?',
      a: 'Vi foretager en grundig vurdering baseret på det aktuelle marked, bilens stand, kilometer, historik og udstyrsniveau. Vi giver dig et realistisk og fair tilbud.',
    },
    {
      q: 'Hvad sker der, hvis der er restgæld i bilen?',
      a: 'Det er slet intet problem. Vi indfrier restgælden direkte hos dit finansieringsselskab/bank og modregner det i handlen.',
    },
    {
      q: 'Hvor hurtigt får jeg mine penge ved et rent salg?',
      a: 'Når vi har gennemgået bilen og overdraget slutsedlen, overfører vi pengene straks via bankoverførsel.',
    },
    {
      q: 'Kan jeg bytte til en billigere bil og få penge udbetalt?',
      a: 'Ja, vi bytter både op og ned. Har din byttebil en højere værdi end den bil, du køber, udbetaler vi differencen.',
    },
  ];

  return (
    <div className="trade-in-page">
      <Helmet>
        <title>Sælg eller byt din bil i Hvidovre {settings.seo_title_suffix || '| Autohus Kvik'}</title>
        <meta
          name="description"
          content="Få et uforpligtende og hurtigt tilbud på din bil hos Autohus Kvik i Hvidovre. Vi køber biler kontant eller tager dem i bytte."
        />
      </Helmet>

      {/* Header Banner */}
      <section className="trade-hero">
        <div className="trade-hero__bg">
          <img src={tradeInHeroBg} alt="Sælg eller byt bil hos Autohus Kvik" className="trade-hero__bg-img" />
          <div className="trade-hero__overlay" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="section-label">Bilsalg og byttebiler</span>
          <h1 className="trade-hero__title">Sælg eller byt din bil nemt & hurtigt</h1>
          <p className="trade-hero__sub">
            Udfyld formularen nedenfor på 2 minutter. Vi gennemgår oplysningerne og vender tilbage med et uforpligtende tilbud inden for 24 timer.
          </p>
        </div>
      </section>

      <div className="container trade-main-grid">
        {/* Main Multi-Step Form */}
        <div className="trade-form-container">
          {submitted ? (
            <div className="trade-success-box">
              <CheckCircle size={56} className="success-check-icon" />
              <h2>Mange tak for din henvendelse!</h2>
              <p>
                Vi har modtaget oplysningerne om din bil. Vores indkøbsteam gennemgår vurderingen og vender tilbage til dig på telefon eller e-mail inden for 24 timer.
              </p>
              <div className="success-action">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setCurrentStep(1);
                    setFiles([]);
                    setFilePreviews([]);
                  }}
                  className="btn btn-secondary"
                >
                  Send en ny vurdering
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="multistep-form">
              {/* Progress Steps Header */}
              <div className="step-indicator">
                <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-num">1</div>
                  <span>Biloplysninger</span>
                </div>
                <div className="step-line" />
                <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-num">2</div>
                  <span>Formål</span>
                </div>
                <div className="step-line" />
                <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-num">3</div>
                  <span>Billeder</span>
                </div>
                <div className="step-line" />
                <div className={`step-item ${currentStep >= 4 ? 'active' : ''}`}>
                  <div className="step-num">4</div>
                  <span>Kontakt</span>
                </div>
              </div>

              {/* Step 1: Biloplysninger */}
              {currentStep === 1 && (
                <div className="form-step-pane">
                  <h2>Trin 1: Fortæl os om din bil</h2>
                  <p className="step-subtext">Indtast basisoplysninger om den bil, du ønsker at sælge eller bytte.</p>

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
                        placeholder="f.eks. Volkswagen, Ford, Audi"
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Model & Variant *</label>
                      <input
                        type="text"
                        placeholder="f.eks. Golf 1.4 TSI R-Line"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Årgang *</label>
                      <input
                        type="number"
                        min={1995}
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Kilometertal *</label>
                      <input
                        type="number"
                        placeholder="f.eks. 125000"
                        value={formData.mileage}
                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                        required
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

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Gearkasse</label>
                      <select
                        value={formData.transmission}
                        onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      >
                        <option value="Automatisk">Automatgear</option>
                        <option value="Manuel">Manuel</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Bilens generelle stand</label>
                      <select
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      >
                        <option value="Perfekt">Perfekt / Som ny</option>
                        <option value="Rigtig god">Rigtig god stand</option>
                        <option value="God">God - almindelige brugsspor</option>
                        <option value="Middel">Middel - har kosmetiske fejl</option>
                        <option value="Defekt">Defekt / Skal have reparation</option>
                      </select>
                    </div>
                  </div>

                  <div className="step-actions right">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (!formData.make || !formData.model || !formData.mileage) {
                          alert('Udfyld venligst mærke, model og kilometertal for at fortsætte.');
                          return;
                        }
                        setCurrentStep(2);
                      }}
                    >
                      Fortsæt til formål <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Formål */}
              {currentStep === 2 && (
                <div className="form-step-pane">
                  <h2>Trin 2: Hvad ønsker du?</h2>
                  <p className="step-subtext">Vælg om du udelukkende vil sælge, eller om du vil bytte til en af vores biler.</p>

                  <div className="intent-selector">
                    <label className={`intent-card ${formData.intent === 'sell' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="intent"
                        value="sell"
                        checked={formData.intent === 'sell'}
                        onChange={() => setFormData({ ...formData, intent: 'sell' })}
                      />
                      <div className="intent-card-content">
                        <h3>Rent salg</h3>
                        <p>Jeg vil blot sælge min bil til jer og modtage kontant udbetaling på kontoen.</p>
                      </div>
                    </label>

                    <label className={`intent-card ${formData.intent === 'trade' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="intent"
                        value="trade"
                        checked={formData.intent === 'trade'}
                        onChange={() => setFormData({ ...formData, intent: 'trade' })}
                      />
                      <div className="intent-card-content">
                        <h3>Byttebil</h3>
                        <p>Jeg vil bruge min bil som delvis betaling til køb af en bil på jeres lager.</p>
                      </div>
                    </label>
                  </div>

                  {formData.intent === 'trade' && (
                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                      <label>Hvilken bil på vores lager er du interesseret i? (valgfrit)</label>
                      <input
                        type="text"
                        placeholder="f.eks. Audi A4 eller link/titel på bilen"
                        value={formData.desiredCarId}
                        onChange={(e) => setFormData({ ...formData, desiredCarId: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="step-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setCurrentStep(3)}
                    >
                      Fortsæt til billeder <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Billeder */}
              {currentStep === 3 && (
                <div className="form-step-pane">
                  <h2>Trin 3: Tilføj billeder (valgfrit)</h2>
                  <p className="step-subtext">
                    Billeder af bilen (udvendigt og indvendigt) gør det muligt for os at give dig en markant mere præcis vurdering.
                  </p>

                  <div className="upload-dropzone">
                    <UploadCloud size={40} className="dropzone-icon" />
                    <p className="dropzone-title">Klik for at vælge eller træk billeder hertil</p>
                    <span className="dropzone-hint">JPG, PNG eller WebP op til 10 MB pr. billede</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                  </div>

                  {filePreviews.length > 0 && (
                    <div className="previews-grid">
                      {filePreviews.map((src, i) => (
                        <div key={i} className="preview-thumb">
                          <img src={src} alt={`Upload ${i + 1}`} />
                          <button
                            type="button"
                            className="remove-thumb-btn"
                            onClick={() => removeFile(i)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="step-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setCurrentStep(4)}
                    >
                      Fortsæt til kontaktoplysninger <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Kontakt */}
              {currentStep === 4 && (
                <div className="form-step-pane">
                  <h2>Trin 4: Kontaktoplysninger</h2>
                  <p className="step-subtext">Hvor skal vi sende vurderingen og tilbuddet hen?</p>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Fulde navn *</label>
                      <input
                        type="text"
                        placeholder="f.eks. Peter Hansen"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefonnummer *</label>
                      <input
                        type="tel"
                        placeholder="f.eks. 30123456"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>E-mailadresse *</label>
                      <input
                        type="email"
                        placeholder="f.eks. peter@mail.dk"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Postnummer (valgfrit)</label>
                      <input
                        type="text"
                        placeholder="f.eks. 2650"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Yderligere bemærkninger (udstyr, fejl, servicehistorik osv.)</label>
                    <textarea
                      rows={3}
                      placeholder="Fortæl gerne om f.eks. tandremsskift, nysynet, vinterhjul medfølger, eller hvis der er buler/ridser."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <div className="step-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(3)}
                    >
                      <ArrowLeft size={16} /> Tilbage
                    </button>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="btn btn-primary btn-lg"
                    >
                      {mutation.isPending ? 'Indsender vurdering...' : 'Send bil til vurdering'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Sidebar Info & Trust */}
        <aside className="trade-sidebar">
          <div className="trade-card-perks">
            <h3>Fordele hos Autohus Kvik</h3>
            <ul className="perks-list">
              <li>
                <CheckCircle size={18} className="perk-icon" />
                <div>
                  <strong>Svar inden for 24 timer</strong>
                  <span>Hurtig personlig vurdering fra vores erfarne indkøbere.</span>
                </div>
              </li>
              <li>
                <CheckCircle size={18} className="perk-icon" />
                <div>
                  <strong>Vi indfrier restgæld</strong>
                  <span>Du behøver ikke bekymre dig om eksisterende billån.</span>
                </div>
              </li>
              <li>
                <CheckCircle size={18} className="perk-icon" />
                <div>
                  <strong>Straks bankoverførsel</strong>
                  <span>Pengene på din konto i samme øjeblik bilen overdrages.</span>
                </div>
              </li>
              <li>
                <CheckCircle size={18} className="perk-icon" />
                <div>
                  <strong>Slip for private købere</strong>
                  <span>Ingen useriøse henvendelser eller tidskrævende prøvekørsler.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* FAQ Card */}
          <div className="trade-card-faq">
            <h3>Ofte stillede spørgsmål</h3>
            <div className="faq-accordion">
              {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => toggleFaq(i)}
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openFaq === i && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
