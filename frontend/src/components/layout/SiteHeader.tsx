import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import './SiteHeader.css';

const navLinks = [
  { to: '/', label: 'Forside', exact: true },
  { to: '/biler', label: 'Biler til salg' },
  { to: '/saelg-eller-byt', label: 'Sælg eller byt' },
  { to: '/tjek-bil', label: 'Tjek bil' },
  {
    to: '/vaerksted',
    label: 'Værksted',
    children: [
      { to: '/vaerksted', label: 'Alle ydelser' },
      { to: '/vaerksted/serviceeftersyn', label: 'Serviceeftersyn' },
      { to: '/vaerksted/reparation-fejlfinding', label: 'Reparation' },
      { to: '/vaerksted/daekskifte', label: 'Dækskifte' },
      { to: '/vaerksted/synstjek', label: 'Synstjek' },
      { to: '/vaerksted/rudeskift', label: 'Rudeskift' },
      { to: '/vaerksted/autohjaelp', label: 'Autohjælp' },
    ],
  },
  { to: '/finansiering', label: 'Finansiering' },
  { to: '/om-os', label: 'Om os' },
  { to: '/kontakt', label: 'Kontakt' },
];

export default function SiteHeader() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Luk menu ved rute-ændring
  useEffect(() => { setIsOpen(false); }, []);

  const phone = settings.company_phone ?? '+45 50 29 08 74';

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo" aria-label="Autohus Kvik – Forside">
            {settings.logo_path ? (
              <img src={settings.logo_path} alt="Autohus Kvik logo" height={40} />
            ) : (
              <div className="logo-text">
                <span className="logo-main">Autohus</span>
                <span className="logo-accent">Kvik</span>
              </div>
            )}
          </Link>

          {/* Desktop navigation */}
          <nav className="header-nav" aria-label="Hovedmenu">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="nav-dropdown"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => `nav-link nav-dropdown-trigger ${isActive ? 'active' : ''}`}
                    aria-expanded={openDropdown === link.label}
                    aria-haspopup="menu"
                    onClick={() => setOpenDropdown(null)}
                  >
                    {link.label}
                    <ChevronDown size={14} className={openDropdown === link.label ? 'rotate' : ''} />
                  </NavLink>
                  {openDropdown === link.label && (
                    <div className="dropdown-menu" role="menu">
                      {link.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className="dropdown-item"
                          role="menuitem"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to!}
                  end={link.exact}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </NavLink>
              )
            )}
          </nav>

          {/* Header actions */}
          <div className="header-actions">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="header-phone" aria-label={`Ring til os: ${phone}`}>
              <Phone size={16} />
              <span>{phone}</span>
            </a>
            <Link to="/book-vaerksted" className="btn btn-primary btn-sm">
              Book værksted
            </Link>

            {/* Mobil menu knap */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Luk menu' : 'Åbn menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil menu */}
      {isOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Mobilmenu">
          <nav aria-label="Mobilnavigation">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="mobile-nav-group">
                  <span className="mobile-nav-label">{link.label}</span>
                  {link.children.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      className="mobile-nav-link sub"
                      onClick={() => setIsOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to!}
                  className="mobile-nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="mobile-menu-cta">
              <Link to="/book-vaerksted" className="btn btn-primary btn-full" onClick={() => setIsOpen(false)}>
                Book værksted
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
