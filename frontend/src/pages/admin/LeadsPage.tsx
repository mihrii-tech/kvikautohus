import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { adminLeadsService } from '@/services';

export default function AdminLeadsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads', statusFilter],
    queryFn: () => adminLeadsService.getAll(statusFilter ? { status: statusFilter } : {}),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminLeadsService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    },
  });

  const leadsList = Array.isArray(data) ? data : (data as any)?.leads || [];

  const handleExportCsv = async () => {
    try {
      const res = await adminLeadsService.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Eksport mislykkedes.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Henvendelser (Leads)</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Prøvekørsler, kontaktbeskeder og forespørgsler fra hjemmesiden
          </p>
        </div>
        <button onClick={handleExportCsv} className="btn btn-secondary">
          <Download size={16} /> Eksportér til CSV
        </button>
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
        >
          <option value="">Alle statusser</option>
          <option value="new">Nye henvendelser</option>
          <option value="contacted">Kontaktet</option>
          <option value="closed">Afsluttet</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Kunde</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Kontakt</th>
                <th style={{ padding: '0.85rem 1rem' }}>Modtaget</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Handling</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Indlæser henvendelser...
                  </td>
                </tr>
              ) : leadsList.length > 0 ? (
                leadsList.map((lead: any) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{lead.name}</strong>
                      {lead.carTitle && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bil: {lead.carTitle}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 20,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: lead.type === 'test_drive' ? '#dbeafe' : '#f1f5f9',
                        color: lead.type === 'test_drive' ? '#1d4ed8' : '#475569',
                      }}>
                        {lead.type === 'test_drive' ? 'Prøvekørsel' : 'Kontakt'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                      <a href={`tel:${lead.phone}`} style={{ display: 'block', color: '#2563eb', textDecoration: 'none' }}>{lead.phone}</a>
                      <span style={{ color: '#64748b' }}>{lead.email}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('da-DK') : 'Nyligt'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={lead.status || 'new'}
                        onChange={(e) => statusMutation.mutate({ id: lead.id, status: e.target.value })}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          border: '1px solid #cbd5e1',
                          background: lead.status === 'new' ? '#fee2e2' : '#f8fafc',
                          color: lead.status === 'new' ? '#991b1b' : '#334155',
                          fontWeight: 600,
                        }}
                      >
                        <option value="new">Ny</option>
                        <option value="contacted">Kontaktet</option>
                        <option value="closed">Afsluttet</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Link
                        to={`/admin/henvendelser/${lead.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Detaljer
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Ingen henvendelser fundet.
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
