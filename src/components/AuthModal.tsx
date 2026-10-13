import React, { useState } from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  KeyRound, 
  RotateCcw,
  Check,
  Building
} from 'lucide-react';
import { UserProfile } from '../types/user';
import { profileFromApiUser } from '../services/authService';
import { apiLogin, apiSignup } from '../services/qloApi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userProfile: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Mobile
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form State
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('+92 ');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle Login (real backend)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || submitting) return;
    setLoginError('');
    setSubmitting(true);
    try {
      const { user } = await apiLogin({ identifier: loginIdentifier.trim(), password: loginPassword });
      onLoginSuccess({ ...profileFromApiUser(user), rememberMe });
      onClose();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Sign Up (real backend)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSignupError('');

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match. Please verify.');
      return;
    }

    if (signupPassword.length < 8) {
      setSignupError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await apiSignup({
        fullName: signupFullName.trim(),
        email: signupEmail.trim(),
        mobile: signupMobile.trim(),
        password: signupPassword,
      });
      onLoginSuccess(profileFromApiUser(user));
      onClose();
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : 'Could not create the account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Top Header */}
        <div className="bg-[#081225] text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>DiscountHotels.pk Portal</span>
            </div>
            <h3 className="font-black text-lg text-white">
              {mode === 'login' && 'Sign In to Your Account'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot_password' && 'Reset Password'}
            </h3>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Login / Sign Up) */}
        {mode !== 'forgot_password' && (
          <div className="bg-slate-100 p-1 flex border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{submitting ? 'Signing in…' : 'Login'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          
          {/* ========================================================
              1. LOGIN VIEW
              Fields: Email / Mobile, Password, Remember me, Forgot password, Login
             ======================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email / Mobile */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email / Mobile *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@company.com or +92 300 0000000"
                    className="w-full pl-3.5 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot_password')}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          {/* ========================================================
              2. SIGN UP VIEW
              Fields:
              * Full Name
              * Email
              * Mobile
              * Password
              * Confirm Password
             ======================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              
              {signupError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {signupError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  placeholder="e.g. Asad Farooqi"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@company.com or personal@gmail.com"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={signupMobile}
                  onChange={(e) => setSignupMobile(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-3.5 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Primary Sign Up Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 disabled:opacity-60"
              >
                <span>{submitting ? 'Creating account…' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-slate-400 text-center pt-1">
                By creating an account, you agree to DiscountHotels.pk terms & guest protection policies.
              </div>

            </form>
          )}

          {/* ========================================================
              3. FORGOT PASSWORD VIEW
             ======================================================== */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatic password reset by email is not available yet. Message our support desk on WhatsApp
                with your registered email or mobile number and we will reset your password for you.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://wa.me/923220957136?text=Salam!%20I%20need%20to%20reset%20my%20DiscountHotels.pk%20account%20password."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                >
                  Reset via WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
