import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody, CardHeader } from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { timeOptions, days } from '../utils/locale';

function ProviderAvailability() {
  const [availability, setAvailability] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.get(`/availability/${user._id}`);
      const existing = res.data.availability || [];

      const full = days.map((day) => {
        const found = existing.find((a) => a.day === day);
        return (
          found || {
            day,
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            isAvailable: false,
          }
        );
      });

      setAvailability(full);
      setBlockedDates(res.data.blockedDates || []);
    } catch (err) {
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setAvailability((prev) =>
      prev.map((a) => (a.day === day ? { ...a, isAvailable: !a.isAvailable } : a))
    );
  };

  const handleTimeChange = (day, field, value) => {
    setAvailability((prev) =>
      prev.map((a) => (a.day === day ? { ...a, [field]: value } : a))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/availability', { availability });
      setSuccess('✅ Availability saved successfully! (Ethiopian Time)');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockDate = async () => {
    if (!newBlockedDate) return;
    try {
      await api.post('/availability/block-date', {
        date: newBlockedDate,
        reason: blockReason || 'Unavailable',
      });
      setNewBlockedDate('');
      setBlockReason('');
      fetchAvailability();
      setSuccess('✅ Date blocked successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block date');
    }
  };

  const handleUnblockDate = async (date) => {
    if (!window.confirm('Unblock this date?')) return;
    try {
      await api.delete(`/availability/block-date/${date}`);
      fetchAvailability();
      setSuccess('✅ Date unblocked!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unblock');
    }
  };

  const activeDaysCount = availability.filter((a) => a.isAvailable).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" label="Loading availability..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">Manage Availability</h1>
          <p className="text-slate-500 mt-1">
            Set your working hours and block off unavailable dates
          </p>
          <p className="text-xs text-slate-400 mt-1">
            🇪🇹 Ethiopian Standard Time (EAT, UTC+3) — 12-hour format
          </p>
        </div>

        {/* Feedback */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-4 text-sm animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm animate-fade-in">
            {success}
          </div>
        )}

        {/* ─── Weekly Schedule ─── */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">📅 Weekly Schedule</h2>
              <span className="text-xs bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full font-medium">
                {activeDaysCount} day{activeDaysCount !== 1 ? 's' : ''} active
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {availability.map((slot) => (
                <div
                  key={slot.day}
                  className={`p-4 rounded-xl border transition ${
                    slot.isAvailable
                      ? 'border-brand-200 bg-brand-50/30'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer select-none sm:w-40 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={slot.isAvailable}
                        onChange={() => handleDayToggle(slot.day)}
                        className="w-5 h-5 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                      />
                      <span
                        className={`font-medium ${
                          slot.isAvailable ? 'text-brand-700' : 'text-slate-500'
                        }`}
                      >
                        {slot.day}
                      </span>
                    </label>

                    {/* Times */}
                    {slot.isAvailable ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-xs text-slate-500 whitespace-nowrap font-medium">
                            From:
                          </label>
                          <select
                            value={slot.startTime}
                            onChange={(e) =>
                              handleTimeChange(slot.day, 'startTime', e.target.value)
                            }
                            className="input py-1.5 text-sm flex-1"
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-xs text-slate-500 whitespace-nowrap font-medium">
                            To:
                          </label>
                          <select
                            value={slot.endTime}
                            onChange={(e) =>
                              handleTimeChange(slot.day, 'endTime', e.target.value)
                            }
                            className="input py-1.5 text-sm flex-1"
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic flex-1">
                        Not available on this day
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              loading={saving}
              onClick={handleSave}
              className="mt-6 w-full sm:w-auto"
            >
              {saving ? 'Saving...' : '💾 Save Schedule'}
            </Button>
          </CardBody>
        </Card>

        {/* ─── Blocked Dates ─── */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">🚫 Blocked Dates</h2>
              <span className="text-xs text-slate-500">
                {blockedDates.length} blocked
              </span>
            </div>
          </CardHeader>
          <CardBody>
            {/* Add new */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="input flex-1"
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="text"
                placeholder="Reason (optional)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="input flex-1"
              />
              <Button
                variant="danger"
                onClick={handleBlockDate}
                disabled={!newBlockedDate}
                className="sm:w-auto"
              >
                Block Date
              </Button>
            </div>

            {/* List */}
            {blockedDates.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-slate-500 text-sm">No blocked dates</p>
                <p className="text-slate-400 text-xs mt-1">
                  Add holidays or days off to prevent bookings
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {blockedDates.map((block, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-sm">
                        🚫
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(block.date).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        {block.reason && (
                          <p className="text-xs text-slate-500">{block.reason}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnblockDate(block.date)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default ProviderAvailability;