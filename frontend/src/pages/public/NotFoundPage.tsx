import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, ArrowLeft, Home, Wrench } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ padding: 'var(--spacing-16) var(--spacing-4)', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Helmet>
        <title>Siden blev ikke fundet | Autohus Kvik</title>
      </Helmet>

      <div style={{
        width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto var(--spacing-6)'
      }}>
        <Car size={40} />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--color-dark)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
        Hov! Siden blev ikke fundet
      </h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: 450, margin: '0 auto var(--spacing-8)', lineHeight: 1.6 }}>
        Siden du leder efter findes desværre ikke, eller også er den blevet flyttet. Prøv at starte forfra på forsiden eller se vores aktuelle biler.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Gå til forsiden
        </Link>
        <Link to="/biler" className="btn btn-secondary">
          <Car size={16} /> Se biler til salg
        </Link>
        <Link to="/vaerksted" className="btn btn-ghost">
          <Wrench size={16} /> Værksted
        </Link>
      </div>
    </div>
  );
}
