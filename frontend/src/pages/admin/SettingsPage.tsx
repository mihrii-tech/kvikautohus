import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save, CheckCircle, Building, Globe, Lock
} from 'lucide-react';
import { adminContentService } from '@/services';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    company_name: 'Autohus Kvik',
    company_cvr: '44047470',
    company_phone: '+45 50 29 08 74',
    company_emergency_phone: '+45 50 29 08 74',
    company_email: 'kontakt@autohusetkvik.dk',
    company_address: 'Gammel Køge Landevej 477, 2650 Hvidovre',
    seo_title_suffix: '| Autohus Kvik – Hvidovre',
    seo_default_description: 'Autohus Kvik i Hvidovre tilbyder brugte biler, bilkøb, byttebiler, finansiering og eget værksted.',
    google_rating_text: '4.8 baseret på over 50 glade bilkøbere i Hvidovre',
    show_testimonials: 'true',
    social_facebook: 'https://facebook.com',
    social_instagram: 'https://instagram.com',
  });

  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminContentService.getSettings(),
  });

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (updates: Record<string, string | null>) =>
      adminContentService.updateSettingsBulk(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    },
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Adgangskoden skal være på mindst 6 tegn.');
      return;
    }
    try {
      await adminContentService.changePassword(1, newPassword);
      setPasswordMsg('Adgangskoden er opdateret!');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch {
      alert('Kunne ikke ændre adgangskode.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Indstillinger</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Virksomhedsoplysninger, SEO og kontosikkerhed
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> Indstillingerne er gemt!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Virksomhedsinfo */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Building size={20} style={{ color: '#ef4444' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Virksomhedsoplysninger</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Firmanavn</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>CVR-nummer</label>
              <input
                type="text"
                value={formData.company_cvr}
                onChange={(e) => setFormData({ ...formData, company_cvr: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Hovedtelefon</label>
              <input
                type="text"
                value={formData.company_phone}
                onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nødnummer / Autohjælp</label>
              <input
                type="text"
                value={formData.company_emergency_phone}
                onChange={(e) => setFormData({ ...formData, company_emergency_phone: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Kontakt E-mail</label>
              <input
                type="email"
                value={formData.company_email}
                onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Fysisk adresse</label>
              <input
                type="text"
                value={formData.company_address}
                onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>
        </div>

        {/* SEO & Markedsføring */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Globe size={20} style={{ color: '#ef4444' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>SEO & Synlighed</h3>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>SEO Title Suffix</label>
            <input
              type="text"
              value={formData.seo_title_suffix}
              onChange={(e) => setFormData({ ...formData, seo_title_suffix: e.target.value })}
              style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Standard metabeskrivelse</label>
            <textarea
              rows={3}
              value={formData.seo_default_description}
              onChange={(e) => setFormData({ ...formData, seo_default_description: e.target.value })}
              style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Google anmeldelsestekst på forside</label>
            <input
              type="text"
              value={formData.google_rating_text}
              onChange={(e) => setFormData({ ...formData, google_rating_text: e.target.value })}
              style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="btn btn-primary btn-lg"
          style={{ alignSelf: 'flex-start' }}
        >
          <Save size={18} /> {saveMutation.isPending ? 'Gemmer ændringer...' : 'Gem alle indstillinger'}
        </button>
      </form>

      {/* Sikkerhed / Adgangskode */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Lock size={20} style={{ color: '#ef4444' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Skift adgangskode</h3>
        </div>

        {passwordMsg && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            {passwordMsg}
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Ny adgangskode</label>
            <input
              type="password"
              placeholder="Mindst 6 tegn"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Opdater adgangskode
          </button>
        </form>
      </div>
    </div>
  );
}
