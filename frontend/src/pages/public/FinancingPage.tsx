import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck, Calculator, CheckCircle2,
  FileCheck, ArrowRight, Shield
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import './FinancingPage.css';

export default function FinancingPage() {
  const { settings } = useSettings();

  const [carPrice, setCarPrice] = useState(150000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [loanPeriodMonths, setLoanPeriodMonths] = useState(84);
  const interestRate = 4.95;

  const downPaymentAmount = Math.round((carPrice * downPaymentPct) / 100);
  const loanAmount = Math.max(0, carPrice - downPaymentAmount);
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = loanAmount > 0
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanPeriodMonths)) / (Math.pow(1 + monthlyRate, loanPeriodMonths) - 1))
    : 0;

  return (
    <div className="financing-page">
      <Helmet>
        <title>Finansiering og Garanti i Hvidovre {settings.seo_title_suffix || '| Autohus Kvik'}</title>
        <meta
          name="description"
          content="Få attraktiv bilfinansiering med eller uden udbetaling hos Autohus Kvik. Vi tilbyder også udvidet garanti på brugte biler for maksimal tryghed."
        />
      </Helmet>

      {/* Hero */}
      <section className="fin-hero">
        <div className="container">
          <span className="section-label">Finansiering & Sikkerhed</span>
          <h1 className="fin-hero__title">Attraktiv bilfinansiering & Tryghedsgaranti</h1>
          <p className="fin-hero__sub">
            Vi samarbejder med Danmarks førende finansieringsselskaber og garantileverandører, så du kan køre hjem i din drømmebil med faste månedlige ydelser og ro i sindet.
          </p>
        </div>
      </section>

      {/* Financing Overview & Calculator */}
      <section className="section">
        <div className="container fin-grid">
          <div className="fin-info-col">
            <span className="section-label">Finansieringsmuligheder</span>
            <h2 className="section-title">Finansiering tilpasset dit budget</h2>
            <p className="section-subtitle">
              Uanset om du ønsker et billån med 20% i udbetaling for den laveste rente eller et lån uden udbetaling, hjælper vi dig med at ansøge og få svar på under 15 minutter.
            </p>

            <ul className="fin-perks-list">
              <li>
                <CheckCircle2 className="perk-check" />
                <div>
                  <strong>Med eller uden udbetaling</strong>
                  <p>Du bestemmer selv, om du vil lægge 0 kr., 20% eller mere i udbetaling.</p>
                </div>
              </li>
              <li>
                <CheckCircle2 className="perk-check" />
                <div>
                  <strong>Hurtig kreditgodkendelse</strong>
                  <p>Vi indsender ansøgningen elektronisk direkte hos forhandleren og får svar med det samme.</p>
                </div>
              </li>
              <li>
                <CheckCircle2 className="perk-check" />
                <div>
                  <strong>Fast eller variabel rente</strong>
                  <p>Vælg fast rente for budgetmæssig tryghed eller variabel rente for markedets laveste rente.</p>
                </div>
              </li>
              <li>
                <CheckCircle2 className="perk-check" />
                <div>
                  <strong>Brug din gamle bil som udbetaling</strong>
                  <p>Vi modregner gerne bytteprisen på din nuværende bil direkte i udbetalingen.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Interactive Calculator */}
          <div className="fin-calc-col">
            <div className="fin-calc-card">
              <div className="calc-card-header">
                <Calculator size={24} className="calc-header-icon" />
                <h3>Vejledende låneberegner</h3>
              </div>

              <div className="calc-group">
                <div className="calc-label-row">
                  <span>Bilens kontantpris:</span>
                  <strong>{carPrice.toLocaleString('da-DK')} kr.</strong>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={600000}
                  step={5000}
                  value={carPrice}
                  onChange={(e) => setCarPrice(Number(e.target.value))}
                  className="fin-slider"
                />
              </div>

              <div className="calc-group">
                <div className="calc-label-row">
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
                  className="fin-slider"
                />
              </div>

              <div className="calc-group">
                <div className="calc-label-row">
                  <span>Løbetid:</span>
                  <strong>{loanPeriodMonths} måneder ({Math.round(loanPeriodMonths / 12)} år)</strong>
                </div>
                <input
                  type="range"
                  min={24}
                  max={96}
                  step={12}
                  value={loanPeriodMonths}
                  onChange={(e) => setLoanPeriodMonths(Number(e.target.value))}
                  className="fin-slider"
                />
              </div>

              <div className="calc-output-box">
                <span className="output-label">Månedlig ydelse ca.:</span>
                <span className="output-amount">{monthlyPayment.toLocaleString('da-DK')} kr./mdr.</span>
                <p className="output-note">
                  Vejledende beregning v. {interestRate}% variabel debitorrente. Lånebeløb: {loanAmount.toLocaleString('da-DK')} kr.
                </p>
              </div>

              <Link to="/biler" className="btn btn-primary btn-block" style={{ marginTop: '1.25rem' }}>
                Find en bil og ansøg <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Section */}
      <section className="section section-grey">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
            <span className="section-label">Udvidet Tryghed</span>
            <h2 className="section-title">Garanti på brugte biler</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Få ro i maven med en udvidet mekanisk garantiforsikring, der dækker uforudsete værkstedsudgifter.
            </p>
          </div>

          <div className="grid-3">
            <div className="warranty-card">
              <Shield className="warranty-icon" />
              <h3>Købelovens reklamationsret</h3>
              <p>Som forbruger er du altid dækket af købelovens 24 måneders reklamationsret mod fejl og mangler, der var til stede ved levering.</p>
              <span className="warranty-badge">Lovpligtig standard</span>
            </div>

            <div className="warranty-card featured-warranty">
              <ShieldCheck className="warranty-icon" />
              <h3>Udvidet Garantiforsikring</h3>
              <p>Dækker reparation af motor, gearkasse, turbo, elektronik og andre vitale komponenter i op til 12, 24 eller 36 måneder.</p>
              <span className="warranty-badge accent">Mest populære tilvalg</span>
            </div>

            <div className="warranty-card">
              <FileCheck className="warranty-icon" />
              <h3>Klargjort på eget værksted</h3>
              <p>Alle vores biler gennemgår et grundigt teknisk og kosmetisk tjek på vores eget værksted i Hvidovre inden udlevering.</p>
              <span className="warranty-badge">Autohus Kvik standard</span>
            </div>
          </div>

          <div className="warranty-cta" style={{ textAlign: 'center', marginTop: 'var(--spacing-10)' }}>
            <Link to="/kontakt" className="btn btn-secondary btn-lg">
              Kontakt os for et skræddersyet tilbud på finansiering og garanti
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
