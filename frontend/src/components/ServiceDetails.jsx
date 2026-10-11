import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody, CardHeader } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import TimePicker from './TimePicker';
import { formatCurrency, formatDate } from '../utils/locale';

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    customerNotes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    distribution: {},
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/services/${id}`);
      setService(response.data.service);
      const providerId = response.data.service.providerId?._id;
      if (providerId) fetchReviews(providerId);
    } catch (err) {
      setError('Failed to load service details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (providerId) => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/services/provider/${providerId}/reviews`);
      setReviews(res.data.reviews || []);
      setReviewStats(
        res.data.stats || { totalReviews: 0, averageRating: 0, distribution: {} }
      );
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingMessage('');
    setBookingSuccess(false);
    try {
      await api.post('/bookings', {
        serviceId: id,
        bookingDate: bookingData.bookingDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        customerNotes: bookingData.customerNotes,
      });
      setBookingSuccess(true);
      setBookingMessage('✅ Booking created successfully!');
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setBookingMessage(`❌ ${err.response?.data?.message || 'Booking failed'}`);
    } finally {
      setBookingLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" label="Loading service..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          <Card>
            <CardBody>
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error || 'Service not found'}
              </div>
              <Link to="/services" className="mt-4 inline-block">
                <Button variant="secondary">← Back to Services</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const provider = service.providerId;
  const providerRating = provider?.providerDetails?.rating || 0;
  const providerTotalReviews = provider?.providerDetails?.totalReviews || 0;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/services"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 transition mb-6"
        >
          ← Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left Column: Service Info ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="overflow-hidden animate-fade-in">
              <div className="h-72 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center relative">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl">🛠️</span>
                )}
                <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-brand-700 text-sm font-semibold px-3 py-1.5 rounded-full shadow-md">
                  {service.category}
                </span>
              </div>

              <CardBody>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{service.title}</h1>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <span>⏱ {service.duration} minutes</span>
                  <span>•</span>
                  <span>📍 {service.location || 'Remote'}</span>
                </div>

                <h3 className="font-semibold text-slate-800 mb-2">About this service</h3>
                <p className="text-slate-600 leading-relaxed">{service.description}</p>
              </CardBody>
            </Card>

            {/* ─── Reviews Section ─── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">⭐ Customer Reviews</h2>
                  <span className="text-sm text-slate-500">
                    {reviewStats.totalReviews} review
                    {reviewStats.totalReviews !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardHeader>

              <CardBody>
                {reviewsLoading ? (
                  <Spinner size="sm" label="Loading reviews..." />
                ) : reviews.length === 0 ? (
                  <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-slate-500 text-sm">
                      No reviews yet. Be the first to book and review!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Rating Summary */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-5">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-amber-600">
                            {reviewStats.averageRating.toFixed(1)}
                          </div>
                          <div className="flex justify-center mt-1">
                            {renderStars(reviewStats.averageRating)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {reviewStats.totalReviews} review
                            {reviewStats.totalReviews !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="flex-1">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviewStats.distribution?.[star] || 0;
                            const percent =
                              reviewStats.totalReviews > 0
                                ? (count / reviewStats.totalReviews) * 100
                                : 0;
                            return (
                              <div key={star} className="flex items-center gap-2 text-xs mb-1">
                                <span className="w-6 text-slate-600">{star}★</span>
                                <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                                  <div
                                    className="bg-amber-400 h-1.5 rounded-full transition-all"
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                                <span className="w-6 text-right text-slate-500">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-3">
                      {displayedReviews.map((review) => (
                        <div
                          key={review._id}
                          className="bg-slate-50 rounded-xl p-4 animate-fade-in"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-lg flex-shrink-0">
                              👤
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-semibold text-slate-800 text-sm">
                                  {review.customerId?.name || 'Anonymous'}
                                </p>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500">
                                  {review.ratedAt ? formatDate(review.ratedAt) : 'Recently'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                {renderStars(review.rating)}
                                <span className="text-xs font-semibold text-slate-700">
                                  {review.rating}/5
                                </span>
                              </div>
                              {review.review && (
                                <p className="text-slate-700 text-sm leading-relaxed">
                                  {review.review}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Show More */}
                    {reviews.length > 3 && (
                      <div className="text-center mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllReviews(!showAllReviews)}
                        >
                          {showAllReviews
                            ? '− Show less'
                            : `+ Show all ${reviews.length} reviews`}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </div>

          {/* ─── Right Column: Booking Card (Sticky) ─── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Price Card */}
              <Card className="animate-slide-up">
                <CardBody>
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Service Price
                    </p>
                    <p className="text-3xl font-bold text-brand-600">
                      {formatCurrency(service.price)}
                    </p>
                  </div>

                  {/* Provider Info */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-slate-500 mb-2 font-medium">
                      SERVICE PROVIDER
                    </p>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-lg flex-shrink-0">
                        👤
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {provider?.name || 'Unknown Provider'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {renderStars(providerRating)}
                          <span className="text-xs text-slate-500">
                            {providerRating > 0
                              ? providerRating.toFixed(1)
                              : 'New'}
                            {providerTotalReviews > 0 &&
                              ` (${providerTotalReviews})`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Form */}
                  <h3 className="font-semibold text-slate-800 mb-3">Book Now</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    🇪🇹 All times in EAT (UTC+3)
                  </p>

                  {bookingMessage && (
                    <div
                      className={`p-3 rounded-xl mb-3 text-sm ${
                        bookingSuccess
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {bookingMessage}
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit} className="space-y-3">
                    <div>
                      <label className="label text-xs">Booking Date</label>
                      <input
                        type="date"
                        name="bookingDate"
                        value={bookingData.bookingDate}
                        onChange={handleBookingChange}
                        className="input"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <TimePicker
                      label="Start Time"
                      value={bookingData.startTime}
                      onChange={(val) =>
                        setBookingData({ ...bookingData, startTime: val })
                      }
                      required
                    />

                    <TimePicker
                      label="End Time"
                      value={bookingData.endTime}
                      onChange={(val) =>
                        setBookingData({ ...bookingData, endTime: val })
                      }
                      required
                    />

                    <div>
                      <label className="label text-xs">Additional Notes</label>
                      <textarea
                        name="customerNotes"
                        value={bookingData.customerNotes}
                        onChange={handleBookingChange}
                        rows="2"
                        className="input resize-none text-sm"
                        placeholder="Any special requests..."
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600">Total</span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Deposit (20%)</span>
                        <span className="font-medium">
                          {formatCurrency(service.price * 0.2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      loading={bookingLoading}
                      className="w-full"
                    >
                      {bookingLoading ? 'Booking...' : '📅 Book Now'}
                    </Button>
                  </form>
                </CardBody>
              </Card>

              {/* Guarantee */}
              <Card>
                <CardBody className="text-xs text-slate-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Verified provider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>Secure booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💬</span>
                    <span>Real customer reviews</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ServiceDetails;