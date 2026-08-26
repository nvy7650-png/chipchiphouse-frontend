import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import {
  ShoppingBag,
  Search,
  Eye,
  X,
  Loader2,
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';

export default function AdminOrders() {
  const API_URL = import.meta.env.VITE_API_URL;

  // State giao diện
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal Chi tiết & Cập nhật
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // 1. Fetch danh sách đơn hàng từ Backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/orders`);
      // Hỗ trợ cả 2 dạng cấu trúc trả về res.data.orders hoặc res.data
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn hàng:', err);
      setError(
        err.response?.data?.message || 'Không thể lấy danh sách đơn hàng!'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Fetch chi tiết 1 đơn hàng
  const handleViewDetail = async (orderId) => {
    try {
      setLoadingDetail(true);
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setSelectedOrder(res.data.order || res.data);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      alert(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng!');
    } finally {
      setLoadingDetail(false);
    }
  };

  // 3. Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status: newStatus
      });

      // Cập nhật lại state trực tiếp
      setOrders((prevOrders) =>
        prevOrders.map((ord) =>
          ord.id === orderId ? { ...ord, status: newStatus } : ord
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }

      alert('Cập nhật trạng thái đơn hàng thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái!');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 4. Lọc đơn hàng
  const filteredOrders = orders.filter((order) => {
    const keyword = search.trim().toLowerCase();
    const matchSearch =
      !keyword ||
      String(order.id).toLowerCase().includes(keyword) ||
      order.customer_name?.toLowerCase().includes(keyword) ||
      order.phone?.toLowerCase().includes(keyword);

    const matchStatus =
      !statusFilter ||
      String(order.status).toUpperCase() === statusFilter.toUpperCase();

    return matchSearch && matchStatus;
  });

  // Helpers định dạng
  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const upper = String(status || '').toUpperCase();
    switch (upper) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200">
            <Truck className="w-3.5 h-3.5" /> Đang giao
          </span>
        );
      case 'CONFIRMED':
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Đã hủy
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Chờ xử lý
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar đồng bộ prop isOpen và setIsOpen */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 lg:ml-64 min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 text-xl"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Quản lý Đơn hàng
              </h1>
              <p className="hidden sm:block text-xs text-slate-500">
                Theo dõi và xử lý đơn hàng của khách hàng
              </p>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* TOOLBAR */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900">Danh sách đơn hàng</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tổng cộng {filteredOrders.length} đơn hàng
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-sm outline-none text-slate-700 font-medium"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="SHIPPING">Đang giao hàng</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, tên, SĐT..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* TABLE */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-3" />
                <p className="text-sm text-slate-500">Đang tải đơn hàng...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600">Không tìm thấy đơn hàng</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">Mã đơn hàng</th>
                      <th className="px-6 py-4">Khách hàng</th>
                      <th className="px-6 py-4">Tổng tiền</th>
                      <th className="px-6 py-4">Ngày đặt</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          #{order.id}
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-900">
                              {order.customer_name || order.receiver_name || 'Khách hàng'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {order.phone || order.email || '—'}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-bold text-sky-600">
                          {formatMoney(order.total_amount || order.total_price)}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(order.created_at)}
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewDetail(order.id)}
                            className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition font-medium text-xs inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem chi tiết</span>
                          </button>
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

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-8 overflow-hidden">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Đặt lúc: {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung Modal */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Thông tin giao hàng & Trạng thái */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">
                    Thông tin nhận hàng
                  </h3>
                  <p className="font-bold text-slate-900">
                    {selectedOrder.receiver_name || selectedOrder.customer_name}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    SĐT: {selectedOrder.phone || '—'}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Địa chỉ: {selectedOrder.address || selectedOrder.shipping_address || '—'}
                  </p>
                  {selectedOrder.note && (
                    <p className="text-xs text-slate-500 italic mt-2">
                      Ghi chú: "{selectedOrder.note}"
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">
                    Cập nhật trạng thái
                  </h3>
                  <div className="mb-3">{getStatusBadge(selectedOrder.status)}</div>

                  <select
                    disabled={updatingStatus}
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleUpdateStatus(selectedOrder.id, e.target.value)
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="PENDING">Chờ xử lý (PENDING)</option>
                    <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
                    <option value="SHIPPING">Đang giao hàng (SHIPPING)</option>
                    <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                    <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                  </select>
                </div>
              </div>

              {/* Danh sách sản phẩm trong đơn */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Danh sách sản phẩm
                </h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {(selectedOrder.items || selectedOrder.products || []).map(
                    (item, idx) => (
                      <div key={idx} className="p-3 flex items-center gap-4">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {item.title || item.product_name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.version_name && `Phân loại: ${item.version_name}`}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Số lượng: x{item.quantity}
                          </p>
                        </div>
                        <div className="text-right font-bold text-sm text-slate-900">
                          {formatMoney(item.price * item.quantity)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Tổng thanh toán */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-700">Tổng cộng thanh toán:</span>
                <span className="text-xl font-black text-sky-600">
                  {formatMoney(selectedOrder.total_amount || selectedOrder.total_price)}
                </span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}