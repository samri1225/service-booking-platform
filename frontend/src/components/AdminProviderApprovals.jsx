import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Card, { CardBody } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import { formatDate } from '../utils/locale';

function AdminProviderApprovals() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users?role=provider');
      setProviders(res.data.users || []);
    } catch (err) {
      setError('Failed to load providers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, name) => {
    if (!window.confirm(`Approve provider "${name}"?`)) return;
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/approve`);
      setSuccess(`✅ ${name} has been approved!`);
      setTimeout(() => setSuccess(''), 3000);
      fetchProviders();
    } catch (err) {
      setError('Failed to approve provider');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId, name) => {
    if (!window.confirm(`Reject provider "${name}"?`)) return;
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/reject`, { reason: 'Rejected by admin' });
      setSuccess(`${name} has been rejected`);
      setTimeout(() => setSuccess(''), 3000);
      fetchProviders();
    } catch (err) {
      setError('Failed to reject provider');
    } finally {
      setActionLoading(null);
    }
  };

  const pending = providers.filter((p) => !p.isApproved);
  const approved = providers.filter((p) => p.isApproved);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">Provider Approvals</h1>
          <p className="text-slate-500 mt-1">
            Review and approve provider applications to activate their accounts
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

        {loading ? (
          <Card>
            <Spinner label="Loading providers..." />
          </Card>
        ) : providers.length === 0 ? (
          <Card>
            <EmptyState
              icon="🔧"
              title="No providers yet"
              description="There are no provider accounts on the platform"
            />
          </Card>
        ) : (
          <>
            {/* ─── Pending ─── */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  ⏰ Pending Approvals
                </h2>
                {pending.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {pending.length} waiting
                  </span>
                )}
              </div>

              {pending.length === 0 ? (
                <Card>
                  <CardBody>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className="text-slate-500 text-sm font-medium">
                        All caught up!
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        No pending provider applications
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pending.map((p) => (
                    <Card
                      key={p._id}
                      className="border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50 animate-fade-in"
                    >
                      <CardBody>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                            🔧
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">
                                {p.name}
                              </h3>
                              <Badge variant="warning">Pending</Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">✉️</span>
                                <span className="text-slate-600 truncate">
                                  {p.email}
                                </span>
                              </div>
                              {p.profile?.phone && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400">📞</span>
                                  <span className="text-slate-600">
                                    {p.profile.phone}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">📅</span>
                                <span className="text-slate-600">
                                  Applied {formatDate(p.createdAt)}
                                </span>
                              </div>
                              {p.profile?.address && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400">📍</span>
                                  <span className="text-slate-600 truncate">
                                    {p.profile.address}
                                  </span>
                                </div>
                              )}
                            </div>

                            {p.profile?.bio && (
                              <p className="mt-3 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                                {p.profile.bio}
                              </p>
                            )}
                          </div>

                          <div className="flex sm:flex-col gap-2 sm:ml-4 sm:min-w-[120px]">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(p._id, p.name)}
                              loading={actionLoading === p._id}
                              className="flex-1 sm:w-full"
                            >
                              ✓ Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(p._id, p.name)}
                              loading={actionLoading === p._id}
                              className="flex-1 sm:w-full"
                            >
                              ✕ Reject
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Approved ─── */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  ✅ Approved Providers
                </h2>
                {approved.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {approved.length} active
                  </span>
                )}
              </div>

              {approved.length === 0 ? (
                <Card>
                  <CardBody>
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-sm">
                        No approved providers yet
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Provider
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {approved.map((p) => (
                          <tr key={p._id} className="hover:bg-slate-50 transition">
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm flex-shrink-0">
                                  🔧
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {p.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="text-sm text-slate-600 truncate">
                                {p.email}
                              </p>
                              {p.profile?.phone && (
                                <p className="text-xs text-slate-500">
                                  {p.profile.phone}
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500">
                              {p.createdAt ? formatDate(p.createdAt) : 'N/A'}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <Badge variant="success">✓ Approved</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default AdminProviderApprovals;