import { Helmet } from 'react-helmet-async';
import { useSettings } from '@/contexts/SettingsContext';

export default function CookiePolicyPage() {
  const { settings } = useSettings();

  const resetConsent = () => {
    localStorage.removeItem('kvik_cookie_consent');
    window.location.reload();
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-12) var(--spacing-4)', maxWidth: 840, lineHeight: 1.7 }}>
      <Helmet>
        <title>Cookiepolitik {settings.seo_title_suffix || '| Autohus Kvik'}</title>
      </Helmet>

      <span className="section-label">Cookies & Samtykke</span>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 'var(--spacing-6)' }}>
        Cookiepolitik for Autohus Kvik
      </h1>

      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-8)' }}>
        Sidst opdateret: {new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>Hvad er cookies?</h2>
        <p>
          En cookie er en lille tekstfil, som lagres på din computer, smartphone eller tablet, når du besøger vores hjemmeside. Cookies gør det muligt at genkende din enhed og huske dine valg, såsom gemte biler og præferencer.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>De tre kategorier af cookies</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-grey-100)', borderRadius: 'var(--radius-md)' }}>
            <strong>1. Nødvendige cookies (Altid aktive)</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Disse cookies er teknisk nødvendige for, at websitet fungerer, herunder navigation, login i admin og huske dit cookie-samtykke. De kan ikke fravælges.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--color-grey-100)', borderRadius: 'var(--radius-md)' }}>
            <strong>2. Statistiske cookies</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Hjælper os med at forstå, hvordan besøgende interagerer med hjemmesiden ved at indsamle og rapportere oplysninger anonymt (f.eks. Google Analytics 4).
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--color-grey-100)', borderRadius: 'var(--radius-md)' }}>
            <strong>3. Marketingcookies</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Bruges til at spore besøgende på tværs af websites med henblik på at vise relevante annoncer (f.eks. Google Tag Manager / Meta Pixel).
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ændring eller tilbagetrækning af samtykke</h2>
        <p style={{ marginBottom: '1rem' }}>
          Du kan til enhver tid ændre eller tilbagekalde dit samtykke ved at klikke på knappen nedenfor:
        </p>
        <button onClick={resetConsent} className="btn btn-secondary">
          Nulstil og tilpas cookie-samtykke
        </button>
      </section>
    </div>
  );
}
