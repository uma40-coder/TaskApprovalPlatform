import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, token, isAuthenticated } = useSelector((s) => s.auth);
  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isApproved: user?.status === 'approved',
    isPending: user?.status === 'pending',
    isRejected: user?.status === 'rejected',
  };
};
