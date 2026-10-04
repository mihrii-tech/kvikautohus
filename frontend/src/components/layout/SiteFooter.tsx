import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import './SiteFooter.css';

export default function SiteFooter() {
  const { settings } = useSettings();

  const openingHours = settings.opening_hours
    ? JSON.parse(settings.opening_hours)
    : { monday: '10:00 - 17:00', tuesday: '10:00 - 17:00', wednesday: '10:00 - 17:00',
        thursday: '10:00 - 17:00', friday: '10:00 - 16:00', saturday: 'Lukket', sunday: '12:00 - 16:00' };

  const dayNames: Record<string, string> = {
    monday: 'Mandag', tuesday: 'Tirsdag', wednesday: 'Onsdag',
    thursday: 'Torsdag', friday: 'Fredag', saturday: 'Lørdag', sunday: 'Søndag'
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Om os */}
            <div className="footer-col footer-about">
              <div className="footer-logo">
                <span className="logo-main">Autohus</span>
                <span className="logo-accent">Kvik</span>
              </div>
              <p className="footer-tagline">
                Din lokale bilforhandler i Hvidovre med bilsalg, byttebiler og eget værksted.
                Vi hjælper dig med at finde den rigtige bil til den rigtige pris.
              </p>
              <div className="footer-social">
                {settings.social_facebook && (
                  <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {settings.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="footer-col">
              <h3 className="footer-heading">Navigation</h3>
              <nav aria-label="Footer navigation">
                <Link to="/">Forside</Link>
                <Link to="/biler">Biler til salg</Link>
                <Link to="/saelg-eller-byt">Sælg eller byt din bil</Link>
                <Link to="/vaerksted">Værksted og ydelser</Link>
                <Link to="/finansiering">Finansiering og garanti</Link>
                <Link to="/om-os">Om Autohus Kvik</Link>
                <Link to="/kontakt">Kontakt</Link>
                <Link to="/book-vaerksted">Book værksted</Link>
              </nav>
            </div>

            {/* Kontakt */}
            <div className="footer-col">
              <h3 className="footer-heading">Kontakt</h3>
              <div className="footer-contact">
                <a href={`tel:${(settings.company_phone ?? '+4550290874').replace(/\s/g, '')}`} className="footer-contact-item">
                  <Phone size={16} />
                  <span>{settings.company_phone ?? '+45 50 29 08 74'}</span>
                </a>
                <a href={`mailto:${settings.company_email ?? 'kontakt@autohusetkvik.dk'}`} className="footer-contact-item">
                  <Mail size={16} />
                  <span>{settings.company_email ?? 'kontakt@autohusetkvik.dk'}</span>
                </a>
                <div className="footer-contact-item">
                  <MapPin size={16} />
                  <span>{settings.company_address ?? 'Gammel Køge Landevej 477, 2650 Hvidovre'}</span>
                </div>
              </div>

              {/* Nødnummer */}
              <div className="footer-emergency">
                <AlertCircle size={16} />
                <div>
                  <div className="footer-emergency-label">Nødnummer – Autohjælp</div>
                  <a href={`tel:${(settings.company_emergency_phone ?? '+4550290874').replace(/\s/g, '')}`}>
                    {settings.company_emergency_phone ?? '+45 50 29 08 74'}
                  </a>
                </div>
              </div>
            </div>

            {/* Åbningstider */}
            <div className="footer-col">
              <h3 className="footer-heading">
                <Clock size={16} style={{ display: 'inline', marginRight: 6 }} />
                Åbningstider
              </h3>
              <div className="footer-hours">
                {Object.entries(openingHours).map(([day, hours]) => (
                  <div key={day} className="hours-row">
                    <span className="hours-day">{dayNames[day] ?? day}</span>
                    <span className="hours-time">{String(hours)}</span>
                  </div>
                ))}
                <p className="hours-note">E-mails besvares alle ugens dage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p>
              © {new Date().getFullYear()} Autohus Kvik ApS · CVR: {settings.company_cvr ?? '44047470'}
            </p>
            <div className="footer-legal-links">
              <Link to="/privatlivspolitik">Privatlivspolitik</Link>
              <Link to="/cookiepolitik">Cookiepolitik</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
