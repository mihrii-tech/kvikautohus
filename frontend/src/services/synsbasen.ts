import type { VehicleLookupResult } from '@/types';

const SYNSBASEN_API_KEY = 'sb_sk_6e612f2e69a665d45c7e36cad2fe802d';
const BASE_URL = 'https://api.synsbasen.dk/v1';

export async function lookupLiveSynsbasen(
  type: 'registration' | 'vin',
  value: string
): Promise<VehicleLookupResult | null> {
  const clean = value.replace(/\s+/g, '').replace(/-/g, '').toUpperCase().trim();
  if (!clean) return null;

  const endpoint = type === 'registration'
    ? `${BASE_URL}/vehicles/registration/${clean}`
    : `${BASE_URL}/vehicles/vin/${clean}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SYNSBASEN_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`Synsbasen API svarede med status ${res.status} for ${clean}`);
      return null;
    }

    const json = await res.json();
    return parseSynsbasenResponse(json, clean);
  } catch (err) {
    console.error('Fejl ved direkte Synsbasen opslag:', err);
    return null;
  }
}

function parseSynsbasenResponse(json: any, queryValue: string): VehicleLookupResult | null {
  if (!json) return null;

  let vehicle = json.data || json;
  if (Array.isArray(vehicle)) {
    if (vehicle.length === 0) return null;
    vehicle = vehicle[0];
  }

  if (!vehicle || typeof vehicle !== 'object') return null;

  const make = vehicle.brand || vehicle.make || (vehicle.brand_and_model ? vehicle.brand_and_model.split(' ')[0] : 'Ukendt mærke');
  let model = vehicle.model || '';
  if (!model && vehicle.brand_and_model) {
    const parts = vehicle.brand_and_model.split(' ');
    if (parts.length > 1) model = parts.slice(1).join(' ');
  }

  // Hestekræfter
  let horsepower: number | undefined;
  if (typeof vehicle.horsepower === 'number') {
    horsepower = vehicle.horsepower;
  } else if (vehicle.engine?.horsepower) {
    horsepower = Number(vehicle.engine.horsepower);
  } else if (vehicle.engine?.engine_power) {
    horsepower = Math.round(Number(vehicle.engine.engine_power) * 1.36);
  }

  // Farve
  const color = vehicle.color || vehicle.body?.color || (vehicle.extra_equipment?.includes('metallak') ? 'Metallak' : undefined);

  // Synsrapport
  let inspectionPdfUrl: string | undefined;
  if (Array.isArray(vehicle.inspections) && vehicle.inspections.length > 0) {
    inspectionPdfUrl = vehicle.inspections[0]?.pdf;
  }

  // Årgang
  let year = vehicle.model_year || vehicle.year;
  if (!year && vehicle.first_registration_date) {
    const d = new Date(vehicle.first_registration_date);
    if (!isNaN(d.getFullYear())) year = d.getFullYear();
  }

  return {
    found: true,
    registrationNumber: vehicle.registration || queryValue,
    vin: vehicle.vin || '',
    make,
    model,
    variant: vehicle.variant || vehicle.version || '',
    year,
    firstRegistrationDate: vehicle.first_registration_date || undefined,
    fuelType: vehicle.fuel_type || 'Benzin',
    fuelConsumptionKmPerL: vehicle.fuel_consumption_km_per_l || vehicle.fuel_economy || undefined,
    horsepower,
    status: vehicle.status || vehicle.registration_status || 'Registreret',
    bodyType: vehicle.body_type || vehicle.kind || 'Personbil',
    color,
    mileage: vehicle.mileage || undefined,
    lastInspectionDate: vehicle.last_inspection_date || undefined,
    lastInspectionResult: vehicle.last_inspection_result || 'Godkendt',
    nextInspectionDate: vehicle.next_inspection_date_estimate || vehicle.next_inspection_date || undefined,
    curbWeight: vehicle.curb_weight || vehicle.vehicle_weight || undefined,
    totalWeight: vehicle.total_weight || undefined,
    inspectionPdfUrl,
  };
}
