import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { taskService, userService } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard, Card, Badge, Button, Spinner, EmptyState, Avatar } from '../../components/common';
import { CheckSquare, Clock, AlertCircle, CheckCircle, Calendar, Flag } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import toast from 'react-hot-toast';

const priorityColor = { low: 'low', medium: 'medium', high: 'high' };
const statusLabel = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };
const statusColor = { pending: 'pending', in_progress: 'in_progress', completed: 'completed' };

const UserDashboard = () => {
  const qc = useQueryClient();
  const { user } = useSelector((s) => s.auth);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['user-tasks'],
    queryFn: () => taskService.getAll().then((r) => r.data),
    refetchInterval: 20000,
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile().then((r) => r.data.user),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.update(id, { status }),
    onSuccess: () => {
      toast.success('Task updated!');
      qc.invalidateQueries({ queryKey: ['user-tasks'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update'),
  });

  const tasks = tasksData?.tasks || [];
  const pending = tasks.filter((t) => t.status === 'pending');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const completed = tasks.filter((t) => t.status === 'completed');
  const overdue = tasks.filter((t) => isPast(new Date(t.deadline)) && t.status !== 'completed');

  const getDeadlineColor = (deadline, status) => {
    if (status === 'completed') return 'text-slate-400';
    if (isPast(new Date(deadline))) return 'text-red-500';
    if (isToday(new Date(deadline))) return 'text-amber-500';
    return 'text-slate-400';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <Avatar name={user?.fullName || ''} size="lg" className="ring-2 ring-white/30" />
            <div>
              <p className="text-blue-100 text-sm">Welcome back 👋</p>
              <h1 className="text-2xl font-bold">{user?.fullName}</h1>
              <p className="text-blue-200 text-sm mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<CheckSquare size={22} />} label="Total Tasks" value={tasks.length} color="blue" />
          <StatCard icon={<Clock size={22} />} label="Pending" value={pending.length} color="amber" />
          <StatCard icon={<AlertCircle size={22} />} label="In Progress" value={inProgress.length} color="purple" />
          <StatCard icon={<CheckCircle size={22} />} label="Completed" value={completed.length} color="green" />
        </div>

        {/* Overdue alert */}
        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              You have <strong>{overdue.length}</strong> overdue task{overdue.length !== 1 ? 's' : ''}. Please address them promptly.
            </p>
          </div>
        )}

        {/* Task list */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">My Tasks</h2>
          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : !tasks.length ? (
            <EmptyState icon="📋" title="No tasks assigned yet" description="Tasks assigned to you by the admin will appear here." />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task._id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-800">{task.title}</h3>
                        <Badge variant={priorityColor[task.priority]}>{task.priority}</Badge>
                        <Badge variant={statusColor[task.status]}>{statusLabel[task.status]}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs flex-wrap">
                        <span className={`flex items-center gap-1 font-medium ${getDeadlineColor(task.deadline, task.status)}`}>
                          <Calendar size={12} />
                          Due: {format(new Date(task.deadline), 'MMM d, yyyy')}
                          {isPast(new Date(task.deadline)) && task.status !== 'completed' && ' (Overdue)'}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Flag size={12} />
                          Priority: {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Status actions */}
                    {task.status !== 'completed' && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateMutation.mutate({ id: task._id, status: 'in_progress' })}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => updateMutation.mutate({ id: task._id, status: 'completed' })}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
