import api from './api';
import { clientStore } from './clientStore';
import { lookupLiveSynsbasen } from './synsbasen';
import type {
  CarDetail, CarFilters, CarsResponse, FilterOptions,
  VehicleLookupResult, VehicleLookupLeadPayload
} from '@/types';

// Hjælper til at afgøre om vi kører mod et rigtigt backend-API
const hasBackendUrl = Boolean(import.meta.env.VITE_API_URL);

// ─── Offentlige Biler ───
export const carsService = {
  getCars: async (filters: CarFilters = {}): Promise<CarsResponse> => {
    if (hasBackendUrl) {
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        });
        const { data } = await api.get(`/cars?${params.toString()}`);
        if (data && data.cars && Array.isArray(data.cars)) return data;
      } catch (e) {
        console.warn('Fallback til browser-database for biler:', e);
      }
    }
    return clientStore.getCars(filters);
  },

  getCar: async (slug: string): Promise<CarDetail> => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get(`/cars/${slug}`);
        if (data && data.id) return data;
      } catch (e) {
        console.warn('Fallback til browser-database for bil:', e);
      }
    }
    return clientStore.getCar(slug);
  },

  getFilterOptions: async (): Promise<FilterOptions> => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/cars/filters');
        if (data && data.makes) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getFilterOptions();
  },

  getSitemapData: async () => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/content/sitemap');
        if (data) return data;
      } catch {
        // Fallback
      }
    }
    const cars = clientStore.getAllCarsRaw();
    return { cars: cars.map((c) => ({ slug: c.slug, updatedAt: c.createdAt || new Date().toISOString() })) };
  },
};

// ─── Offentligt Indhold & Indstillinger ───
export const contentService = {
  getPublicSettings: async () => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/content/settings/public');
        if (data && typeof data === 'object') return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getSettings();
  },

  getTestimonials: async () => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/content/testimonials');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getTestimonials();
  },

  getServices: async () => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/workshop/services');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getServices();
  },

  getService: async (slug: string) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get(`/workshop/services/${slug}`);
        if (data && data.id) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getService(slug);
  },
};

// ─── Henvendelser (Leads) ───
export const leadsService = {
  submitLead: async (payload: Record<string, unknown>) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.post('/leads', payload);
        if (data) {
          clientStore.addLead(payload);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.addLead(payload);
  },
};

// ─── Nummerplade & Synsbasen Opslag ───
export const vehicleLookupService = {
  lookup: async (type: 'registration' | 'vin', value: string): Promise<VehicleLookupResult> => {
    // 1. Slå altid direkte op i det rigtige Synsbasen API
    try {
      const liveData = await lookupLiveSynsbasen(type, value);
      if (liveData && liveData.found && liveData.make) {
        return liveData;
      }
    } catch (e) {
      console.warn('Synsbasen live API opslag fejlede:', e);
    }

    // 2. Hvis der er sat en backend-proxy op
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/vehicle-lookup', {
          params: { type, value },
        });
        if (data && data.found !== false && data.make) return data;
      } catch {
        // Fallback
      }
    }

    // 3. Fallback til kendte test-presets eller fejlmeddelelse
    return clientStore.vehicleLookup(type, value);
  },

  submitLead: async (payload: VehicleLookupLeadPayload) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.post('/vehicle-lookup/lead', payload);
        if (data) {
          clientStore.addLead({
            type: 'car_inquiry',
            customerName: payload.customerName,
            customerEmail: payload.customerEmail,
            customerPhone: payload.customerPhone,
            carTitle: `Nummerpladeopslag: ${payload.licensePlate || 'Ikke angivet'}`,
            message: payload.message || 'Henvendelse via nummerpladetjek',
          });
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.addLead({
      type: 'car_inquiry',
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      carTitle: `Nummerpladeopslag: ${payload.licensePlate || 'Ikke angivet'}`,
      message: payload.message || 'Henvendelse via nummerpladetjek',
    });
  },
};

// ─── Byttebil / Sælg bil ───
export const tradeInService = {
  submit: async (formData: FormData) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.post('/trade-in', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data) {
          clientStore.addTradeIn(formData);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.addTradeIn(formData);
  },
};

// ─── Værkstedsbooking ───
export interface WorkshopBookingPayload {
  licensePlate?: string;
  carMake?: string;
  carModel?: string;
  carYear?: number;
  serviceDescription?: string;
  taskDescription?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail: string;
  requestedDate?: string;
  requestedTimeSlot?: string;
  privacyConsent?: boolean;
  honeypotField?: string;
}

export const bookingService = {
  submit: async (formData: FormData) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.post('/workshop/bookings', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data) {
          clientStore.addBooking(formData);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.addBooking(formData);
  },
  submitJson: async (payload: WorkshopBookingPayload) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.post('/workshop/bookings', payload);
        if (data) {
          clientStore.addBooking(payload);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.addBooking(payload);
  },
};

// ─── Admin: Biler ───
export const adminCarsService = {
  getAll: async (params: Record<string, unknown> = {}) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/admin/cars', { params });
        if (Array.isArray(data) || (data && Array.isArray(data.cars))) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getAllCarsRaw();
  },

  getById: async (id: number) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get(`/admin/cars/${id}`);
        if (data && data.id) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getCar(id);
  },

  create: async (payload: Record<string, unknown>) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.post('/admin/cars', payload);
        if (data && data.id) {
          clientStore.createCar(payload);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.createCar(payload);
  },

  update: async (id: number, payload: Record<string, unknown>) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.put(`/admin/cars/${id}`, payload);
        if (data) {
          clientStore.updateCar(id, payload);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.updateCar(id, payload);
  },

  delete: async (id: number) => {
    if (hasBackendUrl) {
      try {
        await api.delete(`/admin/cars/${id}`);
      } catch {
        // Fallback
      }
    }
    clientStore.deleteCar(id);
    return { success: true };
  },

  duplicate: async (id: number) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.post(`/admin/cars/${id}/duplicate`);
        if (data && data.id) {
          clientStore.duplicateCar(id);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.duplicateCar(id);
  },

  uploadImages: async (id: number, files: File[]) => {
    if (hasBackendUrl) {
      try {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));
        const { data } = await api.post(`/admin/cars/${id}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.uploadCarImages(id, files);
  },

  deleteImage: async (carId: number, imageId: number) => {
    if (hasBackendUrl) {
      try {
        await api.delete(`/admin/cars/${carId}/images/${imageId}`);
      } catch {
        // Fallback
      }
    }
    const car = clientStore.getCar(carId);
    if (car && car.images) {
      car.images = car.images.filter((img) => img.id !== imageId);
      clientStore.updateCar(carId, { images: car.images });
    }
    return { success: true };
  },

  reorderImages: async (carId: number, items: { id: number; sortOrder: number }[]) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.put(`/admin/cars/${carId}/images/reorder`, items);
        if (data) return data;
      } catch {
        // Fallback
      }
    }
    return { success: true };
  },
};

// ─── Admin: Henvendelser (Leads) ───
export const adminLeadsService = {
  getAll: async (params: Record<string, unknown> = {}) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/admin/leads', { params });
        if (Array.isArray(data) || (data && Array.isArray(data.leads))) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getLeads(params as any);
  },

  getById: async (id: number) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get(`/admin/leads/${id}`);
        if (data && data.id) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getLeadById(id);
  },

  updateStatus: async (id: number, payload: { status: string; notes?: string; assignedTo?: string }) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.patch(`/admin/leads/${id}/status`, payload);
        if (data) {
          clientStore.updateLeadStatus(id, payload);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.updateLeadStatus(id, payload);
  },

  exportCsv: async () => {
    if (hasBackendUrl) {
      try {
        const res = await api.get('/admin/leads/export', { responseType: 'blob' });
        if (res && res.data) return res;
      } catch {
        // Fallback
      }
    }
    const blob = clientStore.exportLeadsCsv();
    return { data: blob };
  },
};

// ─── Admin: Byttebiler ───
export const adminTradeInService = {
  getAll: async (params: Record<string, unknown> = {}) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/admin/trade-in', { params });
        if (Array.isArray(data) || (data && Array.isArray(data.tradeIns))) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getTradeIns(params as any);
  },

  getById: async (id: number) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get(`/admin/trade-in/${id}`);
        if (data && data.id) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getTradeInById(id);
  },

  updateStatus: async (id: number, payload: Record<string, unknown>) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.patch(`/admin/trade-in/${id}/status`, payload);
        if (data) {
          clientStore.updateTradeInStatus(id, payload);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.updateTradeInStatus(id, payload);
  },
};

// ─── Admin: Værksted ───
export const adminWorkshopService = {
  getBookings: async (params: Record<string, unknown> = {}) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/admin/workshop/bookings', { params });
        if (Array.isArray(data) || (data && Array.isArray(data.bookings))) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getBookings(params as any);
  },

  getBooking: async (id: number) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get(`/admin/workshop/bookings/${id}`);
        if (data && data.id) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getBookingById(id);
  },

  updateStatus: async (id: number, payload: Record<string, unknown>) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.patch(`/admin/workshop/bookings/${id}/status`, payload);
        if (data) {
          clientStore.updateBookingStatus(id, payload);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.updateBookingStatus(id, payload);
  },
};

// ─── Admin: Indhold & Indstillinger ───
export const adminContentService = {
  getSettings: async (group?: string) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/admin/content/settings', { params: { group } });
        if (data && typeof data === 'object') return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getSettings();
  },

  updateSetting: async (key: string, value: string | null) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.put(`/admin/content/settings/${key}`, { value });
        if (data) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.updateSettings({ [key]: value });
  },

  updateSettingsBulk: async (updates: Record<string, string | null>) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.put('/admin/content/settings/bulk', updates);
        if (data) {
          clientStore.updateSettings(updates);
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return clientStore.updateSettings(updates);
  },

  uploadLogo: async (file: File) => {
    return new Promise<{ url: string }>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        clientStore.updateSettings({ logo_path: url });
        resolve({ url });
      };
      reader.readAsDataURL(file);
    });
  },

  getDashboard: async () => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/admin/content/dashboard');
        if (data) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getDashboard();
  },

  getTestimonials: async () => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/admin/content/testimonials');
        if (Array.isArray(data)) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getTestimonials();
  },

  createTestimonial: async (payload: Record<string, unknown>) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.post('/admin/content/testimonials', payload);
        if (data) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.createTestimonial(payload);
  },

  updateTestimonial: async (id: number, payload: Record<string, unknown>) => {
    return payload;
  },

  deleteTestimonial: async (id: number) => {
    if (hasBackendUrl) {
      try {
        await api.delete(`/admin/content/testimonials/${id}`);
      } catch {
        // Fallback
      }
    }
    clientStore.deleteTestimonial(id);
    return { success: true };
  },

  getServices: async () => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/admin/content/services');
        if (Array.isArray(data)) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getServices();
  },

  updateService: async (id: number, payload: Record<string, unknown>) => {
    return payload;
  },

  getFeatures: async () => {
    return [
      { id: 1, name: 'Adaptiv fartpilot', category: 'Sikkerhed' },
      { id: 2, name: 'Vejbaneassistent', category: 'Sikkerhed' },
      { id: 3, name: 'Apple CarPlay', category: 'Infotainment' },
      { id: 4, name: 'Digitalt cockpit', category: 'Komfort' },
    ];
  },

  createFeature: async (payload: { name: string; category?: string }) => {
    return { id: Date.now(), ...payload };
  },

  getUsers: async () => {
    return [
      { id: 1, name: 'Autohus Kvik Administrator', email: 'admin@autohusetkvik.dk', role: 'owner' }
    ];
  },

  createUser: async (payload: Record<string, unknown>) => {
    return { id: Date.now(), ...payload, role: 'staff' };
  },

  changePassword: async (id: number, newPassword: string) => {
    return { success: true };
  },
};

// ─── Auth ───
export const authService = {
  login: async (email: string, password: string) => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.post('/auth/login', { email, password });
        if (data && data.accessToken) {
          localStorage.setItem('access_token', data.accessToken);
          return data;
        }
      } catch (err: any) {
        // Hvis rigtig server returnerer fejl, kast den
        if (err.response && !err.isStaticFallback) {
          throw err;
        }
      }
    }
    // Browser demo-login
    return clientStore.login(email, password);
  },

  logout: async () => {
    if (hasBackendUrl) {
      try {
        await api.post('/auth/logout');
      } catch {
        // Fallback
      }
    }
    return clientStore.logout();
  },

  getMe: async () => {
    if (hasBackendUrl) {
      try {
        const { data } = await api.get('/auth/me');
        if (data && data.id) return data;
      } catch {
        // Fallback
      }
    }
    return clientStore.getMe();
  },
};

export { clientStore };
