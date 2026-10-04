import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star, Plus, Trash2, Save
} from 'lucide-react';
import { adminContentService } from '@/services';

export default function AdminContentPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'testimonials' | 'services'>('testimonials');

  // Testimonial modal / form state
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);

  const { data: testimonials, isLoading: loadingTestimonials } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: adminContentService.getTestimonials,
  });

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['admin-services'],
    queryFn: adminContentService.getServices,
  });

  const createTestimonialMutation = useMutation({
    mutationFn: (payload: any) => adminContentService.createTestimonial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      setShowAddTestimonial(false);
      setAuthorName('');
      setContent('');
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: (id: number) => adminContentService.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    },
  });

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    createTestimonialMutation.mutate({
      authorName,
      content,
      rating,
    });
  };

  const testimonialList = Array.isArray(testimonials) ? testimonials : [];
  const serviceList = Array.isArray(services) ? services : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Hjemmesideindhold</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Rediger anmeldelser, værkstedsydelser og tekster
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${tab === 'testimonials' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('testimonials')}
        >
          Kundeanmeldelser ({testimonialList.length})
        </button>
        <button
          className={`btn ${tab === 'services' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('services')}
        >
          Værkstedsydelser ({serviceList.length})
        </button>
      </div>

      {/* Tab 1: Testimonials */}
      {tab === 'testimonials' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              onClick={() => setShowAddTestimonial(!showAddTestimonial)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} /> Opret anmeldelse
            </button>
          </div>

          {showAddTestimonial && (
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Tilføj kundeanmeldelse</h3>
              <form onSubmit={handleAddTestimonial}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Kundens navn *</label>
                    <input
                      type="text"
                      required
                      placeholder="f.eks. Michael Jensen"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Stjerner</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', background: '#fff' }}
                    >
                      <option value={5}>5 stjerner</option>
                      <option value={4}>4 stjerner</option>
                      <option value={3}>3 stjerner</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Anmeldelsestekst *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Super professionel service og hurtig levering af bilen..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" disabled={createTestimonialMutation.isPending} className="btn btn-primary">
                    <Save size={16} /> Gem anmeldelse
                  </button>
                  <button type="button" onClick={() => setShowAddTestimonial(false)} className="btn btn-ghost">
                    Annuller
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {testimonialList.map((t: any) => (
              <div key={t.id} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#0f172a' }}>{t.authorName}</strong>
                    <div style={{ display: 'flex', color: '#eab308' }}>
                      {[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>"{t.content}"</p>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
                  <button
                    onClick={() => {
                      if (confirm('Slet denne anmeldelse?')) deleteTestimonialMutation.mutate(t.id);
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Services */}
      {tab === 'services' && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Ydelse</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Beskrivelse</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Vejl. Pris</th>
                </tr>
              </thead>
              <tbody>
                {serviceList.map((s: any) => (
                  <tr key={s.id || s.slug} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>{s.title}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#475569', maxWidth: 400 }}>{s.shortDescription}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#ef4444' }}>{s.fromPrice || 'Timepris'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
