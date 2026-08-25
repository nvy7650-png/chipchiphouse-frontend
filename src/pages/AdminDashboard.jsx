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

  // ==========================================
  // LẤY THÔNG TIN ADMIN
  // ==========================================
  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  // ==========================================
  // FORMAT TIỀN
  // ==========================================
  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' ₫';
  };

  // ==========================================
  // FORMAT NGÀY
  // ==========================================
  const formatDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleDateString('vi-VN');
  };

  // ==========================================
  // FORMAT TRẠNG THÁI
  // ==========================================
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';

      case 'processing':
        return 'Đang xử lý';

      case 'shipping':
        return 'Đang giao';

      case 'cancelled':
        return 'Đã hủy';

      case 'pending':
        return 'Chờ xử lý';

      default:
        return status || 'Không xác định';
    }
  };

  // ==========================================
  // MÀU TRẠNG THÁI
  // ==========================================
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';

      case 'shipping':
        return 'bg-blue-100 text-blue-700';

      case 'processing':
        return 'bg-amber-100 text-amber-700';

      case 'cancelled':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/stats`
        );

        console.log('Admin dashboard:', res.data);

        if (res.data.success) {
          setStats(res.data.stats || {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalUsers: 0
          });

          setRecentOrders(
            res.data.recentOrders || []
          );
        }

      } catch (err) {
        console.error(
          'Lỗi lấy dashboard admin:',
          err
        );

        setError(
          err.response?.data?.message ||
          'Không thể tải dữ liệu dashboard'
        );

      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ==========================================
  // KIỂM TRA ADMIN
  // ==========================================
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-xl font-bold text-slate-800">
            Không có quyền truy cập
          </h2>

          <p className="text-slate-500 mt-2">
            Chỉ tài khoản quản trị viên mới có thể truy cập.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="mt-5 bg-sky-500 text-white px-5 py-2 rounded-xl font-bold"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* ==========================================
          MAIN
      ========================================== */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">

        {/* ========================================
            HEADER
        ======================================== */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 font-bold text-xl"
            >
              ☰
            </button>

            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
              Tổng quan hệ thống
            </h1>

          </div>

          <div className="flex items-center gap-3">

            <div className="text-right hidden sm:block">

              <p className="text-sm font-bold text-slate-800">
                {user.name || user.username || 'Admin'}
              </p>

              <p className="text-xs text-slate-500">
                Quản trị viên
              </p>

            </div>

            <div className="w-9 h-9 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              AD
            </div>

          </div>

        </header>

        {/* ========================================
            MAIN BODY
        ======================================== */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* ========================================
              STATISTICS
          ======================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

            {/* Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tổng doanh thu
              </p>

              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {loading
                  ? 'Đang tải...'
                  : formatCurrency(stats.totalRevenue)
                }
              </p>

            </div>

            {/* Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tổng đơn hàng
              </p>

              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {loading
                  ? 'Đang tải...'
                  : stats.totalOrders.toLocaleString('vi-VN')
                }
              </p>

            </div>

            {/* Products */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sản phẩm
              </p>

              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {loading
                  ? 'Đang tải...'
                  : stats.totalProducts.toLocaleString('vi-VN')
                }
              </p>

            </div>

            {/* Users */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Khách hàng
              </p>

              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {loading
                  ? 'Đang tải...'
                  : stats.totalUsers.toLocaleString('vi-VN')
                }
              </p>

            </div>

          </div>

          {/* ========================================
              RECENT ORDERS
          ======================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-slate-100 flex justify-between items-center">

              <h2 className="text-base font-bold text-slate-900">
                Đơn hàng mới nhất
              </h2>

              <button
                onClick={() => navigate('/admin/orders')}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Xem tất cả
              </button>

            </div>

            {loading ? (

              <div className="p-10 text-center text-slate-500">
                Đang tải dữ liệu...
              </div>

            ) : recentOrders.length === 0 ? (

              <div className="p-10 text-center text-slate-500">
                Chưa có đơn hàng nào.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">

                      <th className="py-3.5 px-6">
                        Mã đơn
                      </th>

                      <th className="py-3.5 px-6">
                        Khách hàng
                      </th>

                      <th className="py-3.5 px-6">
                        Tổng tiền
                      </th>

                      <th className="py-3.5 px-6">
                        Trạng thái
                      </th>

                      <th className="py-3.5 px-6">
                        Ngày đặt
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">

                    {recentOrders.map((order) => (

                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 transition"
                      >

                        <td className="py-4 px-6 font-bold text-sky-600">
                          #{order.id}
                        </td>

                        <td className="py-4 px-6 text-slate-900 font-semibold">
                          {order.customer || 'Khách hàng'}
                        </td>

                        <td className="py-4 px-6 font-bold">
                          {formatCurrency(order.total_amount)}
                        </td>

                        <td className="py-4 px-6">

                          <span
                            className={`
                              inline-block
                              px-2.5 py-1
                              rounded-full
                              text-xs font-bold
                              ${getStatusClass(order.status)}
                            `}
                          >
                            {getStatusText(order.status)}
                          </span>

                        </td>

                        <td className="py-4 px-6 text-slate-500">
                          {formatDate(order.created_at)}
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