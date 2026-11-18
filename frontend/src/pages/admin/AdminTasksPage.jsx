import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { taskService, userService } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge, Button, Spinner, EmptyState, Modal, Input, Select, Textarea, Avatar } from '../../components/common';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Calendar, Flag, User } from 'lucide-react';
import { format } from 'date-fns';

const priorityColor = { low: 'low', medium: 'medium', high: 'high' };
const statusColor = { pending: 'pending', in_progress: 'in_progress', completed: 'completed' };
const statusLabel = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };

const TaskForm = ({ task, users, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    deadline: task?.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.assignedTo || !form.deadline) {
      toast.error('Please fill all required fields');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Task Title *" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Enter task title" />
      <Textarea label="Description *" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Describe the task..." />
      <Select label="Assign To *" value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
        <option value="">Select user...</option>
        {users?.map((u) => <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </Select>
      </div>
      <Input label="Deadline *" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
      <div className="flex gap-2 pt-2">
        <Button type="submit" loading={loading} className="flex-1">{task ? 'Update Task' : 'Create Task'}</Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
};

const AdminTasksPage = () => {
  const qc = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const [modal, setModal] = useState(null); // null | 'create' | task object for edit
  const [deleteId, setDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => taskService.getAll({ status: statusFilter }).then((r) => r.data),
    refetchInterval: 20000,
  });

  const { data: usersData } = useQuery({
    queryKey: ['approved-users'],
    queryFn: () => userService.getAll({ status: 'approved' }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => { toast.success('Task created!'); qc.invalidateQueries({ queryKey: ['tasks'] }); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create task'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.update(id, data),
    onSuccess: () => { toast.success('Task updated!'); qc.invalidateQueries({ queryKey: ['tasks'] }); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => { toast.success('Task deleted'); qc.invalidateQueries({ queryKey: ['tasks'] }); setDeleteId(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete task'),
  });

  const tasks = tasksData?.tasks || [];
  const approvedUsers = usersData?.users || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Task Management</h1>
            <p className="text-slate-500 text-sm mt-1">Create and assign tasks to approved users</p>
          </div>
          <Button onClick={() => setModal('create')}>
            <Plus size={16} /> New Task
          </Button>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['', 'pending', 'in_progress', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {s === '' ? 'All' : statusLabel[s]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : !tasks.length ? (
          <EmptyState icon="📋" title="No tasks yet" description="Create your first task to get started." action={<Button onClick={() => setModal('create')}><Plus size={16} /> Create Task</Button>} />
        ) : (
          <div className="grid gap-4">
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
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {task.assignedTo?.fullName || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Due: {format(new Date(task.deadline), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flag size={12} />
                        Created {format(new Date(task.createdAt), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setModal(task)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(task._id)} className="text-red-500 hover:bg-red-50">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Create New Task' : 'Edit Task'}
        size="lg"
      >
        <TaskForm
          task={modal !== 'create' ? modal : null}
          users={approvedUsers}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={(data) => {
            if (modal === 'create') {
              createMutation.mutate(data);
            } else {
              updateMutation.mutate({ id: modal._id, data });
            }
          }}
          onClose={() => setModal(null)}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Task" size="sm">
        <p className="text-slate-600 mb-5">Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="flex gap-2">
          <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteId)} className="flex-1">Delete</Button>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminTasksPage;
