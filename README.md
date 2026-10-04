# Autohus Kvik – Komplet Webplatform

Professionel, moderne og produktionsklar full-stack webapplikation til **Autohus Kvik** i Hvidovre. Platformen omfatter både en lynhurtig mobile-first offentlig hjemmeside og et komplet, sikkert administrationspanel til bilsalg, byttebiler, servicebookinger og indholdsstyring.

---

## 🌟 Hovedfunktioner

### 1. Bilsalg & Udstilling (`/biler` og `/biler/:slug`)
* **Avanceret filtrering:** Søg på mærke, model, brændstof (Benzin, Diesel, El, Hybrid), gearkasse (Automatisk, Manuel), karrosseritype, årgang, kilometer og maks. pris.
* **Visningsformater:** Skift frit mellem responsivt gitter (Grid) og overskuelig listevisning.
* **Sortering:** Nyeste først, pris stigende/faldende, kilometer, årgang.
* **Bildetaljeside:** 
  * Fuld billedvisning med thumbnails og statusmærker (Til salg, Reserveret, Solgt).
  * Fuldstændig specifikationstabel (forbrug, hk, døre, stelnummer osv.).
  * Udstyrsliste opdelt med letlæselige badges.
  * Interaktiv finansieringsberegner med dynamisk månedlig ydelse, udbetaling og løbetid.
  * Indbyggede kontakt- og prøvekørselsformularer.
  * Deling via Web Share API og direkte printvenlig udskrift.

### 2. Sælg eller Byt din bil (`/saelg-eller-byt`)
* **4-trins interaktiv formular:**
  1. Biloplysninger (nummerplade, mærke, model, årgang, kilometer, stand).
  2. Formål (Rent kontantsalg vs. Byttebil til bil på lager).
  3. Billed-upload med forhåndsvisning og fjernelse.
  4. Kontaktoplysninger og bemærkninger.
* **Fordelsoversigt & FAQ:** Gennemskuelige svar om vurdering, indfrielse af restgæld og straksoverførsel.

### 3. Værksted & Online Tidsbestilling (`/vaerksted` og `/book-vaerksted`)
* **8 specialiserede ydelser:** Serviceeftersyn, Klargøring til syn, Bremseservice, Dækskifte, Klimaservice/AC, Fejlfinding & diagnose, Olieskift, Mekaniske reparationer.
* **Separate ydelsesundersider:** Dybdegående beskrivelser, hvad arbejdet inkluderer, vejledende priser og specifikke FAQ.
* **7-trins værkstedsbooking:**
  1. Bilens stamdata.
  2. Valg af ydelser med forhåndspriser.
  3. Detaljeret fejlbeskrivelse.
  4. Valg af lånebil.
  5. Kalender og tidsrum (Formiddag / Eftermiddag).
  6. Kundeoplysninger.
  7. Opsummering og bekræftelse.

### 4. Finansiering, Garanti, Om os & Kontakt
* **Finansieringsside (`/finansiering`):** Live låneberegner, forklaring af udbetaling, rentevilkår og udvidede mekaniske garantier.
* **Om Autohus Kvik (`/om-os`):** Forretningens værdier, CVR-nummer, lokal forankring og kvalitetsgarantier.
* **Kontakt (`/kontakt`):** Kontaktoplysninger, direkte opkaldslinks, åbningstider, nødnummer til døgnåben autohjælp (+45 50 29 08 74) og formular.
* **GDPR & Cookies:** Cookiebanner med samtykke til 3 kategorier (Nødvendige, Statistik, Marketing) og fuld privatlivspolitik.

### 5. Administrationspanel (`/admin`)
* **Sikkerhed:** JWT authentication, HttpOnly cookies, rollebaseret adgangskontrol (`owner`, `staff`) og rate-limiting mod brute-force angreb.
* **Dashboard:** Live nøgletal (antal biler til salg, nye henvendelser, ventende byttevurderinger og værkstedsbookinger).
* **Bilhåndtering:**
  * Opret ny bil med fulde specifikationer.
  * Drag-and-drop billed-upload med WebP-komprimering via ImageSharp.
  * Dupliker annonce med ét klik.
  * Rediger status (Til salg, Reserveret, Solgt).
* **Indbakker:**
  * Henvendelser (leads) med status (Ny, Kontaktet, Møde aftalt, Afsluttet), interne notater og CSV-eksport.
  * Køb- og byttebilsanmodninger.
  * Værkstedsbookinger med tidsstyring og lånebilsmarkering.
* **Indhold & Indstillinger:** Redigering af testimonials, ydelser, åbningstider, CVR, SEO metadata og skift af administratoradgangskode.

---

## 🔐 Standard Admin Login

| Felt | Værdi |
| :--- | :--- |
| **URL** | `http://localhost:5173/admin/login` (eller `/admin/login` på domænet) |
| **Brugernavn / E-mail** | `admin@autohusetkvik.dk` |
| **Adgangskode** | `Admin1234!` |

*(Adgangskoden kan ændres direkte inde under `/admin/indstillinger` efter første login).*

---

## 🛠️ Teknologistak

* **Frontend:**
  * React 19 + TypeScript + Vite
  * Vanilla CSS design system med CSS variabler, mobile-first responsivitet og glidende overgange
  * React Router DOM v7 (lazy-loaded routes)
  * TanStack Query v5 (state management og cache)
  * Lucide React (moderne letvægtsikoner)
  * React Helmet Async (SEO meta tags, OpenGraph og JSON-LD strukturerede data)
* **Backend:**
  * ASP.NET Core 9 Web API (C#)
  * Entity Framework Core 9 med Pomelo MySQL provider
  * BCrypt.Net til passwordsikkerhed
  * System.IdentityModel.Tokens.Jwt til adgangstokens
  * SixLabors.ImageSharp til billedskalering og WebP-konvertering
  * MailKit / MimeKit til SMTP e-mail notifikationer
  * ASP.NET Core RateLimiter middleware

---

## 🚀 Kom i gang lokalt (Udvikling)

### Forudsætninger
* [Node.js](https://nodejs.org/) (v18+)
* [.NET 9 SDK](https://dotnet.microsoft.com/)
* MySQL Server (eller MariaDB)

### 1. Database & Backend opsætning
1. Opret en MySQL database kaldet `autohuskvik_db`.
2. Gå til backend-mappen:
   ```bash
   cd backend/AutohusKvik.Api
   ```
3. Opdater forbindelsesstrengen i `appsettings.json` eller via miljøvariabel:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Port=3306;Database=autohuskvik_db;User=root;Password=your_password;"
   }
   ```
4. Kør databasemigrationer og opstart:
   ```bash
   dotnet run
   ```
   *API'et kører nu på https://localhost:7208 og seeder automatisk standard admin-bruger, 6 demobiler og anmeldelser.*

### 2. Frontend opsætning
1. Åbn en ny terminal og gå til frontend-mappen:
   ```bash
   cd frontend
   ```
2. Installer afhængigheder (hvis ikke allerede gjort):
   ```bash
   npm install
   ```
3. Start udviklingsserveren:
   ```bash
   npm run dev
   ```
4. Åbn din browser på `http://localhost:5173`.

---

## 📦 Deployment

### A. Deployment til Simply.com (Webhotel)
1. **Frontend:**
   * Kør `npm run build` i `frontend/`.
   * Filen `web.config` ligger automatisk i `public/` og kopieres over i `dist/`.
   * Upload alle filer og mapper fra `frontend/dist/` direkte til `public_html/` på dit webhotel via FTP eller Simply.com File Manager.
2. **Backend (.NET Core):**
   * Hvis dit webhotel understøtter .NET 9, upload den publicerede release (`dotnet publish -c Release`).
   * Alternativt kan backend hostes på en VPS / Azure / DigitalOcean / Render, mens Simply.com serverer frontend og forbinder via API-proxyen.

### B. Deployment med Docker / Linux VPS
1. **Docker Compose:**
   Byg og start containere for MySQL, API og Nginx:
   ```bash
   docker compose up -d --build
   ```

---

## ✅ Tjekliste til ejeren af Autohus Kvik

Inden den officielle lancering anbefales det at gennemgå følgende punkter i adminpanelet (`/admin`):
- [ ] **Log ind i admin** og skift adgangskoden under *Indstillinger*.
- [ ] **Bekræft kontaktoplysninger:** Tjek at CVR (`44047470`), telefon (`+45 50 29 08 74`) og e-mail stemmer.
- [ ] **Bekræft åbningstider:** Tilpas tiderne, hvis der er ændringer i weekender eller helligdage.
- [ ] **Udskift demobiler:** Opret jeres rigtige biler på lager og upload jeres egne billeder.
- [ ] **Google Analytics & GTM:** Indtast jeres GA4 Measurement ID (`G-XXXXXXXX`) under *Indstillinger*.
- [ ] **Anmeldelser:** Slå visning af anmeldelser til under *Indstillinger*, hvis I ønsker testimonials vist på forsiden.
