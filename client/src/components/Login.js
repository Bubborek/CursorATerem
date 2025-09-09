import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Login successful!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center py-4 px-4 sm:py-8 sm:px-6 lg:py-12 lg:px-8">
      <div className="max-w-sm w-full space-y-6 sm:max-w-md sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-red-600 to-red-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl glow-red">
            <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Gym <span className="gradient-text">Access Control</span>
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-300">
            Sign in to your staff account
          </p>
        </motion.div>
        
        <motion.form 
          className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-10 sm:pl-12 text-sm sm:text-base"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:text-white transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm sm:text-base py-2 sm:py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </div>

          <motion.div 
            className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg sm:rounded-xl border border-gray-600"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xs sm:text-sm font-semibold text-red-400 mb-2 sm:mb-3 flex items-center">
              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full mr-2"></div>
              Demo Credentials:
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-white">Admin:</strong> admin@gym.com / admin123<br />
              <strong className="text-white">Staff:</strong> staff@gym.com / staff123
            </p>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;
