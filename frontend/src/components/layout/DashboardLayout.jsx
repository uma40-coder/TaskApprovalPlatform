import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, Badge } from '../common';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, CheckSquare, MessageSquare,
  Bell, LogOut, Menu, X, ChevronRight, Settings,
  ClipboardList, UserCheck
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, badge, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive
          ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`
    }
  >
    <Icon size={18} className="flex-shrink-0" />
    <span className="flex-1">{label}</span>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </NavLink>
);

export const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const unreadCount = useSelector((s) => s.notifications.unreadCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const adminNav = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/tasks', icon: ClipboardList, label: 'Tasks' },
    { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
  ];

  const userNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
  ];

  const navItems = isAdmin ? adminNav : userNav;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <UserCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">TaskFlow</p>
              <p className="text-xs text-slate-400">{isAdmin ? 'Admin Panel' : 'User Portal'}</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">Menu</p>
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <Avatar name={user?.fullName || ''} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 mt-1 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const unreadCount = useSelector((s) => s.notifications.unreadCount);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400">
            <span>TaskFlow</span>
            <ChevronRight size={14} />
            <span className="text-slate-600 font-medium">
              {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {unreadCount > 0 && (
              <div className="relative">
                <Bell size={20} className="text-slate-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
            <Avatar name={user?.fullName || ''} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
