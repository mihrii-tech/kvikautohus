import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://autohusetkvik.dk';
const DEFAULT_IMAGE = `${SITE_URL}/images/dealership.jpg`;

interface SeoProps {
  title: string;
  description: string;
  /** Sti uden domæne, fx "/book-vaerksted" */
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Fælles SEO-komponent: title, description, canonical, Open Graph, Twitter og JSON-LD.
 */
export default function Seo({ title, description, path, image, type = 'website', noindex, jsonLd }: SeoProps) {
  const url = `${SITE_URL}${path}`;
  const img = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : DEFAULT_IMAGE;
  const fullTitle = title.includes('Autohus Kvik') ? title : `${title} | Autohus Kvik Hvidovre`;

  return (
    <Helmet>
      <html lang="da" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="da_DK" />
      <meta property="og:site_name" content="Autohus Kvik" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

export { SITE_URL };
