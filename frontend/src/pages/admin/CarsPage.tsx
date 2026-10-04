import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Car, Plus, Search, Edit2, Copy, Trash2,
  ExternalLink
} from 'lucide-react';
import { adminCarsService } from '@/services';

export default function AdminCarsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: cars, isLoading } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: () => adminCarsService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminCarsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => adminCarsService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
    },
  });

  const handleDelete = (id: number, make: string, model: string) => {
    if (confirm(`Er du sikker på, at du vil slette ${make} ${model}? Handlingen kan ikke fortrydes.`)) {
      deleteMutation.mutate(id);
    }
  };

  const carList = Array.isArray(cars) ? cars : (cars as any)?.cars || [];

  const filteredCars = carList.filter((car: any) => {
    const matchesSearch = `${car.make} ${car.model} ${car.variant || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || car.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Biler til salg</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Opret, rediger og administrer dine bilannoncer
          </p>
        </div>
        <Link to="/admin/biler/ny" className="btn btn-primary">
          <Plus size={16} /> Opret ny bil
        </Link>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#fff', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: 12, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Søg på mærke, model, variant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
        >
          <option value="">Alle statusser</option>
          <option value="for_sale">Til salg</option>
          <option value="reserved">Reserveret</option>
          <option value="sold">Solgt</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Bil</th>
                <th style={{ padding: '0.85rem 1rem' }}>Årgang</th>
                <th style={{ padding: '0.85rem 1rem' }}>Kilometer</th>
                <th style={{ padding: '0.85rem 1rem' }}>Pris</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Indlæser biler...
                  </td>
                </tr>
              ) : filteredCars.length > 0 ? (
                filteredCars.map((car: any) => (
                  <tr key={car.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 60, height: 42, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                          {car.primaryImageUrl ? (
                            <img src={car.primaryImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                              <Car size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: '#0f172a' }}>{car.make} {car.model}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{car.variant || car.fuelType}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{car.year}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{Number(car.mileage).toLocaleString('da-DK')} km</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      {Number(car.price).toLocaleString('da-DK')} kr.
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 20,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: car.status === 'for_sale' ? '#dcfce7' : car.status === 'reserved' ? '#fef3c7' : '#fee2e2',
                        color: car.status === 'for_sale' ? '#15803d' : car.status === 'reserved' ? '#b45309' : '#b91c1c',
                      }}>
                        {car.status === 'for_sale' ? 'Til salg' : car.status === 'reserved' ? 'Reserveret' : 'Solgt'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Link
                          to={`/biler/${car.slug}`}
                          target="_blank"
                          title="Vis på hjemmesiden"
                          style={{ padding: '6px', color: '#64748b', borderRadius: '4px', textDecoration: 'none' }}
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <button
                          onClick={() => duplicateMutation.mutate(car.id)}
                          title="Dupliker annonce"
                          style={{ background: 'none', border: 'none', padding: '6px', color: '#64748b', cursor: 'pointer' }}
                        >
                          <Copy size={16} />
                        </button>
                        <Link
                          to={`/admin/biler/${car.id}/rediger`}
                          title="Rediger bil"
                          style={{ padding: '6px', color: '#2563eb', borderRadius: '4px', textDecoration: 'none' }}
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(car.id, car.make, car.model)}
                          title="Slet bil"
                          style={{ background: 'none', border: 'none', padding: '6px', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Ingen biler matcher søgningen.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
