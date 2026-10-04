import { Link } from 'react-router-dom';
import { Phone, Wrench, Car } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import './MobileBar.css';

export default function MobileBar() {
  const { settings } = useSettings();
  const phone = settings.company_phone ?? '+45 50 29 08 74';

  return (
    <div className="mobile-bar" role="navigation" aria-label="Hurtig adgang">
      <a
        href={`tel:${phone.replace(/\s/g, '')}`}
        className="mobile-bar-btn"
        aria-label={`Ring til os: ${phone}`}
      >
        <Phone size={20} />
        <span>Ring</span>
      </a>
      <Link to="/book-vaerksted" className="mobile-bar-btn primary">
        <Wrench size={20} />
        <span>Book værksted</span>
      </Link>
      <Link to="/biler" className="mobile-bar-btn">
        <Car size={20} />
        <span>Se biler</span>
      </Link>
    </div>
  );
}
