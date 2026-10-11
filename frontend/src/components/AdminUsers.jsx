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

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const url = roleFilter ? `/admin/users?role=${roleFilter}` : '/admin/users';
      const response = await api.get(url);
      setUsers(response.data.users || []);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) return;
    setActionLoading(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccess(`User "${userName}" deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/approve`);
      setSuccess('Provider approved successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError('Failed to approve provider');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to "${newRole}"?`)) return;
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setSuccess(`Role updated to ${newRole}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError('Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleTabs = [
    { key: '', label: 'All Users', count: users.length },
    { key: 'customer', label: 'Customers', count: users.filter((u) => u.role === 'customer').length },
    { key: 'provider', label: 'Providers', count: users.filter((u) => u.role === 'provider').length },
    { key: 'admin', label: 'Admins', count: users.filter((u) => u.role === 'admin').length },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 mt-1">
            View and manage all platform users
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
            ✅ {success}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {roleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
                  roleFilter === tab.key
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      roleFilter === tab.key
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
                placeholder="Search by name or email..."
                className="input pl-10"
              />
            </div>
          </CardBody>
        </Card>

        {/* Content */}
        {loading ? (
          <Card>
            <Spinner label="Loading users..." />
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <EmptyState
              icon="👥"
              title="No users found"
              description={
                searchQuery
                  ? `No users match "${searchQuery}"`
                  : 'No users in this category'
              }
            />
          </Card>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-3">
              Showing <strong className="text-slate-700">{filteredUsers.length}</strong> user
              {filteredUsers.length !== 1 ? 's' : ''}
            </p>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm flex-shrink-0">
                              👤
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {u.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              u.role === 'admin'
                                ? 'info'
                                : u.role === 'provider'
                                ? 'confirmed'
                                : 'declined'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.role === 'provider' ? (
                            <Badge variant={u.isApproved ? 'success' : 'warning'}>
                              {u.isApproved ? '✓ Approved' : '⏰ Pending'}
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {u.role === 'provider' && !u.isApproved && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprove(u._id)}
                                loading={actionLoading === u._id}
                              >
                                Approve
                              </Button>
                            )}
                            {u.role !== 'admin' && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(u._id, u.name)}
                                loading={actionLoading === u._id}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
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

export default AdminUsers;