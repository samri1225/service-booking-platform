import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody, CardHeader } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import { formatCurrency, formatDate } from '../utils/locale';

function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data.booking);
      if (response.data.booking.rating) {
        setRating(response.data.booking.rating);
        setReview(response.data.booking.review || '');
      }
    } catch (err) {
      setError('Failed to load booking details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Cancelled by customer' });
      fetchBookingDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!rating || rating < 1) {
      setError('Please select a star rating');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/bookings/${id}/confirm`, { rating, review });
      setRatingSuccess('Thank you for your feedback! 🎉');
      setTimeout(() => {
        setRatingSuccess('');
        fetchBookingDetails();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return (
      <span className="text-yellow-400 text-lg">
        {'★'.repeat(rounded)}
        <span className="text-slate-300">{'★'.repeat(5 - rounded)}</span>
      </span>
    );
  };

  const statusSteps = ['pending', 'confirmed', 'completed'];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" label="Loading booking..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          <Card>
            <CardBody>
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error}
              </div>
              <Link to="/my-bookings" className="mt-4 inline-block">
                <Button variant="secondary">← Back to My Bookings</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          <Card>
            <CardBody>
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                Booking not found
              </div>
            </CardBody>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(booking.status);
  const isCancelled = ['cancelled', 'declined'].includes(booking.status);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 transition mb-6"
        >
          ← Back to My Bookings
        </Link>

        {/* ─── Header Card ─── */}
        <Card className="overflow-hidden mb-6 animate-fade-in">
          <div className="bg-gradient-to-br from-brand-600 to-indigo-700 px-6 py-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <p className="text-brand-200 text-sm mb-1">Booking Reference</p>
                <h1 className="text-2xl font-bold">#{booking.bookingId}</h1>
                <p className="text-brand-100 text-sm mt-2">
                  Created on {formatDate(booking.createdAt)}
                </p>
              </div>
              <Badge
                variant={booking.status}
                className="text-sm px-3 py-1.5 !bg-white/90"
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* ─── Status Timeline ─── */}
          {!isCancelled && (
            <div className="px-6 py-6 border-b border-slate-100">
              <div className="flex items-center justify-between relative">
                {statusSteps.map((step, idx) => {
                  const isActive = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center gap-2 relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                            isActive
                              ? 'bg-brand-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
                        >
                          {isActive ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-medium capitalize ${
                            isActive ? 'text-brand-600' : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                      {idx < statusSteps.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 rounded-full transition ${
                            idx < currentStepIndex ? 'bg-brand-600' : 'bg-slate-200'
                          }`}
                        ></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Service & Provider ─── */}
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
                  Service
                </p>
                <h3 className="font-semibold text-slate-800 mb-1">
                  {booking.serviceId?.title || 'Service'}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {booking.serviceId?.description || ''}
                </p>
              </div>

              {/* Provider */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
                  Provider
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {booking.providerId?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.providerId?.email || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ─── Date, Time, Price ─── */}
        <Card className="mb-6">
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Date</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {formatDate(booking.bookingDate)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Time (EAT)</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Total Amount</p>
                <p className="font-semibold text-brand-600 text-sm">
                  {formatCurrency(booking.totalAmount)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Deposit (20%)</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {formatCurrency(booking.depositAmount)}
                </p>
              </div>
            </div>

            {booking.customerNotes && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-800 mb-1">📝 Your Notes</p>
                <p className="text-sm text-amber-700">{booking.customerNotes}</p>
              </div>
            )}

            {booking.status === 'cancelled' && booking.cancellationReason && (
              <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-rose-800 mb-1">
                  Cancellation Reason
                </p>
                <p className="text-sm text-rose-700">{booking.cancellationReason}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ─── Rating Section ─── */}
        {booking.status === 'completed' && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-bold text-slate-900">⭐ Rate This Service</h3>
            </CardHeader>
            <CardBody>
              {!booking.rating ? (
                <>
                  {ratingSuccess && (
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-xl mb-4 text-sm animate-fade-in">
                      {ratingSuccess}
                    </div>
                  )}

                  {error && (
                    <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="mb-5">
                    <label className="label">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`text-5xl transition-all duration-150 hover:scale-110 ${
                            (hoverRating || rating) >= star
                              ? 'text-yellow-400'
                              : 'text-slate-200'
                          }`}
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-sm text-slate-600 mt-2">
                        You selected:{' '}
                        <strong>
                          {rating} star{rating > 1 ? 's' : ''}
                        </strong>
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="label">Your Review (Optional)</label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience with this service..."
                      rows="4"
                      maxLength="500"
                      className="input resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {review.length}/500 characters
                    </p>
                  </div>

                  <Button
                    variant="success"
                    size="lg"
                    className="w-full"
                    disabled={!rating}
                    loading={submitting}
                    onClick={handleSubmitRating}
                  >
                    {submitting ? 'Submitting...' : '⭐ Submit Rating'}
                  </Button>
                </>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-emerald-800 mb-3">
                    ✅ You rated this service
                  </h4>
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(booking.rating)}
                    <span className="text-lg font-semibold text-emerald-800">
                      {booking.rating}/5
                    </span>
                  </div>
                  {booking.review && (
                    <div className="bg-white rounded-lg p-3 mt-3">
                      <p className="text-xs text-slate-500 mb-1">Your review:</p>
                      <p className="text-slate-700 italic text-sm">"{booking.review}"</p>
                    </div>
                  )}
                  {booking.ratedAt && (
                    <p className="text-xs text-emerald-600 mt-3">
                      Rated on {formatDate(booking.ratedAt)}
                    </p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* ─── Actions ─── */}
        {booking.status === 'pending' && (
          <Card>
            <CardBody className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="danger"
                size="lg"
                className="flex-1"
                loading={cancelling}
                onClick={handleCancel}
              >
                {cancelling ? 'Cancelling...' : '✕ Cancel Booking'}
              </Button>
              <Link to="/services" className="flex-1">
                <Button variant="secondary" size="lg" className="w-full">
                  Browse More Services
                </Button>
              </Link>
            </CardBody>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default BookingDetails;