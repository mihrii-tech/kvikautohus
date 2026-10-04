import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { adminWorkshopService } from '@/services';

export default function AdminWorkshopPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-workshop-bookings', statusFilter],
    queryFn: () => adminWorkshopService.getBookings(statusFilter ? { status: statusFilter } : {}),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminWorkshopService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workshop-bookings'] });
    },
  });

  const bookingsList = Array.isArray(data) ? data : (data as any)?.bookings || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Værksted & Tidsbestillinger</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Administrer aftaler, serviceeftersyn og reparationer
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Kunde</th>
                <th style={{ padding: '0.85rem 1rem' }}>Bil</th>
                <th style={{ padding: '0.85rem 1rem' }}>Ydelser</th>
                <th style={{ padding: '0.85rem 1rem' }}>Dato & Tid</th>
                <th style={{ padding: '0.85rem 1rem' }}>Lånebil</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Indlæser værkstedsbookinger...
                  </td>
                </tr>
              ) : bookingsList.length > 0 ? (
                bookingsList.map((b: any) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{b.customerName}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.customerPhone}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{b.make} {b.model}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.registrationNumber || 'Uden plade'}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ maxWidth: 200, fontSize: '0.85rem', color: '#334155' }}>
                        {b.selectedServices ? (
                          typeof b.selectedServices === 'string'
                            ? (b.selectedServices.startsWith('[') ? JSON.parse(b.selectedServices).join(', ') : b.selectedServices)
                            : b.selectedServices.join(', ')
                        ) : 'Service'}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.85rem' }}>{b.preferredDate}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {b.preferredTimeSlot === 'morning' ? 'Formiddag' : 'Eftermiddag'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: b.needsLoanerCar ? '#fef3c7' : '#f1f5f9',
                        color: b.needsLoanerCar ? '#b45309' : '#64748b',
                      }}>
                        {b.needsLoanerCar ? 'Ja, ønskes' : 'Nej'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={b.status || 'confirmed'}
                        onChange={(e) => statusMutation.mutate({ id: b.id, status: e.target.value })}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontWeight: 600,
                        }}
                      >
                        <option value="confirmed">Bekræftet</option>
                        <option value="in_progress">I gang</option>
                        <option value="completed">Fuldført</option>
                        <option value="cancelled">Annulleret</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Ingen værkstedsbookinger fundet.
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
