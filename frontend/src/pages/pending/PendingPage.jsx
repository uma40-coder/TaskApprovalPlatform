import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { authService } from '../../services/api';
import { updateUser, logout } from '../../features/auth/authSlice';
import { useSocket } from '../../hooks/useSocket';
import { getSocket } from '../../utils/socket';
import { Button } from '../../components/common';
import { Clock, CheckCircle, XCircle, RefreshCw, LogOut } from 'lucide-react';

const steps = [
  { label: 'Registration Submitted', done: true },
  { label: 'Under Admin Review', active: true },
  { label: 'Account Activated', done: false },
];

const PendingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [checking, setChecking] = useState(false);
  const [showModal, setShowModal] = useState(true);

  // Initialise socket (also listens for status_change)
  useSocket();

  // Poll status every 15 seconds as a fallback
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await authService.checkStatus();
        const { status, rejectionReason } = res.data;
        if (status !== user?.status) {
          dispatch(updateUser({ status, rejectionReason }));
        }
        if (status === 'approved') navigate('/dashboard', { replace: true });
        if (status === 'rejected') navigate('/rejected', { replace: true });
      } catch {}
    };

    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [user?.status]);

  // Listen for socket status_change
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = ({ status, reason }) => {
      dispatch(updateUser({ status, rejectionReason: reason || null }));
      if (status === 'approved') navigate('/dashboard', { replace: true });
      if (status === 'rejected') navigate('/rejected', { replace: true });
    };
    socket.on('status_change', handler);
    return () => socket.off('status_change', handler);
  });

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const res = await authService.checkStatus();
      const { status, rejectionReason } = res.data;
      dispatch(updateUser({ status, rejectionReason }));
      if (status === 'approved') navigate('/dashboard', { replace: true });
      else if (status === 'rejected') navigate('/rejected', { replace: true });
    } catch {}
    setChecking(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Info Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Account Pending Review</h3>
            <p className="text-slate-500 text-sm mb-6">
              Your registration has been submitted. An admin will review your account shortly. You'll be notified automatically once a decision is made.
            </p>
            <Button onClick={() => setShowModal(false)} fullWidth>Got it, I'll wait</Button>
          </div>
        </div>
      )}

      <div className="max-w-lg w-full">
        {/* Animated illustration */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-float">
              <Clock size={56} className="text-blue-500" />
            </div>
            <span className="absolute top-2 right-2 w-5 h-5 bg-amber-400 rounded-full animate-pulse-ring opacity-75" />
            <span className="absolute top-2 right-2 w-5 h-5 bg-amber-400 rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">Your account is under review</h1>
          <p className="text-slate-500 max-w-sm mx-auto">
            Hi <span className="font-semibold text-blue-600">{user?.fullName}</span>! We've received your registration and our admin team is reviewing it. This usually takes a short while.
          </p>
        </div>

        {/* Progress steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-5">Approval Progress</h3>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.done ? 'bg-emerald-100' : step.active ? 'bg-blue-100 animate-pulse' : 'bg-slate-100'
                }`}>
                  {step.done ? (
                    <CheckCircle size={18} className="text-emerald-500" />
                  ) : step.active ? (
                    <Clock size={18} className="text-blue-500" />
                  ) : (
                    <div className="w-3 h-3 bg-slate-300 rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${step.done ? 'text-emerald-600' : step.active ? 'text-blue-600' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
                {step.active && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">In Progress</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <div className="flex gap-3">
            <div className="text-blue-500 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">What happens next?</p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• The admin will review your registration details</li>
                <li>• You'll be notified instantly via our real-time system</li>
                <li>• Once approved, you'll gain full dashboard access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleManualCheck} loading={checking} variant="outline" className="flex-1" size="lg">
            <RefreshCw size={16} />
            Check Status
          </Button>
          <Button onClick={handleLogout} variant="ghost" size="lg">
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Status checks automatically every 15 seconds
        </p>
      </div>
    </div>
  );
};

export default PendingPage;
