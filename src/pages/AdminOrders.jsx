import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import {
  ShoppingBag,
  Search,
  Eye,
  Plus,
  X,
  Loader2,
  Trash2,
  UserCheck
} from 'lucide-react';

export default function AdminOrders() {
  const API_URL = import.meta.env.VITE_API_URL;

  // =========================================================
  // STATE CHÍNH
  // =========================================================
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal Xem chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modal Tạo đơn hàng mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Form tạo đơn hàng mới (Đã bỏ email)
  const [createForm, setCreateForm] = useState({
    customer_name: '',
    customer_phone: '',
    shipping_address: '',
    payment_method: 'COD',
    items: [] // { product_id, title, price, quantity }
  });

  // State hỗ trợ tìm kiếm khách hàng bằng SĐT
  const [phoneSearch, setPhoneSearch] = useState('');
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);

  // State hỗ trợ tìm kiếm sản phẩm bằng Text
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  // =========================================================
  // GỌI API FETCH DỮ LIỆU
  // =========================================================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data.orders || res.data.data || res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsForOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setAvailableProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách sản phẩm:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================================================
  // UTILS & FORMATTING
  // =========================================================
  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (val) => {
    if (!val) return '—';
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return date.toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">Hoàn thành</span>;
      case 'PAID':
      case 'CONFIRMED':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">Đã xác nhận / Thanh toán</span>;
      case 'SHIPPING':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700">Đang giao hàng</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">Đã hủy</span>;
      case 'PENDING':
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700">Chờ xử lý</span>;
    }
  };

  // Lọc danh sách đơn hàng cho bảng chính
  const filteredOrders = orders.filter((order) => {
    const keyword = search.trim().toLowerCase();
    const matchSearch =
      !keyword ||
      String(order.id).toLowerCase().includes(keyword) ||
      order.customer_name?.toLowerCase().includes(keyword) ||
      order.customer_phone?.includes(keyword);

    const matchStatus =
      !statusFilter || String(order.status).toUpperCase() === statusFilter.toUpperCase();

    return matchSearch && matchStatus;
  });

  // Trích xuất danh sách Khách hàng độc nhất từ danh sách đơn hàng cũ để gợi ý khi gõ SĐT
  const uniqueCustomers = Array.from(
    new Map(
      orders
        .filter((o) => o.customer_phone)
        .map((o) => [
          o.customer_phone,
          {
            phone: o.customer_phone,
            name: o.customer_name || '',
            address: o.shipping_address || ''
          }
        ])
    ).values()
  );

  const filteredCustomerSuggestions = uniqueCustomers.filter((c) =>
    c.phone.includes(phoneSearch.trim())
  );

  // Lọc gợi ý sản phẩm khi nhập Text tìm tên sản phẩm
  const filteredProductSuggestions = availableProducts.filter((p) =>
    p.title?.toLowerCase().includes(productSearch.trim().toLowerCase())
  );

  // =========================================================
  // XỬ LÝ CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
  // =========================================================
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
      alert('Cập nhật trạng thái thành công!');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      await fetchOrders();
    } catch (err) {
      console.error('Lỗi cập nhật đơn hàng:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng!');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================================================
  // XỬ LÝ MỞ MODAL & TẠO ĐƠN HÀNG
  // =========================================================
  const handleOpenCreateModal = async () => {
    setCreateForm({
      customer_name: '',
      customer_phone: '',
      shipping_address: '',
      payment_method: 'COD',
      items: []
    });
    setPhoneSearch('');
    setProductSearch('');
    setSelectedProduct(null);
    setSelectedQty(1);
    setShowCreateModal(true);

    if (availableProducts.length === 0) {
      await fetchProductsForOrder();
    }
  };

  // Tự động điền Tên & Địa chỉ khi chọn gợi ý SĐT
  const handleSelectCustomer = (customer) => {
    setCreateForm({
      ...createForm,
      customer_phone: customer.phone,
      customer_name: customer.name,
      shipping_address: customer.address || createForm.shipping_address
    });
    setPhoneSearch(customer.phone);
    setShowPhoneSuggestions(false);
  };

  // Thêm sản phẩm tìm được vào bảng tạm
  const handleAddItemToOrder = () => {
    if (!selectedProduct) {
      alert('Vui lòng chọn sản phẩm từ danh sách gợi ý!');
      return;
    }

    const existingIndex = createForm.items.findIndex(
      (item) => String(item.product_id) === String(selectedProduct.id)
    );

    if (existingIndex > -1) {
      const updatedItems = [...createForm.items];
      updatedItems[existingIndex].quantity += Number(selectedQty);
      setCreateForm({ ...createForm, items: updatedItems });
    } else {
      setCreateForm({
        ...createForm,
        items: [
          ...createForm.items,
          {
            product_id: selectedProduct.id,
            title: selectedProduct.title,
            price: Number(selectedProduct.price || 0),
            quantity: Number(selectedQty)
          }
        ]
      });
    }

    // Reset ô nhập sản phẩm
    setProductSearch('');
    setSelectedProduct(null);
    setSelectedQty(1);
  };

  // Sửa trực tiếp số lượng hoặc giá tiền ngay trong danh sách
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...createForm.items];
    const numValue = Math.max(0, Number(value) || 0);
    updatedItems[index][field] = numValue;
    setCreateForm({ ...createForm, items: updatedItems });
  };

  const handleRemoveItemFromOrder = (index) => {
    const updatedItems = createForm.items.filter((_, i) => i !== index);
    setCreateForm({ ...createForm, items: updatedItems });
  };

  const calculateTotalOrderAmount = () => {
    return createForm.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();

    if (!createForm.customer_phone.trim()) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }
    if (!createForm.customer_name.trim()) {
      alert('Vui lòng nhập tên khách hàng!');
      return;
    }
    if (createForm.items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm vào đơn hàng!');
      return;
    }

    try {
      setCreating(true);

      // Chuẩn hóa dữ liệu gửi lên Backend (khớp với req.body của Backend)
      const payload = {
        customer_name: createForm.customer_name,
        phone: createForm.customer_phone, // <--- ĐÃ SỬA: Đổi customer_phone thành phone
        address: createForm.shipping_address || "Tại cửa hàng",
        payment_method: createForm.payment_method || "COD",
        items: createForm.items.map(item => ({
          product_id: item.product_id,
          price: Number(item.price),
          quantity: Number(item.quantity)
        }))
      };

      await axios.post(`${API_URL}/orders`, payload);
      alert('Tạo đơn hàng thành công!');
      setShowCreateModal(false);
      await fetchOrders();
    } catch (err) {
      console.error('Lỗi tạo đơn hàng chi tiết:', err.response?.data || err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      alert(backendMessage ? `Lỗi: ${backendMessage}` : 'Không thể tạo đơn hàng! Vui lòng kiểm tra lại thông tin.');
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // RENDER GIAO DIỆN
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-100 flex">
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
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                Quản lý Đơn hàng
              </h1>
              <p className="hidden sm:block text-xs text-slate-500">
                Theo dõi và xử lý đơn hàng của khách hàng
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo đơn hàng mới</span>
          </button>
        </header>

        {/* MAIN BODY */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* TOOLBAR */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900">Danh sách đơn hàng</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tổng số: {filteredOrders.length} đơn hàng
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="SHIPPING">Đang giao</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Mã đơn, Tên KH, SĐT..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* TABLE BẢNG ĐƠN HÀNG */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-3" />
                <p className="text-sm text-slate-500">Đang tải đơn hàng...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600">Không tìm thấy đơn hàng nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">Mã Đơn</th>
                      <th className="px-6 py-4">Khách hàng</th>
                      <th className="px-6 py-4">Tổng tiền</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4">Ngày đặt</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-bold text-sky-600">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{order.customer_name || 'Khách vãng lai'}</p>
                          <p className="text-xs text-slate-400">{order.customer_phone || '—'}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatMoney(order.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDate(order.created_at || order.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition text-xs font-bold"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Chi tiết</span>
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

      {/* ========================================================= */}
      {/* MODAL 1: XEM CHI TIẾT & CẬP NHẬT TRẠNG THÁI */}
      {/* ========================================================= */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>
                <p className="text-xs text-slate-500">
                  Đặt lúc: {formatDate(selectedOrder.created_at || selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Thông tin khách hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Khách hàng</p>
                  <p className="font-bold text-slate-900 mt-1">{selectedOrder.customer_name}</p>
                  <p className="text-slate-600">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Địa chỉ giao hàng</p>
                  <p className="text-slate-700 mt-1">{selectedOrder.shipping_address || 'Không có thông tin'}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-2">Thanh toán</p>
                  <p className="text-slate-700 font-semibold">{selectedOrder.payment_method || 'COD'}</p>
                </div>
              </div>

              {/* Danh sách sản phẩm trong đơn */}
              <div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm">Sản phẩm đặt mua</h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {(selectedOrder.items || selectedOrder.OrderItems || []).map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-slate-800">{item.title || item.product_title || `Sản phẩm #${item.product_id}`}</p>
                        <p className="text-xs text-slate-400">
                          {formatMoney(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-slate-900">
                        {formatMoney((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Tổng cộng:</span>
                  <span className="font-black text-lg text-sky-600">{formatMoney(selectedOrder.total_amount)}</span>
                </div>
              </div>

              {/* Thay đổi trạng thái */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Cập nhật trạng thái đơn hàng
                </label>
                <div className="flex flex-wrap gap-2">
                  {['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                        String(selectedOrder.status).toUpperCase() === st
                          ? 'bg-slate-900 text-white shadow'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: TẠO ĐƠN HÀNG MỚI (ĐÃ CẬP NHẬT THEO YÊU CẦU) */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50">
              <div>
                <h2 className="text-lg font-black text-slate-900">Tạo đơn hàng mới</h2>
                <p className="text-xs text-slate-500">Nhập SĐT để tự điền tên hoặc nhập mới thủ công</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* THÔNG TIN KHÁCH HÀNG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Nhập Số điện thoại (kèm gợi ý & tên) */}
                <div className="relative">
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.customer_phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreateForm({ ...createForm, customer_phone: val });
                      setPhoneSearch(val);
                      setShowPhoneSuggestions(true);
                    }}
                    onFocus={() => setShowPhoneSuggestions(true)}
                    placeholder="Nhập số điện thoại..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                  />

                  {/* Dropdown Gợi ý SĐT + Tên */}
                  {showPhoneSuggestions && phoneSearch.trim() && filteredCustomerSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredCustomerSuggestions.map((c, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectCustomer(c)}
                          className="p-2.5 hover:bg-sky-50 cursor-pointer border-b border-slate-100 last:border-b-0 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-sm text-slate-900">{c.phone}</p>
                            <p className="text-xs text-slate-500">{c.name || 'Chưa tên'}</p>
                          </div>
                          <UserCheck className="w-4 h-4 text-sky-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Tên khách hàng (Tự điền khi chọn SĐT hoặc sửa tay) */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.customer_name}
                    onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
                    placeholder="Tên khách hàng"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Địa chỉ giao hàng
                </label>
                <input
                  type="text"
                  value={createForm.shipping_address}
                  onChange={(e) => setCreateForm({ ...createForm, shipping_address: e.target.value })}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                />
              </div>

              {/* CHỌN SẢN PHẨM BẰNG TEXT INPUT (KHÔNG DÙNG DROPDOWN) */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Thêm sản phẩm (Nhập tên để tìm kiếm)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setSelectedProduct(null);
                        setShowProductSuggestions(true);
                      }}
                      onFocus={() => setShowProductSuggestions(true)}
                      placeholder="Gõ tên sản phẩm cần tìm..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                    />

                    {/* Gợi ý danh sách sản phẩm khi gõ text */}
                    {showProductSuggestions && productSearch.trim() && filteredProductSuggestions.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                        {filteredProductSuggestions.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedProduct(p);
                              setProductSearch(p.title);
                              setShowProductSuggestions(false);
                            }}
                            className="p-2.5 hover:bg-sky-50 cursor-pointer border-b border-slate-100 last:border-b-0 flex justify-between items-center text-sm"
                          >
                            <span className="font-medium text-slate-800">{p.title}</span>
                            <span className="font-bold text-sky-600">{formatMoney(p.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(e.target.value)}
                      className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddItemToOrder}
                      className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition whitespace-nowrap"
                    >
                      Thêm vào đơn
                    </button>
                  </div>
                </div>
              </div>

              {/* BẢNG DANH SÁCH SẢN PHẨM TRONG ĐƠN (CHO PHÉP SỬA GIÁ & SL TRỰC TIẾP) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-3">Sản phẩm</th>
                      <th className="p-3 w-32">Đơn giá (₫)</th>
                      <th className="p-3 w-24 text-center">SL</th>
                      <th className="p-3">Thành tiền</th>
                      <th className="p-3 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {createForm.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-slate-900">{item.title}</td>
                        {/* Ô chỉnh sửa giá trực tiếp */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                          />
                        </td>
                        {/* Ô chỉnh sửa số lượng trực tiếp */}
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                          />
                        </td>
                        <td className="p-3 font-bold text-sky-600">
                          {formatMoney(item.price * item.quantity)}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromOrder(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {createForm.items.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-xs text-slate-400">
                          Chưa có sản phẩm nào được chọn
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TỔNG TIỀN ĐƠN HÀNG */}
              <div className="flex justify-between items-center bg-sky-50 p-4 rounded-xl">
                <span className="font-bold text-slate-900">Tổng tiền đơn hàng:</span>
                <span className="font-black text-xl text-sky-600">
                  {formatMoney(calculateTotalOrderAmount())}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tạo đơn hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}