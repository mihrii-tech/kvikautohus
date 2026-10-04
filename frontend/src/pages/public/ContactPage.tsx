import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import {
  Phone, Mail, MapPin, Clock, AlertCircle,
  CheckCircle, Send
} from 'lucide-react';
import { leadsService } from '@/services';
import { useSettings } from '@/contexts/SettingsContext';
import './ContactPage.css';

export default function ContactPage() {
  const { settings } = useSettings();

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Bilsalg',
    message: '',
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => leadsService.submitLead(payload),
    onSuccess: () => {
      setFormSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      type: 'contact',
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: `[Emne: ${formData.subject}]\n${formData.message}`,
    });
  };

  return (
    <div className="contact-page">
      <Helmet>
        <title>Kontakt Autohus Kvik i Hvidovre {settings.seo_title_suffix || '| Autohus Kvik'}</title>
        <meta
          name="description"
          content="Kontakt Autohus Kvik i Hvidovre. Ring på +45 50 29 08 74 eller besøg os på Gammel Køge Landevej 477. Vi står klar til at hjælpe dig med bilkøb og værksted."
        />
      </Helmet>

      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero__inner">
            <span className="hero-pill-tag">📍 Gammel Køge Landevej 477, Hvidovre</span>
            <h1 className="contact-hero__title">Kontakt Autohus Kvik</h1>
            <p className="contact-hero__sub">
              Har du spørgsmål til en af vores salgsbiler, brug for et uforpligtende tilbud på værkstedet, eller ønsker du at sælge/bytte din bil? Vi glæder os til at hjælpe dig.
            </p>

            <div className="contact-hero__chips">
              <span className="hero-chip">📞 Hurtigt svar pr. telefon</span>
              <span className="hero-chip">🛠️ Eget autoværksted</span>
              <span className="hero-chip">🚨 Døgnåben autohjælp: +45 50 29 08 74</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container contact-main-container">
        <div className="contact-grid">
          {/* Left Column: Direct Info & Hours */}
          <div className="contact-info-col">
            <div className="contact-card">
              <div className="contact-dealership-photo">
                <img src="/images/dealership/dealership-5.jpg" alt="Autohuset Kvik Facade & Værksted i Hvidovre" />
                <div className="photo-tag-badge">
                  <MapPin size={15} /> Gammel Køge Landevej 477, 2650 Hvidovre
                </div>
              </div>

              <h3 className="card-section-title">Kontaktoplysninger</h3>
              <div className="contact-list">
                <a href={`tel:${(settings.company_phone || '+4550290874').replace(/\s/g, '')}`} className="contact-item">
                  <div className="contact-icon"><Phone size={20} /></div>
                  <div className="item-content">
                    <span className="item-label">Hovednummer</span>
                    <strong className="item-val">{settings.company_phone || '+45 50 29 08 74'}</strong>
                  </div>
                </a>

                <a href={`mailto:${settings.company_email || 'kontakt@autohusetkvik.dk'}`} className="contact-item">
                  <div className="contact-icon"><Mail size={20} /></div>
                  <div className="item-content">
                    <span className="item-label">E-mailadresse</span>
                    <strong className="item-val">{settings.company_email || 'kontakt@autohusetkvik.dk'}</strong>
                  </div>
                </a>

                <div className="contact-item">
                  <div className="contact-icon"><MapPin size={20} /></div>
                  <div className="item-content">
                    <span className="item-label">Adresse</span>
                    <strong className="item-val">{settings.company_address || 'Gammel Køge Landevej 477, 2650 Hvidovre'}</strong>
                  </div>
                </div>
              </div>

              {/* Nødnummer / Akut hjælp */}
              <div className="emergency-alert-card">
                <div className="emergency-icon-wrap">
                  <AlertCircle size={24} className="alert-icon" />
                </div>
                <div>
                  <strong>Døgnvagt – Autohjælp & Akut assistance</strong>
                  <p>Ved nedbrud eller akut bugsering uden for åbningstid:</p>
                  <a href={`tel:${(settings.company_emergency_phone || '+4550290874').replace(/\s/g, '')}`}>
                    📞 {settings.company_emergency_phone || '+45 50 29 08 74'}
                  </a>
                </div>
              </div>

              {/* Åbningstider */}
              <div className="contact-hours-block">
                <h4 className="hours-title">
                  <Clock size={18} />
                  Åbningstider
                </h4>
                <div className="hours-table">
                  <div className="hours-row">
                    <span>Mandag – Torsdag:</span>
                    <strong>10:00 – 17:00</strong>
                  </div>
                  <div className="hours-row">
                    <span>Fredag:</span>
                    <strong>10:00 – 16:00</strong>
                  </div>
                  <div className="hours-row closed">
                    <span>Lørdag:</span>
                    <strong className="closed-tag">Lukket</strong>
                  </div>
                  <div className="hours-row highlight-sun">
                    <span>Søndag:</span>
                    <strong>12:00 – 16:00</strong>
                  </div>
                </div>
                <p className="hours-note">E-mails og henvendelser besvares løbende alle ugens dage.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <div className="form-card-header">
                <span className="form-badge">Direkte besked</span>
                <h3>Send os en besked</h3>
                <p className="form-sub">Udfyld formularen – vi besvarer din henvendelse hurtigst muligt.</p>
              </div>

              {formSubmitted ? (
                <div className="form-success-box">
                  <div className="success-icon-wrap">
                    <CheckCircle size={48} className="success-icon" />
                  </div>
                  <h4>Tak for din henvendelse!</h4>
                  <p>Vi har modtaget din besked og kontakter dig inden for kort tid.</p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', subject: 'Bilsalg', message: '' });
                    }}
                  >
                    Send en ny besked
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-actual-form">
                  <div className="form-group">
                    <label htmlFor="subject-select">Hvad drejer din henvendelse sig om?</label>
                    <select
                      id="subject-select"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-input-styled"
                    >
                      <option value="Bilsalg">🚗 Køb af bil / Spørgsmål til salgsbil</option>
                      <option value="Værksted">🛠️ Værksted & Serviceeftersyn</option>
                      <option value="Byttebil">🔄 Sælg eller byt min bil</option>
                      <option value="Finansiering">💳 Finansiering & Garanti</option>
                      <option value="Andet">💬 Andet</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-name">Dit fulde navn *</label>
                    <input
                      id="contact-name"
                      type="text"
                      className="form-input-styled"
                      placeholder="f.eks. Henrik Hansen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="contact-phone">Telefonnummer *</label>
                      <input
                        id="contact-phone"
                        type="tel"
                        className="form-input-styled"
                        placeholder="f.eks. 50 29 08 74"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact-email">E-mailadresse *</label>
                      <input
                        id="contact-email"
                        type="email"
                        className="form-input-styled"
                        placeholder="f.eks. henrik@mail.dk"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message">Din besked *</label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      className="form-input-styled textarea-styled"
                      placeholder="Skriv din besked her..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="btn btn-primary btn-block btn-lg submit-contact-btn"
                  >
                    <Send size={18} />
                    {mutation.isPending ? 'Sender besked...' : 'Send besked nu'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Map Card at Bottom */}
        <div className="contact-map-banner">
          <div className="map-banner-content">
            <div className="map-info">
              <span className="map-tag">FIND OS I HVIDOVRE</span>
              <h3>Besøg vores udstilling og værksted</h3>
              <p>Gammel Køge Landevej 477, 2650 Hvidovre · Tæt på motorvejen med gode parkeringsforhold.</p>
            </div>
            <a
              href="https://maps.google.com/?q=Gammel+Køge+Landevej+477,+2650+Hvidovre"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg map-nav-link"
            >
              <MapPin size={18} /> Åbn rutevejledning i Google Maps ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
