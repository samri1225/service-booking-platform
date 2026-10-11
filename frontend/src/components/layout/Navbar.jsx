import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getMenuItems = () => {
    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { label: 'Users', path: '/admin/users', icon: '👥' },
        { label: 'Bookings', path: '/admin/bookings', icon: '📋' },
        { label: 'Providers', path: '/admin/providers', icon: '🔧' },
      ];
    }
    if (user.role === 'provider') {
      return [
        { label: 'Dashboard', path: '/provider/dashboard', icon: '📊' },
        { label: 'Services', path: '/provider/services', icon: '📦' },
        { label: 'Bookings', path: '/provider/bookings', icon: '📋' },
        { label: 'Availability', path: '/provider/availability', icon: '📅' },
      ];
    }
    return [
      { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
      { label: 'Services', path: '/services', icon: '🔍' },
      { label: 'My Bookings', path: '/my-bookings', icon: '📋' },
    ];
  };

  const menuItems = getMenuItems();
  const roleColor =
    user.role === 'admin'
      ? 'bg-purple-100 text-purple-700'
      : user.role === 'provider'
      ? 'bg-brand-100 text-brand-700'
      : 'bg-emerald-100 text-emerald-700';

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-lg text-slate-900 hidden sm:block">
              Service Booking
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className={`badge ${roleColor} capitalize`}>{user.role}</span>
              <span className="text-sm text-slate-700 font-medium max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Logout">
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">↪</span>
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn btn-ghost btn-sm"
            >
              ☰
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 animate-fade-in">
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;