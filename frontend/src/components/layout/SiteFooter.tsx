import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import './SiteFooter.css';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const DAY_NAMES: Record<string, string> = {
  monday: 'Mandag', tuesday: 'Tirsdag', wednesday: 'Onsdag',
  thursday: 'Torsdag', friday: 'Fredag', saturday: 'Lørdag', sunday: 'Søndag',
};
const ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DEFAULT_HOURS: Record<string, string> = {
  monday: '10:00 - 17:00', tuesday: '10:00 - 17:00', wednesday: '10:00 - 17:00',
  thursday: '10:00 - 17:00', friday: '10:00 - 16:00', saturday: 'Lukket', sunday: '12:00 - 16:00',
};

function parseHours(raw?: string): Record<string, string> {
  if (!raw) return DEFAULT_HOURS;
  try { return { ...DEFAULT_HOURS, ...JSON.parse(raw) }; } catch { return DEFAULT_HOURS; }
}

function isOpenNow(hours: Record<string, string>) {
  const now = new Date();
  const today = hours[DAY_KEYS[now.getDay()]] ?? '';
  const m = today.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= +m[1] * 60 + +m[2] && mins < +m[3] * 60 + +m[4];
}

export default function SiteFooter() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [plate, setPlate] = useState('');

  const hours = parseHours(settings.opening_hours);
  const todayKey = DAY_KEYS[new Date().getDay()];
  const open = isOpenNow(hours);

  const phone = settings.company_phone ?? '+45 50 29 08 74';
  const email = settings.company_email ?? 'kontakt@autohusetkvik.dk';
  const address = settings.company_address ?? 'Gammel Køge Landevej 477, 2650 Hvidovre';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const goBook = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = plate.replace(/\s+/g, '');
    navigate(clean ? `/book-vaerksted?plate=${encodeURIComponent(clean)}` : '/book-vaerksted');
  };

  return (
    <footer className="ft" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Autohus Kvik – kontakt og links</h2>

      {/* CTA-bånd */}
      <div className="ft-cta">
        <div className="container ft-cta__inner">
          <div>
            <p className="ft-cta__title">Skal bilen på værksted?</p>
            <p className="ft-cta__sub">Indtast nummerpladen – så er du i gang.</p>
          </div>
          <form className="ft-cta__form" onSubmit={goBook}>
            <label htmlFor="footer-plate" className="sr-only">Nummerplade</label>
            <div className="ft-plate">
              <span className="ft-plate__eu">DK</span>
              <input
                id="footer-plate"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase().slice(0, 9))}
                placeholder="AB 12 345"
                autoComplete="off"
              />
            </div>
            <button type="submit" className="ft-cta__btn" id="footer-book-btn">
              Book tid <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </div>

      {/* Hovedindhold */}
      <div className="container ft-main">
        <div className="ft-brand">
          <Link to="/" className="ft-logo" aria-label="Autohus Kvik – forside">
            Autohus<span>Kvik</span>
          </Link>
          <p className="ft-about">
            Bilforhandler og autoværksted i Hvidovre. Brugte biler, byttehandel og service på alle bilmærker – under samme tag.
          </p>
          <address className="ft-contact">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="ft-contact__phone">
              <Phone size={16} /> {phone}
            </a>
            <a href={`mailto:${email}`}><Mail size={16} /> {email}</a>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin size={16} /> {address} <ArrowUpRight size={14} className="ft-ext" />
            </a>
          </address>
        </div>

        <nav className="ft-col" aria-label="Biler">
          <h3>Biler</h3>
          <Link to="/biler">Biler til salg</Link>
          <Link to="/saelg-eller-byt">Sælg eller byt din bil</Link>
          <Link to="/tjek-bil">Tjek en nummerplade</Link>
        </nav>

        <nav className="ft-col" aria-label="Værksted">
          <h3>Værksted</h3>
          <Link to="/book-vaerksted">Book værkstedstid</Link>
          <Link to="/vaerksted/serviceeftersyn">Serviceeftersyn</Link>
          <Link to="/vaerksted/synstjek">Klargøring til syn</Link>
          <Link to="/vaerksted/daekskifte">Dækskifte</Link>
          <Link to="/vaerksted">Alle ydelser</Link>
        </nav>

        <nav className="ft-col" aria-label="Autohus Kvik">
          <h3>Autohus Kvik</h3>
          <Link to="/om-os">Om os</Link>
          <Link to="/kontakt">Kontakt</Link>
          <a href={`tel:${(settings.company_emergency_phone ?? phone).replace(/\s/g, '')}`}>Døgnvagt / autohjælp</a>
        </nav>

        <div className="ft-hours">
          <h3>
            Åbningstider
            <span className={`ft-status ${open ? 'is-open' : ''}`}>{open ? 'Åben nu' : 'Lukket nu'}</span>
          </h3>
          <ul>
            {ORDER.map((d) => (
              <li key={d} className={d === todayKey ? 'is-today' : ''}>
                <span>{DAY_NAMES[d]}</span>
                <span>{(hours[d] ?? '').replace(' - ', '–')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bund */}
      <div className="ft-bottom">
        <div className="container ft-bottom__inner">
          <p>© {new Date().getFullYear()} Autohus Kvik ApS · CVR {settings.company_cvr ?? '44047470'} · Gammel Køge Landevej 477, 2650 Hvidovre</p>
          <div className="ft-legal">
            <Link to="/privatlivspolitik">Privatlivspolitik</Link>
            <Link to="/cookiepolitik">Cookiepolitik</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
