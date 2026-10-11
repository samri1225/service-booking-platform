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

function ProviderDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    totalServices: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    setLoading(true);
    setError('');
    try {
      const bookingsRes = await api.get('/bookings');
      const bookings = bookingsRes.data.bookings || [];

      let myServices = [];
      try {
        const servicesRes = await api.get('/services');
        myServices =
          servicesRes.data.services?.filter(
            (s) => s.providerId?._id === user._id || s.providerId === user._id
          ) || [];
      } catch (err) {
        console.error('Could not load services:', err);
      }

      const pending = bookings.filter((b) => b.status === 'pending').length;
      const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
      const completed = bookings.filter((b) => b.status === 'completed').length;
      const totalRevenue = bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalBookings: bookings.length,
        pendingBookings: pending,
        confirmedBookings: confirmed,
        completedBookings: completed,
        totalRevenue,
        totalServices: myServices.length,
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (err) {
      setError('Failed to load provider data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: '📋',
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Pending',
      value: stats.pendingBookings,
      icon: '⏰',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Confirmed',
      value: stats.confirmedBookings,
      icon: '✅',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Completed',
      value: stats.completedBookings,
      icon: '🏆',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: '💰',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user.name?.split(' ')[0] || 'Provider'} 🔧
            </h1>
          </div>
          <p className="text-slate-500">
            Here's an overview of your services and bookings
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label} className="animate-slide-up">
              <CardBody>
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-xl mb-3`}
                >
                  {stat.icon}
                </div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className={`text-xl font-bold mt-1 ${stat.color} truncate`}>
                  {stat.value}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/provider/services">
              <Card hover className="cursor-pointer h-full">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-2xl flex-shrink-0">
                    📦
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">Manage Services</p>
                    <p className="text-xs text-slate-500">
                      {stats.totalServices} service{stats.totalServices !== 1 ? 's' : ''} listed
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link to="/provider/bookings">
              <Card hover className="cursor-pointer h-full">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
                    📋
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">View Bookings</p>
                    <p className="text-xs text-slate-500">
                      {stats.pendingBookings} pending
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link to="/provider/availability">
              <Card hover className="cursor-pointer h-full">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
                    📅
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">Set Availability</p>
                    <p className="text-xs text-slate-500">Manage working hours</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Recent bookings</h2>
            <Link
              to="/provider/bookings"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              View all →
            </Link>
          </div>

          <Card>
            {loading ? (
              <Spinner label="Loading bookings..." />
            ) : recentBookings.length === 0 ? (
              <CardBody>
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-slate-500 mb-4">
                    No bookings yet. Customers will book your services here.
                  </p>
                  <Link to="/provider/services">
                    <Button variant="primary">Add a Service</Button>
                  </Link>
                </div>
              </CardBody>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBookings.map((booking) => (
                  <CardBody
                    key={booking._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {booking.serviceId?.title || 'Service'}
                        </h3>
                        <Badge variant={booking.status}>{booking.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        <span className="font-medium text-slate-700">
                          {booking.customerId?.name || 'Unknown'}
                        </span>{' '}
                        • {formatDate(booking.bookingDate)} • {booking.startTime} -{' '}
                        {booking.endTime} (EAT)
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-lg font-bold text-brand-600">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                  </CardBody>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProviderDashboard;