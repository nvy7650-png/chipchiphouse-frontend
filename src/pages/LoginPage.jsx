import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Card Form */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center p-3 bg-sky-50 text-sky-600 rounded-2xl mb-3 hover:bg-sky-100 hover:scale-105 transition-all"
          >
            <Home className="w-6 h-6" />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CHIPCHIP <span className="text-sky-500">HOUSE</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Đăng nhập để tiếp tục săn Merch Kpop xịn xò
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs sm:text-sm font-medium rounded-r-xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mật khẩu
              </label>
              <a href="#" className="text-xs font-bold text-sky-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />
              
              {/* Nút bật/tắt ẩn hiện mật khẩu */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chip-yellow hover:bg-yellow-300 text-slate-900 font-bold py-3 sm:py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition transform active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span>Đăng Nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 text-center text-xs sm:text-sm font-medium text-slate-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-sky-600 font-bold hover:underline">
            Tạo tài khoản mới
          </Link>
        </div>

      </div>
    </div>
  );
}