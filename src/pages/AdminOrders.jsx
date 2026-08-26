import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import {
  Plus,
  Search,
  ShoppingCart,
  Eye,
  Printer,
  X,
  Loader2,
  User,
  Phone,
  MapPin,
  Package,
  Minus,
  Trash2,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Truck,
  Ban,
  CircleCheck,
  AlertCircle
} from 'lucide-react';

export default function AdminOrders() {
  const API_URL = import.meta.env.VITE_API_URL;

  // SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ORDERS
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState('');

  // SEARCH & FILTER
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // CREATE MODAL
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // DETAIL MODAL
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // STATUS UPDATE
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // DATA SELECT LISTS
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // SEARCH DROPDOWNS IN MODAL
  const [productSearch, setProductSearch] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);

  // SELECTED ITEM FORM STATE
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState('');

  // FORM OBJECT
  const emptyOrderForm = {
    user_id: '',
    customer_name: '',
    phone: '',
    address: '',
    note: '',
    items: []
  };
  const [orderForm, setOrderForm] = useState(emptyOrderForm);

  // CONSTANTS
  const statuses = [
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'SHIPPING', label: 'Đang giao' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' }
  ];

  const categoryLabel = {
    album: 'Album',
    photocard: 'Photocard',
    md_event: 'MD / Event',
    lightstick: 'Lightstick'
  };

  // FORMATTERS
  const formatMoney = (value) => {
    const number = Number(value || 0);
    return number.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('vi-VN');
  };

  const getStatusLabel = (status) => {
    const item = statuses.find((item) => item.value === status);
    return item?.label || status || '--';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const StatusIcon = ({ status }) => {
    if (status === 'PENDING') return <Clock3 className="w-4 h-4" />;
    if (status === 'CONFIRMED') return <CheckCircle2 className="w-4 h-4" />;
    if (status === 'SHIPPING') return <Truck className="w-4 h-4" />;
    if (status === 'COMPLETED') return <CircleCheck className="w-4 h-4" />;
    if (status === 'CANCELLED') return <Ban className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  // FETCH APIS
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrderError('');
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
    } catch (error) {
      console.error('Lỗi lấy đơn hàng:', error);
      setOrderError(
        error.response?.data?.message || 'Không thể lấy danh sách đơn hàng!'
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await axios.get(`${API_URL}/orders/products`);
      setProducts(Array.isArray(res.data?.products) ? res.data.products : []);
    } catch (error) {
      console.error('Lỗi lấy sản phẩm:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await axios.get(`${API_URL}/orders/customers`);
      setCustomers(Array.isArray(res.data?.customers) ? res.data.customers : []);
    } catch (error) {
      console.error('Lỗi lấy khách hàng:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
  }, []);

  // FILTERS
  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        String(order.id || '').toLowerCase().includes(keyword) ||
        String(order.customer_name || '').toLowerCase().includes(keyword) ||
        String(order.user_name || '').toLowerCase().includes(keyword) ||
        String(order.phone || '').toLowerCase().includes(keyword);

      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();
    if (!keyword) return [];
    return products
      .filter((product) => {
        const title = String(product.title || '').toLowerCase();
        const version = String(product.version_name || '').toLowerCase();
        const album = String(product.album_name || '').toLowerCase();
        const group = String(product.group_name || '').toLowerCase();
        return (
          title.includes(keyword) ||
          version.includes(keyword) ||
          album.includes(keyword) ||
          group.includes(keyword)
        );
      })
      .slice(0, 10);
  }, [products, productSearch]);

  const filteredCustomers = useMemo(() => {
    const keyword = customerSearch.trim().toLowerCase();
    if (!keyword) return [];
    return customers
      .filter((customer) => {
        const name = String(customer.name || '').toLowerCase();
        const phone = String(customer.phone || '').toLowerCase();
        const email = String(customer.email || '').toLowerCase();
        return (
          name.includes(keyword) ||
          phone.includes(keyword) ||
          email.includes(keyword)
        );
      })
      .slice(0, 10);
  }, [customers, customerSearch]);

  // FORM HANDLERS
  const resetCreateForm = () => {
    setOrderForm(emptyOrderForm);
    setProductSearch('');
    setCustomerSearch('');
    setShowProductList(false);
    setShowCustomerList(false);
    setSelectedProduct(null);
    setSelectedQuantity(1);
    setSelectedPrice('');
  };

  const openCreateModal = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (creating) return;
    setShowCreateModal(false);
    resetCreateForm();
  };

  const handleSelectCustomer = (customer) => {
    setOrderForm((prev) => ({
      ...prev,
      user_id: customer.id,
      customer_name: customer.name || '',
      phone: customer.phone || ''
    }));
    setCustomerSearch(customer.phone || customer.name || '');
    setShowCustomerList(false);
  };

  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);
    setShowCustomerList(value.trim().length > 0);
    if (!value.trim()) {
      setOrderForm((prev) => ({
        ...prev,
        user_id: '',
        customer_name: '',
        phone: ''
      }));
    }
  };

  const handleCustomerNameChange = (value) => {
    setOrderForm((prev) => ({ ...prev, customer_name: value }));
  };

  const handlePhoneChange = (value) => {
    setOrderForm((prev) => ({ ...prev, phone: value }));
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSelectedPrice(product.price ?? '');
    setSelectedQuantity(1);
    setProductSearch(product.title || '');
    setShowProductList(false);
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      alert('Vui lòng chọn sản phẩm!');
      return;
    }
    const price = Number(selectedPrice);
    const quantity = Number(selectedQuantity);

    if (!Number.isFinite(price) || price < 0) {
      alert('Giá bán không hợp lệ!');
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert('Số lượng không hợp lệ!');
      return;
    }

    const existingIndex = orderForm.items.findIndex(
      (item) => Number(item.product_id) === Number(selectedProduct.id)
    );

    if (existingIndex >= 0) {
      const newItems = [...orderForm.items];
      const existing = newItems[existingIndex];
      newItems[existingIndex] = {
        ...existing,
        quantity: Number(existing.quantity) + quantity,
        price
      };
      setOrderForm((prev) => ({ ...prev, items: newItems }));
    } else {
      const newItem = {
        product_id: selectedProduct.id,
        title: selectedProduct.title,
        version_name: selectedProduct.version_name,
        album_name: selectedProduct.album_name,
        category: selectedProduct.category,
        image_url: selectedProduct.image_url,
        price,
        quantity
      };
      setOrderForm((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    }

    setSelectedProduct(null);
    setSelectedQuantity(1);
    setSelectedPrice('');
    setProductSearch('');
    setShowProductList(false);
  };

  const removeOrderItem = (index) => {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const changeItemQuantity = (index, amount) => {
    setOrderForm((prev) => {
      const items = [...prev.items];
      const current = Number(items[index].quantity || 0);
      const next = current + amount;
      if (next <= 0) {
        return {
          ...prev,
          items: items.filter((_, itemIndex) => itemIndex !== index)
        };
      }
      items[index] = { ...items[index], quantity: next };
      return { ...prev, items };
    });
  };

  const changeItemPrice = (index, value) => {
    setOrderForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], price: value };
      return { ...prev, items };
    });
  };

  const orderTotal = useMemo(() => {
    return orderForm.items.reduce((total, item) => {
      return total + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  }, [orderForm.items]);

  // ACTIONS
  const handleCreateOrder = async (event) => {
    event.preventDefault();

    if (!orderForm.customer_name.trim()) {
      alert('Vui lòng nhập tên khách hàng!');
      return;
    }

    if (!orderForm.phone.trim()) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    if (orderForm.items.length === 0) {
      alert('Đơn hàng phải có ít nhất 1 sản phẩm!');
      return;
    }

    for (const item of orderForm.items) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        alert('Có sản phẩm có số lượng không hợp lệ!');
        return;
      }

      if (!Number.isFinite(price) || price < 0) {
        alert('Có sản phẩm có giá bán không hợp lệ!');
        return;
      }
    }

    try {
      setCreating(true);

      const payload = {
        user_id: orderForm.user_id || null,
        customer_name: orderForm.customer_name.trim(),
        phone: orderForm.phone.trim(),
        address: orderForm.address.trim(),
        note: orderForm.note.trim(),
        items: orderForm.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      };

      const res = await axios.post(`${API_URL}/orders`, payload);
      const createdOrder = res.data?.order;

      alert(res.data?.message || 'Tạo đơn hàng thành công!');
      setShowCreateModal(false);
      resetCreateForm();
      await fetchOrders();

      if (createdOrder?.id) {
        const shouldPrint = window.confirm(
          'Đã tạo đơn hàng. Bạn có muốn in bill ngay không?'
        );
        if (shouldPrint) {
          await handlePrintOrder(createdOrder.id);
        }
      }
    } catch (error) {
      console.error('Lỗi tạo đơn hàng:', error);
      alert(error.response?.data?.message || 'Không thể tạo đơn hàng!');
    } finally {
      setCreating(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      setLoadingDetail(true);
      setSelectedOrder(null);
      setShowDetailModal(true);
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setSelectedOrder(res.data?.order || null);
    } catch (error) {
      console.error('Lỗi lấy chi tiết đơn:', error);
      alert(error.response?.data?.message || 'Không thể lấy chi tiết đơn hàng!');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    if (!status) return;

    try {
      setUpdatingStatus(true);
      const res = await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status
      });

      alert(res.data?.message || 'Cập nhật trạng thái thành công!');
      await fetchOrders();

      if (selectedOrder && Number(selectedOrder.id) === Number(orderId)) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái!');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrintOrder = async (orderId) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      const order = res.data?.order;
      if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
      }
      printBill(order);
    } catch (error) {
      console.error('Lỗi lấy đơn để in:', error);
      alert(error.response?.data?.message || 'Không thể in hóa đơn!');
    }
  };

  const printBill = (order) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup.');
      return;
    }

    const items = Array.isArray(order.items) ? order.items : [];

    const rows = items
      .map((item) => {
        const itemTotal = Number(item.price || 0) * Number(item.quantity || 0);
        const productName = item.product_title || item.title || 'Sản phẩm';
        const version = item.version_name ? ` - ${item.version_name}` : '';

        return `
          <tr>
            <td>
              <div class="product-name">${escapeHtml(productName)}</div>
              ${version ? `<div class="version">${escapeHtml(version)}</div>` : ''}
            </td>
            <td class="center">${Number(item.quantity || 0)}</td>
            <td class="right">${formatMoney(item.price)}</td>
            <td class="right">${formatMoney(itemTotal)}</td>
          </tr>
        `;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Hóa đơn #${order.id}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 32px; font-family: Arial, Helvetica, sans-serif; color: #111827; background: white; }
          .bill { max-width: 760px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 28px; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; }
          .header h2 { margin: 8px 0; font-size: 18px; }
          .header p { margin: 5px 0; color: #6b7280; font-size: 13px; }
          .customer { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 24px; }
          .customer p { margin: 7px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 12px 8px; font-size: 13px; }
          th { background: #f8fafc; font-weight: 700; text-align: left; }
          .center { text-align: center; }
          .right { text-align: right; }
          .product-name { font-weight: 700; }
          .version { margin-top: 3px; color: #6b7280; font-size: 11px; }
          .total { margin-top: 20px; padding-top: 16px; border-top: 2px solid #111827; display: flex; justify-content: flex-end; gap: 20px; font-size: 20px; font-weight: 800; }
          .footer { margin-top: 42px; text-align: center; color: #6b7280; font-size: 12px; }
          @media print { body { padding: 0; } .bill { max-width: none; } }
        </style>
      </head>
      <body>
        <div class="bill">
          <div class="header">
            <h1>CHIP CHIP HOUSE</h1>
            <h2>HÓA ĐƠN BÁN HÀNG</h2>
            <p>Mã đơn: #${order.id}</p>
            <p>${formatDate(order.created_at)}</p>
          </div>
          <div class="customer">
            <p><strong>Khách hàng:</strong> ${escapeHtml(order.customer_name || order.user_name || '--')}</p>
            <p><strong>SĐT:</strong> ${escapeHtml(order.phone || '--')}</p>
            <p><strong>Địa chỉ:</strong> ${escapeHtml(order.address || '--')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style="text-align:center; width:70px;">SL</th>
                <th style="text-align:right; width:120px;">Đơn giá</th>
                <th style="text-align:right; width:140px;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="total">
            <span>TỔNG CỘNG</span>
            <span>${formatMoney(order.total_amount)}</span>
          </div>
          <div class="footer">Cảm ơn quý khách đã mua hàng tại CHIP CHIP HOUSE 💗</div>
        </div>
        <script>window.onload = function () { window.print(); };</script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const escapeHtml = (value) => {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="flex-1 min-w-0 lg:ml-64">
        {/* TOP BAR */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Quản lý đơn hàng
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Quản lý đơn hàng và hóa đơn
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-sm shadow-sm hover:bg-sky-600 active:scale-[0.98] transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo đơn hàng</span>
              <span className="sm:hidden">Tạo đơn</span>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-5">
          {orderError && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{orderError}</span>
              </div>
              <button
                type="button"
                onClick={fetchOrders}
                className="inline-flex items-center gap-1.5 font-bold hover:underline"
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
            </div>
          )}

          {/* FILTER BAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm mã đơn, tên khách hoặc SĐT..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white outline-none text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div className="relative sm:w-56">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full h-11 px-4 pr-10 rounded-xl border border-slate-200 bg-white outline-none text-sm font-medium focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="">Tất cả trạng thái</option>
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={fetchOrders}
                disabled={loadingOrders}
                className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900">Danh sách đơn hàng</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {filteredOrders.length} đơn hàng
                </p>
              </div>
            </div>

            {loadingOrders ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Đang tải đơn hàng...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-slate-700">Không có đơn hàng</p>
                <p className="text-sm mt-1">Chưa tìm thấy đơn hàng phù hợp.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5 font-bold">Mã đơn</th>
                      <th className="px-5 py-3.5 font-bold">Khách hàng</th>
                      <th className="px-5 py-3.5 font-bold">Tổng tiền</th>
                      <th className="px-5 py-3.5 font-bold">Trạng thái</th>
                      <th className="px-5 py-3.5 font-bold">Ngày tạo</th>
                      <th className="px-5 py-3.5 font-bold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <span className="font-black text-sky-600">
                            #{order.id}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate max-w-[220px]">
                                {order.customer_name ||
                                  order.user_name ||
                                  'Khách hàng'}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {order.phone || '--'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-black text-slate-900">
                            {formatMoney(order.total_amount)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold ${getStatusClass(
                              order.status
                            )}`}
                          >
                            <StatusIcon status={order.status} />
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewOrder(order.id)}
                              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 flex items-center justify-center transition"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintOrder(order.id)}
                              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-center transition"
                              title="In bill"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CREATE ORDER MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCreateModal();
          }}
        >
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Tạo đơn hàng
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Tạo bill bán hàng trực tiếp
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder}>
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-5">
                  {/* LEFT COLUMN */}
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-black text-slate-900 mb-3">
                        Thông tin khách hàng
                      </h3>
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
                          Tìm khách hàng
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => handleCustomerSearch(e.target.value)}
                            onFocus={() => {
                              if (customerSearch.trim()) setShowCustomerList(true);
                            }}
                            placeholder="Nhập tên hoặc số điện thoại..."
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                          />
                        </div>

                        {showCustomerList && (
                          <div className="absolute z-40 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                            {loadingCustomers ? (
                              <div className="p-4 flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang tải khách hàng...
                              </div>
                            ) : filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => (
                                <button
                                  key={customer.id}
                                  type="button"
                                  onClick={() => handleSelectCustomer(customer)}
                                  className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b border-slate-100 last:border-0"
                                >
                                  <p className="font-bold text-slate-800">
                                    {customer.name || 'Chưa có tên'}
                                  </p>
                                  <p className="text-sm text-sky-600 mt-1">
                                    {customer.phone || 'Chưa có SĐT'}
                                  </p>
                                  {customer.email && (
                                    <p className="text-xs text-slate-400 mt-0.5">
                                      {customer.email}
                                    </p>
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-sm text-slate-500">
                                Không tìm thấy khách hàng.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
                          Tên khách hàng *
                        </label>
                        <input
                          type="text"
                          value={orderForm.customer_name}
                          onChange={(e) => handleCustomerNameChange(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                        />
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
                          Số điện thoại *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={orderForm.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="0912345678"
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
                          Địa chỉ
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <textarea
                            value={orderForm.address}
                            onChange={(e) =>
                              setOrderForm((prev) => ({
                                ...prev,
                                address: e.target.value
                              }))
                            }
                            rows={3}
                            placeholder="Địa chỉ giao hàng..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none text-sm resize-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
                          Ghi chú
                        </label>
                        <textarea
                          value={orderForm.note}
                          onChange={(e) =>
                            setOrderForm((prev) => ({
                              ...prev,
                              note: e.target.value
                            }))
                          }
                          rows={2}
                          placeholder="Ghi chú đơn hàng..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm resize-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                      <h3 className="font-black text-slate-900 mb-3">
                        Thêm sản phẩm
                      </h3>
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
                          Tìm sản phẩm
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => {
                              setProductSearch(e.target.value);
                              setShowProductList(e.target.value.trim().length > 0);
                            }}
                            onFocus={() => {
                              if (productSearch.trim()) setShowProductList(true);
                            }}
                            placeholder="Nhập tên sản phẩm, album..."
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                          />
                        </div>

                        {showProductList && (
                          <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
                            {loadingProducts ? (
                              <div className="p-4 flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang tải sản phẩm...
                              </div>
                            ) : filteredProducts.length > 0 ? (
                              filteredProducts.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => handleSelectProduct(product)}
                                  className="w-full text-left p-3 hover:bg-sky-50 border-b border-slate-100 last:border-0"
                                >
                                  <div className="flex gap-3">
                                    {product.image_url ? (
                                      <img
                                        src={product.image_url}
                                        alt=""
                                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <Package className="w-5 h-5 text-slate-400" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold text-sm text-slate-800">
                                        {product.title}
                                      </p>
                                      {product.version_name && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          Version: {product.version_name}
                                        </p>
                                      )}
                                      {product.album_name && (
                                        <p className="text-xs text-slate-400 truncate">
                                          {product.album_name}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold text-sky-600">
                                          {formatMoney(product.price)}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                          {categoryLabel[product.category] ||
                                            product.category}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-sm text-slate-500">
                                Không tìm thấy sản phẩm.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {selectedProduct && (
                        <div className="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-100">
                          <div className="flex items-center gap-3">
                            {selectedProduct.image_url ? (
                              <img
                                src={selectedProduct.image_url}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-slate-800 truncate">
                                {selectedProduct.title}
                              </p>
                              {selectedProduct.version_name && (
                                <p className="text-xs text-slate-500">
                                  {selectedProduct.version_name}
                                </p>
                              )}
                              <p className="text-xs text-slate-500">
                                Giá niêm yết:{' '}
                                <strong>
                                  {formatMoney(selectedProduct.price)}
                                </strong>
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                                Giá bán
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={selectedPrice}
                                onChange={(e) => setSelectedPrice(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white outline-none text-sm font-bold focus:border-sky-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                                Số lượng
                              </label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={selectedQuantity}
                                onChange={(e) =>
                                  setSelectedQuantity(e.target.value)
                                }
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white outline-none text-sm font-bold focus:border-sky-400"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddProduct}
                            className="w-full mt-3 h-10 rounded-lg bg-sky-500 text-white font-bold text-sm hover:bg-sky-600 transition"
                          >
                            Thêm vào bill
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN - BILL */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 flex flex-col min-h-[450px]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black text-slate-900">BILL</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {orderForm.items.length} sản phẩm
                        </p>
                      </div>
                      {orderForm.items.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setOrderForm((prev) => ({ ...prev, items: [] }))
                          }
                          className="text-xs font-bold text-red-500 hover:underline"
                        >
                          Xóa tất cả
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                      {orderForm.items.length === 0 ? (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-slate-400">
                          <ShoppingCart className="w-12 h-12 mb-3 text-slate-300" />
                          <p className="font-bold text-slate-500">Bill đang trống</p>
                          <p className="text-xs mt-1 max-w-[220px]">
                            Tìm sản phẩm ở bên trái để thêm vào bill.
                          </p>
                        </div>
                      ) : (
                        orderForm.items.map((item, index) => {
                          const lineTotal =
                            Number(item.price || 0) * Number(item.quantity || 0);
                          return (
                            <div
                              key={`${item.product_id}-${index}`}
                              className="bg-white rounded-xl border border-slate-200 p-3"
                            >
                              <div className="flex gap-3">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt=""
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-slate-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-800">
                                        {item.title}
                                      </p>
                                      {item.version_name && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          {item.version_name}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeOrderItem(index)}
                                      className="w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center flex-shrink-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="mt-3 grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                        Đơn giá
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={item.price}
                                        onChange={(e) =>
                                          changeItemPrice(index, e.target.value)
                                        }
                                        className="w-full h-9 px-2 rounded-lg border border-slate-200 text-sm font-bold outline-none focus:border-sky-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                        Số lượng
                                      </label>
                                      <div className="h-9 flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            changeItemQuantity(index, -1)
                                          }
                                          className="w-9 h-full flex items-center justify-center hover:bg-slate-50"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="flex-1 text-center text-sm font-bold">
                                          {item.quantity}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            changeItemQuantity(index, 1)
                                          }
                                          className="w-9 h-full flex items-center justify-center hover:bg-slate-50"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-slate-400">
                                      Thành tiền
                                    </span>
                                    <span className="font-black text-slate-900">
                                      {formatMoney(lineTotal)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t border-slate-200 mt-4 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500">
                          Tổng cộng
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-sky-600">
                          {formatMoney(orderTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    disabled={creating}
                    className="h-11 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating || orderForm.items.length === 0}
                    className="h-11 px-5 rounded-xl bg-sky-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Tạo đơn hàng
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowDetailModal(false);
          }}
        >
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Chi tiết đơn hàng
                  </h2>
                  {selectedOrder && (
                    <p className="text-sm text-slate-500 mt-1">
                      Đơn #{selectedOrder.id}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingDetail ? (
                <div className="py-20 flex items-center justify-center text-slate-500">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
              ) : selectedOrder ? (
                <div className="p-5 sm:p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-bold uppercase">
                        Khách hàng
                      </p>
                      <p className="mt-1 font-black text-slate-800">
                        {selectedOrder.customer_name ||
                          selectedOrder.user_name ||
                          '--'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-bold uppercase">
                        Số điện thoại
                      </p>
                      <p className="mt-1 font-black text-slate-800">
                        {selectedOrder.phone || '--'}
                      </p>
                    </div>

                    <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 font-bold uppercase">
                        Địa chỉ
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedOrder.address || 'Không có địa chỉ'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">
                        Trạng thái
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusClass(
                          selectedOrder.status
                        )}`}
                      >
                        <StatusIcon status={selectedOrder.status} />
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedOrder.status || ''}
                        onChange={(e) =>
                          handleUpdateStatus(selectedOrder.id, e.target.value)
                        }
                        disabled={updatingStatus}
                        className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-bold outline-none"
                      >
                        {statuses.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      {updatingStatus && (
                        <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 mb-3">Sản phẩm</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      {(selectedOrder.items || []).map((item, index) => {
                        const lineTotal =
                          Number(item.price || 0) * Number(item.quantity || 0);
                        return (
                          <div
                            key={index}
                            className="p-3 sm:p-4 flex gap-3 border-b border-slate-100 last:border-0"
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt=""
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-slate-800">
                                {item.product_title || item.title || 'Sản phẩm'}
                              </p>
                              {item.version_name && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {item.version_name}
                                </p>
                              )}
                              <p className="text-xs text-slate-500 mt-2">
                                {item.quantity} × {formatMoney(item.price)}
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <p className="font-black text-slate-900">
                                {formatMoney(lineTotal)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-500">Tổng cộng</span>
                    <span className="text-2xl font-black text-sky-600">
                      {formatMoney(selectedOrder.total_amount)}
                    </span>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDetailModal(false)}
                      className="h-11 px-5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintOrder(selectedOrder.id)}
                      className="h-11 px-5 rounded-xl bg-slate-900 text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-slate-800"
                    >
                      <Printer className="w-4 h-4" />
                      In bill
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500">
                  Không có dữ liệu đơn hàng.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}