import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import './CookieBanner.css';

interface ConsentState {
  necessary: boolean;
  statistics: boolean;
  marketing: boolean;
  decided: boolean;
}

const CONSENT_KEY = 'kvik_cookie_consent';

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      setConsent(JSON.parse(stored));
    }
  }, []);

  return consent;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Forsinkelse for bedre UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (consent: { statistics: boolean; marketing: boolean }) => {
    const state: ConsentState = { ...consent, necessary: true, decided: true };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
    setShowBanner(false);

    // Indlæs analytics EFTER samtykke
    if (state.statistics || state.marketing) {
      window.dispatchEvent(new CustomEvent('cookie-consent-given', { detail: state }));
    }
  };

  const acceptAll = () => saveConsent({ statistics: true, marketing: true });
  const acceptNecessary = () => saveConsent({ statistics: false, marketing: false });
  const acceptSelected = () => saveConsent({ statistics: stats, marketing });

  if (!showBanner) return null;

  return (
    <div className="cookie-overlay" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className="cookie-banner">
        <div className="cookie-header">
          <div className="cookie-icon"><Cookie size={20} /></div>
          <h2 id="cookie-title" className="cookie-title">Vi bruger cookies</h2>
          <button className="cookie-close" onClick={acceptNecessary} aria-label="Luk og acceptér kun nødvendige">
            <X size={18} />
          </button>
        </div>

        <p className="cookie-text">
          Vi bruger cookies for at give dig den bedste oplevelse. Nødvendige cookies er altid aktive.
          Du kan vælge, om du vil tillade statistik- og marketingcookies.{' '}
          <a href="/cookiepolitik">Læs vores cookiepolitik</a>.
        </p>

        {showDetails && (
          <div className="cookie-details">
            <div className="cookie-category">
              <div className="cookie-category-header">
                <span className="cookie-category-name">Nødvendige</span>
                <span className="cookie-badge always-on">Altid aktive</span>
              </div>
              <p>Nødvendige for at hjemmesiden fungerer korrekt. Kan ikke deaktiveres.</p>
            </div>

            <div className="cookie-category">
              <div className="cookie-category-header">
                <label className="cookie-category-name" htmlFor="stats-toggle">Statistik</label>
                <label className="toggle" htmlFor="stats-toggle">
                  <input
                    id="stats-toggle"
                    type="checkbox"
                    checked={stats}
                    onChange={(e) => setStats(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <p>Hjælper os med at forstå, hvordan hjemmesiden bruges (Google Analytics 4).</p>
            </div>

            <div className="cookie-category">
              <div className="cookie-category-header">
                <label className="cookie-category-name" htmlFor="marketing-toggle">Marketing</label>
                <label className="toggle" htmlFor="marketing-toggle">
                  <input
                    id="marketing-toggle"
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <p>Bruges til at vise relevante annoncer (Google Tag Manager).</p>
            </div>
          </div>
        )}

        <div className="cookie-actions">
          <button className="btn btn-primary" onClick={acceptAll}>
            Acceptér alle
          </button>
          {showDetails ? (
            <button className="btn btn-secondary" onClick={acceptSelected}>
              Gem valg
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setShowDetails(true)}>
              Tilpas
            </button>
          )}
          <button className="btn cookie-reject-btn" onClick={acceptNecessary}>
            Kun nødvendige
          </button>
        </div>
      </div>
    </div>
  );
}
