import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, PlusCircle, MessageSquare,
  ArrowLeftRight, Wrench, Globe, Settings, LogOut,
  Menu, X, ExternalLink, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/admin/biler', label: 'Biler til salg', icon: <Car size={18} /> },
    { to: '/admin/biler/ny', label: 'Opret ny bil', icon: <PlusCircle size={18} /> },
    { to: '/admin/henvendelser', label: 'Henvendelser', icon: <MessageSquare size={18} /> },
    { to: '/admin/koeb-bytte', label: 'Køb & Byttebiler', icon: <ArrowLeftRight size={18} /> },
    { to: '/admin/vaerksted', label: 'Værksted & Booking', icon: <Wrench size={18} /> },
    { to: '/admin/indhold', label: 'Hjemmesideindhold', icon: <Globe size={18} /> },
    { to: '/admin/indstillinger', label: 'Indstillinger', icon: <Settings size={18} /> },
  ];

  return (
    <div className="admin-root">
      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <button
          className="menu-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Åbn menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="admin-brand">
          <Shield size={20} className="brand-shield" />
          <span>Autohus Kvik <strong>Admin</strong></span>
        </div>

        <button onClick={handleLogout} className="mobile-logout-btn" title="Log ud">
          <LogOut size={18} />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-wrap">
          <div className="sidebar-brand">
            <span className="brand-main">Autohus</span>
            <span className="brand-accent">Kvik</span>
            <span className="brand-admin-tag">Admin</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-user-card">
          <div className="user-avatar">
            {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <strong>{user?.name || 'Administrator'}</strong>
            <span>{user?.role || 'Admin'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" target="_blank" className="sidebar-external-link">
            <ExternalLink size={16} />
            <span>Se offentlig hjemmeside</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={16} />
            <span>Log ud</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-body">
        {/* Desktop Topbar */}
        <header className="admin-topbar">
          <div className="topbar-welcome">
            Velkommen, <strong>{user?.name || 'Admin'}</strong>
          </div>

          <div className="topbar-actions">
            <Link to="/" target="_blank" className="btn btn-secondary btn-sm">
              <ExternalLink size={14} /> Se webshop
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              <LogOut size={14} /> Log ud
            </button>
          </div>
        </header>

        {/* Dynamic Nested Route View */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
