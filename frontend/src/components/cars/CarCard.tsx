import { Link } from 'react-router-dom';
import { Heart, Share2, Gauge, Fuel, Settings2, Calendar } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { CarSummary } from '@/types';
import './CarCard.css';

interface CarCardProps {
  car: CarSummary;
  view?: 'grid' | 'list';
}

const STATUS_LABELS: Record<string, string> = {
  for_sale: 'Til salg',
  reserved: 'Reserveret',
  sold: 'Solgt',
};

const STATUS_CLASS: Record<string, string> = {
  for_sale: 'badge-for-sale',
  reserved: 'badge-reserved',
  sold: 'badge-sold',
};

export default function CarCard({ car, view = 'grid' }: CarCardProps) {
  const [isFaved, setIsFaved] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('kvik_favorites') ?? '[]');
      return favs.includes(car.id);
    } catch { return false; }
  });

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs: number[] = JSON.parse(localStorage.getItem('kvik_favorites') ?? '[]');
      const newFavs = isFaved ? favs.filter((id) => id !== car.id) : [...favs, car.id];
      localStorage.setItem('kvik_favorites', JSON.stringify(newFavs));
      setIsFaved(!isFaved);
    } catch { /* ignore */ }
  }, [car.id, isFaved]);

  const sharecar = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/biler/${car.slug}`;
    if (navigator.share) {
      await navigator.share({ title: car.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      // Simple feedback
      const btn = e.currentTarget as HTMLButtonElement;
      const original = btn.innerHTML;
      btn.textContent = '✓ Kopieret!';
      setTimeout(() => { btn.innerHTML = original; }, 2000);
    }
  }, [car.slug, car.title]);

  const coverSrc = car.coverImage?.webPPath || car.coverImage?.thumbnailPath || (car.coverImage as any)?.filePath;
  const alt = car.coverImage?.altText || `${car.make} ${car.model} ${car.year}`;

  const isSold = car.status === 'sold';

  return (
    <Link
      to={`/biler/${car.slug}`}
      className={`car-card ${view === 'list' ? 'car-card--list' : ''} ${isSold ? 'car-card--sold' : ''}`}
      aria-label={`${car.title} – ${car.price.toLocaleString('da-DK')} kr.`}
    >
      <div className="car-card__image">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="img-cover"
          />
        ) : (
          <div className="car-card__placeholder">
            <span>Billede mangler</span>
          </div>
        )}

        {/* Badges */}
        <div className="car-card__badges">
          <span className={`badge ${STATUS_CLASS[car.status] ?? 'badge-sold'}`}>
            {STATUS_LABELS[car.status] ?? car.status}
          </span>
          {car.badge && <span className="badge badge-accent">{car.badge}</span>}
          {car.isNew && !car.badge && <span className="badge badge-new">Nyhed</span>}
        </div>

        {/* Handlingsknapper */}
        <div className="car-card__actions">
          <button
            onClick={toggleFavorite}
            className={`car-card__action-btn ${isFaved ? 'faved' : ''}`}
            aria-label={isFaved ? 'Fjern fra favoritter' : 'Gem som favorit'}
            aria-pressed={isFaved}
          >
            <Heart size={18} fill={isFaved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={sharecar}
            className="car-card__action-btn"
            aria-label="Del bil"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="car-card__body">
        <div className="car-card__meta">
          <span className="car-card__make">{car.make}</span>
          <span className="car-card__year">{car.year}</span>
        </div>
        <h3 className="car-card__title">{car.model} {car.variant}</h3>

        <div className="car-card__specs">
          {car.mileage != null && (
            <span>
              <Gauge size={14} />
              {car.mileage.toLocaleString('da-DK')} km
            </span>
          )}
          {car.fuelType && (
            <span>
              <Fuel size={14} />
              {car.fuelType}
            </span>
          )}
          {car.transmission && (
            <span>
              <Settings2 size={14} />
              {car.transmission}
            </span>
          )}
          {car.year && (
            <span>
              <Calendar size={14} />
              {car.year}
            </span>
          )}
        </div>

        <div className="car-card__pricing">
          <div className="car-card__price">
            {isSold ? (
              <span className="car-card__sold-label">Solgt</span>
            ) : (
              <>
                <span className="car-card__price-main">
                  {car.price.toLocaleString('da-DK')} kr.
                </span>
                {car.monthlyPayment && (
                  <span className="car-card__price-monthly">
                    Fra {Math.round(car.monthlyPayment).toLocaleString('da-DK')} kr./md.*
                  </span>
                )}
              </>
            )}
          </div>
          <span className="car-card__cta">Se bil →</span>
        </div>
      </div>
    </Link>
  );
}
