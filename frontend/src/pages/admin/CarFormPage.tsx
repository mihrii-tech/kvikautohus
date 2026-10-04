import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, Save, UploadCloud, Trash2,
  CheckCircle
} from 'lucide-react';
import { adminCarsService } from '@/services';

export default function AdminCarFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    mileage: 0,
    price: 0,
    fuelType: 'Benzin',
    transmission: 'Automatisk',
    bodyType: 'Stationcar',
    color: '',
    doors: 5,
    horsepower: 150,
    fuelConsumptionKmPerL: 18.5,
    vin: '',
    description: '',
    status: 'for_sale',
    isFeatured: false,
    equipmentString: '',
  });

  const [images, setImages] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch existing car if editing
  const { data: existingCar, isLoading } = useQuery({
    queryKey: ['admin-car', id],
    queryFn: () => adminCarsService.getById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingCar) {
      setFormData({
        make: existingCar.make || '',
        model: existingCar.model || '',
        variant: existingCar.variant || '',
        year: existingCar.year || new Date().getFullYear(),
        mileage: existingCar.mileage || 0,
        price: existingCar.price || 0,
        fuelType: existingCar.fuelType || 'Benzin',
        transmission: existingCar.transmission || 'Automatisk',
        bodyType: existingCar.bodyType || 'Stationcar',
        color: existingCar.color || '',
        doors: existingCar.doors || 5,
        horsepower: existingCar.horsepower || 150,
        fuelConsumptionKmPerL: existingCar.fuelConsumptionKmPerL || 18.5,
        vin: existingCar.vin || '',
        description: existingCar.description || '',
        status: existingCar.status || 'for_sale',
        isFeatured: !!existingCar.isFeatured,
        equipmentString: Array.isArray(existingCar.equipment)
          ? existingCar.equipment.map((e: any) => typeof e === 'string' ? e : e.name).join('\n')
          : '',
      });
      if (existingCar.images) {
        setImages(existingCar.images);
      }
    }
  }, [existingCar]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEdit) {
        return adminCarsService.update(Number(id), payload);
      } else {
        return adminCarsService.create(payload);
      }
    },
    onSuccess: async (res: any) => {
      const targetId = isEdit ? Number(id) : res?.id;
      // Upload new images if any
      if (targetId && newFiles.length > 0) {
        await adminCarsService.uploadImages(targetId, newFiles);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/admin/biler');
      }, 1000);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...files]);
      const previews = files.map((f) => URL.createObjectURL(f));
      setNewPreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeExistingImage = async (imgId: number) => {
    if (confirm('Vil du slette dette billede?')) {
      if (isEdit) {
        await adminCarsService.deleteImage(Number(id), imgId);
      }
      setImages((prev) => prev.filter((i) => i.id !== imgId));
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const equipment = formData.equipmentString
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      equipment,
    };
    saveMutation.mutate(payload);
  };

  if (isEdit && isLoading) {
    return <div style={{ padding: '2rem' }}>Indlæser biloplysninger...</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/biler" style={{ color: '#64748b', display: 'flex' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            {isEdit ? `Rediger: ${formData.make} ${formData.model}` : 'Opret ny bilannonce'}
          </h1>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> Bilen blev gemt med succes! Omdirigerer...
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Basale oplysninger */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>1. Grundlæggende biloplysninger</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Mærke *</label>
              <input
                type="text"
                required
                placeholder="f.eks. Volkswagen"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Model *</label>
              <input
                type="text"
                required
                placeholder="f.eks. Passat"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Variant</label>
              <input
                type="text"
                placeholder="f.eks. 2.0 TDI Highline DSG"
                value={formData.variant}
                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Pris (DKK) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Kilometer *</label>
              <input
                type="number"
                required
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Årgang *</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', background: '#fff' }}
              >
                <option value="for_sale">Til salg</option>
                <option value="reserved">Reserveret</option>
                <option value="sold">Solgt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tekniske specifikationer */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>2. Specifikationer & Drivlinje</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Brændstof</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', background: '#fff' }}
              >
                <option value="Benzin">Benzin</option>
                <option value="Diesel">Diesel</option>
                <option value="El">El</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Gearkasse</label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', background: '#fff' }}
              >
                <option value="Automatisk">Automatisk</option>
                <option value="Manuel">Manuel</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Karrosseri</label>
              <input
                type="text"
                placeholder="Stationcar, Hatchback, SUV..."
                value={formData.bodyType}
                onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Hestekræfter (HK)</label>
              <input
                type="number"
                value={formData.horsepower}
                onChange={(e) => setFormData({ ...formData, horsepower: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Km/l forbrug</label>
              <input
                type="number"
                step="0.1"
                value={formData.fuelConsumptionKmPerL}
                onChange={(e) => setFormData({ ...formData, fuelConsumptionKmPerL: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Farve</label>
              <input
                type="text"
                placeholder="f.eks. Sortmetal"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Stelnummer (VIN)</label>
              <input
                type="text"
                placeholder="17 tegn"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>
        </div>

        {/* Billeder */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Billeder</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Upload billeder af bilen. Det første billede vises som primært billede på oversigten.
          </p>

          {/* Eksisterende billeder */}
          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {images.map((img: any) => (
                <div key={img.id} style={{ position: 'relative', width: 120, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Nye uploads preview */}
          {newPreviews.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>Nye billeder til upload:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {newPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: 120, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid #ef4444' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ border: '2px dashed #cbd5e1', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', background: '#f8fafc', position: 'relative', cursor: 'pointer' }}>
            <UploadCloud size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Vælg billeder fra din computer</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Understøtter JPG, PNG og WebP</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Beskrivelse & Udstyr */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>4. Beskrivelse & Udstyrsliste</h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Salgstekst / Beskrivelse</label>
            <textarea
              rows={6}
              placeholder="Beskriv bilens stand, historik, serviceeftersyn og fordele..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              Udstyr (ét punkt pr. linje)
            </label>
            <textarea
              rows={6}
              placeholder="Navigation&#10;Adaptiv fartpilot&#10;Parkeringssensor bag&#10;Anhængertræk&#10;Læderrat"
              value={formData.equipmentString}
              onChange={(e) => setFormData({ ...formData, equipmentString: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/admin/biler" className="btn btn-secondary">
            Annuller
          </Link>
          <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary btn-lg">
            <Save size={18} /> {saveMutation.isPending ? 'Gemmer...' : 'Gem bilannonce'}
          </button>
        </div>
      </form>
    </div>
  );
}
