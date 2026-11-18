import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initSocket, disconnectSocket, getSocket } from '../utils/socket';
import { addNotification } from '../features/notifications/notificationSlice';
import { updateUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !user) return;

    const socket = initSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', user._id);
    });

    socket.on('notification', (notification) => {
      dispatch(addNotification(notification));
      toast(notification.message, {
        icon: '🔔',
        style: { borderLeft: '4px solid #3b82f6' },
        duration: 5000,
      });
    });

    socket.on('status_change', ({ status, reason }) => {
      dispatch(updateUser({ status, rejectionReason: reason || null }));
      if (status === 'approved') {
        toast.success('Your account has been approved! Redirecting…', { duration: 4000 });
      } else if (status === 'rejected') {
        toast.error(`Account rejected: ${reason || 'No reason given'}`, { duration: 6000 });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, [token, user?._id]);

  return socketRef.current || getSocket();
};
