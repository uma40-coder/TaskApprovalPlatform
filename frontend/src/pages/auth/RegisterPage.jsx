import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authService } from '../../services/api';
import { setCredentials } from '../../features/auth/authSlice';
import { Button, Input } from '../../components/common';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserCheck } from 'lucide-react';

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });
      toast.success('Registration successful! Awaiting admin approval.');
      // Store minimal info (no token yet, status = pending)
      // We need to login to get the token
      const loginRes = await authService.login({ email: data.email, password: data.password });
      dispatch(setCredentials({ user: loginRes.data.user, token: loginRes.data.token }));
      navigate('/pending');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Left panel */}
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
            Start your journey with us today
          </h1>
          <p className="text-blue-100 text-lg">
            Join thousands of teams managing tasks efficiently with TaskFlow.
          </p>
        </div>
        <div className="relative space-y-4">
          {['Secure & Private', 'Real-time Collaboration', 'Smart Task Management'].map((f) => (
            <div key={f} className="flex items-center gap-3 text-white">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-blue-100">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <UserCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Create account</h2>
            <p className="text-slate-500">Fill in your details to register</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon={<User size={16} />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+1 234 567 8900"
              icon={<Phone size={16} />}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={16} /></div>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className={`w-full border ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={16} /></div>
                <input
                  type={showCPw ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className={`w-full border ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  {...register('confirmPassword')}
                />
                <button type="button" onClick={() => setShowCPw(!showCPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-6">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
