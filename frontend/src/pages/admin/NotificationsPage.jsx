import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { userService } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Spinner, EmptyState, Badge, Button } from '../../components/common';
import { setNotifications, markAllRead, markOneRead } from '../../features/notifications/notificationSlice';
import toast from 'react-hot-toast';
import { Bell, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';

const typeIcon = {
  account_approved: '🎉',
  account_rejected: '❌',
  registration_submitted: '📝',
  task_assigned: '📋',
  task_updated: '✏️',
  new_message: '💬',
};

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const { items, unreadCount } = useSelector((s) => s.notifications);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userService.getNotifications().then((r) => r.data),
    onSuccess: (data) => dispatch(setNotifications(data)),
  });

  useEffect(() => {
    if (data) dispatch(setNotifications(data));
  }, [data]);

  const markReadMutation = useMutation({
    mutationFn: (id) => userService.markNotificationRead(id),
    onSuccess: (_, id) => {
      if (id === 'all') {
        dispatch(markAllRead());
      } else {
        dispatch(markOneRead(id));
      }
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = items.length ? items : data?.notifications || [];

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            <p className="text-slate-500 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate('all')}>
              <CheckCheck size={16} /> Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : !notifications.length ? (
          <EmptyState icon="🔔" title="No notifications" description="You're all caught up! Notifications will appear here." />
        ) : (
          <Card className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
              >
                <div className="text-2xl flex-shrink-0">{typeIcon[n.type] || '🔔'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm">{n.title}</p>
                    {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
