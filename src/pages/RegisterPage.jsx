import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiAlertCircle
} from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    // Kiểm tra số điện thoại:
    // Đúng 10 số và bắt đầu bằng 0
    const phoneRegex = /^0[0-9]{9}$/;

    if (!phoneRegex.test(formData.phone)) {
      setError(
        'Số điện thoại không hợp lệ! Phải gồm đúng 10 chữ số và bắt đầu bằng số 0.'
      );
      return;
    }

    // Kiểm tra mật khẩu
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }
      );

      console.log('Register response:', res.data);

      alert('Đăng ký tài khoản thành công! 🎉');

      navigate('/login');

    } catch (err) {
      console.error('Lỗi đăng ký:', err);

      setError(
        err.response?.data?.message ||
        'Không thể kết nối đến máy chủ!'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">

      {/* Container */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">

          <Link
            to="/"
            className="inline-flex items-center justify-center p-3 bg-sky-50 text-sky-600 rounded-2xl mb-3 hover:bg-sky-100 hover:scale-105 transition-all"
          >
            <FiHome className="w-6 h-6" />
          </Link>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tạo Tài Khoản
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Trở thành thành viên của CHIPCHIP HOUSE ngay hôm nay
          </p>

        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs sm:text-sm font-medium rounded-r-xl flex items-center gap-2.5">

            <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />

            <span>{error}</span>

          </div>
        )}

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tên tài khoản
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiUser className="w-4 h-4" />
              </div>

              <input
                type="text"
                name="username"
                required
                placeholder="Nhập tên tài khoản"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

            </div>

          </div>

          {/* Email */}
          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiMail className="w-4 h-4" />
              </div>

              <input
                type="email"
                name="email"
                required
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

            </div>

          </div>

          {/* Phone */}
          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Số điện thoại
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiPhone className="w-4 h-4" />
              </div>

              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                placeholder="Nhập số điện thoại của bạn"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

            </div>

          </div>

          {/* Password */}
          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mật khẩu
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                placeholder="Ít nhất 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>

          {/* Confirm Password */}
          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Xác nhận mật khẩu
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>

              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chip-yellow hover:bg-yellow-300 text-slate-900 font-bold py-3 sm:py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition transform active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >

            {loading ? (
              <>
                <CgSpinner className="w-5 h-5 animate-spin" />
                <span>Đang khởi tạo...</span>
              </>
            ) : (
              <span>Đăng Ký</span>
            )}

          </button>

        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 text-center text-xs sm:text-sm font-medium text-slate-600">

          Đã có tài khoản?{' '}

          <Link
            to="/login"
            className="text-sky-600 font-bold hover:underline"
          >
            Đăng nhập tại đây
          </Link>

        </div>

      </div>

    </div>
  );
}