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
    name: '',
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

  // ==========================================
  // HANDLE INPUT
  // ==========================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Khi người dùng nhập lại thì xóa lỗi
    if (error) {
      setError('');
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================
  const handleSubmit = async (e) => {
  e.preventDefault();

  setError('');

  // ========================================
  // VALIDATE HỌ VÀ TÊN
  // ========================================
  const name = formData.name.trim();

  if (!name) {
    setError('Vui lòng nhập họ và tên!');
    return;
  }

  // ========================================
  // VALIDATE EMAIL
  // ========================================
  const email = formData.email.trim();

  if (!email) {
    setError('Vui lòng nhập email!');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    setError('Email không hợp lệ!');
    return;
  }

  // ========================================
  // VALIDATE PHONE
  // ========================================
  const phone = formData.phone.trim();

  if (!phone) {
    setError('Vui lòng nhập số điện thoại!');
    return;
  }

  if (!/^0\d{9}$/.test(phone)) {
    setError(
      'Số điện thoại phải gồm 10 số và bắt đầu bằng 0!'
    );
    return;
  }

  // ========================================
  // VALIDATE PASSWORD
  // ========================================
  if (!formData.password) {
    setError('Vui lòng nhập mật khẩu!');
    return;
  }

  if (formData.password.length < 6) {
    setError('Mật khẩu phải có ít nhất 6 ký tự!');
    return;
  }

  // ========================================
  // CONFIRM PASSWORD
  // ========================================
  if (!formData.confirmPassword) {
    setError('Vui lòng xác nhận mật khẩu!');
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError('Mật khẩu xác nhận không khớp!');
    return;
  }

  setLoading(true);

  try {
    // ========================================
    // GỌI API REGISTER
    // QUAN TRỌNG:
    // BACKEND ĐANG NHẬN username
    // ========================================
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      {
        username: name,
        email: email,
        phone: phone,
        password: formData.password
      }
    );

    console.log('Register response:', res.data);

    // ========================================
    // XÓA LOGIN CŨ
    // ========================================
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // ========================================
    // ĐĂNG KÝ THÀNH CÔNG
    // ========================================
    navigate('/login', {
      replace: true,
      state: {
        message: 'Đăng ký thành công! Vui lòng đăng nhập.'
      }
    });

  } catch (err) {
    console.error('Lỗi đăng ký:', err);

    if (err.response) {
      setError(
        err.response.data?.message ||
        'Đăng ký thất bại!'
      );
    } else if (err.request) {
      setError(
        'Không thể kết nối đến máy chủ!'
      );
    } else {
      setError(
        err.message ||
        'Đã xảy ra lỗi khi đăng ký!'
      );
    }

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">

      {/* ==========================================
          CARD
      ========================================== */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">

        {/* ========================================
            HEADER
        ======================================== */}
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

        {/* ========================================
            ERROR
        ======================================== */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs sm:text-sm font-medium rounded-r-xl flex items-center gap-2.5">

            <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />

            <span>{error}</span>

          </div>
        )}

        {/* ========================================
            FORM
        ======================================== */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* ======================================
              NAME
          ====================================== */}
          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Họ và tên
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiUser className="w-4 h-4" />
              </div>

              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                placeholder="Nhập họ và tên"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

            </div>

          </div>

          {/* ======================================
              EMAIL
          ====================================== */}
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
                autoComplete="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

            </div>

          </div>

          {/* ======================================
              PHONE
          ====================================== */}
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
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 10);

                  setFormData({
                    ...formData,
                    phone: value
                  });

                  if (error) {
                    setError('');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

            </div>

          </div>

          {/* ======================================
              PASSWORD
          ====================================== */}
          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mật khẩu
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Ít nhất 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
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

          {/* ======================================
              CONFIRM PASSWORD
          ====================================== */}
          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Xác nhận mật khẩu
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>

              <input
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                name="confirmPassword"
                required
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 sm:py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
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

          {/* ======================================
              SUBMIT
          ====================================== */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chip-yellow hover:bg-yellow-300 text-slate-900 font-bold py-3 sm:py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >

            {loading ? (
              <>
                <CgSpinner className="w-5 h-5 animate-spin" />
                <span>Đang đăng ký...</span>
              </>
            ) : (
              <span>Đăng Ký</span>
            )}

          </button>

        </form>

        {/* ========================================
            FOOTER
        ======================================== */}
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