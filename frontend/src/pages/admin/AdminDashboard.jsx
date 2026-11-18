import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard, Card, Badge, Button, Avatar, Spinner, EmptyState, Input } from '../../components/common';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Users, Clock, CheckCircle, XCircle, Search, Eye, UserCheck, UserX, ChevronDown } from 'lucide-react';
import { Modal } from '../../components/common';
import { format } from 'date-fns';

const statusColor = { pending: 'pending', approved: 'approved', rejected: 'rejected' };

const UserDetailModal = ({ user, onClose, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!user) return null;
  return (
    <Modal isOpen={!!user} onClose={onClose} title="User Details" size="md">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar name={user.fullName} size="lg" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">{user.fullName}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
            {user.phone && <p className="text-sm text-slate-400">{user.phone}</p>}
          </div>
          <Badge variant={statusColor[user.status]} size="sm">{user.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-1">Registered</p>
            <p className="font-medium text-slate-700">{format(new Date(user.createdAt), 'MMM d, yyyy')}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-1">Role</p>
            <p className="font-medium text-slate-700 capitalize">{user.role}</p>
          </div>
        </div>

        {user.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-500">{user.rejectionReason}</p>
          </div>
        )}

        {user.status === 'pending' && (
          <div className="space-y-3">
            {showRejectForm ? (
              <div className="space-y-3">
                <Input
                  label="Rejection Reason (optional)"
                  placeholder="Why is this registration being rejected?"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={() => onReject(user._id, rejectReason)} variant="danger" size="sm" className="flex-1">
                    Confirm Reject
                  </Button>
                  <Button onClick={() => setShowRejectForm(false)} variant="ghost" size="sm">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => onApprove(user._id)} variant="success" className="flex-1">
                  <UserCheck size={16} /> Approve
                </Button>
                <Button onClick={() => setShowRejectForm(true)} variant="danger" className="flex-1">
                  <UserX size={16} /> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

const AdminDashboard = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => userService.getStats().then((r) => r.data.stats),
    refetchInterval: 30000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, statusFilter],
    queryFn: () => userService.getAll({ search, status: statusFilter }).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => userService.approve(id),
    onSuccess: () => {
      toast.success('User approved!');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedUser(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => userService.reject(id, reason),
    onSuccess: () => {
      toast.success('User rejected');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedUser(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to reject'),
  });

  const stats = statsData || {};

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage users, tasks and platform activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users size={22} />} label="Total Users" value={stats.total ?? '—'} color="blue" />
          <StatCard icon={<Clock size={22} />} label="Pending" value={stats.pending ?? '—'} color="amber" />
          <StatCard icon={<CheckCircle size={22} />} label="Approved" value={stats.approved ?? '—'} color="green" />
          <StatCard icon={<XCircle size={22} />} label="Rejected" value={stats.rejected ?? '—'} color="red" />
        </div>

        {/* Users table */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-base font-semibold text-slate-700">Registered Users</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full sm:w-56 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : !data?.users?.length ? (
            <EmptyState icon="👤" title="No users found" description="No users match your current filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Registered</th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.fullName} size="sm" />
                          <div>
                            <p className="font-medium text-slate-800">{u.fullName}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-500 hidden sm:table-cell">{u.phone || '—'}</td>
                      <td className="px-4 py-4">
                        <Badge variant={statusColor[u.status]}>{u.status}</Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-400 text-xs hidden md:table-cell">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedUser(u)}>
                            <Eye size={14} /> View
                          </Button>
                          {u.status === 'pending' && (
                            <>
                              <Button size="sm" variant="success" onClick={() => approveMutation.mutate(u._id)}>
                                <UserCheck size={14} />
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => { setSelectedUser(u); }}>
                                <UserX size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onApprove={(id) => approveMutation.mutate(id)}
        onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
