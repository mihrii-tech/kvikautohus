import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle, Calendar, ArrowLeft, Phone,
  Shield, Award, Clock
} from 'lucide-react';
import { contentService } from '@/services';
import { useSettings } from '@/contexts/SettingsContext';
import './ServiceDetailPage.css';

const DEFAULT_SERVICE_DATA: Record<string, {
  title: string;
  category: string;
  heroText: string;
  fromPrice: string;
  duration: string;
  points: string[];
  description: string;
  faq: { q: string; a: string }[];
}> = {
  serviceeftersyn: {
    title: 'Serviceeftersyn & Vedligeholdelse',
    category: 'Værksted & Service',
    heroText: 'Få din bil serviceret efter fabrikkens forskrifter, så fabriksgarantien bevares og driftsikkerheden er i top.',
    fromPrice: 'Fra 1.195 kr.',
    duration: 'ca. 2-3 timer',
    points: [
      'Udskiftning af motorolie og oliefilter',
      'Kontrol af bremser, væsker og dæktryk',
      'Udlæsning af fejlkoder via computertester',
      'Stempel i servicebog / digital servicebog opdateres',
      'Gennemgang af styretøj, ophæng og lygter',
    ],
    description: 'Et regelmæssigt serviceeftersyn er afgørende for at forlænge bilens levetid, mindske brændstofforbrug og undgå dyre reparationer på sigt. Vores mekanikere anvender udelukkende OE-godkendte reservedele og kvalitetsolier, hvilket sikrer, at fabriksgarantien på nyere biler forbliver 100% intakt.',
    faq: [
      {
        q: 'Bevarer jeg fabriksgarantien hos Autohus Kvik?',
        a: 'Ja, ifølge EU-reglerne (gruppefritagelsen) bevarer du din fabriksgaranti, når service udføres efter fabrikkens forskrifter med godkendte reservedele.',
      },
      {
        q: 'Hvor ofte skal bilen til serviceeftersyn?',
        a: 'Typisk enten én gang årligt eller for hver 15.000-30.000 km, afhængigt af bilens fabriksanbefalinger.',
      },
    ],
  },
  synstjek: {
    title: 'Synstjek & Klargøring til syn',
    category: 'Syn & Sikkerhed',
    heroText: 'Undgå omsyn! Vi gennemgår alle bilens vitale dele grundigt, inden den skal til periodisk bilsyn.',
    fromPrice: 'Fra 495 kr.',
    duration: 'ca. 1 time',
    points: [
      'Test af bremsekraft og skævtræk',
      'Kontrol af lygter, lygtehøjde og blinklys',
      'Tjek af styretøj, bærekugler og støddæmpere',
      'Undersøgelse af rust i bærende dele og udstødning',
      'Valgfri kørsel til godkendt synshal',
    ],
    description: 'Når du modtager indkaldelse til syn fra Færdselsstyrelsen, kan et forudgående synstjek spare dig for både ærgrelse og ekstra synsgebyrer. Vi identificerer eventuelle fejl på forhånd og giver dig et fast prisoverslag, før noget udbedres.',
    faq: [
      {
        q: 'Kan I køre bilen til syn for mig?',
        a: 'Ja, du kan blot aflevere bilen hos os, så gennemgår vi den og kører den direkte til syn for dig. Du henter den godkendt.',
      },
    ],
  },
  'reparation-fejlfinding': {
    title: 'Reparation & Avanceret Fejlsøgning',
    category: 'Mekanisk Værksted',
    heroText: 'Vi løser alle mekaniske og elektriske problemer på din bil med avanceret testudstyr og OE-reservedele.',
    fromPrice: 'Fra 595 kr.',
    duration: 'Efter aftale',
    points: [
      'Fuld computerdiagnose og fejlkodelæsning',
      'Reparation af motor, kobling, gearkasse og udstødning',
      'Udskiftning af tandrem og vandpumpe',
      'Fejlfinding på elektriske komponenter og sensorer',
      'Professionelt prisoverslag før påbegyndelse',
    ],
    description: 'Uanset om en advarselslampe lyser i instrumentbrættet, eller du oplever uforklarlige lyde fra motoren, står vores dygtige mekanikere klar. Vi benytter avanceret udlæsningsudstyr til hurtigt og præcist at lokalisere fejlen.',
    faq: [
      {
        q: 'Hvad koster en diagnose udlæsning?',
        a: 'Udlæsning af fejlkoder og fejlfinding koster fra 595 kr. Vi giver altid et klart tilbud, inden vi påbegynder selve reparationen.',
      },
    ],
  },
  daekskifte: {
    title: 'Dækskifte & Hjulskift',
    category: 'Dæk & Hjul',
    heroText: 'Sikker kørsel starter med det rigtige vejgreb. Få skiftet mellem sommer- og vinterdæk hurtigt og professionelt.',
    fromPrice: 'Fra 350 kr.',
    duration: 'ca. 30 min.',
    points: [
      'Professionelt skift af 4 hjul på bilen',
      'Kontrol af dækmønster og slidbane',
      'Justering af dæktryk til fabriksspecifikationer',
      'Afbalancering af hjul ved behov',
      'Visuel kontrol af bremser under skiftet',
    ],
    description: 'Vi sørger for, at din bil står fast på vejen uanset årstiden. Under dækskiftet gennemgår mekanikeren altid bremser og ophæng for at sikre, at alt fungerer som det skal.',
    faq: [
      {
        q: 'Hvornår skal man skifte til vinterdæk?',
        a: 'Det anbefales typisk at skifte til vinterdæk i oktober/november, eller når temperaturen falder til under 7 grader.',
      },
    ],
  },
  rudeskift: {
    title: 'Rudeskift & Stenslagsreparation',
    category: 'Glas & Karrosseri',
    heroText: 'Få repareret stenslag eller skiftet forruden hurtigt. Vi samarbejder med alle forsikringsselskaber.',
    fromPrice: 'Fra 295 kr.',
    duration: 'ca. 1-3 timer',
    points: [
      'Hurtig reparation af stenslag inden det revner',
      'Udskiftning af forrude, side- og bagruder',
      'Kalibrering af kameraer og vejbaneassistenter (ADAS)',
      'Håndtering af forsikringsskader direkte med dit selskab',
      'Kvalitetsglas fremstillet efter originale standarder',
    ],
    description: 'Et stenslag i forruden kan hurtigt revne og svække bilens bærende konstruktion. Vi udbedrer mindre stenslag på under 30 minutter eller udskifter hele ruden inklusiv genkalibrering af sikkerhedskameraer.',
    faq: [
      {
        q: 'Håndterer I papirarbejdet med forsikringen?',
        a: 'Ja, vi anmelder skaden direkte til dit forsikringsselskab, så du slipper for besværet.',
      },
    ],
  },
  autohjaelp: {
    title: 'Døgnåben Autohjælp & Bugsering',
    category: 'Akut Hjælp',
    heroText: 'Er bilen brudt sammen? Ring på vort nødnummer +45 50 29 08 74 for hurtig bugsering til vores værksted i Hvidovre.',
    fromPrice: 'Akut service',
    duration: 'Døgnvagt',
    points: [
      'Døgnåben telefonvagt på +45 50 29 08 74',
      'Bugsering af personbiler og varevogne',
      'Startelement ved fladt batteri',
      'Hjulskift på stedet ved punktering',
      'Direkte transport til Autohus Kvik Værksted',
    ],
    description: 'Når uheldet er ude, lader vi dig ikke i stikken. Vores akutteam rykker ud for at hjælpe dig videre eller fragte bilen direkte til vores værksted for udbedring.',
    faq: [
      {
        q: 'Hvad er nødnummeret?',
        a: 'Du kan ringe direkte på +45 50 29 08 74 uanset tidspunkt på døgnet.',
      },
    ],
  },
  autohjælp: {
    title: 'Døgnåben Autohjælp & Bugsering',
    category: 'Akut Hjælp',
    heroText: 'Er bilen brudt sammen? Ring på vort nødnummer +45 50 29 08 74 for hurtig bugsering til vores værksted i Hvidovre.',
    fromPrice: 'Akut service',
    duration: 'Døgnvagt',
    points: [
      'Døgnåben telefonvagt på +45 50 29 08 74',
      'Bugsering af personbiler og varevogne',
      'Startelement ved fladt batteri',
      'Hjulskift på stedet ved punktering',
      'Direkte transport til Autohus Kvik Værksted',
    ],
    description: 'Når uheldet er ude, lader vi dig ikke i stikken. Vores akutteam rykker ud for at hjælpe dig videre eller fragte bilen direkte til vores værksted for udbedring.',
    faq: [
      {
        q: 'Hvad er nødnummeret?',
        a: 'Du kan ringe direkte på +45 50 29 08 74 uanset tidspunkt på døgnet.',
      },
    ],
  },
  'klargoering-til-syn': {
    title: 'Klargøring til syn & Synstjek',
    category: 'Syn & Sikkerhed',
    heroText: 'Undgå omsyn! Vi gennemgår alle bilens vitale dele grundigt, inden den skal til periodisk bilsyn.',
    fromPrice: 'Fra 495 kr.',
    duration: 'ca. 1 time',
    points: [
      'Test af bremsekraft og skævtræk',
      'Kontrol af lygter, lygtehøjde og blinklys',
      'Tjek af styretøj, bærekugler og støddæmpere',
      'Undersøgelse af rust i bærende dele og udstødning',
      'Valgfri kørsel til godkendt synshal',
    ],
    description: 'Når du modtager indkaldelse til syn fra Færdselsstyrelsen, kan et forudgående synstjek spare dig for både ærgrelse og ekstra synsgebyrer. Vi identificerer eventuelle fejl på forhånd og giver dig et fast prisoverslag, før noget udbedres.',
    faq: [
      {
        q: 'Kan I køre bilen til syn for mig?',
        a: 'Ja, du kan blot aflevere bilen hos os, så gennemgår vi den og kører den direkte til syn for dig. Du henter den godkendt.',
      },
    ],
  },
  bremseservice: {
    title: 'Bremseservice & Udskiftning',
    category: 'Mekanisk service',
    heroText: 'Dine bremser er bilens vigtigste sikkerhedsudstyr. Vi sørger for optimal bremseeffekt og sikkerhed.',
    fromPrice: 'Fra 795 kr.',
    duration: 'ca. 1-2 timer',
    points: [
      'Kontrol af bremseklodser og bremseskivers tykkelse',
      'Rensning og smøring af bremsekalibre',
      'Test og udskiftning af bremsevæske ved behov',
      'Kontrol af håndbremsekabler og sensorer',
    ],
    description: 'Bremser slides løbende ved kørsel. Hvis du oplever hylelyde, rystelser i rattet ved opbremsning, eller at bremsepedalen føles blød, er det tid til at få bremserne efterset. Vi monterer kvalitetsbremser fra anerkendte producenter.',
    faq: [
      {
        q: 'Hvor ofte bør bremserne efterses?',
        a: 'Vi anbefaler en årlig bremserensning, især efter vinterhalvåret, hvor vejsalt kan få bremsekalibrene til at sætte sig fast.',
      },
    ],
  },
};

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const { data: serviceFromApi } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => contentService.getService(slug || ''),
    enabled: !!slug,
  });

  const service = serviceFromApi || (slug && DEFAULT_SERVICE_DATA[slug]) || {
    title: (slug || 'Værkstedsydelse').replace(/-/g, ' '),
    category: 'Værkstedsydelse',
    heroText: 'Få professionel rådgivning og reparation udført af autoriserede mekanikere.',
    fromPrice: 'Kontakt for pris',
    duration: 'Efter aftale',
    points: ['Professionel diagnose', 'OE-godkendte reservedele', 'Garanti på arbejde'],
    description: 'Vores dygtige mekanikere tager sig grundigt af din bil på vores moderne værksted i Hvidovre.',
    faq: [],
  };

  return (
    <div className="service-detail-page">
      <Helmet>
        <title>{service.title} {settings.seo_title_suffix || '| Autohus Kvik'}</title>
        <meta name="description" content={service.heroText || service.description} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="container service-detail-nav">
        <button onClick={() => navigate(-1)} className="back-link">
          <ArrowLeft size={16} /> Tilbage til ydelser
        </button>
        <div className="breadcrumb">
          <Link to="/">Forside</Link> / <Link to="/vaerksted">Værksted</Link> / <span>{service.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container service-detail-grid">
        <div className="service-detail-body">
          <span className="section-label">{service.category || 'Værkstedsydelse'}</span>
          <h1 className="service-detail-title">{service.title}</h1>
          <p className="service-detail-hero-text">{service.heroText}</p>

          <div className="service-main-text">
            <h2>Hvad indebærer denne ydelse?</h2>
            <p>{service.description}</p>
          </div>

          {service.points && service.points.length > 0 && (
            <div className="service-checklist-box">
              <h3>Dette inkluderer arbejdet:</h3>
              <ul className="checklist">
                {service.points.map((pt: string, idx: number) => (
                  <li key={idx}>
                    <CheckCircle size={18} className="check-icon" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.faq && service.faq.length > 0 && (
            <div className="service-faq-section">
              <h2>Spørgsmål og svar om {service.title}</h2>
              <div className="service-faq-list">
                {service.faq.map((item: { q: string; a: string }, i: number) => (
                  <div key={i} className="service-faq-card">
                    <h4>{item.q}</h4>
                    <p>{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Booking Card */}
        <aside className="service-detail-sidebar">
          <div className="booking-cta-card">
            <div className="price-tag">
              <span className="price-label">Vejledende pris</span>
              <strong className="price-value">{service.fromPrice || 'Fast timepris'}</strong>
            </div>

            <div className="quick-meta">
              <div className="meta-item">
                <Clock size={16} />
                <span>Estimeret tid: {service.duration || 'Efter aftale'}</span>
              </div>
              <div className="meta-item">
                <Shield size={16} />
                <span>Garanti på alle reservedele</span>
              </div>
              <div className="meta-item">
                <Award size={16} />
                <span>Udføres af faglærte mekanikere</span>
              </div>
            </div>

            <Link
              to={`/book-vaerksted?service=${encodeURIComponent(service.title)}`}
              className="btn btn-primary btn-block btn-lg"
            >
              <Calendar size={18} /> Book tid til denne ydelse
            </Link>

            <a
              href={`tel:${(settings.company_phone || '+4550290874').replace(/\s/g, '')}`}
              className="btn btn-secondary btn-block"
              style={{ marginTop: '0.5rem' }}
            >
              <Phone size={18} /> Ring for spørgsmål
            </a>
          </div>

          <div className="sidebar-hours-card">
            <h4>Værkstedets åbningstider</h4>
            <div className="hours-list">
              <div className="hour-row">
                <span>Mandag - Torsdag:</span>
                <strong>10:00 - 17:00</strong>
              </div>
              <div className="hour-row">
                <span>Fredag:</span>
                <strong>10:00 - 16:00</strong>
              </div>
              <div className="hour-row">
                <span>Lørdag:</span>
                <strong>Lukket</strong>
              </div>
              <div className="hour-row">
                <span>Søndag:</span>
                <strong>12:00 - 16:00</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
