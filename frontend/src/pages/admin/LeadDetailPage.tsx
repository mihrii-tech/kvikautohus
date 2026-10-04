import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Save, CheckCircle
} from 'lucide-react';
import { adminLeadsService } from '@/services';

export default function AdminLeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ['admin-lead', id],
    queryFn: () => adminLeadsService.getById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (lead) {
      setStatus(lead.status || 'new');
      setNotes(lead.notes || '');
    }
  }, [lead]);

  const updateMutation = useMutation({
    mutationFn: () =>
      adminLeadsService.updateStatus(Number(id), { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lead', id] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    },
  });

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Indlæser henvendelse...</div>;
  }

  if (!lead) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Henvendelsen blev ikke fundet.</p>
        <Link to="/admin/henvendelser" className="btn btn-secondary">
          <ArrowLeft size={16} /> Tilbage til oversigt
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/admin/henvendelser" style={{ color: '#64748b', display: 'flex' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Henvendelse fra {lead.name}
          </h1>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Modtaget {lead.createdAt ? new Date(lead.createdAt).toLocaleString('da-DK') : 'Nyligt'}
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> Ændringerne er gemt!
        </div>
      )}

      {/* Main Info Box */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Kunde</span>
            <strong style={{ display: 'block', fontSize: '1rem', color: '#0f172a', marginTop: 2 }}>{lead.name}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Telefon</span>
            <a href={`tel:${lead.phone}`} style={{ display: 'block', fontSize: '1rem', color: '#2563eb', fontWeight: 600, marginTop: 2, textDecoration: 'none' }}>
              {lead.phone}
            </a>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>E-mail</span>
            <a href={`mailto:${lead.email}`} style={{ display: 'block', fontSize: '1rem', color: '#2563eb', marginTop: 2, textDecoration: 'none' }}>
              {lead.email}
            </a>
          </div>
        </div>

        {lead.car && (
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Tilknyttet bil</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <strong>{lead.car.make} {lead.car.model} ({lead.car.year})</strong>
              <Link to={`/biler/${lead.car.slug}`} target="_blank" style={{ fontSize: '0.85rem', color: '#ef4444', textDecoration: 'none', fontWeight: 600 }}>
                Se annonce →
              </Link>
            </div>
          </div>
        )}

        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Besked fra kunden</span>
          <p style={{ marginTop: 6, color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.6, background: '#f1f5f9', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            {lead.message || 'Ingen besked indtastet.'}
          </p>
        </div>
      </div>

      {/* Status & Notater */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Opdater status & Interne notater</h3>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: '100%', maxWidth: 300, padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', background: '#fff' }}
          >
            <option value="new">Ny henvendelse</option>
            <option value="contacted">Kontaktet</option>
            <option value="appointment">Prøvekørsel / Møde aftalt</option>
            <option value="closed">Afsluttet / Handlet</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Interne notater (kun synlige for personale)</label>
          <textarea
            rows={4}
            placeholder="f.eks.: Ringede d. 19/9 kl. 14. Kunden vil gerne prøvekøre lørdag kl. 11..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
          />
        </div>

        <button
          type="button"
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="btn btn-primary"
        >
          <Save size={16} /> {updateMutation.isPending ? 'Gemmer...' : 'Gem opdatering'}
        </button>
      </div>
    </div>
  );
}
