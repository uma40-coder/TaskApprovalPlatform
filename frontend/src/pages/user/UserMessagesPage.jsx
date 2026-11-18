import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { messageService, userService } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Spinner, EmptyState, Avatar, Button } from '../../components/common';
import { getSocket } from '../../utils/socket';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { format } from 'date-fns';

const MessageBubble = ({ message, currentUserId }) => {
  const isOwn = message.sender?._id === currentUserId;
  return (
    <div className={`flex gap-2 items-end ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar name={message.sender?.fullName || ''} size="xs" />
      <div className={`max-w-[70%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
          {message.content}
        </div>
        <span className="text-xs text-slate-400 px-1">{format(new Date(message.createdAt), 'h:mm a')}</span>
      </div>
    </div>
  );
};

const UserMessagesPage = () => {
  const { user } = useSelector((s) => s.auth);
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const socket = getSocket();
  const conversationId = user?._id; // User's conversation is always their own ID

  // Find admin
  const { data: adminData } = useQuery({
    queryKey: ['admin-user'],
    queryFn: () => userService.getAll({ role: 'admin' }).then((r) => r.data.users?.[0]),
    enabled: false, // We'll rely on message metadata
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId).then((r) => r.data.messages),
    enabled: !!conversationId,
    refetchInterval: 10000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('join_conversation', conversationId);
    const handler = () => qc.invalidateQueries({ queryKey: ['messages', conversationId] });
    socket.on('new_message', handler);
    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message', handler);
    };
  }, [conversationId, socket]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      return messageService.send({ content });
    },
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
    onError: (e) => toast.error(e.response?.data?.message || e.message || 'Failed to send'),
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMutation.mutate(text.trim());
  };

  // Get admin info from messages
  const adminInfo = messages?.find((m) => m.sender?.role === 'admin')?.sender;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
          <p className="text-slate-500 text-sm mt-1">Private conversation with admin</p>
        </div>

        <Card className="flex flex-col h-[calc(100vh-220px)] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <Avatar name="Platform Admin" size="sm" />
            <div>
              <p className="font-semibold text-slate-800">Platform Admin</p>
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                Available to help
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome message */}
            <div className="text-center py-4">
              <div className="inline-block bg-slate-100 rounded-full px-4 py-1.5 text-xs text-slate-500">
                This is a private conversation with admin. Messages are confidential.
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : !messages?.length ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No messages yet. Start the conversation by asking about your tasks or anything you need help with! 👋
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg._id} message={msg} currentUserId={user?._id} />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask admin about your tasks..."
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" disabled={!text.trim()} loading={sendMutation.isPending}>
              <Send size={16} />
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserMessagesPage;
