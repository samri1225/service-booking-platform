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

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const upcoming = bookings.filter((b) => ['pending', 'confirmed'].includes(b.status));
  const completed = bookings.filter((b) => b.status === 'completed');
  const totalSpent = completed.reduce((sum, b) => sum + b.totalAmount, 0);

  const stats = [
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: '📋',
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Upcoming',
      value: upcoming.length,
      icon: '⏰',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Completed',
      value: completed.length,
      icon: '✅',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: '💰',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">
            Hello, {user.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your bookings</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
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
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/services">
              <Card hover className="cursor-pointer h-full">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-2xl">
                    🔍
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Browse Services</p>
                    <p className="text-xs text-slate-500">Find a service to book</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
            <Link to="/my-bookings">
              <Card hover className="cursor-pointer h-full">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">My Bookings</p>
                    <p className="text-xs text-slate-500">Manage all bookings</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
            <Card hover className="cursor-pointer h-full">
              <CardBody className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Leave Reviews</p>
                  <p className="text-xs text-slate-500">Rate completed services</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming bookings</h2>
            <Link
              to="/my-bookings"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              View all →
            </Link>
          </div>

          <Card>
            {loading ? (
              <Spinner label="Loading bookings..." />
            ) : upcoming.length === 0 ? (
              <CardBody>
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-slate-500 mb-4">No upcoming bookings</p>
                  <Link to="/services">
                    <Button variant="primary">Browse Services</Button>
                  </Link>
                </div>
              </CardBody>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcoming.slice(0, 3).map((booking) => (
                  <CardBody
                    key={booking._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {booking.serviceId?.title || 'Service'}
                        </h3>
                        <Badge variant={booking.status}>{booking.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {formatDate(booking.bookingDate)} • {booking.startTime} - {booking.endTime} (EAT)
                      </p>
                      <p className="text-sm text-slate-500">
                        Provider: {booking.providerId?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-brand-600">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                      <Link to={`/bookings/${booking._id}`}>
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </Link>
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

export default Dashboard;