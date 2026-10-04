import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  Wrench, ShieldCheck, Clock,
  Calendar, Award, ArrowRight, Phone
} from 'lucide-react';
import { contentService } from '@/services';
import { useSettings } from '@/contexts/SettingsContext';
import workshopImg from '@/assets/workshop.jpg';
import './WorkshopPage.css';

export default function WorkshopPage() {
  const { settings } = useSettings();

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: contentService.getServices,
  });

  const defaultServices = [
    {
      id: 1,
      slug: 'serviceeftersyn',
      title: 'Serviceeftersyn & Eftersyn',
      shortDescription: 'Fuldstændigt eftersyn efter bilens forskrifter, så du bevarer fabriksgarantien og driftsikkerheden.',
      fromPrice: 'Fra 1.195 kr.',
    },
    {
      id: 2,
      slug: 'klargoering-til-syn',
      title: 'Klargøring til syn & Synstjek',
      shortDescription: 'Gennemgang af lygter, bremser, styretøj og udstødning. Vi kører også gerne bilen til syn for dig.',
      fromPrice: 'Fra 495 kr.',
    },
    {
      id: 3,
      slug: 'bremseservice',
      title: 'Bremseservice & Bremseudskiftning',
      shortDescription: 'Kontrol, rensning og udskiftning af bremseskiver og bremseklodser med kvalitetsdele.',
      fromPrice: 'Fra 795 kr.',
    },
    {
      id: 4,
      slug: 'daekskifte-hjulskift',
      title: 'Dækskifte & Hjulskift',
      shortDescription: 'Skift mellem sommer- og vinterhjul, afbalancering og mulighed for dækopbevaring.',
      fromPrice: 'Fra 350 kr.',
    },
    {
      id: 5,
      slug: 'aircondition-klimaanlaeg',
      title: 'Aircondition & Klimaservice',
      shortDescription: 'Trykprøvning, påfyldning af kølemiddel og desinficering for et sundt indeklima.',
      fromPrice: 'Fra 895 kr.',
    },
    {
      id: 6,
      slug: 'fejlfinding-diagnose',
      title: 'Fejlfinding & Computerdiagnose',
      shortDescription: 'Udlæsning af fejlkoder med avanceret testudstyr til alle bilmærker og modeller.',
      fromPrice: 'Fra 595 kr.',
    },
    {
      id: 7,
      slug: 'olieskift-filterskift',
      title: 'Olieskift & Oliefilter',
      shortDescription: 'Hurtigt skift af motorolie og nyt kvalitetsfilter for optimal motorsmøring.',
      fromPrice: 'Fra 695 kr.',
    },
    {
      id: 8,
      slug: 'reparation-skader',
      title: 'Mekanisk reparation & Skader',
      shortDescription: 'Udbedring af mekaniske defekter, koblingsskift, tandrem og forsikringsskader.',
      fromPrice: 'Timepris 650 kr.',
    },
  ];

  const serviceList = (services && (services as any[]).length > 0) ? services : defaultServices;

  return (
    <div className="workshop-page">
      <Helmet>
        <title>Autoværksted i Hvidovre {settings.seo_title_suffix || '| Autohus Kvik'}</title>
        <meta
          name="description"
          content="Autoriseret værksted i Hvidovre hos Autohus Kvik. Vi udfører serviceeftersyn, bremseservice, synstjek, dækskifte og computerdiagnose til konkurrencedygtige priser."
        />
      </Helmet>

      {/* Hero */}
      <section className="workshop-hero">
        <div className="workshop-hero__bg">
          <img src={workshopImg} alt="Autohus Kvik Værksted Hvidovre" className="workshop-hero__bg-img" />
          <div className="workshop-hero__overlay" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="workshop-hero__inner">
            <span className="section-label">Autohus Kvik Værksted</span>
            <h1 className="workshop-hero__title">Professionelt værksted i Hvidovre</h1>
            <p className="workshop-hero__sub">
              Vi servicerer og reparerer alle bilmærker med moderne diagnoseudstyr. Hurtig levering, fair priser og fuld garanti på reservedele og arbejdskraft.
            </p>
            <div className="workshop-hero__ctas">
              <Link to="/book-vaerksted" className="btn btn-primary btn-lg">
                <Calendar size={18} /> Book værkstedstid online
              </Link>
              <a href={`tel:${(settings.company_phone || '+4550290874').replace(/\s/g, '')}`} className="btn btn-secondary btn-lg">
                <Phone size={18} /> Ring: {settings.company_phone || '+45 50 29 08 74'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="workshop-trust-bar">
        <div className="container">
          <div className="trust-bar-grid">
            <div className="trust-bar-item">
              <Award size={24} className="bar-icon" />
              <div>
                <strong>Bevar fabriksgarantien</strong>
                <span>Vi følger bilfabrikantens forskrifter</span>
              </div>
            </div>
            <div className="trust-bar-item">
              <Clock size={24} className="bar-icon" />
              <div>
                <strong>Hurtig betjening</strong>
                <span>Korte ventetider og præcise aftaler</span>
              </div>
            </div>
            <div className="trust-bar-item">
              <ShieldCheck size={24} className="bar-icon" />
              <div>
                <strong>Garanti på arbejdet</strong>
                <span>Kvalitetsdele med fuld reservedelsgaranti</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section workshop-services-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
            <span className="section-label">Vores ekspertise</span>
            <h2 className="section-title">Værkstedsydelser</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Vi klarer alt fra det årlige serviceeftersyn til avancerede reparationer.
            </p>
          </div>

          <div className="grid-3">
            {serviceList.map((service: any) => (
              <div key={service.id || service.slug} className="workshop-card">
                <div className="card-top">
                  <div className="workshop-card__icon">
                    <Wrench size={24} />
                  </div>
                  {service.fromPrice && (
                    <span className="price-badge">{service.fromPrice}</span>
                  )}
                </div>
                <h3 className="workshop-card__title">{service.title}</h3>
                <p className="workshop-card__desc">{service.shortDescription}</p>
                <div className="workshop-card__footer">
                  <Link to={`/vaerksted/${service.slug}`} className="service-read-more">
                    Læs mere om ydelsen <ArrowRight size={14} />
                  </Link>
                  <Link
                    to={`/book-vaerksted?service=${encodeURIComponent(service.title)}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Book tid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Advantages */}
      <section className="section section-grey">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <span className="section-label">Hvorfor vælge os</span>
            <h2 className="section-title">Tryghed for din bil og din pengepung</h2>
          </div>

          <div className="grid-4" style={{ marginTop: 'var(--spacing-10)' }}>
            <div className="advantage-box">
              <div className="adv-number">01</div>
              <h3>Gennemskuelige priser</h3>
              <p>Ingen ubehagelige overraskelser. Vi ringer altid og aftaler pris, hvis uforudsete reparationer er nødvendige.</p>
            </div>
            <div className="advantage-box">
              <div className="adv-number">02</div>
              <h3>Moderne testudstyr</h3>
              <p>Vores testere kan udlæse data og fejlfinding på både benzin-, diesel-, hybrid- og elbiler.</p>
            </div>
            <div className="advantage-box">
              <div className="adv-number">03</div>
              <h3>Mulighed for lånebil</h3>
              <p>Skal din bil være på værkstedet i længere tid, tilbyder vi en lånebil, så din hverdag ikke går i stå.</p>
            </div>
            <div className="advantage-box">
              <div className="adv-number">04</div>
              <h3>Alt samlet ét sted</h3>
              <p>Værksted, klargøring, dækcenter, bilsalg og byttebiler – vi tager hånd om alle dine bilbehov.</p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="workshop-cta-card">
            <div className="cta-content">
              <h2>Klar til at bestille tid til din bil?</h2>
              <p>Det tager kun 1 minut at booke tid via vores nemme online bookingformular.</p>
            </div>
            <Link to="/book-vaerksted" className="btn btn-primary btn-lg">
              <Calendar size={18} /> Book værkstedstid nu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
