import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody } from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import { formatCurrency } from '../utils/locale';

function ServiceListings() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedCategory
        ? `/services?category=${selectedCategory}`
        : '/services';
      const response = await api.get(url);
      setServices(response.data.services || []);
      const uniqueCategories = [
        ...new Set(response.data.services?.map((s) => s.category) || []),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Failed to load services. Please try again.');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
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

  // Filter by search
  const filteredServices = services.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">Explore Services</h1>
          <p className="text-slate-500 mt-1">
            Discover and book trusted services from verified providers
          </p>
        </div>

        {/* Filters Bar */}
        <Card className="mb-6">
          <CardBody className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services by name or description..."
                className="input pl-10"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input md:w-56"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </CardBody>
        </Card>

        {/* Content */}
        {loading ? (
          <Card>
            <Spinner label="Loading services..." />
          </Card>
        ) : error ? (
          <Card>
            <CardBody>
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            </CardBody>
          </Card>
        ) : filteredServices.length === 0 ? (
          <Card>
            <EmptyState
              icon="🔍"
              title="No services found"
              description={
                selectedCategory
                  ? `No services available in "${selectedCategory}" category`
                  : searchQuery
                  ? `No services match "${searchQuery}"`
                  : 'Check back later for new services'
              }
              action={
                <Link to="/dashboard">
                  <Button variant="primary">Back to Dashboard</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Showing <strong className="text-slate-700">{filteredServices.length}</strong>{' '}
                service{filteredServices.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const provider = service.providerId;
                const rating = provider?.providerDetails?.rating || 0;
                const totalReviews = provider?.providerDetails?.totalReviews || 0;

                return (
                  <Card
                    key={service._id}
                    hover
                    className="overflow-hidden flex flex-col animate-slide-up"
                  >
                    {/* Image */}
                    <div className="h-44 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center relative">
                      {service.images && service.images.length > 0 ? (
                        <img
                          src={service.images[0]}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl">🛠️</span>
                      )}
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        {service.category}
                      </span>
                    </div>

                    <CardBody className="flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-1">
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-500 text-sm mb-3 line-clamp-2 flex-1">
                        {service.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        {renderStars(rating)}
                        <span className="text-xs font-semibold text-slate-700">
                          {rating > 0 ? rating.toFixed(1) : 'New'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {totalReviews > 0
                            ? `(${totalReviews} review${totalReviews > 1 ? 's' : ''})`
                            : 'No reviews yet'}
                        </span>
                      </div>

                      {/* Provider */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs">
                          👤
                        </div>
                        <span className="truncate">{provider?.name || 'Unknown Provider'}</span>
                      </div>

                      {/* Price + Duration */}
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-xs text-slate-400">Starting from</p>
                          <p className="text-xl font-bold text-brand-600">
                            {formatCurrency(service.price)}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          ⏱ {service.duration} min
                        </span>
                      </div>

                      {/* CTA */}
                      <Link to={`/services/${service._id}`} className="mt-auto">
                        <Button variant="primary" size="md" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ServiceListings;