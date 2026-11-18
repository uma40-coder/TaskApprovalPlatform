import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { messageService, userService } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Spinner, EmptyState, Avatar, Button } from '../../components/common';
import { getSocket } from '../../utils/socket';
import toast from 'react-hot-toast';
import { Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex gap-2 items-end ${isOwn ? 'flex-row-reverse' : ''}`}>
    <Avatar name={message.sender?.fullName || ''} size="xs" />
    <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
        isOwn
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-slate-100 text-slate-800 rounded-bl-sm'
      }`}>
        {message.content}
      </div>
      <span className="text-xs text-slate-400 px-1">
        {format(new Date(message.createdAt), 'h:mm a')}
        {message.isRead && isOwn && <span className="ml-1 text-blue-400">✓</span>}
      </span>
    </div>
  </div>
);

const ChatPane = ({ conversationId, otherUser }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const socket = getSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId).then((r) => r.data.messages),
    enabled: !!conversationId,
    refetchInterval: 10000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('join_conversation', conversationId);
    const handler = (msg) => {
      qc.invalidateQueries({ queryKey: ['messages', conversationId] });
    };
    socket.on('new_message', handler);
    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message', handler);
    };
  }, [conversationId, socket]);

  const sendMutation = useMutation({
    mutationFn: (content) => messageService.send({ receiverId: otherUser?._id, content }),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['messages', conversationId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to send'),
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMutation.mutate(text.trim());
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon="💬" title="Select a conversation" description="Choose a user from the left to start messaging." />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <Avatar name={otherUser?.fullName || ''} size="sm" />
        <div>
          <p className="font-semibold text-slate-800">{otherUser?.fullName}</p>
          <p className="text-xs text-slate-400">{otherUser?.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !data?.length ? (
          <div className="text-center py-8 text-slate-400 text-sm">No messages yet. Say hello! 👋</div>
        ) : (
          data.map((msg) => (
            <MessageBubble key={msg._id} message={msg} isOwn={msg.sender?._id === user?._id} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" disabled={!text.trim()} loading={sendMutation.isPending} size="md">
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
};

const AdminMessagesPage = () => {
  const [activeConv, setActiveConv] = useState(null);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations().then((r) => r.data.conversations),
    refetchInterval: 15000,
  });

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
          <p className="text-slate-500 text-sm mt-1">Private conversations with users</p>
        </div>

        <Card className="flex h-[calc(100vh-220px)] overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 border-r border-slate-100 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700 text-sm">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8"><Spinner size="sm" /></div>
              ) : !conversations?.length ? (
                <div className="p-4 text-center text-sm text-slate-400">No conversations yet</div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 ${
                      activeConv?._id === conv._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Avatar name={conv.user?.fullName || ''} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{conv.user?.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat pane */}
          <ChatPane
            conversationId={activeConv?._id}
            otherUser={activeConv?.user}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminMessagesPage;
