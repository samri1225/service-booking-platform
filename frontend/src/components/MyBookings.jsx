import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/locale';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const url = statusFilter ? `/bookings?status=${statusFilter}` : '/bookings';
      const response = await api.get(url);
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by customer',
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return (
      <span className="text-yellow-400 text-sm">
        {'★'.repeat(rounded)}
        <span className="text-slate-300">{'★'.repeat(5 - rounded)}</span>
      </span>
    );
  };

  const statusTabs = [
    { key: '', label: 'All', count: bookings.length },
    {
      key: 'pending',
      label: 'Pending',
      count: bookings.filter((b) => b.status === 'pending').length,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      count: bookings.filter((b) => b.status === 'confirmed').length,
    },
    {
      key: 'completed',
      label: 'Completed',
      count: bookings.filter((b) => b.status === 'completed').length,
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: bookings.filter((b) => b.status === 'cancelled').length,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-1">Manage all your service bookings in one place</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
                  statusFilter === tab.key
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      statusFilter === tab.key
                        ? 'bg-white/20'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Card>
            <Spinner label="Loading your bookings..." />
          </Card>
        ) : error ? (
          <Card>
            <CardBody>
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            </CardBody>
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <EmptyState
              icon="📭"
              title="No bookings yet"
              description={
                statusFilter
                  ? `You don't have any ${statusFilter} bookings`
                  : 'Browse services and book your first one!'
              }
              action={
                <Link to="/services">
                  <Button variant="primary">Browse Services →</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking._id} hover className="animate-fade-in">
                <CardBody>
                  <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">
                      🛠️
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                          {booking.serviceId?.title || 'Service'}
                        </h3>
                        <Badge variant={booking.status}>{booking.status}</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">👤</span>
                          <span className="truncate">
                            {booking.providerId?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">📅</span>
                          <span>{formatDate(booking.bookingDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">🕐</span>
                          <span>
                            {booking.startTime} - {booking.endTime} (EAT)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-brand-600">
                          💰 {formatCurrency(booking.totalAmount)}
                        </div>
                      </div>

                      {booking.status === 'completed' && booking.rating && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="text-slate-500">Your rating:</span>
                          {renderStars(booking.rating)}
                          <span className="font-semibold text-slate-700">
                            {booking.rating}/5
                          </span>
                        </div>
                      )}

                      {booking.customerNotes && (
                        <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg line-clamp-2">
                          📝 {booking.customerNotes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:ml-4 md:min-w-[130px]">
                      <Link to={`/bookings/${booking._id}`}>
                        <Button variant="secondary" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>

                      {booking.status === 'completed' && !booking.rating && (
                        <Link to={`/bookings/${booking._id}`}>
                          <Button variant="primary" size="sm" className="w-full">
                            ⭐ Rate Service
                          </Button>
                        </Link>
                      )}

                      {booking.status === 'pending' && (
                        <Button
                          variant="danger"
                          size="sm"
                          className="w-full"
                          loading={cancelling === booking._id}
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default MyBookings;