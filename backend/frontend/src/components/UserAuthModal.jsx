import React, { useState } from 'react';
import Modal from './Modal';
import { login, register } from '../api';
import api from '../api';
import { useData } from '../context/DataContext';

const UserAuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const { setUser } = useData();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const validatePassword = (pass) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isLogin && !isForgotPassword && !validatePassword(password)) {
      setError('Password must be at least 8 characters long, contain one uppercase letter and one special character.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await login({ username, password });
        if (res.data.success) {
          setUser(res.data.user);
          if (onAuthSuccess) onAuthSuccess(res.data);
          onClose();
        }
      } else {
        const res = await register({ username, email, fullName, phone, password });
        if (res.data.success) {
          setUser(res.data.user);
          if (onAuthSuccess) onAuthSuccess(res.data);
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword(newPassword)) {
      setError('New password must be at least 8 characters long, contain one uppercase letter and one special character.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsLogin(true);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setMessage('');
  };

  const openForgotPassword = () => {
    setIsForgotPassword(true);
    setError('');
    setMessage('');
  };

  const closeForgotPassword = () => {
    setIsForgotPassword(false);
    setError('');
    setMessage('');
  };

  const bannerUrl = '/auth_banner.png';

  if (isForgotPassword) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Reset Your Security">
        <div className="flex flex-col md:flex-row h-full -m-6 min-h-[500px]">
          <div className="hidden md:flex md:w-2/5 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-center">
            <img 
              src={bannerUrl} 
              className="absolute inset-0 w-full h-full object-cover opacity-40" 
              alt="Banner" 
              width="400" 
              height="600"
            />
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-primary-red/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-xl border border-white/10">
                <i className="fas fa-shield-alt text-2xl text-primary-red"></i>
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter">Security Center</h4>
              <p className="text-xs text-slate-400 font-bold leading-relaxed lowercase tracking-tight">Protecting your account with end-to-end security protocols.</p>
            </div>
          </div>
          <div className="w-full md:w-3/5 p-8 lg:p-12 overflow-y-auto bg-white">
            <div className="max-w-md mx-auto space-y-6">
              <header className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Forgot Password</h2>
                <p className="text-sm font-bold text-slate-400">Follow the steps to regain access.</p>
              </header>

              {error && <div className="p-4 rounded-xl text-xs font-black bg-red-50 text-red-600 border border-red-100 animate-in slide-in-from-top-2">{error}</div>}
              {message && <div className="p-4 rounded-xl text-xs font-black bg-green-50 text-green-600 border border-green-100 animate-in slide-in-from-top-2">{message}</div>}
              
              {!message.includes('OTP sent') ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="group transition-all">
                    <label htmlFor="auth-email-reset" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">Email Address</label>
                    <div className="relative">
                      <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red transition-colors text-xs"></i>
                      <input 
                        id="auth-email-reset"
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-red/5 focus:bg-white focus:border-primary-red transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                        type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-primary-red hover:shadow-2xl hover:shadow-primary-red/30 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 mt-4">Send Secure OTP</button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">Verification Key</label>
                    <div className="relative">
                      <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red text-xs"></i>
                      <input className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-primary-red/5 focus:bg-white" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">New Password</label>
                    <div className="relative">
                      <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red text-xs"></i>
                      <input className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-primary-red/5 focus:bg-white" type={showNewPassword ? "text" : "password"} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-red transition-colors p-2">
                        <i className={`fas fa-eye${showNewPassword ? '-slash' : ''} text-xs`}></i>
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-primary-red hover:shadow-2xl hover:shadow-primary-red/30 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 mt-4">Confirm New Password</button>
                </form>
              )}
              <div className="text-center pt-4">
                <button onClick={closeForgotPassword} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-red transition-colors border-b-2 border-transparent hover:border-primary-red pb-1">Back to Authentication</button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLogin ? 'Authentication' : 'Registration'}>
      <div className="flex flex-col md:flex-row h-full -m-6 min-h-[600px]">
        {/* Left Side Banner */}
        <div className="hidden md:flex md:w-2/5 bg-slate-900 relative overflow-hidden items-end p-12">
          <img src={bannerUrl} className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 transition-all duration-700" alt="Banner" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          <div className="relative z-10 space-y-2">
            <h4 className="text-3xl font-black text-white uppercase leading-none tracking-tighter">Stay <br/><span className="text-primary-red">Informed.</span></h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Premium News & Media Access</p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-3/5 p-8 lg:p-12 overflow-y-auto bg-white thin-scrollbar">
          <div className="max-w-md mx-auto space-y-8">
            <header className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                {isLogin ? "Welcome Back" : "Join the Elite"}
              </h2>
              <p className="text-sm font-bold text-slate-400 leading-snug">
                {isLogin ? "Enter your credentials to access your dashboard and saved news." : "Complete the profile to join the fastest growing news community."}
              </p>
            </header>

            {error && (
              <div className="p-4 rounded-xl text-[11px] font-black bg-red-50 text-red-600 border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (

                    <div className="grid grid-cols-1 gap-4">
                      <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">Full Legal Name</label>
                        <div className="relative">
                          <i className="fas fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red text-xs"></i>
                          <input 
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-red/5 focus:bg-white focus:border-primary-red transition-all text-sm font-bold text-slate-900"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">Email Archive</label>
                        <div className="relative">
                          <i className="fas fa-at absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red text-xs"></i>
                          <input 
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-red/5 focus:bg-white focus:border-primary-red transition-all text-sm font-bold text-slate-900"
                            type="email"
                            placeholder="archive@mail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">Username or Email</label>
                    <div className="relative">
                      <i className="fas fa-user-circle absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red text-xs"></i>
                      <input 
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-red/5 focus:bg-white focus:border-primary-red transition-all text-sm font-bold text-slate-900"
                        placeholder="Identifier"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                   <div className="group">
                    <label htmlFor="auth-password" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">Secret Passphrase</label>
                    <div className="relative">
                      <i className="fas fa-fingerprint absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red text-xs"></i>
                      <input 
                        id="auth-password"
                        className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-red/5 focus:bg-white focus:border-primary-red transition-all text-sm font-bold text-slate-900"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-red transition-colors p-2">
                        <i className={`fas fa-eye${showPassword ? '-slash' : ''} text-xs`}></i>
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-primary-red hover:shadow-2xl hover:shadow-primary-red/30 transition-all hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest text-[11px] mt-4 disabled:opacity-50"
                  >
                    {isLoading ? 'Decrypting...' : (isLogin ? 'Sign In Now' : 'Initialize Profile')}
                  </button>

                  <div className="flex flex-col items-center space-y-4 pt-6 border-t border-slate-50">
                    <button 
                      type="button" 
                      onClick={toggleMode}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      {isLogin ? "New here? Create your identity" : "Existing member? Authenticate here"}
                    </button>
                    
                    {isLogin && (
                      <button 
                        type="button" 
                        onClick={openForgotPassword}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-red transition-colors"
                      >
                        Lost your credentials?
                      </button>
                    )}
                  </div>
                </form>
          </div>

        </div>
      </div>
    </Modal>
  );
};

export default UserAuthModal;
