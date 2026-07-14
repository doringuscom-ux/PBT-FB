import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import Logo from '../components/Logo';
import { useData } from '../context/DataContext';

const AdminLogin = () => {
  const { user, setUser } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'sub-admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login({ username, password });
      if (res.data.success) {
        const loggedUser = res.data.user;
        if (loggedUser.role !== 'admin' && loggedUser.role !== 'sub-admin') {
          setError('Access denied: Unauthorized role');
          return;
        }
        setUser(loggedUser);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center px-5">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo className="h-24 w-auto mb-4" />
          <p className="text-text-gray font-semibold">Sign in to manage your content</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center font-bold">{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-text-dark mb-2">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary-red focus:ring-2 focus:ring-primary-red/10 outline-none transition-all"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-dark mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary-red focus:ring-2 focus:ring-primary-red/10 outline-none transition-all pr-12"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-red transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary-red text-white py-3 rounded-lg font-bold text-lg hover:bg-secondary-red transition-colors shadow-lg"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-gray">
          <a href="/" className="hover:text-primary-red underline">Back to Main Site</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
