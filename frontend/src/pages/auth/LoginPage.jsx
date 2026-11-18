import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authService } from '../../services/api';
import { setCredentials } from '../../features/auth/authSlice';
import { Button, Input } from '../../components/common';
import { Eye, EyeOff, Mail, Lock, UserCheck } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      const { user, token } = res.data;
      dispatch(setCredentials({ user, token }));
      toast.success(`Welcome back, ${user.fullName}!`);

      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.status === 'approved') {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else if (user.status === 'pending') {
        navigate('/pending', { replace: true });
      } else {
        navigate('/rejected', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <UserCheck size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">TaskFlow</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back to TaskFlow
          </h1>
          <p className="text-blue-100 text-lg">
            Sign in to manage your tasks and collaborate with your team.
          </p>
        </div>
        <div className="relative">
          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
            <p className="text-blue-100 text-sm italic mb-3">
              "TaskFlow has completely transformed how our team manages projects. The approval system is flawless."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">JD</div>
              <div>
                <p className="text-white text-sm font-medium">Jane Doe</p>
                <p className="text-blue-200 text-xs">Project Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <UserCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign in</h2>
            <p className="text-slate-500">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={16} /></div>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  className={`w-full border ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">Demo Admin Credentials</p>
            <p className="text-xs text-blue-600">Email: admin@taskplatform.com</p>
            <p className="text-xs text-blue-600">Password: Admin@123456</p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
