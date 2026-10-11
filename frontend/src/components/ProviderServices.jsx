import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import { formatCurrency } from '../utils/locale';

const CATEGORIES = [
  'Plumbing',
  'Tutoring',
  'Cleaning',
  'Electrician',
  'Gardening',
  'Painting',
  'Carpentry',
  'Moving',
  'Photography',
  'Event Planning',
  'Catering',
  'Transport',
  'IT Support',
  'Other',
];

function ProviderServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    location: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/services');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const providerServices =
        response.data.services?.filter(
          (s) => s.providerId?._id === user._id || s.providerId === user._id
        ) || [];
      setServices(providerServices);
    } catch (err) {
      setError('Failed to load services');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      location: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };

      if (editingService) {
        await api.put(`/services/${editingService._id}`, payload);
      } else {
        await api.post('/services', payload);
      }

      setShowForm(false);
      setEditingService(null);
      resetForm();
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      duration: service.duration.toString(),
      location: service.location || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${serviceId}`);
      fetchServices();
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
    resetForm();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Services</h1>
            <p className="text-slate-500 mt-1">
              Create and manage your service offerings
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setShowForm(true);
              setEditingService(null);
              resetForm();
            }}
          >
            + Add Service
          </Button>
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

        {/* ─── Form (Modal-style card) ─── */}
        {showForm && (
          <Card className="mb-8 animate-slide-up">
            <CardBody>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingService ? '✏️ Edit Service' : '➕ Add New Service'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-slate-400 hover:text-slate-600 text-xl"
                  aria-label="Close form"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Service Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Professional Home Cleaning"
                    required
                  />

                  <div>
                    <label className="label">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Input
                      label="Price (ETB)"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 500"
                      min="0"
                      step="0.01"
                      required
                    />
                    {formData.price && (
                      <p className="mt-1.5 text-xs text-brand-600 font-medium">
                        Preview: {formatCurrency(parseFloat(formData.price) || 0)}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Duration (minutes)"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 60"
                    min="15"
                    step="15"
                    required
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Addis Ababa"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="input resize-none"
                      placeholder="Describe what your service includes..."
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={saving}
                    className="flex-1"
                  >
                    {saving
                      ? 'Saving...'
                      : editingService
                      ? 'Update Service'
                      : 'Create Service'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* ─── Services List ─── */}
        {loading ? (
          <Card>
            <Spinner label="Loading services..." />
          </Card>
        ) : services.length === 0 ? (
          <Card>
            <EmptyState
              icon="📦"
              title="No services yet"
              description="Click 'Add Service' to create your first service offering and start receiving bookings."
              action={
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowForm(true);
                    setEditingService(null);
                    resetForm();
                  }}
                >
                  + Add Your First Service
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service._id}
                hover
                className="overflow-hidden flex flex-col animate-slide-up"
              >
                <div className="h-32 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                  <span className="text-4xl">🛠️</span>
                </div>

                <CardBody className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
                      {service.title}
                    </h3>
                    <span className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
                      {service.category}
                    </span>
                  </div>

                  <p className="text-slate-500 text-sm mb-3 line-clamp-2 flex-1">
                    {service.description}
                  </p>

                  <div className="flex justify-between items-end mb-4 pb-4 border-b border-slate-100">
                    <span className="text-xl font-bold text-brand-600">
                      {formatCurrency(service.price)}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                      ⏱ {service.duration} min
                    </span>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      className="flex-1"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(service._id)}
                      className="flex-1"
                    >
                      🗑 Delete
                    </Button>
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

export default ProviderServices;