import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/locale';

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

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

  const handleAction = async (bookingId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) return;

    setActionLoading(bookingId);
    setError('');
    try {
      if (action === 'accept') {
        await api.put(`/bookings/${bookingId}/status`, { status: 'confirmed' });
      } else if (action === 'decline') {
        const reason = window.prompt('Please provide a reason for declining:');
        if (!reason) {
          setActionLoading(null);
          return;
        }
        await api.put(`/bookings/${bookingId}/status`, {
          status: 'declined',
          reason,
        });
      } else if (action === 'complete') {
        await api.put(`/bookings/${bookingId}/complete`);
      }
      fetchBookings();
    } catch (err) {
      setError(
        `Failed to ${action} booking: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setActionLoading(null);
    }
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
      key: 'declined',
      label: 'Declined',
      count: bookings.filter((b) => b.status === 'declined').length,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">All Bookings</h1>
          <p className="text-slate-500 mt-1">
            Manage all booking requests from your customers
          </p>
          <p className="text-xs text-slate-400 mt-1">
            🇪🇹 Times in Ethiopian Standard Time (EAT) • Prices in ETB
          </p>
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

        {error && (
          <Card className="mb-6">
            <CardBody>
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          <Card>
            <Spinner label="Loading bookings..." />
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <EmptyState
              icon="📭"
              title="No bookings yet"
              description={
                statusFilter
                  ? `You don't have any ${statusFilter} bookings`
                  : 'Customers will see your services and book them here'
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isPending = booking.status === 'pending';
              const isConfirmed = booking.status === 'confirmed';
              const isLoading = actionLoading === booking._id;

              return (
                <Card key={booking._id} hover className="animate-fade-in">
                  <CardBody>
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">
                        🛠️
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-slate-900 truncate">
                            {booking.serviceId?.title || 'Service'}
                          </h3>
                          <Badge variant={booking.status}>{booking.status}</Badge>
                          {booking.bookingId && (
                            <span className="text-xs text-slate-400 font-mono">
                              #{booking.bookingId}
                            </span>
                          )}
                        </div>

                        {/* Customer Row */}
                        <div className="bg-slate-50 rounded-xl p-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm flex-shrink-0">
                              👤
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {booking.customerId?.name || 'Unknown Customer'}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {booking.customerId?.email || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-400">Date</p>
                            <p className="font-medium text-slate-700">
                              {formatDate(booking.bookingDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Time (EAT)</p>
                            <p className="font-medium text-slate-700">
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Price</p>
                            <p className="font-semibold text-brand-600">
                              {formatCurrency(booking.totalAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Deposit</p>
                            <p className="font-medium text-slate-700">
                              {formatCurrency(booking.depositAmount)}
                            </p>
                          </div>
                        </div>

                        {booking.customerNotes && (
                          <p className="mt-3 text-xs text-slate-500 bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                            📝 {booking.customerNotes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="lg:ml-4 flex flex-col gap-2 lg:min-w-[140px]">
                        {isPending && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              loading={isLoading}
                              onClick={() => handleAction(booking._id, 'accept')}
                              className="w-full"
                            >
                              {isLoading ? 'Processing...' : '✓ Accept'}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              loading={isLoading}
                              onClick={() => handleAction(booking._id, 'decline')}
                              className="w-full"
                            >
                              {isLoading ? 'Processing...' : '✕ Decline'}
                            </Button>
                          </>
                        )}

                        {isConfirmed && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={isLoading}
                            onClick={() => handleAction(booking._id, 'complete')}
                            className="w-full"
                          >
                            {isLoading ? 'Processing...' : '✓ Mark Complete'}
                          </Button>
                        )}

                        {booking.status === 'completed' && (
                          <div className="text-center p-3 bg-emerald-50 rounded-xl">
                            <p className="text-xs font-semibold text-emerald-700">
                              ✓ Completed
                            </p>
                            {booking.rating && (
                              <p className="text-xs text-emerald-600 mt-1">
                                ⭐ {booking.rating}/5
                              </p>
                            )}
                          </div>
                        )}

                        {booking.status === 'declined' && (
                          <div className="text-center p-3 bg-slate-100 rounded-xl">
                            <p className="text-xs font-semibold text-slate-600">
                              ✕ Declined
                            </p>
                          </div>
                        )}

                        {booking.status === 'cancelled' && (
                          <div className="text-center p-3 bg-rose-50 rounded-xl">
                            <p className="text-xs font-semibold text-rose-700">
                              ⚠ Cancelled
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProviderBookings;