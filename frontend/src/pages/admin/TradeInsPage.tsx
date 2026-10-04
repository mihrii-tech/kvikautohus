import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { adminTradeInService } from '@/services';

export default function AdminTradeInsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-trade-ins', statusFilter],
    queryFn: () => adminTradeInService.getAll(statusFilter ? { status: statusFilter } : {}),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminTradeInService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trade-ins'] });
    },
  });

  const tradeInsList = Array.isArray(data) ? data : (data as any)?.tradeIns || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Køb & Byttebiler</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Vurderingsanmodninger fra kunder, der ønsker at sælge eller bytte deres bil
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
                <th style={{ padding: '0.85rem 1rem' }}>Bil til vurdering</th>
                <th style={{ padding: '0.85rem 1rem' }}>Formål</th>
                <th style={{ padding: '0.85rem 1rem' }}>Stand</th>
                <th style={{ padding: '0.85rem 1rem' }}>Modtaget</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Indlæser vurderingsanmodninger...
                  </td>
                </tr>
              ) : tradeInsList.length > 0 ? (
                tradeInsList.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{item.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.phone} · {item.email}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{item.make} {item.model} ({item.year})</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {Number(item.mileage || 0).toLocaleString('da-DK')} km {item.registrationNumber && `· ${item.registrationNumber}`}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 20,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: item.intent === 'trade' ? '#dbeafe' : '#f1f5f9',
                        color: item.intent === 'trade' ? '#1d4ed8' : '#334155',
                      }}>
                        {item.intent === 'trade' ? 'Byttebil' : 'Rent salg'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{item.condition || 'God'}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('da-DK') : 'Nyligt'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={item.status || 'pending'}
                        onChange={(e) => statusMutation.mutate({ id: item.id, status: e.target.value })}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          border: '1px solid #cbd5e1',
                          background: item.status === 'pending' ? '#fef3c7' : '#f8fafc',
                          color: item.status === 'pending' ? '#b45309' : '#334155',
                          fontWeight: 600,
                        }}
                      >
                        <option value="pending">Afventer vurdering</option>
                        <option value="offer_sent">Tilbud sendt</option>
                        <option value="accepted">Accepteret / Købt</option>
                        <option value="declined">Afvist</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Ingen bytte- eller salgsanmodninger endnu.
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
