import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody } from './ui/Card';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/locale';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const url = statusFilter
        ? `/admin/bookings?status=${statusFilter}`
        : '/admin/bookings';
      const res = await api.get(url);
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.bookingId?.toLowerCase().includes(q) ||
      b.customerId?.name?.toLowerCase().includes(q) ||
      b.providerId?.name?.toLowerCase().includes(q) ||
      b.serviceId?.title?.toLowerCase().includes(q)
    );
  });

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">All Bookings</h1>
          <p className="text-slate-500 mt-1">
            View all bookings across the platform
          </p>
          <p className="text-xs text-slate-400 mt-1">
            🇪🇹 Prices in ETB • Times in EAT (UTC+3)
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-4 overflow-x-auto">
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

        {/* Search */}
        <Card className="mb-6">
          <CardBody>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by booking ID, customer, provider, or service..."
                className="input pl-10"
              />
            </div>
          </CardBody>
        </Card>

        {/* Content */}
        {loading ? (
          <Card>
            <Spinner label="Loading bookings..." />
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <EmptyState
              icon="📋"
              title="No bookings found"
              description={
                searchQuery
                  ? `No bookings match "${searchQuery}"`
                  : statusFilter
                  ? `No ${statusFilter} bookings`
                  : 'No bookings have been made yet'
              }
            />
          </Card>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-3">
              Showing{' '}
              <strong className="text-slate-700">{filteredBookings.length}</strong>{' '}
              booking{filteredBookings.length !== 1 ? 's' : ''}
            </p>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm font-mono font-medium text-slate-700">
                            #{booking.bookingId || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">
                            {booking.serviceId?.title || 'Unknown'}
                          </p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm text-slate-700">
                            {booking.customerId?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {booking.customerId?.email || ''}
                          </p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm text-slate-700">
                            {booking.providerId?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {booking.providerId?.email || ''}
                          </p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm text-slate-700">
                            {formatDate(booking.bookingDate)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-brand-600">
                            {formatCurrency(booking.totalAmount)}
                          </p>
                          <p className="text-xs text-slate-400">
                            Deposit: {formatCurrency(booking.depositAmount)}
                          </p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge variant={booking.status}>{booking.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default AdminBookings;