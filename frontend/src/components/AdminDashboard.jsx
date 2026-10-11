import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import { formatCurrency, formatDate } from '../utils/locale';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalCustomers: 0,
    pendingProviders: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    platformCommission: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const usersRes = await api.get('/admin/users');
      const users = usersRes.data.users || [];

      const bookingsRes = await api.get('/admin/bookings');
      const bookings = bookingsRes.data.bookings || [];

      const providers = users.filter((u) => u.role === 'provider');
      const customers = users.filter((u) => u.role === 'customer');
      const pendingProviders = providers.filter((p) => !p.isApproved);

      const pendingBookings = bookings.filter((b) => b.status === 'pending');
      const completedBookings = bookings.filter((b) => b.status === 'completed');

      const totalRevenue = completedBookings.reduce(
        (sum, b) => sum + b.totalAmount,
        0
      );
      const platformCommission = totalRevenue * 0.1;

      setStats({
        totalUsers: users.length,
        totalProviders: providers.length,
        totalCustomers: customers.length,
        pendingProviders: pendingProviders.length,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        completedBookings: completedBookings.length,
        totalRevenue,
        platformCommission,
      });

      setRecentBookings(bookings.slice(0, 5));
      setRecentUsers(users.slice(0, 5));
    } catch (err) {
      setError('Failed to load admin data. Make sure you are logged in as admin.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      sub: `${stats.totalCustomers} customers • ${stats.totalProviders} providers`,
    },
    {
      label: 'Pending Providers',
      value: stats.pendingProviders,
      icon: '⏰',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      sub: 'Awaiting approval',
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: '📋',
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      sub: `${stats.pendingBookings} pending • ${stats.completedBookings} completed`,
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: '💰',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      sub: `Commission: ${formatCurrency(stats.platformCommission)}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" label="Loading admin data..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Dashboard 👑
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user.name?.split(' ')[0] || 'Admin'} — here's your platform overview
          </p>
        </div>

        {error && (
          <Card className="mb-6">
            <CardBody>
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label} className="animate-slide-up">
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center text-xl`}
                  >
                    {stat.icon}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${stat.color} truncate`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-2">{stat.sub}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Pending Alert */}
        {stats.pendingProviders > 0 && (
          <Card className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">
                  ⚠️
                </div>
                <div>
                  <p className="font-semibold text-amber-900">
                    {stats.pendingProviders} provider
                    {stats.pendingProviders > 1 ? 's' : ''} awaiting approval
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Review their applications to activate their accounts
                  </p>
                </div>
              </div>
              <Link to="/admin/providers">
                <Button variant="primary" size="md">
                  Review Now →
                </Button>
              </Link>
            </CardBody>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/admin/users">
              <Card hover className="cursor-pointer h-full">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
                    👥
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">Manage Users</p>
                    <p className="text-xs text-slate-500">
                      {stats.totalUsers} users total
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link to="/admin/bookings">
              <Card hover className="cursor-pointer h-full">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-2xl flex-shrink-0">
                    📋
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">All Bookings</p>
                    <p className="text-xs text-slate-500">
                      {stats.totalBookings} bookings
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link to="/admin/providers">
              <Card hover className="cursor-pointer h-full">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                    🔧
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">Provider Approvals</p>
                    <p className="text-xs text-slate-500">
                      {stats.pendingProviders} pending
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">📋 Recent Bookings</h2>
                <Link
                  to="/admin/bookings"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  View all →
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-slate-500 text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="border-b border-slate-100 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">
                            {booking.serviceId?.title || 'Service'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {booking.customerId?.name || 'Unknown'} •{' '}
                            {formatDate(booking.bookingDate)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {booking.startTime} - {booking.endTime} •{' '}
                            <span className="font-medium text-brand-600">
                              {formatCurrency(booking.totalAmount)}
                            </span>
                          </p>
                        </div>
                        <Badge variant={booking.status}>{booking.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">👤 Recent Users</h2>
                <Link
                  to="/admin/users"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  View all →
                </Link>
              </div>

              {recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-slate-500 text-sm">No users yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 border-b border-slate-100 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'info'
                            : u.role === 'provider'
                            ? 'confirmed'
                            : 'declined'
                        }
                      >
                        {u.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;