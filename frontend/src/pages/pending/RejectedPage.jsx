import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useSelector } from 'react-redux';
import { XCircle, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common';

const RejectedPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Registration Rejected</h1>
        <p className="text-slate-500 mb-4">
          Hi <span className="font-semibold">{user?.fullName}</span>, unfortunately your registration was not approved.
        </p>
        {user?.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-red-700 mb-1">Reason:</p>
            <p className="text-sm text-red-600">{user.rejectionReason}</p>
          </div>
        )}
        <p className="text-sm text-slate-500 mb-6">
          If you believe this was a mistake, please contact support or try registering with a different account.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={handleLogout} variant="danger" size="lg">
            <LogOut size={16} />
            Sign Out
          </Button>
          <Button onClick={() => navigate('/register')} variant="outline" size="lg">
            <RefreshCw size={16} />
            Re-register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RejectedPage;
