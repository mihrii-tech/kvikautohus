import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  SlidersHorizontal, LayoutGrid, List, RotateCcw,
  Search, ShieldCheck,
  X, Car as CarIcon, ArrowUpDown
} from 'lucide-react';
import { carsService } from '@/services';
import { useSettings } from '@/contexts/SettingsContext';
import CarCard from '@/components/cars/CarCard';
import type { CarFilters, CarSummary } from '@/types';
import './CarsPage.css';

export default function CarsPage() {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Extract filter parameters from URL
  const filters: CarFilters = useMemo(() => ({
    search: searchParams.get('search') || undefined,
    make: searchParams.get('make') || undefined,
    model: searchParams.get('model') || undefined,
    fuelType: searchParams.get('fuelType') || undefined,
    transmission: searchParams.get('transmission') || undefined,
    bodyType: searchParams.get('bodyType') || undefined,
    minYear: searchParams.get('minYear') ? Number(searchParams.get('minYear')) : undefined,
    maxYear: searchParams.get('maxYear') ? Number(searchParams.get('maxYear')) : undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    maxKm: searchParams.get('maxKm') ? Number(searchParams.get('maxKm')) : undefined,
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    pageSize: 12,
  }), [searchParams]);

  // Fetch cars data
  const { data, isLoading } = useQuery({
    queryKey: ['cars', filters],
    queryFn: () => carsService.getCars(filters),
  });

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options'],
    queryFn: carsService.getFilterOptions,
  });

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '' || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    const keys = ['search', 'make', 'model', 'fuelType', 'transmission', 'bodyType', 'minPrice', 'maxPrice', 'maxKm', 'minYear', 'maxYear'];
    keys.forEach(k => {
      if (searchParams.has(k)) count++;
    });
    return count;
  }, [searchParams]);

  const carsList: CarSummary[] = data?.cars || [];
  const totalCount = data?.totalCount || carsList.length;
  const totalPages = data?.totalPages || 1;

  const titleSuffix = settings.seo_title_suffix || '| Autohus Kvik';

  return (
    <div className="cars-page">
      <Helmet>
        <title>Brugte biler til salg i Hvidovre {titleSuffix}</title>
        <meta
          name="description"
          content="Se vores udvalg af kvalitetstestede brugte biler til salg hos Autohus Kvik i Hvidovre. Vi tilbyder byttepris, finansiering og professionel rådgivning."
        />
      </Helmet>

      {/* Hero Header */}
      <section className="cars-header">
        <div className="container">
          <div className="cars-header__content">
            <span className="section-label">Aktuelt lager</span>
            <h1 className="cars-header__title">Brugte biler til salg</h1>
            <p className="cars-header__sub">
              Alle vores biler leveres professionelt gennemgået og klargjort med mulighed for garanti og attraktiv finansiering.
            </p>
          </div>
        </div>
      </section>

      <div className="container cars-layout">
        {/* Mobile filter toggle bar */}
        <div className="mobile-filter-bar">
          <button
            className="btn btn-secondary filter-toggle-btn"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          >
            <SlidersHorizontal size={18} />
            <span>Filtre {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <div className="cars-view-controls">
            <div className="sort-dropdown-wrap">
              <ArrowUpDown size={16} />
              <select
                aria-label="Sortering"
                value={filters.sort || 'newest'}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="sort-select"
              >
                <option value="newest">Nyeste først</option>
                <option value="price_asc">Pris: Lav til høj</option>
                <option value="price_desc">Pris: Høj til lav</option>
                <option value="mileage_asc">Kilometer: Lavest</option>
                <option value="year_desc">Årgang: Nyeste</option>
              </select>
            </div>
            <div className="view-mode-buttons">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid visning"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="Liste visning"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Filters */}
        <aside className={`cars-filters ${showFiltersMobile ? 'open' : ''}`}>
          <div className="filters-header">
            <h3>Filtrér biler</h3>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="reset-filters-btn">
                <RotateCcw size={14} /> Nulstil ({activeFilterCount})
              </button>
            )}
            <button
              className="filters-close-btn"
              onClick={() => setShowFiltersMobile(false)}
              aria-label="Luk filtre"
            >
              <X size={20} />
            </button>
          </div>

          <div className="filters-body">
            {/* Søgefelt */}
            <div className="filter-group">
              <label>Fritekstsøgning</label>
              <div className="filter-search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Mærke, model, variant..."
                  value={searchParams.get('search') || ''}
                  onChange={(e) => updateParam('search', e.target.value)}
                />
              </div>
            </div>

            {/* Mærke */}
            <div className="filter-group">
              <label>Mærke</label>
              <select
                value={searchParams.get('make') || ''}
                onChange={(e) => updateParam('make', e.target.value)}
              >
                <option value="">Alle mærker</option>
                {(filterOptions as any)?.makes?.map((make: string) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            {/* Brændstof */}
            <div className="filter-group">
              <label>Brændstof</label>
              <select
                value={searchParams.get('fuelType') || ''}
                onChange={(e) => updateParam('fuelType', e.target.value)}
              >
                <option value="">Alle typer</option>
                <option value="Benzin">Benzin</option>
                <option value="Diesel">Diesel</option>
                <option value="El">El / 100% Elektrisk</option>
                <option value="Hybrid">Plug-in Hybrid / Hybrid</option>
              </select>
            </div>

            {/* Gearkasse */}
            <div className="filter-group">
              <label>Gearkasse</label>
              <select
                value={searchParams.get('transmission') || ''}
                onChange={(e) => updateParam('transmission', e.target.value)}
              >
                <option value="">Alle gearkasser</option>
                <option value="Automatisk">Automatgear</option>
                <option value="Manuel">Manuel</option>
              </select>
            </div>

            {/* Maks. Pris */}
            <div className="filter-group">
              <label>Maks. Pris</label>
              <select
                value={searchParams.get('maxPrice') || ''}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
              >
                <option value="">Ubegrænset</option>
                <option value="75000">75.000 kr.</option>
                <option value="100000">100.000 kr.</option>
                <option value="150000">150.000 kr.</option>
                <option value="200000">200.000 kr.</option>
                <option value="300000">300.000 kr.</option>
                <option value="500000">500.000 kr.</option>
              </select>
            </div>

            {/* Maks. Km */}
            <div className="filter-group">
              <label>Maks. Kilometer</label>
              <select
                value={searchParams.get('maxKm') || ''}
                onChange={(e) => updateParam('maxKm', e.target.value)}
              >
                <option value="">Ubegrænset</option>
                <option value="50000">50.000 km</option>
                <option value="100000">100.000 km</option>
                <option value="150000">150.000 km</option>
                <option value="200000">200.000 km</option>
              </select>
            </div>

            {/* Minimum Årgang */}
            <div className="filter-group">
              <label>Min. Årgang</label>
              <select
                value={searchParams.get('minYear') || ''}
                onChange={(e) => updateParam('minYear', e.target.value)}
              >
                <option value="">Alle årgange</option>
                <option value="2023">2023 eller nyere</option>
                <option value="2021">2021 eller nyere</option>
                <option value="2019">2019 eller nyere</option>
                <option value="2017">2017 eller nyere</option>
                <option value="2015">2015 eller nyere</option>
                <option value="2010">2010 eller nyere</option>
              </select>
            </div>

            <div className="filter-apply-mobile">
              <button
                className="btn btn-primary btn-block"
                onClick={() => setShowFiltersMobile(false)}
              >
                Vis resultater ({totalCount})
              </button>
            </div>
          </div>
        </aside>

        {/* Cars Content Area */}
        <main className="cars-content">
          {/* Top Bar for Desktop */}
          <div className="cars-topbar desktop-only">
            <div className="cars-count">
              <span>Viser <strong>{totalCount}</strong> biler til salg</span>
            </div>

            <div className="cars-view-controls">
              <div className="sort-dropdown-wrap">
                <ArrowUpDown size={16} />
                <select
                  aria-label="Sortering"
                  value={filters.sort || 'newest'}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Nyeste først</option>
                  <option value="price_asc">Pris: Lav til høj</option>
                  <option value="price_desc">Pris: Høj til lav</option>
                  <option value="mileage_asc">Kilometer: Lavest</option>
                  <option value="year_desc">Årgang: Nyeste</option>
                </select>
              </div>

              <div className="view-mode-buttons">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid visning"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="Liste visning"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Cars Grid / List */}
          {isLoading ? (
            <div className={`cars-${viewMode}-layout`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="car-skeleton" />
              ))}
            </div>
          ) : carsList.length > 0 ? (
            <div className={`cars-${viewMode}-layout`}>
              {carsList.map((car) => (
                <CarCard key={car.id} car={car} view={viewMode} />
              ))}
            </div>
          ) : (
            <div className="cars-empty-state">
              <div className="empty-icon"><CarIcon size={48} /></div>
              <h2>Ingen biler matcher dine kriterier</h2>
              <p>Prøv at fjerne eller justere nogle af dine filtre for at se flere resultater.</p>
              <button onClick={resetFilters} className="btn btn-primary">
                Nulstil alle filtre
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === (filters.page || 1);
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${isCurrent ? 'active' : ''}`}
                    onClick={() => updateParam('page', String(pageNum))}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}

          {/* Info Banner at bottom */}
          <div className="cars-info-card">
            <div className="cars-info-icon">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3>Fandt du ikke det, du søgte?</h3>
              <p>
                Vi får løbende nye biler på lager og hjælper gerne med at skaffe den bil, du drømmer om, gennem vores netværk.
              </p>
              <Link to="/kontakt" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>
                Kontakt os for en uforpligtende bilsøgning
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
