import type {
  CarDetail, CarFilters, CarsResponse, FilterOptions, Lead,
  TradeInStatus, BookingStatus, LeadStatus, WorkshopBooking,
  PublicSettings, Testimonial, Service, AdminUser,
  VehicleLookupResult, VehicleLookupLeadPayload, CarImage
} from '@/types';
import { MOCK_CARS, MOCK_SERVICES, MOCK_TESTIMONIALS, MOCK_SETTINGS } from './mockData';

// ─── LocalStorage Hjælpefunktioner ───
const KEYS = {
  CARS: 'autohus_cars',
  LEADS: 'autohus_leads',
  TRADE_INS: 'autohus_trade_ins',
  BOOKINGS: 'autohus_bookings',
  TESTIMONIALS: 'autohus_testimonials',
  SERVICES: 'autohus_services',
  SETTINGS: 'autohus_settings',
  AUTH_USER: 'autohus_auth_user',
  AUTH_TOKEN: 'access_token',
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Kunne ikke gemme i localStorage (${key}):`, e);
  }
}

// ─── Initial Demo Data ───
const INITIAL_LEADS: Lead[] = [
  {
    id: 1,
    referenceNumber: 'L-240101',
    type: 'test_drive',
    carTitle: 'Volkswagen Golf 1.4 TSI R-Line DSG',
    customerName: 'Mads Mikkelsen',
    customerEmail: 'mads@eksempel.dk',
    customerPhone: '+45 20 12 34 56',
    status: 'new',
    assignedTo: 'Salgsteam',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 2,
    referenceNumber: 'L-240102',
    type: 'car_inquiry',
    carTitle: 'Audi A4 2.0 TDI Avant S-Line',
    customerName: 'Sarah Lund',
    customerEmail: 'sarah.lund@eksempel.dk',
    customerPhone: '+45 30 45 67 89',
    status: 'contacted',
    assignedTo: 'Salgsteam',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 3,
    referenceNumber: 'L-240103',
    type: 'contact',
    carTitle: 'Generel henvendelse',
    customerName: 'Jens Peter Hansen',
    customerEmail: 'jph@eksempel.dk',
    customerPhone: '+45 40 55 66 77',
    status: 'appointment',
    assignedTo: 'Kundeservice',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export interface TradeInItem {
  id: number;
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  licensePlate?: string;
  carMake?: string;
  carModel?: string;
  carYear?: number;
  mileage?: number;
  condition?: string;
  purpose?: string;
  desiredPrice?: string;
  notes?: string;
  images?: string[];
  status: TradeInStatus;
  createdAt: string;
}

const INITIAL_TRADE_INS: TradeInItem[] = [
  {
    id: 1,
    referenceNumber: 'B-240101',
    customerName: 'Thomas Vinter',
    customerEmail: 'thomas@eksempel.dk',
    customerPhone: '+45 22 33 44 55',
    licensePlate: 'CW 88 921',
    carMake: 'Audi',
    carModel: 'A4 Avant',
    carYear: 2018,
    mileage: 112000,
    condition: 'Rigtig god - alle service overholdt',
    purpose: 'Bytte til VW Golf',
    desiredPrice: '145.000 kr.',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 2,
    referenceNumber: 'B-240102',
    customerName: 'Camilla Frost',
    customerEmail: 'camilla@eksempel.dk',
    customerPhone: '+45 61 72 83 94',
    licensePlate: 'EF 67 890',
    carMake: 'Mercedes-Benz',
    carModel: 'C220',
    carYear: 2017,
    mileage: 145000,
    condition: 'Pæn stand, mindre stenslag på forkofanger',
    purpose: 'Rent kontantsalg',
    desiredPrice: '160.000 kr.',
    status: 'contacted',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

export interface WorkshopBookingExtended extends WorkshopBooking {
  services?: string[];
  serviceDescription?: string;
  taskDescription?: string;
  needsLoanerCar?: boolean;
  notes?: string;
}

const INITIAL_BOOKINGS: WorkshopBookingExtended[] = [
  {
    id: 1,
    referenceNumber: 'V-240101',
    licensePlate: 'AB 12 345',
    carMake: 'Volkswagen',
    carModel: 'Golf 7',
    customerName: 'Christian Friis',
    customerEmail: 'cfriis@eksempel.dk',
    customerPhone: '+45 50 11 22 33',
    services: ['Serviceeftersyn & Eftersyn', 'Olieskift & Oliefilter'],
    requestedDate: '2026-10-15',
    requestedTimeSlot: 'Formiddag (08:00 - 12:00)',
    needsLoanerCar: true,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 2,
    referenceNumber: 'V-240102',
    licensePlate: 'DK 99 111',
    carMake: 'Toyota',
    carModel: 'Yaris',
    customerName: 'Lene Skov',
    customerEmail: 'lene@eksempel.dk',
    customerPhone: '+45 28 39 40 51',
    services: ['Dækskifte & Hjulskift', 'Klargøring til syn & Synstjek'],
    requestedDate: '2026-10-18',
    requestedTimeSlot: 'Eftermiddag (12:00 - 16:00)',
    needsLoanerCar: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

const DEFAULT_ADMIN_USER: AdminUser = {
  id: 1,
  name: 'Autohus Kvik Administrator',
  email: 'admin@autohusetkvik.dk',
  role: 'owner',
};

// ─── Initialisering ───
export function initStore() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEYS.CARS)) {
    safeSet(KEYS.CARS, MOCK_CARS);
  }
  if (!localStorage.getItem(KEYS.LEADS)) {
    safeSet(KEYS.LEADS, INITIAL_LEADS);
  }
  if (!localStorage.getItem(KEYS.TRADE_INS)) {
    safeSet(KEYS.TRADE_INS, INITIAL_TRADE_INS);
  }
  if (!localStorage.getItem(KEYS.BOOKINGS)) {
    safeSet(KEYS.BOOKINGS, INITIAL_BOOKINGS);
  }
  if (!localStorage.getItem(KEYS.TESTIMONIALS)) {
    safeSet(KEYS.TESTIMONIALS, MOCK_TESTIMONIALS);
  }
  if (!localStorage.getItem(KEYS.SERVICES)) {
    safeSet(KEYS.SERVICES, MOCK_SERVICES);
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    safeSet(KEYS.SETTINGS, MOCK_SETTINGS);
  }
}

// Kald initialisering ved modulindlæsning
initStore();

// ─── Store API Implementation ───
export const clientStore = {
  // ─── Biler ───
  getCars: (filters: CarFilters = {}): CarsResponse => {
    initStore();
    let list: CarDetail[] = safeGet(KEYS.CARS, MOCK_CARS);

    if (filters.make) {
      list = list.filter((c) => c.make.toLowerCase() === filters.make!.toLowerCase());
    }
    if (filters.model) {
      list = list.filter((c) => c.model.toLowerCase() === filters.model!.toLowerCase());
    }
    if (filters.fuelType) {
      list = list.filter((c) => c.fuelType?.toLowerCase() === filters.fuelType!.toLowerCase());
    }
    if (filters.transmission) {
      list = list.filter((c) => c.transmission?.toLowerCase() === filters.transmission!.toLowerCase());
    }
    if (filters.bodyType) {
      list = list.filter((c) => c.bodyType?.toLowerCase() === filters.bodyType!.toLowerCase());
    }
    if (filters.maxPrice) {
      list = list.filter((c) => c.price <= Number(filters.maxPrice));
    }
    if (filters.minPrice) {
      list = list.filter((c) => c.price >= Number(filters.minPrice));
    }
    if (filters.minYear) {
      list = list.filter((c) => c.year >= Number(filters.minYear));
    }
    if (filters.maxYear) {
      list = list.filter((c) => c.year <= Number(filters.maxYear));
    }
    if (filters.status) {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters.isFeatured) {
      list = list.filter((c) => c.isFeatured);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter((c) =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.make || '').toLowerCase().includes(q) ||
        (c.model || '').toLowerCase().includes(q) ||
        (c.variant || '').toLowerCase().includes(q)
      );
    }

    // Sortering
    if (filters.sort) {
      if (filters.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (filters.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      else if (filters.sort === 'year_desc') list.sort((a, b) => b.year - a.year);
      else if (filters.sort === 'mileage_asc') list.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
      else if (filters.sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const pageSize = filters.pageSize || 12;
    const page = filters.page || 1;
    const startIndex = (page - 1) * pageSize;
    const pagedCars = list.slice(startIndex, startIndex + pageSize);

    return {
      cars: pagedCars,
      total: list.length,
      totalCount: list.length,
      page,
      pageSize,
      totalPages: Math.ceil(list.length / pageSize) || 1,
    };
  },

  getAllCarsRaw: (): CarDetail[] => {
    initStore();
    return safeGet(KEYS.CARS, MOCK_CARS);
  },

  getCar: (slugOrId: string | number): CarDetail => {
    initStore();
    const cars = safeGet<CarDetail[]>(KEYS.CARS, MOCK_CARS);
    const found = cars.find((c) =>
      typeof slugOrId === 'number'
        ? c.id === slugOrId
        : c.slug === slugOrId || String(c.id) === String(slugOrId)
    );
    return found || cars[0];
  },

  createCar: (payload: any): CarDetail => {
    initStore();
    const cars = safeGet<CarDetail[]>(KEYS.CARS, MOCK_CARS);
    const id = Date.now();
    const title = `${payload.make} ${payload.model} ${payload.variant || ''}`.trim();
    const slug = `${payload.make}-${payload.model}-${payload.year}-${id.toString().slice(-4)}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const newCar: CarDetail = {
      ...payload,
      id,
      title,
      slug,
      status: payload.status || 'for_sale',
      isFeatured: !!payload.isFeatured,
      isNew: true,
      hasWarranty: payload.hasWarranty ?? true,
      isPrepared: true,
      hasServiceHistory: true,
      isInspected: true,
      createdAt: new Date().toISOString(),
      images: payload.images && payload.images.length > 0 ? payload.images : [
        {
          id: 1,
          filePath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
          thumbnailPath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
          webPPath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
          isPrimary: true,
          sortOrder: 1,
        }
      ],
      coverImage: {
        thumbnailPath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
        webPPath: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
        altText: title,
      },
      features: [
        { category: 'Sikkerhed', items: ['Adaptiv fartpilot', 'Isofix', 'Vejbaneassistent'] },
        { category: 'Komfort', items: ['Klimaanlæg', 'Sædevarme for', 'Multifunktionsrat'] }
      ],
      relatedCars: [],
    };

    cars.unshift(newCar);
    safeSet(KEYS.CARS, cars);
    return newCar;
  },

  updateCar: (id: number, payload: any): CarDetail => {
    initStore();
    const cars = safeGet<CarDetail[]>(KEYS.CARS, MOCK_CARS);
    const index = cars.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Bil med ID ${id} blev ikke fundet.`);
    }

    const title = `${payload.make || cars[index].make} ${payload.model || cars[index].model} ${payload.variant || cars[index].variant || ''}`.trim();
    const updated: CarDetail = {
      ...cars[index],
      ...payload,
      id,
      title,
    };

    cars[index] = updated;
    safeSet(KEYS.CARS, cars);
    return updated;
  },

  deleteCar: (id: number): boolean => {
    initStore();
    let cars = safeGet<CarDetail[]>(KEYS.CARS, MOCK_CARS);
    cars = cars.filter((c) => c.id !== id);
    safeSet(KEYS.CARS, cars);
    return true;
  },

  duplicateCar: (id: number): CarDetail => {
    initStore();
    const cars = safeGet<CarDetail[]>(KEYS.CARS, MOCK_CARS);
    const car = cars.find((c) => c.id === id);
    if (!car) throw new Error('Bilen blev ikke fundet.');

    const newId = Date.now();
    const duplicated: CarDetail = {
      ...car,
      id: newId,
      title: `${car.title} (Kopi)`,
      slug: `${car.slug}-kopi-${newId.toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      status: 'for_sale',
    };

    cars.unshift(duplicated);
    safeSet(KEYS.CARS, cars);
    return duplicated;
  },

  uploadCarImages: async (carId: number, files: File[]): Promise<CarImage[]> => {
    initStore();
    const cars = safeGet<CarDetail[]>(KEYS.CARS, MOCK_CARS);
    const carIndex = cars.findIndex((c) => c.id === carId);

    const convertedImages: CarImage[] = await Promise.all(
      files.map((file, idx) => {
        return new Promise<CarImage>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            resolve({
              id: Date.now() + idx,
              filePath: dataUrl,
              thumbnailPath: dataUrl,
              webPPath: dataUrl,
              altText: file.name,
              isPrimary: idx === 0,
              sortOrder: idx + 1,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    if (carIndex !== -1) {
      cars[carIndex].images = [...(cars[carIndex].images || []), ...convertedImages];
      if (convertedImages.length > 0 && !cars[carIndex].coverImage?.webPPath) {
        cars[carIndex].coverImage = {
          thumbnailPath: convertedImages[0].thumbnailPath,
          webPPath: convertedImages[0].webPPath,
          altText: cars[carIndex].title,
        };
      }
      safeSet(KEYS.CARS, cars);
    }

    return convertedImages;
  },

  getFilterOptions: (): FilterOptions => {
    initStore();
    const cars = safeGet<CarDetail[]>(KEYS.CARS, MOCK_CARS);
    const makes = Array.from(new Set(cars.map((c) => c.make).filter(Boolean)));
    const models = Array.from(new Set(cars.map((c) => c.model).filter(Boolean)));
    const fuelTypes = Array.from(new Set(cars.map((c) => c.fuelType).filter(Boolean))) as string[];
    const transmissions = Array.from(new Set(cars.map((c) => c.transmission).filter(Boolean))) as string[];
    const bodyTypes = Array.from(new Set(cars.map((c) => c.bodyType).filter(Boolean))) as string[];
    const colors = Array.from(new Set(cars.map((c) => c.color).filter(Boolean))) as string[];

    const prices = cars.map((c) => c.price);
    const years = cars.map((c) => c.year);

    return {
      makes,
      models,
      fuelTypes: fuelTypes.length ? fuelTypes : ['Benzin', 'Diesel', 'El', 'Hybrid'],
      transmissions: transmissions.length ? transmissions : ['Automatisk', 'Manuel'],
      bodyTypes: bodyTypes.length ? bodyTypes : ['Stationcar', 'Hatchback', 'Sedan', 'SUV'],
      colors,
      minPrice: prices.length ? Math.min(...prices) : 100000,
      maxPrice: prices.length ? Math.max(...prices) : 400000,
      minYear: years.length ? Math.min(...years) : 2018,
      maxYear: years.length ? Math.max(...years) : 2024,
    };
  },

  // ─── Henvendelser (Leads) ───
  getLeads: (params: { status?: string } = {}): Lead[] => {
    initStore();
    let leads = safeGet<Lead[]>(KEYS.LEADS, INITIAL_LEADS);
    if (params.status) {
      leads = leads.filter((l) => l.status === params.status);
    }
    return leads;
  },

  getLeadById: (id: number): (Lead & { notes?: string; message?: string }) | undefined => {
    initStore();
    const leads = safeGet<(Lead & { notes?: string; message?: string })[]>(KEYS.LEADS, INITIAL_LEADS);
    return leads.find((l) => l.id === id);
  },

  addLead: (payload: any): { success: boolean; message: string; referenceNumber: string } => {
    initStore();
    const leads = safeGet<any[]>(KEYS.LEADS, INITIAL_LEADS);
    const id = Date.now();
    const ref = `L-${id.toString().slice(-6)}`;

    const newLead = {
      id,
      referenceNumber: ref,
      type: payload.type || 'contact',
      carTitle: payload.carTitle || (payload.carId ? `Bil ID: ${payload.carId}` : 'Generel henvendelse'),
      customerName: payload.customerName || payload.name || 'Ukendt kunde',
      customerEmail: payload.customerEmail || payload.email || '',
      customerPhone: payload.customerPhone || payload.phone || '',
      message: payload.message || payload.comments || '',
      status: 'new' as LeadStatus,
      assignedTo: 'Salg & Service',
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
    };

    leads.unshift(newLead);
    safeSet(KEYS.LEADS, leads);
    return { success: true, message: 'Tak for din henvendelse! Vi vender tilbage hurtigst muligt.', referenceNumber: ref };
  },

  updateLeadStatus: (id: number, payload: { status: string; notes?: string }): any => {
    initStore();
    const leads = safeGet<any[]>(KEYS.LEADS, INITIAL_LEADS);
    const index = leads.findIndex((l) => l.id === id);
    if (index !== -1) {
      leads[index] = {
        ...leads[index],
        status: payload.status,
        notes: payload.notes !== undefined ? payload.notes : leads[index].notes,
      };
      safeSet(KEYS.LEADS, leads);
      return leads[index];
    }
    return { id, ...payload };
  },

  exportLeadsCsv: (): Blob => {
    initStore();
    const leads = safeGet<any[]>(KEYS.LEADS, INITIAL_LEADS);
    const headers = 'ID;Referencenr;Type;Kunde;Email;Telefon;Emne/Bil;Status;Dato\n';
    const rows = leads.map((l) =>
      `"${l.id}";"${l.referenceNumber}";"${l.type}";"${l.customerName}";"${l.customerEmail}";"${l.customerPhone || ''}";"${l.carTitle || ''}";"${l.status}";"${l.createdAt}"`
    ).join('\n');

    return new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
  },

  // ─── Byttebiler & Køb ───
  getTradeIns: (params: { status?: string } = {}): TradeInItem[] => {
    initStore();
    let tradeIns = safeGet<TradeInItem[]>(KEYS.TRADE_INS, INITIAL_TRADE_INS);
    if (params.status) {
      tradeIns = tradeIns.filter((t) => t.status === params.status);
    }
    return tradeIns;
  },

  getTradeInById: (id: number): TradeInItem | undefined => {
    initStore();
    const tradeIns = safeGet<TradeInItem[]>(KEYS.TRADE_INS, INITIAL_TRADE_INS);
    return tradeIns.find((t) => t.id === id);
  },

  addTradeIn: (formDataOrObj: any): { success: boolean; message: string } => {
    initStore();
    const tradeIns = safeGet<TradeInItem[]>(KEYS.TRADE_INS, INITIAL_TRADE_INS);
    const id = Date.now();

    let data: any = {};
    if (formDataOrObj instanceof FormData) {
      for (const [key, value] of (formDataOrObj as any).entries()) {
        data[key] = value;
      }
    } else {
      data = formDataOrObj;
    }

    const newTradeIn: TradeInItem = {
      id,
      referenceNumber: `B-${id.toString().slice(-6)}`,
      customerName: data.customerName || data.name || 'Interesseret bilejer',
      customerEmail: data.customerEmail || data.email || '',
      customerPhone: data.customerPhone || data.phone || '',
      licensePlate: data.licensePlate || data.registrationNumber || '',
      carMake: data.carMake || data.make || '',
      carModel: data.carModel || data.model || '',
      carYear: Number(data.carYear || data.year || new Date().getFullYear()),
      mileage: Number(data.mileage || 0),
      condition: data.condition || 'Almindelig pæn',
      purpose: data.purpose || 'Byttebil / Kontantsalg',
      desiredPrice: data.desiredPrice || 'Vurdering ønskes',
      notes: data.notes || data.message || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    tradeIns.unshift(newTradeIn);
    safeSet(KEYS.TRADE_INS, tradeIns);

    // Opret også en henvendelse, så den ses i overblik
    clientStore.addLead({
      type: 'contact',
      customerName: newTradeIn.customerName,
      customerEmail: newTradeIn.customerEmail,
      customerPhone: newTradeIn.customerPhone,
      carTitle: `Bytte/Køb: ${newTradeIn.carMake} ${newTradeIn.carModel} (${newTradeIn.licensePlate})`,
      message: `Kunde ønsker vurdering af bil. Stand: ${newTradeIn.condition}. Km: ${newTradeIn.mileage}.`,
    });

    return {
      success: true,
      message: 'Tak! Vi har modtaget dine biloplysninger og vender tilbage med en uforpligtende vurdering inden for 24 timer.'
    };
  },

  updateTradeInStatus: (id: number, payload: any): any => {
    initStore();
    const tradeIns = safeGet<TradeInItem[]>(KEYS.TRADE_INS, INITIAL_TRADE_INS);
    const index = tradeIns.findIndex((t) => t.id === id);
    if (index !== -1) {
      tradeIns[index] = { ...tradeIns[index], ...payload };
      safeSet(KEYS.TRADE_INS, tradeIns);
      return tradeIns[index];
    }
    return { id, ...payload };
  },

  // ─── Værkstedsbookinger ───
  getBookings: (params: { status?: string } = {}): WorkshopBookingExtended[] => {
    initStore();
    let bookings = safeGet<WorkshopBookingExtended[]>(KEYS.BOOKINGS, INITIAL_BOOKINGS);
    if (params.status) {
      bookings = bookings.filter((b) => b.status === params.status);
    }
    return bookings;
  },

  getBookingById: (id: number): WorkshopBookingExtended | undefined => {
    initStore();
    const bookings = safeGet<WorkshopBookingExtended[]>(KEYS.BOOKINGS, INITIAL_BOOKINGS);
    return bookings.find((b) => b.id === id);
  },

  addBooking: (formDataOrObj: any): { success: boolean; message: string; referenceNumber: string } => {
    initStore();
    const bookings = safeGet<WorkshopBookingExtended[]>(KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const id = Date.now();
    const ref = `V-${id.toString().slice(-6)}`;

    let data: any = {};
    if (formDataOrObj instanceof FormData) {
      for (const [key, value] of (formDataOrObj as any).entries()) {
        data[key] = value;
      }
    } else {
      data = formDataOrObj;
    }

    const services = Array.isArray(data.services)
      ? data.services
      : data.serviceDescription
        ? [data.serviceDescription]
        : ['Serviceeftersyn'];

    const newBooking: WorkshopBookingExtended = {
      id,
      referenceNumber: ref,
      licensePlate: data.licensePlate || '',
      carMake: data.carMake || '',
      carModel: data.carModel || '',
      customerName: data.customerName || data.name || 'Værkstedskunde',
      customerEmail: data.customerEmail || data.email || '',
      customerPhone: data.customerPhone || data.phone || '',
      requestedDate: data.requestedDate || new Date().toISOString().slice(0, 10),
      requestedTimeSlot: data.requestedTimeSlot || 'Formiddag (08:00 - 12:00)',
      services,
      serviceDescription: services.join(', '),
      taskDescription: data.taskDescription || data.message || '',
      needsLoanerCar: !!data.needsLoanerCar || !!data.loanerCar,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    safeSet(KEYS.BOOKINGS, bookings);

    // Gem som henvendelse også
    clientStore.addLead({
      type: 'contact',
      customerName: newBooking.customerName,
      customerEmail: newBooking.customerEmail,
      customerPhone: newBooking.customerPhone,
      carTitle: `Værkstedsbooking (${newBooking.requestedDate}): ${newBooking.services?.join(', ')}`,
      message: `Bil: ${newBooking.carMake} ${newBooking.carModel} (${newBooking.licensePlate}). Tidsrum: ${newBooking.requestedTimeSlot}. Lånebil: ${newBooking.needsLoanerCar ? 'Ja' : 'Nej'}.`,
    });

    return {
      success: true,
      message: 'Tak! Din bookingforespørgsel er modtaget hos Autohus Kviks værksted. Vi bekræfter hurtigst muligt.',
      referenceNumber: ref
    };
  },

  updateBookingStatus: (id: number, payload: any): any => {
    initStore();
    const bookings = safeGet<WorkshopBookingExtended[]>(KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const index = bookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...payload };
      safeSet(KEYS.BOOKINGS, bookings);
      return bookings[index];
    }
    return { id, ...payload };
  },

  // ─── Nummerplade & Synsbasen Opslag ───
  vehicleLookup: (type: 'registration' | 'vin', rawValue: string): VehicleLookupResult => {
    const val = rawValue.replace(/\s+/g, '').replace(/-/g, '').toUpperCase();

    // Tjek om nummerpladen svarer til en af vores kendte biler
    const cars = safeGet<CarDetail[]>(KEYS.CARS, MOCK_CARS);

    // Kendte testplader med faste, rige data
    const PRESETS: Record<string, Partial<VehicleLookupResult>> = {
      'AB12345': {
        make: 'Volkswagen',
        model: 'Golf',
        variant: '1.4 TSI R-Line DSG 150HK',
        year: 2021,
        firstRegistrationDate: '2021-03-15',
        fuelType: 'Benzin',
        fuelConsumptionKmPerL: 18.2,
        horsepower: 150,
        vin: 'WVWZZZAUZMW012345',
        color: 'Pure White',
        bodyType: 'Hatchback',
        mileage: 58000,
        lastInspectionDate: '2025-01-14',
        lastInspectionResult: 'Godkendt',
        nextInspectionDate: '2027-01-14',
        status: 'Aktiv / Registreret',
        curbWeight: 1285,
        totalWeight: 1820,
      },
      'CW88921': {
        make: 'Audi',
        model: 'A4',
        variant: '2.0 TDI Avant S-Line S-tronic 190HK',
        year: 2020,
        firstRegistrationDate: '2020-05-20',
        fuelType: 'Diesel',
        fuelConsumptionKmPerL: 21.3,
        horsepower: 190,
        vin: 'WAUZZZF46LA088921',
        color: 'Mythossort Metallak',
        bodyType: 'Stationcar',
        mileage: 89000,
        lastInspectionDate: '2024-04-18',
        lastInspectionResult: 'Godkendt',
        nextInspectionDate: '2026-04-18',
        status: 'Aktiv / Registreret',
        curbWeight: 1570,
        totalWeight: 2145,
      },
      'EF67890': {
        make: 'Mercedes-Benz',
        model: 'C220',
        variant: 'd 2.0 AMG Line 9G-Tronic 194HK',
        year: 2019,
        firstRegistrationDate: '2019-09-10',
        fuelType: 'Diesel',
        fuelConsumptionKmPerL: 20.4,
        horsepower: 194,
        vin: 'WDD2052041F678901',
        color: 'Selenitgrå Metallak',
        bodyType: 'Stationcar',
        mileage: 104000,
        lastInspectionDate: '2024-11-05',
        lastInspectionResult: 'Godkendt',
        nextInspectionDate: '2026-11-05',
        status: 'Aktiv / Registreret',
        curbWeight: 1615,
        totalWeight: 2225,
      },
      'BB22444': {
        make: 'Peugeot',
        model: '208',
        variant: '1.2 PureTech Allure Sky 100HK EAT8',
        year: 2022,
        firstRegistrationDate: '2022-06-12',
        fuelType: 'Benzin',
        fuelConsumptionKmPerL: 22.7,
        horsepower: 100,
        vin: 'VR3UPHNFPNT022444',
        color: 'Faro Gul',
        bodyType: 'Hatchback',
        mileage: 34000,
        lastInspectionDate: '2024-06-10',
        lastInspectionResult: 'Godkendt',
        nextInspectionDate: '2026-06-10',
        status: 'Aktiv / Registreret',
        curbWeight: 1165,
        totalWeight: 1625,
      },
      'DK99111': {
        make: 'Toyota',
        model: 'Yaris',
        variant: '1.5 Hybrid H3 Comfort e-CVT 116HK',
        year: 2021,
        firstRegistrationDate: '2021-08-25',
        fuelType: 'Hybrid',
        fuelConsumptionKmPerL: 26.3,
        horsepower: 116,
        vin: 'VNKKGCA330A099111',
        color: 'Shuriken Grå',
        bodyType: 'Hatchback',
        mileage: 42000,
        lastInspectionDate: '2025-08-15',
        lastInspectionResult: 'Godkendt',
        nextInspectionDate: '2027-08-15',
        status: 'Aktiv / Registreret',
        curbWeight: 1110,
        totalWeight: 1615,
      }
    };

    if (PRESETS[val]) {
      return {
        found: true,
        registrationNumber: val,
        ...PRESETS[val],
      };
    }

    // Tjek om indtastningen matcher en bil på lager
    const matchingStockCar = cars.find((c) =>
      c.vin === val ||
      (c.make && val.toLowerCase().includes(c.make.toLowerCase())) ||
      (c.model && val.toLowerCase().includes(c.model.toLowerCase()))
    );

    if (matchingStockCar) {
      return {
        found: true,
        registrationNumber: val,
        make: matchingStockCar.make,
        model: matchingStockCar.model,
        variant: matchingStockCar.variant,
        year: matchingStockCar.year,
        firstRegistrationDate: `${matchingStockCar.year}-04-01`,
        fuelType: matchingStockCar.fuelType,
        fuelConsumptionKmPerL: matchingStockCar.fuelConsumptionKmPerL || 19.5,
        horsepower: matchingStockCar.horsepower || 150,
        vin: matchingStockCar.vin || `DK${val}99447711X`,
        color: matchingStockCar.color || 'Sort',
        bodyType: matchingStockCar.bodyType || 'Personbil',
        mileage: matchingStockCar.mileage || 65000,
        lastInspectionDate: '2025-02-10',
        lastInspectionResult: 'Godkendt',
        nextInspectionDate: '2027-02-10',
        status: 'Aktiv / Registreret',
        curbWeight: 1350,
        totalWeight: 1850,
      };
    }

    // Hvis det er en gyldig nummerplade eller VIN, generer realistiske data
    if ((type === 'registration' && val.length >= 2 && val.length <= 8) || (type === 'vin' && val.length === 17)) {
      // Deterministisk udvælgelse baseret på nummerplade-hash
      const hash = val.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const brands = [
        { make: 'Skoda', model: 'Octavia', variant: '2.0 TDI Combi Style DSG', fuel: 'Diesel', hp: 150, kmL: 22.1 },
        { make: 'Ford', model: 'Focus', variant: '1.0 EcoBoost Titanium 125HK', fuel: 'Benzin', hp: 125, kmL: 19.8 },
        { make: 'Volvo', model: 'V60', variant: '2.0 D4 Momentum Aut.', fuel: 'Diesel', hp: 190, kmL: 20.8 },
        { make: 'BMW', model: '320d', variant: '2.0 Touring M-Sport', fuel: 'Diesel', hp: 190, kmL: 21.0 },
        { make: 'Volkswagen', model: 'Passat', variant: '1.5 TSI Elegance DSG', fuel: 'Benzin', hp: 150, kmL: 18.5 },
      ];
      const selected = brands[hash % brands.length];
      const year = 2018 + (hash % 6); // 2018-2023

      return {
        found: true,
        registrationNumber: type === 'registration' ? val : `AB${hash.toString().slice(-5)}`,
        make: selected.make,
        model: selected.model,
        variant: selected.variant,
        year,
        firstRegistrationDate: `${year}-05-15`,
        fuelType: selected.fuel,
        fuelConsumptionKmPerL: selected.kmL,
        horsepower: selected.hp,
        vin: type === 'vin' ? val : `WBA${val}X987654321`,
        color: ['Hvid', 'Sort Metallak', 'Koksgrå Metallak', 'Blå Metallak'][hash % 4],
        bodyType: 'Stationcar',
        mileage: 35000 + (hash % 120) * 1000,
        lastInspectionDate: '2024-10-12',
        lastInspectionResult: 'Godkendt',
        nextInspectionDate: '2026-10-12',
        status: 'Aktiv / Registreret i Motorregistret',
        curbWeight: 1420,
        totalWeight: 1980,
      };
    }

    return {
      found: false,
      message: 'Bilen blev ikke fundet i Motorregistret. Tjek nummerpladen eller kontakt os direkte.',
    };
  },

  // ─── Indstillinger & Dashboard ───
  getSettings: (): Record<string, string> => {
    initStore();
    return safeGet<Record<string, string>>(KEYS.SETTINGS, MOCK_SETTINGS as any);
  },

  updateSettings: (updates: Record<string, string | null>): Record<string, string> => {
    initStore();
    const current = safeGet<Record<string, string>>(KEYS.SETTINGS, MOCK_SETTINGS as any);
    const merged = { ...current, ...updates };
    safeSet(KEYS.SETTINGS, merged);
    return merged;
  },

  getTestimonials: (): Testimonial[] => {
    initStore();
    return safeGet<Testimonial[]>(KEYS.TESTIMONIALS, MOCK_TESTIMONIALS);
  },

  createTestimonial: (payload: any): Testimonial => {
    initStore();
    const list = safeGet<Testimonial[]>(KEYS.TESTIMONIALS, MOCK_TESTIMONIALS);
    const newTestimonial: Testimonial = {
      id: Date.now(),
      authorName: payload.authorName || 'Kunde',
      authorTitle: payload.authorTitle || 'Verificeret bilkøber',
      content: payload.content || '',
      rating: payload.rating || 5,
      isActive: true,
      sortOrder: list.length + 1,
    };
    list.unshift(newTestimonial);
    safeSet(KEYS.TESTIMONIALS, list);
    return newTestimonial;
  },

  deleteTestimonial: (id: number): boolean => {
    initStore();
    let list = safeGet<Testimonial[]>(KEYS.TESTIMONIALS, MOCK_TESTIMONIALS);
    list = list.filter((t) => t.id !== id);
    safeSet(KEYS.TESTIMONIALS, list);
    return true;
  },

  getServices: (): Service[] => {
    initStore();
    return safeGet<Service[]>(KEYS.SERVICES, MOCK_SERVICES as any);
  },

  getService: (slug: string): Service | undefined => {
    initStore();
    const services = safeGet<Service[]>(KEYS.SERVICES, MOCK_SERVICES as any);
    return services.find((s) => s.slug === slug) || services[0];
  },

  getDashboard: () => {
    initStore();
    const cars = safeGet<CarDetail[]>(KEYS.CARS, MOCK_CARS);
    const leads = safeGet<Lead[]>(KEYS.LEADS, INITIAL_LEADS);
    const tradeIns = safeGet<TradeInItem[]>(KEYS.TRADE_INS, INITIAL_TRADE_INS);
    const bookings = safeGet<WorkshopBookingExtended[]>(KEYS.BOOKINGS, INITIAL_BOOKINGS);

    return {
      carsCount: cars.filter((c) => c.status === 'for_sale').length,
      leadsCount: leads.filter((l) => l.status === 'new').length,
      tradeInsCount: tradeIns.filter((t) => t.status === 'new').length,
      bookingsCount: bookings.filter((b) => b.status === 'new' || b.status === 'pending').length,
      recentLeads: leads.slice(0, 5),
      recentBookings: bookings.slice(0, 5),
    };
  },

  // ─── Godkendelse / Auth ───
  login: async (email: string, password: string): Promise<{ accessToken: string; user: AdminUser }> => {
    initStore();
    // Simuler hurtig netværksforsinkelse for realistisk feel
    await new Promise((r) => setTimeout(r, 200));

    // Godkend enhver login-anmodning til admin for demo/testing
    const user: AdminUser = {
      ...DEFAULT_ADMIN_USER,
      email: email.trim() || DEFAULT_ADMIN_USER.email,
    };
    const token = `autohus_jwt_${Date.now()}`;

    safeSet(KEYS.AUTH_USER, user);
    localStorage.setItem(KEYS.AUTH_TOKEN, token);

    return { accessToken: token, user };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(KEYS.AUTH_TOKEN);
    localStorage.removeItem(KEYS.AUTH_USER);
  },

  getMe: async (): Promise<AdminUser> => {
    initStore();
    const user = safeGet<AdminUser>(KEYS.AUTH_USER, DEFAULT_ADMIN_USER);
    return user;
  },
};
