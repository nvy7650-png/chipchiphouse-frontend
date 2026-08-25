import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  BarChart3,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Clock,
  Menu
} from 'lucide-react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import AdminSidebar from '../components/AdminSidebar';

export default function AdminDashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [period, setPeriod] = useState('month');

  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    stats: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      currentMonth: {
        revenue: 0,
        orders: 0
      },
      today: {
        revenue: 0,
        orders: 0
      }
    },

    recentOrders: [],

    charts: {
      daily: [],
      monthly: []
    }
  });

  const navigate = useNavigate();

  // ==========================================
  // FORMAT TIỀN
  // ==========================================
  const formatMoney = (value) => {
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
  // LẤY DATA BACKEND
  // ==========================================
  const fetchDashboard = async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/stats`,
        {
          params: {
            period
          }
        }
      );

      if (res.data?.success) {
        setDashboard(res.data);
      }

    } catch (error) {

      console.error(
        'Lỗi lấy dashboard:',
        error
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  // ==========================================
  // DATA CHART
  // ==========================================
  const chartData =
    period === 'day'
      ? dashboard.charts.daily
      : dashboard.charts.monthly;

  // ==========================================
  // ĐỔI FORMAT CHART
  // ==========================================
  const formattedChartData = chartData.map(item => ({
    ...item,

    label:
      period === 'day'
        ? formatDate(item.date)
        : item.month
  }));

  // ==========================================
  // TRẠNG THÁI ĐƠN
  // ==========================================
  const getStatusClass = (status) => {

    switch (status) {

      case 'completed':
        return 'bg-emerald-100 text-emerald-700';

      case 'paid':
        return 'bg-blue-100 text-blue-700';

      case 'shipping':
        return 'bg-amber-100 text-amber-700';

      case 'cancelled':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status) => {

    switch (status) {

      case 'completed':
        return 'Hoàn thành';

      case 'paid':
        return 'Đã thanh toán';

      case 'shipping':
        return 'Đang giao';

      case 'cancelled':
        return 'Đã hủy';

      case 'pending':
        return 'Chờ xử lý';

      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* SIDEBAR */}
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* MAIN */}
      <div className="flex-1 lg:ml-64 min-w-0">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>

              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                Tổng quan hệ thống
              </h1>

              <p className="text-xs text-slate-500">
                Theo dõi hoạt động CHIPCHIP HOUSE
              </p>

            </div>

          </div>

        </header>

        <main className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* ========================================
              ĐƠN HÀNG MỚI NHẤT
          ======================================== */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-slate-100 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Clock className="w-5 h-5 text-sky-500" />

                <h2 className="font-black text-slate-900">
                  Đơn hàng mới nhất
                </h2>

              </div>

              <button
                onClick={() => navigate('/admin/orders')}
                className="text-sm font-bold text-sky-600 hover:underline"
              >
                Xem tất cả
              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr className="text-xs uppercase text-slate-500">

                    <th className="text-left px-6 py-3">
                      Mã đơn
                    </th>

                    <th className="text-left px-6 py-3">
                      Khách hàng
                    </th>

                    <th className="text-left px-6 py-3">
                      Tổng tiền
                    </th>

                    <th className="text-left px-6 py-3">
                      Trạng thái
                    </th>

                    <th className="text-left px-6 py-3">
                      Ngày đặt
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {dashboard.recentOrders.map(order => (

                    <tr
                      key={order.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-4 font-bold text-sky-600">
                        #{order.id}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {order.customer || 'Khách hàng'}
                      </td>

                      <td className="px-6 py-4 font-bold">
                        {formatMoney(order.total_amount)}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(order.status)}`}
                        >
                          {getStatusText(order.status)}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {formatDate(order.created_at)}
                      </td>

                    </tr>

                  ))}

                  {!loading &&
                    dashboard.recentOrders.length === 0 && (

                      <tr>

                        <td
                          colSpan="5"
                          className="text-center py-10 text-slate-400"
                        >
                          Chưa có đơn hàng
                        </td>

                      </tr>

                    )}

                </tbody>

              </table>

            </div>

          </section>

          {/* ========================================
              FILTER
          ======================================== */}
          <div className="flex items-center justify-between">

            <h2 className="text-lg font-black text-slate-900">
              Thống kê
            </h2>

            <div className="flex bg-white border border-slate-200 rounded-xl p-1">

              <button
                onClick={() => setPeriod('day')}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  period === 'day'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-500'
                }`}
              >
                Theo ngày
              </button>

              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  period === 'month'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-500'
                }`}
              >
                Theo tháng
              </button>

            </div>

          </div>

          {/* ========================================
              STAT CARDS
          ======================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="bg-white p-5 rounded-2xl border shadow-sm">

              <div className="flex justify-between">

                <div>

                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Doanh thu
                  </p>

                  <p className="text-xl font-black mt-2">
                    {formatMoney(
                      period === 'day'
                        ? dashboard.stats.today.revenue
                        : dashboard.stats.currentMonth.revenue
                    )}
                  </p>

                </div>

                <TrendingUp className="text-emerald-500" />

              </div>

            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm">

              <div className="flex justify-between">

                <div>

                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Đơn hàng
                  </p>

                  <p className="text-xl font-black mt-2">

                    {period === 'day'
                      ? dashboard.stats.today.orders
                      : dashboard.stats.currentMonth.orders}

                  </p>

                </div>

                <ShoppingBag className="text-sky-500" />

              </div>

            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm">

              <p className="text-xs font-bold text-slate-500 uppercase">
                Tổng sản phẩm
              </p>

              <p className="text-2xl font-black mt-2">
                {dashboard.stats.totalProducts}
              </p>

            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm">

              <p className="text-xs font-bold text-slate-500 uppercase">
                Khách hàng
              </p>

              <p className="text-2xl font-black mt-2">
                {dashboard.stats.totalUsers}
              </p>

            </div>

          </div>

          {/* ========================================
              BIỂU ĐỒ
          ======================================== */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="font-black text-slate-900">
                  Doanh thu
                </h2>

                <p className="text-xs text-slate-500 mt-1">

                  {period === 'day'
                    ? '30 ngày gần nhất'
                    : '12 tháng gần nhất'}

                </p>

              </div>

              <BarChart3 className="text-sky-500" />

            </div>

            <div className="h-[320px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={formattedChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10
                  }}
                >

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="label"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatMoney(value)
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    strokeWidth={3}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}