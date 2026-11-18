// Reusable Button component
export const Button = ({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled = false, loading = false, className = '', fullWidth = false,
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
};

// Badge component
export const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
  };
  const sizes = { xs: 'px-1.5 py-0.5 text-xs', sm: 'px-2.5 py-1 text-xs' };
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant] || variants.default} ${sizes[size]}`}>
      {children}
    </span>
  );
};

// Card component
export const Card = ({ children, className = '', hover = false }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

// Spinner
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <svg className={`animate-spin text-blue-600 ${sizes[size]} ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
};

// Skeleton loader
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

// Input field
export const Input = ({ label, error, className = '', icon, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      )}
      <input
        className={`w-full border ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${icon ? 'pl-10' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// Select field
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
    <select
      className={`w-full border ${error ? 'border-red-400' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// Textarea
export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
    <textarea
      className={`w-full border ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// Modal
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl ${sizes[size]} w-full animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Empty state
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-6xl mb-4">{icon || '📭'}</div>
    <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
    {description && <p className="text-sm text-slate-500 mb-6 max-w-sm">{description}</p>}
    {action}
  </div>
);

// Avatar
export const Avatar = ({ name = '', size = 'md', className = '' }) => {
  const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-9 h-9 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-xl' };
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {initials || '?'}
    </div>
  );
};

// Stat card
export const StatCard = ({ icon, label, value, color = 'blue', trend }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
    </Card>
  );
};
