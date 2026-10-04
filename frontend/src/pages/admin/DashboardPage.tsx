import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Car, MessageSquare, ArrowLeftRight, Wrench,
  PlusCircle, ArrowUpRight
} from 'lucide-react';
import { adminContentService, adminLeadsService, adminWorkshopService } from '@/services';

export default function DashboardPage() {
  const { data: dashboardData } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminContentService.getDashboard,
  });

  const { data: recentLeads } = useQuery({
    queryKey: ['admin-recent-leads'],
    queryFn: () => adminLeadsService.getAll({ pageSize: 5 }),
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: () => adminWorkshopService.getBookings({ pageSize: 5 }),
  });

  const stats = [
    {
      title: 'Biler til salg',
      val: dashboardData?.carsCount ?? 8,
      sub: 'Aktive annoncer',
      icon: <Car size={24} />,
      color: '#3b82f6',
      link: '/admin/biler',
    },
    {
      title: 'Nye henvendelser',
      val: dashboardData?.leadsCount ?? 3,
      sub: 'Prøvekørsler & spørgsmål',
      icon: <MessageSquare size={24} />,
      color: '#ef4444',
      link: '/admin/henvendelser',
    },
    {
      title: 'Køb & byttebiler',
      val: dashboardData?.tradeInsCount ?? 2,
      sub: 'Vurderinger venter',
      icon: <ArrowLeftRight size={24} />,
      color: '#f59e0b',
      link: '/admin/koeb-bytte',
    },
    {
      title: 'Værkstedsbookinger',
      val: dashboardData?.bookingsCount ?? 5,
      sub: 'Kommende aftaler',
      icon: <Wrench size={24} />,
      color: '#10b981',
      link: '/admin/vaerksted',
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Dashboard</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Overblik over bilsalg, kundehenvendelser og værkstedsaktiviteter
          </p>
        </div>
        <Link to="/admin/biler/ny" className="btn btn-primary">
          <PlusCircle size={16} /> Opret ny bil
        </Link>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <Link
            key={i}
            to={stat.link}
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-sm)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{stat.title}</span>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stat.val}</div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', display: 'block' }}>{stat.sub}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Grid: Recent Leads & Recent Bookings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Seneste Henvendelser */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Seneste henvendelser (Leads)</h3>
            <Link to="/admin/henvendelser" style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              Se alle <ArrowUpRight size={14} />
            </Link>
          </div>

          {recentLeads?.leads && recentLeads.leads.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentLeads.leads.map((lead: any) => (
                <Link
                  key={lead.id}
                  to={`/admin/henvendelser/${lead.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{lead.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{lead.type === 'test_drive' ? 'Prøvekørsel' : 'Kontakt'} · {lead.phone}</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 20,
                    background: lead.status === 'new' ? '#fee2e2' : '#f1f5f9',
                    color: lead.status === 'new' ? '#991b1b' : '#64748b',
                    fontWeight: 600,
                  }}>
                    {lead.status === 'new' ? 'Ny' : lead.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Ingen henvendelser endnu.</p>
          )}
        </div>

        {/* Seneste Værkstedsbookinger */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Seneste værkstedsbookinger</h3>
            <Link to="/admin/vaerksted" style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              Se alle <ArrowUpRight size={14} />
            </Link>
          </div>

          {recentBookings?.bookings && recentBookings.bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentBookings.bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{booking.customerName} ({booking.make} {booking.model})</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Dato: {booking.preferredDate} · {booking.customerPhone}</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 20,
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontWeight: 600,
                  }}>
                    {booking.status || 'Bekræftet'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Ingen bookinger endnu.</p>
          )}
        </div>
      </div>
    </div>
  );
}
