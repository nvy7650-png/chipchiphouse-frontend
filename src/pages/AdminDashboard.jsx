import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // =====================================================
  // LẤY USER HIỆN TẠI
  // =====================================================
  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem('user');

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Lỗi đọc user:', error);

      localStorage.removeItem('user');
      return null;
    }
  };

  const user = getCurrentUser();

  // =====================================================
  // KIỂM TRA QUYỀN ADMIN
  // =====================================================
  const isAdmin =
    user &&
    String(user.role || '')
      .trim()
      .toLowerCase() === 'admin';

  // =====================================================
  // FORMAT TIỀN
  // =====================================================
  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return (
      number.toLocaleString('vi-VN') + ' ₫'
    );
  };

  // =====================================================
  // FORMAT SỐ
  // =====================================================
  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString('vi-VN');
  };

  // =====================================================
  // FORMAT NGÀY
  // =====================================================
  const formatDate = (date) => {
    if (!date) {
      return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // =====================================================
  // FORMAT GIỜ
  // =====================================================
  const formatDateTime = (date) => {
    if (!date) {
      return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleString('vi-VN');
  };

  // =====================================================
  // TEXT TRẠNG THÁI ĐƠN HÀNG
  //
  // Theo DB:
  // pending
  // paid
  // shipping
  // completed
  // cancelled
  // =====================================================
  const getStatusText = (status) => {
    const normalizedStatus = String(status || '')
      .trim()
      .toLowerCase();

    switch (normalizedStatus) {
      case 'pending':
        return 'Chờ thanh toán';

      case 'paid':
        return 'Đã thanh toán';

      case 'shipping':
        return 'Đang giao';

      case 'completed':
        return 'Hoàn thành';

      case 'cancelled':
        return 'Đã hủy';

      default:
        return 'Không xác định';
    }
  };

  // =====================================================
  // MÀU TRẠNG THÁI
  // =====================================================
  const getStatusClass = (status) => {
    const normalizedStatus = String(status || '')
      .trim()
      .toLowerCase();

    switch (normalizedStatus) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';

      case 'paid':
        return 'bg-sky-100 text-sky-700';

      case 'shipping':
        return 'bg-blue-100 text-blue-700';

      case 'completed':
        return 'bg-emerald-100 text-emerald-700';

      case 'cancelled':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error(
          'Chưa cấu hình VITE_API_URL'
        );
      }

      const response = await axios.get(
        `${apiUrl}/admin/stats`
      );

      console.log(
        'Admin dashboard response:',
        response.data
      );

      const data = response.data;

      // =================================================
      // KIỂM TRA RESPONSE
      // =================================================
      if (!data || data.success === false) {
        throw new Error(
          data?.message ||
          'Không thể lấy dữ liệu dashboard'
        );
      }

      // =================================================
      // STATS
      // =================================================
      const receivedStats = data.stats || {};

      setStats({
        totalRevenue:
          Number(receivedStats.totalRevenue || 0),

        totalOrders:
          Number(receivedStats.totalOrders || 0),

        totalProducts:
          Number(receivedStats.totalProducts || 0),

        totalUsers:
          Number(receivedStats.totalUsers || 0)
      });

      // =================================================
      // RECENT ORDERS
      // =================================================
      const orders = Array.isArray(
        data.recentOrders
      )
        ? data.recentOrders
        : [];

      setRecentOrders(orders);

    } catch (err) {
      console.error(
        'Lỗi lấy dashboard admin:',
        err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        'Không thể tải dữ liệu dashboard'
      );

      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
      });

      setRecentOrders([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // KIỂM TRA ADMIN + LOAD DATA
  // =====================================================
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    fetchDashboard();
  }, [isAdmin]);

  // =====================================================
  // KHÔNG PHẢI ADMIN
  // =====================================================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-500 flex items-center justify-center text-2xl font-black">
            !
          </div>

          <h2 className="text-xl font-black text-slate-800 mt-5">
            Không có quyền truy cập
          </h2>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Chỉ tài khoản quản trị viên mới có thể
            truy cập trang quản trị.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="mt-6 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Đăng nhập
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================
  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* =================================================
          SIDEBAR
      ================================================= */}
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* =================================================
          MAIN
      ================================================= */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">

        {/* =================================================
            HEADER
        ================================================= */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">

          <div className="flex items-center gap-4">

            {/* Mobile menu */}
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="lg:hidden text-slate-600 hover:text-slate-900 font-bold text-xl"
              aria-label="Mở menu"
            >
              ☰
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                Tổng quan hệ thống
              </h1>

              <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                Quản lý và theo dõi hoạt động cửa hàng
              </p>
            </div>

          </div>

          {/* Admin info */}
          <div className="flex items-center gap-3">

            <div className="text-right hidden sm:block">

              <p className="text-sm font-bold text-slate-800">
                {user?.name || 'Admin'}
              </p>

              <p className="text-xs text-slate-500">
                Quản trị viên
              </p>

            </div>

            <div className="w-9 h-9 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">
              {(
                user?.name ||
                user?.username ||
                'AD'
              )
                .substring(0, 2)
                .toUpperCase()}
            </div>

          </div>

        </header>

        {/* =================================================
            MAIN BODY
        ================================================= */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* =================================================
              PAGE HEADER
          ================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <h2 className="text-xl font-black text-slate-900">
                Dashboard
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Tổng quan tình hình hoạt động của cửa hàng
              </p>
            </div>

            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {loading
                ? 'Đang tải...'
                : '↻ Làm mới'}
            </button>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">

              <span className="font-black">
                !
              </span>

              <div>
                <p className="font-bold">
                  Không thể tải dữ liệu
                </p>

                <p className="mt-0.5">
                  {error}
                </p>
              </div>

            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

            {/* Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tổng doanh thu
              </p>

              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 break-words">
                {loading
                  ? 'Đang tải...'
                  : formatCurrency(
                      stats.totalRevenue
                    )}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Doanh thu từ đơn hàng
              </p>

            </div>

            {/* Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tổng đơn hàng
              </p>

              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {loading
                  ? 'Đang tải...'
                  : formatNumber(
                      stats.totalOrders
                    )}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Tổng số đơn trong hệ thống
              </p>

            </div>

            {/* Products */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sản phẩm
              </p>

              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {loading
                  ? 'Đang tải...'
                  : formatNumber(
                      stats.totalProducts
                    )}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Tổng sản phẩm trong kho
              </p>

            </div>

            {/* Users */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Khách hàng
              </p>

              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {loading
                  ? 'Đang tải...'
                  : formatNumber(
                      stats.totalUsers
                    )}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Tổng tài khoản khách hàng
              </p>

            </div>

          </div>

          {/* =================================================
              RECENT ORDERS
          ================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>

                <h2 className="text-base font-bold text-slate-900">
                  Đơn hàng mới nhất
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Các đơn hàng gần đây trong hệ thống
                </p>

              </div>

              <button
                onClick={() =>
                  navigate('/admin/orders')
                }
                className="self-start sm:self-auto text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
              >
                Xem tất cả →
              </button>

            </div>

            {/* Loading */}
            {loading && (
              <div className="p-10 text-center">

                <div className="inline-flex items-center gap-2 text-sm text-slate-500">

                  <div className="w-4 h-4 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />

                  Đang tải dữ liệu...

                </div>

              </div>
            )}

            {/* Empty */}
            {!loading &&
              !error &&
              recentOrders.length === 0 && (
                <div className="p-10 text-center">

                  <div className="text-3xl mb-3">
                    📦
                  </div>

                  <p className="text-sm font-semibold text-slate-600">
                    Chưa có đơn hàng nào
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Các đơn hàng mới sẽ xuất hiện ở đây.
                  </p>

                </div>
              )}

            {/* Orders table */}
            {!loading &&
              recentOrders.length > 0 && (
                <div className="overflow-x-auto">

                  <table className="w-full text-left border-collapse">

                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">

                        <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                          Mã đơn
                        </th>

                        <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                          Khách hàng
                        </th>

                        <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                          Tổng tiền
                        </th>

                        <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                          Trạng thái
                        </th>

                        <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                          Ngày đặt
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">

                      {recentOrders.map((order) => (

                        <tr
                          key={order.id}
                          className="hover:bg-slate-50 transition"
                        >

                          {/* ID */}
                          <td className="py-4 px-4 sm:px-6 font-bold text-sky-600 whitespace-nowrap">
                            #{order.id}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4 sm:px-6">

                            <div className="min-w-[140px]">

                              <p className="text-slate-900 font-semibold">
                                {order.customer ||
                                  order.customer_name ||
                                  order.name ||
                                  'Khách hàng'}
                              </p>

                              {order.email && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {order.email}
                                </p>
                              )}

                            </div>

                          </td>

                          {/* Amount */}
                          <td className="py-4 px-4 sm:px-6 font-bold whitespace-nowrap">
                            {formatCurrency(
                              order.total_amount
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 sm:px-6">

                            <span
                              className={`
                                inline-block
                                px-2.5
                                py-1
                                rounded-full
                                text-xs
                                font-bold
                                whitespace-nowrap
                                ${getStatusClass(
                                  order.status
                                )}
                              `}
                            >
                              {getStatusText(
                                order.status
                              )}
                            </span>

                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 sm:px-6 text-slate-500 whitespace-nowrap">
                            <div>
                              {formatDate(
                                order.created_at
                              )}
                            </div>

                            <div className="text-xs text-slate-400 mt-0.5">
                              {formatDateTime(
                                order.created_at
                              ).split(' ')[1] || ''}
                            </div>
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>
              )}

          </div>

        </main>

      </div>

    </div>
  );
}