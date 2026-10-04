import { Helmet } from 'react-helmet-async';
import { useSettings } from '@/contexts/SettingsContext';

export default function PrivacyPage() {
  const { settings } = useSettings();

  return (
    <div className="container" style={{ padding: 'var(--spacing-12) var(--spacing-4)', maxWidth: 840, lineHeight: 1.7 }}>
      <Helmet>
        <title>Privatlivspolitik {settings.seo_title_suffix || '| Autohus Kvik'}</title>
      </Helmet>

      <span className="section-label">GDPR & Sikkerhed</span>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 'var(--spacing-6)' }}>
        Privatlivspolitik for Autohus Kvik ApS
      </h1>

      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-8)' }}>
        Sidst opdateret: {new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Dataansvarlig</h2>
        <p>
          Autohus Kvik ApS er dataansvarlig for behandlingen af de personoplysninger, vi modtager om dig i forbindelse med bilsalg, byttebiler, servicebooking eller henvendelser via vores hjemmeside.
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li>CVR-nr.: {settings.company_cvr || '44047470'}</li>
          <li>Adresse: {settings.company_address || 'Gammel Køge Landevej 477, 2650 Hvidovre'}</li>
          <li>E-mail: {settings.company_email || 'kontakt@autohusetkvik.dk'}</li>
          <li>Telefon: {settings.company_phone || '+45 50 29 08 74'}</li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Formål med behandling af personoplysninger</h2>
        <p>Vi indsamler og behandler personoplysninger til følgende formål:</p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li>Håndtering af køb, salg og bytte af biler (slutsedler, omregistrering, finansiering).</li>
          <li>Booking og udførelse af værkstedsydelser og serviceeftersyn.</li>
          <li>Besvarelse af henvendelser indsendt via kontaktformularer.</li>
          <li>Overholdelse af gældende lovgivning, herunder bogføringsloven og hvidvaskloven ved kontante/digitale bilhandler.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Hvilke oplysninger behandler vi?</h2>
        <p>
          Vi behandler almindelige personoplysninger såsom navn, adresse, e-mail, telefonnummer, registreringsnummer (nummerplade), stelnummer samt oplysninger om din bil og eventuelle låne- eller bytteønsker.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. Opbevaring og sletning</h2>
        <p>
          Oplysninger opbevares kun så længe, det er nødvendigt for at opfylde det formål, de blev indsamlet til. Bogføringsmateriale opbevares i 5 år i overensstemmelse med bogføringslovens krav, hvorefter det slettes forsvarligt.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>5. Dine rettigheder</h2>
        <p>
          Ifølge databeskyttelsesforordningen har du ret til indsigt i de oplysninger, vi behandler om dig, ret til berigtigelse af forkerte data, samt i visse tilfælde ret til sletning eller indsigelse. Henvend dig blot på {settings.company_email || 'kontakt@autohusetkvik.dk'}.
        </p>
      </section>
    </div>
  );
}
