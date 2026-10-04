import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck, Wrench, Users, Award, MapPin
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import './AboutPage.css';

export default function AboutPage() {
  const { settings } = useSettings();

  return (
    <div className="about-page">
      <Helmet>
        <title>Om Autohus Kvik i Hvidovre {settings.seo_title_suffix || '| Autohus Kvik'}</title>
        <meta
          name="description"
          content="Lær Autohus Kvik i Hvidovre at kende. Vi kombinerer passion for biler med solidt værkstedshåndværk, ærlige priser og personlig rådgivning."
        />
      </Helmet>

      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <span className="section-label">Mød Autohus Kvik</span>
          <h1 className="about-hero__title">Din lokale bilpartner i Hvidovre</h1>
          <p className="about-hero__sub">
            Vi skaber gennemskuelige bilhandler og pålidelig værkstedsservice med fokus på tillid, kvalitet og den gode personlige relation.
          </p>
        </div>
      </section>

      {/* Main story section */}
      <section className="section">
        <div className="container about-grid-story">
          <div className="about-story-text">
            <span className="section-label">Vores Filosofi</span>
            <h2 className="section-title">Glade kunder fra start til slut</h2>
            <p className="lead-p">
              Hos Autohuset Kvik er vi interesserede i at have glade kunder fra start til slut. Vi har et stort udvalg af gode brugte biler og står klar til at hjælpe med at finde den bil, der passer til netop dit behov.
            </p>
            <p>
              Vi tager alle biler i bytte – kontakt os og hør nærmere. Vi gennemgår altid vores biler grundigt på vores eget værksted i Hvidovre, så du trygt kan køre herfra i din nye bil.
            </p>
            <p>
              Uanset om du søger en økonomisk bybil, en rummelig familiebil eller har brug for et serviceeftersyn, glæder vi os til at se dig hos Autohuset Kvik!
            </p>

            <div className="cvr-box">
              <strong>Autohus Kvik ApS</strong>
              <span>CVR-nr.: {settings.company_cvr || '44047470'} · Gammel Køge Landevej 477, 2650 Hvidovre</span>
            </div>
          </div>

          <div className="about-story-visual">
            <div className="about-image-card">
              <img src="/images/dealership/dealership-5.jpg" alt="Autohuset Kvik Facade og Værksted i Hvidovre" className="about-story-img" />
              <div className="experience-badge">
                <strong>100%</strong>
                <span>Fokus på kundetilfredshed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Photo Showcase Gallery */}
      <section className="section section-gallery">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
            <span className="section-label">Billeder fra matriklen</span>
            <h2 className="section-title">Velkommen hos Autohus Kvik i Hvidovre</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Se vores salgsplads og værksted på Gammel Køge Landevej 477.
            </p>
          </div>

          <div className="dealership-photo-grid">
            <div className="photo-card">
              <img src="/images/dealership/dealership-1.jpg" alt="Autohus Kvik Bilsalgsplads" />
              <div className="photo-caption">
                <MapPin size={16} /> <span>Salgspladsen på Gammel Køge Landevej</span>
              </div>
            </div>
            <div className="photo-card">
              <img src="/images/dealership/dealership-2.jpg" alt="Autohus Kvik Værksted" />
              <div className="photo-caption">
                <Wrench size={16} /> <span>Eget værksted & klargøring</span>
              </div>
            </div>
            <div className="photo-card">
              <img src="/images/dealership/dealership-3.jpg" alt="Brugte biler til salg" />
              <div className="photo-caption">
                <ShieldCheck size={16} /> <span>Altid klar til prøvekørsel</span>
              </div>
            </div>
            <div className="photo-card">
              <img src="/images/dealership/dealership-4.jpg" alt="Udvalgte brugte biler" />
              <div className="photo-caption">
                <Award size={16} /> <span>Gennemgået og klargjort</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values & Offers Grid */}
      <section className="section section-grey">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
            <span className="section-label">Hvorfor vælge os?</span>
            <h2 className="section-title">Vi tilbyder dig</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              En tryg og professionel oplevelse, når du skal købe, sælge eller servicere din bil.
            </p>
          </div>

          <div className="grid-4">
            <div className="value-card">
              <div className="value-icon"><Award size={28} /></div>
              <h3>Konkurrencedygtige priser</h3>
              <p>Vi tilbyder altid gennemskuelige og fair priser på alle vores brugte kvalitetsbiler.</p>
            </div>

            <div className="value-card">
              <div className="value-icon"><Users size={28} /></div>
              <h3>God pris for din bil</h3>
              <p>Få en attraktiv byttepris for din brugte bil – vi tager alle mærker og modeller i bytte.</p>
            </div>

            <div className="value-card">
              <div className="value-icon"><ShieldCheck size={28} /></div>
              <h3>Forsikring & Finansiering</h3>
              <p>Vi tilbyder attraktive finansieringsløsninger med eller uden udbetaling samt tryg forsikring.</p>
            </div>

            <div className="value-card">
              <div className="value-icon"><Wrench size={28} /></div>
              <h3>Ekstraordinær service</h3>
              <p>Personlig betjening og glade kunder fra start til slut – understøttet af vores eget værksted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta-box">
            <h2>Kig forbi til en uforpligtende bilsnak</h2>
            <p>Vi har altid frisk kaffe på kanden og spændende biler på lager.</p>
            <div className="cta-buttons">
              <Link to="/biler" className="btn btn-primary btn-lg">Se biler til salg</Link>
              <Link to="/kontakt" className="btn btn-secondary btn-lg">Kontakt os</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
