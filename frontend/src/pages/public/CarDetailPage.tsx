import { useState, useId } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Calendar, Gauge, Fuel, Settings2, Shield, Phone, Mail,
  CheckCircle, Share2, Printer, ArrowLeft, Sparkles, Send
} from 'lucide-react';
import { carsService, leadsService } from '@/services';
import { useSettings } from '@/contexts/SettingsContext';
import CarCard from '@/components/cars/CarCard';
import type { CarImage } from '@/types';
import './CarDetailPage.css';

function cleanDescriptionText(raw?: string): string[] {
  if (!raw) return [];
  
  // Decode HTML entities
  let cleaned = raw
    .replace(/&#x1f4cd;/gi, '📍 ')
    .replace(/&#x1f4de;/gi, '📞 ')
    .replace(/&#43;/g, '+')
    .replace(/&#x[0-9a-f]+;/gi, '')
    .replace(/&#[0-9]+;/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Split lines & filter out old holiday notices
  const lines = cleaned.split('\n');
  const filtered = lines.filter(line => {
    const l = line.toLowerCase();
    if (
      l.includes('sommerferie') ||
      l.includes('ferielukket') ||
      l.includes('holdt ferie') ||
      l.includes('lukket i uge') ||
      l.includes('i denne periode vil autohuset kvik være lukket') ||
      l.includes('god sommer') ||
      l.includes('fra 16. juli') ||
      l.includes('i ferieperioden') ||
      l.includes('kære kunder') && (l.includes('ferie') || l.includes('lukket'))
    ) {
      return false;
    }
    return true;
  });

  return filtered.map(l => l.trim()).filter(Boolean);
}

export default function CarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'finance'>('details');

  // Financing calculator state
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [loanPeriodMonths, setLoanPeriodMonths] = useState(84);
  const [interestRate] = useState(4.95);

  // Form states
  const [leadType, setLeadType] = useState<'test_drive' | 'contact' | 'trade_in'>('test_drive');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    preferredDate: '',
    tradeInCar: '',
  });

  const testDriveDateId = useId();
  const formNameId = useId();
  const formPhoneId = useId();
  const formEmailId = useId();
  const formMsgId = useId();
  const tradeInCarId = useId();

  // Fetch Car
  const { data: car, isLoading, error } = useQuery({
    queryKey: ['car', slug],
    queryFn: () => carsService.getCar(slug || ''),
    enabled: !!slug,
  });

  // Fetch related cars
  const { data: relatedData } = useQuery({
    queryKey: ['related-cars', car?.make],
    queryFn: () => carsService.getCars({ make: car?.make, pageSize: 4 }),
    enabled: !!car?.make,
  });

  // Lead submit mutation
  const leadMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => leadsService.submitLead(payload),
    onSuccess: () => {
      setFormSubmitted(true);
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    leadMutation.mutate({
      type: leadType,
      carId: car.id,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: `${formData.message} ${formData.preferredDate ? `\nØnsket dato: ${formData.preferredDate}` : ''} ${formData.tradeInCar ? `\nByttebil: ${formData.tradeInCar}` : ''}`,
    });
  };

  const scrollToForm = (type: 'test_drive' | 'contact') => {
    setLeadType(type);
    const el = document.getElementById('booking-form-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const shareCar = () => {
    if (navigator.share) {
      navigator.share({
        title: `${car?.make} ${car?.model} ${car?.variant || ''}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Linket til bilen er kopieret til din udklipsholder!');
    }
  };

  if (isLoading) {
    return (
      <div className="container car-detail-loading">
        <div className="skeleton-detail-hero" />
        <div className="skeleton-detail-body" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container car-detail-notfound">
        <h2>Bilen blev ikke fundet</h2>
        <p>Den efterspurgte bil kan være solgt eller flyttet.</p>
        <Link to="/biler" className="btn btn-primary">
          <ArrowLeft size={16} /> Se alle aktuelle biler
        </Link>
      </div>
    );
  }

  // Financial calculations
  const price = car.price || 0;
  const downPaymentAmount = Math.round((price * downPaymentPct) / 100);
  const loanAmount = Math.max(0, price - downPaymentAmount);
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = loanAmount > 0
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanPeriodMonths)) / (Math.pow(1 + monthlyRate, loanPeriodMonths) - 1))
    : 0;

  const getImgSrc = (img?: CarImage | null): string => {
    if (!img) return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80';
    return img.filePath || img.webPPath || img.thumbnailPath || img.url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80';
  };

  const images: CarImage[] = car.images && car.images.length > 0
    ? car.images
    : [{ id: 0, url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 0 }];

  const currentImage = images[activeImageIndex] || images[0];

  const titleSuffix = settings.seo_title_suffix || '| Autohus Kvik';
  const pageTitle = `${car.make} ${car.model} ${car.variant || ''} (${car.year}) ${titleSuffix}`;
  const carDescription = car.description || `Køb brugt ${car.make} ${car.model} ${car.year} hos Autohus Kvik i Hvidovre. Flot stand, km ${car.mileage.toLocaleString('da-DK')}. Finansiering tilbydes.`;

  const descParagraphs = cleanDescriptionText(car.description);
  const filteredRelatedCars = ((relatedData as any)?.cars || []).filter((c: any) => c.id !== car.id);

  return (
    <div className="car-detail-page">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={carDescription} />
        <meta property="og:title" content={`${car.make} ${car.model} - Autohus Kvik`} />
        <meta property="og:description" content={carDescription} />
        <meta property="og:image" content={getImgSrc(currentImage)} />
      </Helmet>

      {/* Breadcrumb & Navigation */}
      <div className="car-detail-breadcrumb container">
        <button onClick={() => navigate(-1)} className="back-link">
          <ArrowLeft size={16} /> Tilbage til biler
        </button>
        <div className="breadcrumb-trail">
          <Link to="/">Forside</Link> / <Link to="/biler">Biler til salg</Link> / <span>{car.make} {car.model}</span>
        </div>
        <div className="car-detail-actions">
          <button onClick={shareCar} className="action-btn" title="Del denne bil">
            <Share2 size={16} /> <span>Del</span>
          </button>
          <button onClick={() => window.print()} className="action-btn" title="Udskriv annonce">
            <Printer size={16} /> <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Gallery + Right Simple Price Card */}
      <div className="container car-detail-grid">
        {/* Left Column: Image & Gallery */}
        <div className="car-detail-main">
          {/* Gallery */}
          <div className="car-gallery">
            <div className="main-image-wrap">
              <img
                src={getImgSrc(currentImage)}
                alt={`${car.make} ${car.model} billede ${activeImageIndex + 1}`}
                className="main-image"
              />
              <span className={`detail-status-badge badge-${car.status}`}>
                {car.status === 'for_sale' ? 'Til salg' : car.status === 'reserved' ? 'Reserveret' : 'Solgt'}
              </span>
              <div className="image-counter">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {images.length > 1 && (
              <div className="thumbnails-wrap">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    className={`thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={getImgSrc(img)} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="car-tabs">
            <button
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Beskrivelse
            </button>
            <button
              className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifikationer
            </button>
            <button
              className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
              onClick={() => setActiveTab('finance')}
            >
              Finansiering
            </button>
          </div>

          {/* Tab Content: Details */}
          {activeTab === 'details' && (
            <div className="tab-pane car-description-pane">
              <h2>Om denne {car.make} {car.model}</h2>
              <div className="description-text">
                {descParagraphs.length > 0 ? (
                  descParagraphs.map((para, i) => <p key={i}>{para}</p>)
                ) : (
                  <p>
                    Super velholdt {car.make} {car.model} med {car.fuelType}-motor og {car.transmission}-gear.
                    Bilen er kosmetisk og mekanisk gennemgået af vores værksted og leveres professionelt klargjort.
                  </p>
                )}
              </div>

              {/* Udstyrsliste */}
              {car.equipment && car.equipment.length > 0 && (
                <div className="car-features-section">
                  <h3>Fremhævet udstyr</h3>
                  <div className="features-grid">
                    {car.equipment.map((item, idx) => (
                      <div key={idx} className="feature-pill">
                        <CheckCircle size={14} className="pill-check" />
                        <span>{typeof item === 'string' ? item : (item as any).name || ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Specs */}
          {activeTab === 'specs' && (
            <div className="tab-pane car-specs-pane">
              <h2>Fuld specifikation</h2>
              <div className="specs-table">
                <div className="spec-row">
                  <span className="spec-name">Mærke</span>
                  <span className="spec-val">{car.make}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Model</span>
                  <span className="spec-val">{car.model}</span>
                </div>
                {car.variant && (
                  <div className="spec-row">
                    <span className="spec-name">Variant</span>
                    <span className="spec-val">{car.variant}</span>
                  </div>
                )}
                <div className="spec-row">
                  <span className="spec-name">Årgang</span>
                  <span className="spec-val">{car.year}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Kilometertal</span>
                  <span className="spec-val">{car.mileage.toLocaleString('da-DK')} km</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Brændstof</span>
                  <span className="spec-val">{car.fuelType}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Gearkasse</span>
                  <span className="spec-val">{car.transmission}</span>
                </div>
                {car.fuelConsumptionKmPerL && (
                  <div className="spec-row">
                    <span className="spec-name">Brændstofforbrug</span>
                    <span className="spec-val">{car.fuelConsumptionKmPerL} km/l</span>
                  </div>
                )}
                {car.horsepower && (
                  <div className="spec-row">
                    <span className="spec-name">Hestekræfter</span>
                    <span className="spec-val">{car.horsepower} hk</span>
                  </div>
                )}
                {car.bodyType && (
                  <div className="spec-row">
                    <span className="spec-name">Karrosseri</span>
                    <span className="spec-val">{car.bodyType}</span>
                  </div>
                )}
                {car.color && (
                  <div className="spec-row">
                    <span className="spec-name">Farve</span>
                    <span className="spec-val">{car.color}</span>
                  </div>
                )}
                {car.doors && (
                  <div className="spec-row">
                    <span className="spec-name">Døre</span>
                    <span className="spec-val">{car.doors}</span>
                  </div>
                )}
                {car.vin && (
                  <div className="spec-row">
                    <span className="spec-name">Stelnummer (VIN)</span>
                    <span className="spec-val">{car.vin}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Finance */}
          {activeTab === 'finance' && (
            <div className="tab-pane car-finance-pane">
              <h2>Beregn finansiering</h2>
              <p>Få et overblik over den månedlige ydelse ved køb af denne bil.</p>

              <div className="calc-box">
                <div className="calc-row">
                  <div className="calc-label">
                    <span>Udbetaling ({downPaymentPct}%):</span>
                    <strong>{downPaymentAmount.toLocaleString('da-DK')} kr.</strong>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={5}
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="calc-slider"
                  />
                </div>

                <div className="calc-row">
                  <div className="calc-label">
                    <span>Løbetid:</span>
                    <strong>{loanPeriodMonths} mdr. ({Math.round(loanPeriodMonths / 12)} år)</strong>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={96}
                    step={12}
                    value={loanPeriodMonths}
                    onChange={(e) => setLoanPeriodMonths(Number(e.target.value))}
                    className="calc-slider"
                  />
                </div>

                <div className="calc-result">
                  <div className="calc-result-main">
                    <span>Estimeret månedlig ydelse:</span>
                    <strong className="monthly-figure">{monthlyPayment.toLocaleString('da-DK')} kr./mdr.</strong>
                  </div>
                  <small className="calc-disclaimer">
                    Beregningen er vejledende og baseret på en variabel rente på {interestRate}%. Endeligt lånetilbud kræver kreditgodkendelse.
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Clean Simple Price Box ONLY */}
        <div className="car-detail-sidebar">
          <div className="detail-price-card">
            <div className="price-header">
              <h1>{car.make} {car.model}</h1>
              {car.variant && <span className="car-variant-tag">{car.variant}</span>}
            </div>

            <div className="price-tag-wrap">
              <div className="main-price">
                {car.price ? `${car.price.toLocaleString('da-DK')} kr.` : 'Ring for pris'}
              </div>
              {monthlyPayment > 0 && (
                <div className="sub-monthly">
                  eller ca. <strong>{monthlyPayment.toLocaleString('da-DK')} kr./mdr.</strong>
                </div>
              )}
            </div>

            {/* Quick Specs */}
            <div className="detail-quick-specs">
              <div className="spec-badge">
                <Calendar size={18} />
                <span>{car.year}</span>
              </div>
              <div className="spec-badge">
                <Gauge size={18} />
                <span>{car.mileage.toLocaleString('da-DK')} km</span>
              </div>
              <div className="spec-badge">
                <Fuel size={18} />
                <span>{car.fuelType}</span>
              </div>
              <div className="spec-badge">
                <Settings2 size={18} />
                <span>{car.transmission}</span>
              </div>
            </div>

            {/* 3 Clear Action Buttons */}
            <div className="price-actions">
              <a href={`tel:${(settings.company_phone || '+4550290874').replace(/\s/g, '')}`} className="btn btn-primary btn-block">
                <Phone size={18} /> Ring til os: {settings.company_phone || '+45 50 29 08 74'}
              </a>
              <button
                className="btn btn-secondary btn-block"
                onClick={() => scrollToForm('test_drive')}
              >
                <Calendar size={18} /> Book prøvekørsel
              </button>
              <button
                className="btn btn-outline btn-block"
                onClick={() => scrollToForm('contact')}
              >
                <Mail size={18} /> Send besked
              </button>
            </div>

            {/* Trust Mini Badges */}
            <div className="detail-trust-minibadges">
              <div className="trust-mini-item">
                <Shield size={16} /> <span>Mekanisk klargjort & Nysynet</span>
              </div>
              <div className="trust-mini-item">
                <Sparkles size={16} /> <span>Eget værksted i Hvidovre</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Contact & Booking Form Section AT THE BOTTOM */}
      <div className="container car-bottom-contact-section" id="booking-form-anchor">
        <div className="bottom-contact-card">
          <div className="section-title-wrap">
            <span className="section-subtitle">Personlig Betjening</span>
            <h2>Kontakt os angående {car.make} {car.model}</h2>
            <p>Udfyld formularen for at booke en prøvekørsel, få et uforpligtende byttetilbud eller stille et spørgsmål.</p>
          </div>

          <div className="form-type-selector">
            <button
              className={`type-btn ${leadType === 'test_drive' ? 'active' : ''}`}
              onClick={() => setLeadType('test_drive')}
            >
              <Calendar size={16} style={{ display: 'inline', marginRight: 6 }} /> Book prøvekørsel
            </button>
            <button
              className={`type-btn ${leadType === 'trade_in' ? 'active' : ''}`}
              onClick={() => setLeadType('trade_in')}
            >
              Få byttepris
            </button>
            <button
              className={`type-btn ${leadType === 'contact' ? 'active' : ''}`}
              onClick={() => setLeadType('contact')}
            >
              <Mail size={16} style={{ display: 'inline', marginRight: 6 }} /> Send besked / Spørgsmål
            </button>
          </div>

          {formSubmitted ? (
            <div className="form-success-message">
              <CheckCircle size={48} className="success-icon" />
              <h3>Mange tak for din henvendelse!</h3>
              <p>Vi har modtaget dine oplysninger angående {car.make} {car.model} og kontakter dig hurtigst muligt.</p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setFormSubmitted(false)}
              >
                Send en ny besked
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="lead-spacious-form">
              {leadType === 'test_drive' && (
                <div className="form-field">
                  <label htmlFor={testDriveDateId}>Ønsket dato & tidspunkt for prøvekørsel</label>
                  <input
                    id={testDriveDateId}
                    type="datetime-local"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData(d => ({ ...d, preferredDate: e.target.value }))}
                    required
                  />
                </div>
              )}

              {leadType === 'trade_in' && (
                <div className="form-field">
                  <label htmlFor={tradeInCarId}>Din nuværende bil (Mærke, model, årgang, km)</label>
                  <input
                    id={tradeInCarId}
                    type="text"
                    placeholder="f.eks. VW Golf VII 2017, 120.000 km"
                    value={formData.tradeInCar}
                    onChange={(e) => setFormData(d => ({ ...d, tradeInCar: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-field">
                  <label htmlFor={formNameId}>Dit fulde navn</label>
                  <input
                    id={formNameId}
                    type="text"
                    placeholder="f.eks. Anders Jensen"
                    value={formData.name}
                    onChange={(e) => setFormData(d => ({ ...d, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor={formPhoneId}>Telefonnummer</label>
                  <input
                    id={formPhoneId}
                    type="tel"
                    placeholder="f.eks. 20123456"
                    value={formData.phone}
                    onChange={(e) => setFormData(d => ({ ...d, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor={formEmailId}>E-mailadresse</label>
                <input
                  id={formEmailId}
                  type="email"
                  placeholder="f.eks. anders@mail.dk"
                  value={formData.email}
                  onChange={(e) => setFormData(d => ({ ...d, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor={formMsgId}>Eventuel besked (valgfrit)</label>
                <textarea
                  id={formMsgId}
                  rows={3}
                  placeholder="Skriv dine ønsker eller spørgsmål her..."
                  value={formData.message}
                  onChange={(e) => setFormData(d => ({ ...d, message: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={leadMutation.isPending}
                className="lead-submit-btn"
              >
                <Send size={18} />
                <span>{leadMutation.isPending ? 'Sender henvendelse...' : 'Send henvendelse til Autohus Kvik'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Related Cars Section - ONLY SHOWN IF THERE ARE OTHER CARS */}
      {filteredRelatedCars.length > 0 && (
        <section className="related-cars-section container">
          <div className="section-header">
            <h2>Lignende biler på lager</h2>
            <Link to="/biler" className="see-more-link">Se alle biler →</Link>
          </div>
          <div className="grid-3">
            {filteredRelatedCars.slice(0, 3).map((relatedCar: any) => (
              <CarCard key={relatedCar.id} car={relatedCar} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
