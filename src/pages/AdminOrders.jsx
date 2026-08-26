import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

import {
  Plus,
  Search,
  ShoppingBag,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Printer,
  ChevronDown,
  Minus,
  User,
  Phone,
  MapPin,
  Package,
  AlertCircle
} from 'lucide-react';

export default function AdminOrders() {
  const API_URL = import.meta.env.VITE_API_URL;

  // =========================================================
  // SIDEBAR
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================================================
  // ORDERS
  // =========================================================

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState('');

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // =========================================================
  // CREATE ORDER
  // =========================================================

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // =========================================================
  // VIEW ORDER
  // =========================================================

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const [updatingStatus, setUpdatingStatus] = useState(false);

  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // =========================================================
  // PRODUCT SEARCH
  // =========================================================

  const [productSearch, setProductSearch] = useState('');

  // =========================================================
  // CUSTOMER SEARCH
  // =========================================================

  const [customerSearch, setCustomerSearch] = useState('');

  // =========================================================
  // CREATE FORM
  // =========================================================

  const emptyOrderForm = {
    user_id: '',
    customer_name: '',
    phone: '',
    address: '',
    note: '',
    items: []
  };

  const [orderForm, setOrderForm] = useState(emptyOrderForm);

  // =========================================================
  // PRODUCT SELECTED
  // =========================================================

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState('');

  // =========================================================
  // STATUS
  // =========================================================

  const statuses = [
    {
      value: '',
      label: 'Tất cả trạng thái'
    },
    {
      value: 'PENDING',
      label: 'Chờ xử lý'
    },
    {
      value: 'CONFIRMED',
      label: 'Đã xác nhận'
    },
    {
      value: 'SHIPPING',
      label: 'Đang giao'
    },
    {
      value: 'COMPLETED',
      label: 'Hoàn thành'
    },
    {
      value: 'CANCELLED',
      label: 'Đã hủy'
    }
  ];

  // =========================================================
  // CATEGORY
  // =========================================================

  const categoryLabel = {
    album: 'Album',
    photocard: 'Photocard',
    md_event: 'MD / Event',
    lightstick: 'Lightstick'
  };

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrderError('');

      const res = await axios.get(
        `${API_URL}/orders`
      );

      setOrders(
        Array.isArray(res.data?.orders)
          ? res.data.orders
          : []
      );
    } catch (error) {
      console.error(
        'Lỗi lấy đơn hàng:',
        error
      );

      setOrderError(
        error.response?.data?.message ||
        'Không thể lấy danh sách đơn hàng!'
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const res = await axios.get(
        `${API_URL}/orders/products`
      );

      setProducts(
        Array.isArray(res.data?.products)
          ? res.data.products
          : []
      );
    } catch (error) {
      console.error(
        'Lỗi lấy sản phẩm:',
        error
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================================================
  // INITIAL LOAD PRODUCTS
  // =========================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // FILTER ORDERS
  //
  // QUAN TRỌNG:
  // KHÔNG GỌI API KHI NHẬP SEARCH
  // =========================================================

  const filteredOrders = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        String(order.id || '')
          .toLowerCase()
          .includes(keyword) ||
        String(order.customer_name || '')
          .toLowerCase()
          .includes(keyword) ||
        String(order.user_name || '')
          .toLowerCase()
          .includes(keyword) ||
        String(order.phone || '')
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        !statusFilter ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter
  ]);

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString(
      'vi-VN'
    ) + ' ₫';
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return '--';
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(
      'vi-VN'
    );
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    const item = statuses.find(
      (x) => x.value === status
    );

    return item?.label || status || '--';
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-600';

      case 'CONFIRMED':
        return 'bg-sky-50 text-sky-600';

      case 'SHIPPING':
        return 'bg-violet-50 text-violet-600';

      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-600';

      case 'CANCELLED':
        return 'bg-red-50 text-red-600';

      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  // =========================================================
  // RESET CREATE FORM
  // =========================================================

  const resetCreateForm = () => {
    setOrderForm(emptyOrderForm);

    setSelectedProduct(null);
    setSelectedQuantity(1);
    setSelectedPrice('');

    setProductSearch('');
    setCustomerSearch('');
  };

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };

  // =========================================================
  // CLOSE CREATE MODAL
  // =========================================================

  const closeCreateModal = () => {
    if (creating) {
      return;
    }

    setShowCreateModal(false);
    resetCreateForm();
  };

  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const addProductToOrder = () => {
    if (!selectedProduct) {
      alert('Vui lòng chọn sản phẩm!');
      return;
    }

    const quantity = Number(
      selectedQuantity
    );

    const price = Number(
      selectedPrice
    );

    if (
      !quantity ||
      quantity < 1
    ) {
      alert('Số lượng không hợp lệ!');
      return;
    }

    if (
      isNaN(price) ||
      price < 0
    ) {
      alert('Giá bán không hợp lệ!');
      return;
    }

    const existingIndex =
      orderForm.items.findIndex(
        (item) =>
          Number(item.product_id) ===
          Number(selectedProduct.id)
      );

    if (existingIndex >= 0) {
      const newItems = [
        ...orderForm.items
      ];

      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity:
          Number(
            newItems[existingIndex].quantity
          ) + quantity,
        price
      };

      setOrderForm({
        ...orderForm,
        items: newItems
      });
    } else {
      const newItem = {
        product_id:
          selectedProduct.id,

        title:
          selectedProduct.title,

        version_name:
          selectedProduct.version_name,

        image_url:
          selectedProduct.image_url,

        category:
          selectedProduct.category,

        price,

        quantity
      };

      setOrderForm({
        ...orderForm,
        items: [
          ...orderForm.items,
          newItem
        ]
      });
    }

    setSelectedProduct(null);
    setSelectedQuantity(1);
    setSelectedPrice('');
    setProductSearch('');
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeOrderItem = (index) => {
    const newItems =
      orderForm.items.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

    setOrderForm({
      ...orderForm,
      items: newItems
    });
  };

  // =========================================================
  // CHANGE QUANTITY
  // =========================================================

  const changeItemQuantity = (
    index,
    amount
  ) => {
    const newItems =
      [...orderForm.items];

    const current =
      Number(
        newItems[index].quantity
      );

    const next =
      current + amount;

    if (next <= 0) {
      removeOrderItem(index);
      return;
    }

    newItems[index] = {
      ...newItems[index],
      quantity: next
    };

    setOrderForm({
      ...orderForm,
      items: newItems
    });
  };

  // =========================================================
  // CHANGE ITEM PRICE
  // =========================================================

  const changeItemPrice = (
    index,
    value
  ) => {
    const newItems =
      [...orderForm.items];

    newItems[index] = {
      ...newItems[index],
      price: value
    };

    setOrderForm({
      ...orderForm,
      items: newItems
    });
  };

  // =========================================================
  // TOTAL
  // =========================================================

  const orderTotal = useMemo(() => {
    return orderForm.items.reduce(
      (total, item) => {
        return (
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0)
        );
      },
      0
    );
  }, [orderForm.items]);

  // =========================================================
  // PRODUCT SEARCH RESULT
  // =========================================================

  const filteredProducts =
    useMemo(() => {
      const keyword =
        productSearch
          .trim()
          .toLowerCase();

      if (!keyword) {
        return products.slice(0, 20);
      }

      return products
        .filter((product) => {
          const title =
            String(
              product.title || ''
            ).toLowerCase();

          const version =
            String(
              product.version_name || ''
            ).toLowerCase();

          const album =
            String(
              product.album_name || ''
            ).toLowerCase();

          return (
            title.includes(keyword) ||
            version.includes(keyword) ||
            album.includes(keyword)
          );
        })
        .slice(0, 20);
    }, [
      products,
      productSearch
    ]);

  // =========================================================
  // SELECT PRODUCT
  // =========================================================

  const handleSelectProduct = (
    product
  ) => {
    setSelectedProduct(product);

    setSelectedPrice(
      product.price || ''
    );

    setSelectedQuantity(1);
  };

  // =========================================================
  // CREATE ORDER
  // =========================================================

  const handleCreateOrder = async (
    e
  ) => {
    e.preventDefault();

    if (
      !orderForm.customer_name.trim()
    ) {
      alert(
        'Vui lòng nhập tên khách hàng!'
      );
      return;
    }

    if (
      !orderForm.phone.trim()
    ) {
      alert(
        'Vui lòng nhập số điện thoại!'
      );
      return;
    }

    if (
      orderForm.items.length === 0
    ) {
      alert(
        'Đơn hàng phải có ít nhất 1 sản phẩm!'
      );
      return;
    }

    try {
      setCreating(true);

      const payload = {
        user_id:
          orderForm.user_id || null,

        customer_name:
          orderForm.customer_name.trim(),

        phone:
          orderForm.phone.trim(),

        address:
          orderForm.address.trim(),

        note:
          orderForm.note.trim(),

        items:
          orderForm.items.map(
            (item) => ({
              product_id:
                item.product_id,

              quantity:
                Number(item.quantity),

              price:
                Number(item.price)
            })
          )
      };

      const res = await axios.post(
        `${API_URL}/orders`,
        payload
      );

      alert(
        res.data?.message ||
        'Tạo đơn hàng thành công!'
      );

      setShowCreateModal(false);
      resetCreateForm();

      await fetchOrders();
    } catch (error) {
      console.error(
        'Lỗi tạo đơn hàng:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Không thể tạo đơn hàng!'
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // VIEW ORDER DETAIL
  // =========================================================

  const handleViewOrder = async (
    orderId
  ) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true);
      setSelectedOrder(null);

      const res = await axios.get(
        `${API_URL}/orders/${orderId}`
      );

      setSelectedOrder(
        res.data?.order || null
      );
    } catch (error) {
      console.error(
        'Lỗi lấy chi tiết đơn:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Không thể lấy chi tiết đơn hàng!'
      );

      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleUpdateStatus = async (
    orderId,
    status
  ) => {
    if (!status) {
      return;
    }

    try {
      setUpdatingStatus(true);

      const res =
        await axios.put(
          `${API_URL}/orders/${orderId}/status`,
          {
            status
          }
        );

      alert(
        res.data?.message ||
        'Cập nhật trạng thái thành công!'
      );

      await fetchOrders();

      if (
        selectedOrder &&
        Number(selectedOrder.id) ===
          Number(orderId)
      ) {
        setSelectedOrder({
          ...selectedOrder,
          status
        });
      }
    } catch (error) {
      console.error(
        'Lỗi cập nhật trạng thái:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Không thể cập nhật trạng thái!'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================================================
  // PRINT BILL
  // =========================================================

  const handlePrintBill = (
    order
  ) => {
    if (!order) {
      return;
    }

    const items =
      order.items || [];

    const rows = items
      .map(
        (item) => `
          <tr>
            <td>
              ${item.title || '--'}
              ${
                item.version_name
                  ? `<br><small>${item.version_name}</small>`
                  : ''
              }
            </td>
            <td style="text-align:center">
              ${item.quantity || 0}
            </td>
            <td style="text-align:right">
              ${formatMoney(item.price)}
            </td>
            <td style="text-align:right">
              ${formatMoney(
                Number(item.price || 0) *
                  Number(item.quantity || 0)
              )}
            </td>
          </tr>
        `
      )
      .join('');

    const printWindow =
      window.open(
        '',
        '_blank',
        'width=900,height=700'
      );

    if (!printWindow) {
      alert(
        'Trình duyệt đã chặn cửa sổ in!'
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />

        <title>
          Hóa đơn #${order.id}
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              Arial,
              sans-serif;

            padding: 32px;
            color: #111827;
          }

          .bill {
            max-width: 760px;
            margin: 0 auto;
          }

          .header {
            text-align: center;
            margin-bottom: 24px;
          }

          .header h1 {
            margin: 0 0 8px;
            font-size: 24px;
          }

          .header p {
            margin: 4px 0;
            color: #6b7280;
          }

          .customer {
            border: 1px solid #e5e7eb;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }

          .customer p {
            margin: 7px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border-bottom: 1px solid #e5e7eb;
            padding: 12px 8px;
            font-size: 14px;
          }

          th {
            text-align: left;
            background: #f8fafc;
          }

          .total {
            margin-top: 20px;
            text-align: right;
            font-size: 20px;
            font-weight: bold;
          }

          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 13px;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        <div class="bill">

          <div class="header">
            <h1>CHIP CHIP HOUSE</h1>

            <p>HÓA ĐƠN BÁN HÀNG</p>

            <p>
              Mã đơn: #${order.id}
            </p>

            <p>
              ${formatDate(
                order.created_at
              )}
            </p>
          </div>

          <div class="customer">

            <p>
              <strong>
                Khách hàng:
              </strong>

              ${
                order.customer_name ||
                order.user_name ||
                '--'
              }
            </p>

            <p>
              <strong>
                SĐT:
              </strong>

              ${order.phone || '--'}
            </p>

            <p>
              <strong>
                Địa chỉ:
              </strong>

              ${order.address || '--'}
            </p>

          </div>

          <table>

            <thead>
              <tr>
                <th>
                  Sản phẩm
                </th>

                <th style="text-align:center">
                  SL
                </th>

                <th style="text-align:right">
                  Đơn giá
                </th>

                <th style="text-align:right">
                  Thành tiền
                </th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>

          </table>

          <div class="total">
            Tổng cộng:
            ${formatMoney(
              order.total_amount
            )}
          </div>

          <div class="footer">
            Cảm ơn quý khách đã mua hàng!
          </div>

        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>

      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingOrders) {
    return (
      <div className="min-h-screen bg-slate-100 flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 lg:ml-64 flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="w-9 h-9 animate-spin text-sky-500 mx-auto mb-3" />

            <p className="text-sm text-slate-500">
              Đang tải đơn hàng...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100 flex">

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 lg:ml-64 min-w-0">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="bg-white border-b border-slate-200">

          <div className="px-4 sm:px-6 lg:px-8 py-4">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Quản lý đơn hàng
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Tạo, quản lý và in hóa đơn bán hàng
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={fetchOrders}
                  className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50"
                  title="Làm mới"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition"
                >
                  <Plus className="w-4 h-4" />

                  Tạo đơn hàng
                </button>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-4 sm:p-6 lg:p-8">

          {/* ERROR */}

          {orderError && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-600">

              <AlertCircle className="w-5 h-5 shrink-0" />

              <span className="text-sm">
                {orderError}
              </span>

            </div>
          )}

          {/* FILTER */}

          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5">

            <div className="flex flex-col lg:flex-row gap-3">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Tìm theo mã đơn, tên khách hàng, SĐT..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                />

              </div>

              {/* STATUS */}

              <div className="relative">

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="w-full lg:w-52 h-11 appearance-none pl-4 pr-10 rounded-xl border border-slate-200 bg-white outline-none focus:border-sky-400 text-sm"
                >

                  {statuses.map(
                    (status) => (
                      <option
                        key={status.value}
                        value={
                          status.value
                        }
                      >
                        {status.label}
                      </option>
                    )
                  )}

                </select>

                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

              </div>

            </div>

          </div>

          {/* =================================================
              TABLE DESKTOP
          ================================================= */}

          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Đơn hàng
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Khách hàng
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Tổng tiền
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Trạng thái
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Ngày tạo
                    </th>

                    <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Thao tác
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredOrders.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 transition"
                      >

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              handleViewOrder(
                                order.id
                              )
                            }
                            className="font-bold text-sky-600 hover:text-sky-700"
                          >
                            #{order.id}
                          </button>

                        </td>

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-900">
                            {
                              order.customer_name ||
                              order.user_name ||
                              '--'
                            }
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {order.phone || '--'}
                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <span className="font-bold text-slate-900">
                            {formatMoney(
                              order.total_amount
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(
                              order.status
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            order.created_at
                          )}
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewOrder(
                                  order.id
                                )
                              }
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                              title="Xem đơn"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                await handleViewOrder(
                                  order.id
                                );
                              }}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100"
                              title="In bill"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {filteredOrders.length === 0 && (
              <EmptyOrders />
            )}

          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="md:hidden space-y-3">

            {filteredOrders.map(
              (order) => (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewOrder(
                            order.id
                          )
                        }
                        className="font-black text-sky-600"
                      >
                        #{order.id}
                      </button>

                      <p className="font-bold text-slate-900 mt-1">
                        {
                          order.customer_name ||
                          order.user_name ||
                          '--'
                        }
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {order.phone || '--'}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(
                        order.status
                      )}
                    </span>

                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">

                    <div>

                      <p className="text-xs text-slate-400">
                        Tổng tiền
                      </p>

                      <p className="font-black text-slate-900 mt-1">
                        {formatMoney(
                          order.total_amount
                        )}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleViewOrder(
                          order.id
                        )
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </button>

                  </div>

                </div>
              )
            )}

            {filteredOrders.length === 0 && (
              <EmptyOrders />
            )}

          </div>

        </div>

      </main>

      {/* =====================================================
          CREATE ORDER MODAL
      ===================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeCreateModal}
          />

          <div className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* HEADER */}

            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">

              <div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Tạo đơn hàng
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Tạo đơn bán hàng trực tiếp
                </p>

              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={creating}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* BODY */}

            <form
              onSubmit={handleCreateOrder}
              className="overflow-y-auto p-5 sm:p-6"
            >

              <div className="grid lg:grid-cols-2 gap-6">

                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="space-y-5">

                  {/* CUSTOMER */}

                  <div>

                    <h3 className="font-black text-slate-900 mb-3">
                      Thông tin khách hàng
                    </h3>

                    <div className="space-y-3">

                      <div>

                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          Tên khách hàng *
                        </label>

                        <div className="relative">

                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                          <input
                            type="text"
                            value={
                              orderForm.customer_name
                            }
                            onChange={(e) =>
                              setOrderForm({
                                ...orderForm,
                                customer_name:
                                  e.target.value
                              })
                            }
                            className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400"
                            placeholder="Nguyễn Văn A"
                          />

                        </div>

                      </div>

                      <div>

                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          Số điện thoại *
                        </label>

                        <div className="relative">

                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                          <input
                            type="text"
                            value={
                              orderForm.phone
                            }
                            onChange={(e) =>
                              setOrderForm({
                                ...orderForm,
                                phone:
                                  e.target.value
                              })
                            }
                            className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400"
                            placeholder="090..."
                          />

                        </div>

                      </div>

                      <div>

                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          Địa chỉ
                        </label>

                        <div className="relative">

                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />

                          <textarea
                            value={
                              orderForm.address
                            }
                            onChange={(e) =>
                              setOrderForm({
                                ...orderForm,
                                address:
                                  e.target.value
                              })
                            }
                            rows={3}
                            className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-sky-400"
                            placeholder="Địa chỉ giao hàng..."
                          />

                        </div>

                      </div>

                      <div>

                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          Ghi chú
                        </label>

                        <textarea
                          value={
                            orderForm.note
                          }
                          onChange={(e) =>
                            setOrderForm({
                              ...orderForm,
                              note:
                                e.target.value
                            })
                          }
                          rows={2}
                          className="w-full px-3 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-sky-400"
                          placeholder="Ghi chú đơn hàng..."
                        />

                      </div>

                    </div>

                  </div>

                  {/* ADD PRODUCT */}

                  <div>

                    <h3 className="font-black text-slate-900 mb-3">
                      Thêm sản phẩm
                    </h3>

                    <div className="border border-slate-200 rounded-2xl p-4">

                      <div className="relative">

                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                        <input
                          type="text"
                          value={
                            productSearch
                          }
                          onChange={(e) =>
                            setProductSearch(
                              e.target.value
                            )
                          }
                          className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400"
                          placeholder="Tìm tên sản phẩm, album..."
                        />

                      </div>

                      <div className="mt-3 max-h-52 overflow-y-auto space-y-2">

                        {loadingProducts && (
                          <div className="py-5 text-center">
                            <Loader2 className="w-5 h-5 animate-spin text-sky-500 mx-auto" />
                          </div>
                        )}

                        {!loadingProducts &&
                          filteredProducts.map(
                            (product) => (
                              <button
                                type="button"
                                key={product.id}
                                onClick={() =>
                                  handleSelectProduct(
                                    product
                                  )
                                }
                                className={`w-full text-left p-3 rounded-xl border transition ${
                                  selectedProduct?.id ===
                                  product.id
                                    ? 'border-sky-400 bg-sky-50'
                                    : 'border-slate-100 hover:bg-slate-50'
                                }`}
                              >

                                <div className="flex items-center gap-3">

                                  <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0">

                                    {product.image_url ? (
                                      <img
                                        src={
                                          product.image_url
                                        }
                                        alt={
                                          product.title
                                        }
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="w-5 h-5 text-slate-300 m-auto mt-3" />
                                    )}

                                  </div>

                                  <div className="min-w-0 flex-1">

                                    <p className="font-bold text-sm text-slate-800 truncate">
                                      {
                                        product.title
                                      }
                                    </p>

                                    {product.version_name && (
                                      <p className="text-xs text-slate-500 truncate">
                                        {
                                          product.version_name
                                        }
                                      </p>
                                    )}

                                    <p className="text-xs text-sky-600 font-bold mt-1">
                                      {formatMoney(
                                        product.price
                                      )}
                                    </p>

                                  </div>

                                </div>

                              </button>
                            )
                          )}

                      </div>

                      {/* SELECTED PRODUCT */}

                      {selectedProduct && (
                        <div className="mt-4 pt-4 border-t border-slate-100">

                          <p className="text-xs font-bold text-slate-500 mb-3">
                            Sản phẩm đã chọn
                          </p>

                          <div className="grid sm:grid-cols-3 gap-3">

                            <div className="sm:col-span-3">

                              <p className="font-bold text-sm text-slate-800">
                                {
                                  selectedProduct.title
                                }
                              </p>

                              {selectedProduct.version_name && (
                                <p className="text-xs text-slate-500">
                                  {
                                    selectedProduct.version_name
                                  }
                                </p>
                              )}

                            </div>

                            <div>

                              <label className="block text-xs font-bold text-slate-500 mb-1">
                                Số lượng
                              </label>

                              <input
                                type="number"
                                min="1"
                                value={
                                  selectedQuantity
                                }
                                onChange={(e) =>
                                  setSelectedQuantity(
                                    e.target.value
                                  )
                                }
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-sky-400"
                              />

                            </div>

                            <div className="sm:col-span-2">

                              <label className="block text-xs font-bold text-slate-500 mb-1">
                                Giá bán thực tế
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  selectedPrice
                                }
                                onChange={(e) =>
                                  setSelectedPrice(
                                    e.target.value
                                  )
                                }
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-sky-400"
                              />

                            </div>

                            <button
                              type="button"
                              onClick={
                                addProductToOrder
                              }
                              className="sm:col-span-3 h-10 rounded-lg bg-sky-500 text-white text-sm font-bold hover:bg-sky-600"
                            >
                              <Plus className="w-4 h-4 inline mr-1" />
                              Thêm vào đơn
                            </button>

                          </div>

                        </div>
                      )}

                    </div>

                  </div>

                </div>

                {/* =================================================
                    RIGHT
                ================================================= */}

                <div>

                  <div className="flex items-center justify-between mb-3">

                    <div>
                      <h3 className="font-black text-slate-900">
                        Sản phẩm trong đơn
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {orderForm.items.length}{' '}
                        sản phẩm
                      </p>
                    </div>

                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">

                    {orderForm.items.length === 0 ? (
                      <div className="py-16 px-5 text-center">

                        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />

                        <p className="font-bold text-slate-500">
                          Chưa có sản phẩm
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Chọn sản phẩm bên trái để thêm vào đơn
                        </p>

                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">

                        {orderForm.items.map(
                          (item, index) => (
                            <div
                              key={`${item.product_id}-${index}`}
                              className="p-4"
                            >

                              <div className="flex gap-3">

                                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">

                                  {item.image_url ? (
                                    <img
                                      src={
                                        item.image_url
                                      }
                                      alt={
                                        item.title
                                      }
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 text-slate-300 mx-auto mt-4" />
                                  )}

                                </div>

                                <div className="flex-1 min-w-0">

                                  <div className="flex justify-between gap-2">

                                    <div className="min-w-0">

                                      <p className="font-bold text-sm text-slate-800">
                                        {item.title}
                                      </p>

                                      {item.version_name && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          {
                                            item.version_name
                                          }
                                        </p>
                                      )}

                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeOrderItem(
                                          index
                                        )
                                      }
                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 shrink-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                  </div>

                                  <div className="grid grid-cols-2 gap-2 mt-3">

                                    <div>

                                      <label className="text-[11px] font-bold text-slate-400">
                                        Giá bán
                                      </label>

                                      <input
                                        type="number"
                                        min="0"
                                        value={
                                          item.price
                                        }
                                        onChange={(e) =>
                                          changeItemPrice(
                                            index,
                                            e.target.value
                                          )
                                        }
                                        className="w-full mt-1 h-9 px-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-sky-400"
                                      />

                                    </div>

                                    <div>

                                      <label className="text-[11px] font-bold text-slate-400">
                                        Số lượng
                                      </label>

                                      <div className="flex items-center mt-1 h-9 border border-slate-200 rounded-lg overflow-hidden">

                                        <button
                                          type="button"
                                          onClick={() =>
                                            changeItemQuantity(
                                              index,
                                              -1
                                            )
                                          }
                                          className="w-8 h-full flex items-center justify-center hover:bg-slate-50"
                                        >
                                          <Minus className="w-3.5 h-3.5" />
                                        </button>

                                        <span className="flex-1 text-center text-sm font-bold">
                                          {
                                            item.quantity
                                          }
                                        </span>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            changeItemQuantity(
                                              index,
                                              1
                                            )
                                          }
                                          className="w-8 h-full flex items-center justify-center hover:bg-slate-50"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>

                                      </div>

                                    </div>

                                  </div>

                                  <div className="text-right mt-3">

                                    <span className="text-sm font-black text-slate-900">
                                      {formatMoney(
                                        Number(
                                          item.price
                                        ) *
                                          Number(
                                            item.quantity
                                          )
                                      )}
                                    </span>

                                  </div>

                                </div>

                              </div>

                            </div>
                          )
                        )}

                      </div>
                    )}

                    {/* TOTAL */}

                    <div className="border-t border-slate-200 bg-slate-50 p-4">

                      <div className="flex items-center justify-between">

                        <span className="font-bold text-slate-600">
                          Tổng cộng
                        </span>

                        <span className="text-xl font-black text-slate-900">
                          {formatMoney(
                            orderTotal
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-6 mt-6 border-t border-slate-100">

                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    orderForm.items.length ===
                      0
                  }
                  className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >

                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Tạo đơn hàng
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setShowDetailModal(false)
            }
          />

          <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* HEADER */}

            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="font-black text-lg text-slate-900">
                  Chi tiết đơn hàng
                </h2>

                {selectedOrder && (
                  <p className="text-xs text-slate-500 mt-1">
                    Đơn #{selectedOrder.id}
                  </p>
                )}

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDetailModal(false)
                }
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* BODY */}

            <div className="overflow-y-auto p-5 sm:p-6">

              {loadingDetail && (
                <div className="py-20 text-center">

                  <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-3" />

                  <p className="text-sm text-slate-500">
                    Đang tải đơn hàng...
                  </p>

                </div>
              )}

              {!loadingDetail &&
                selectedOrder && (
                  <div className="space-y-5">

                    {/* CUSTOMER */}

                    <div className="grid sm:grid-cols-2 gap-3">

                      <InfoBox
                        icon={
                          <User className="w-4 h-4" />
                        }
                        label="Khách hàng"
                        value={
                          selectedOrder.customer_name ||
                          selectedOrder.user_name ||
                          '--'
                        }
                      />

                      <InfoBox
                        icon={
                          <Phone className="w-4 h-4" />
                        }
                        label="Số điện thoại"
                        value={
                          selectedOrder.phone ||
                          '--'
                        }
                      />

                      <InfoBox
                        icon={
                          <MapPin className="w-4 h-4" />
                        }
                        label="Địa chỉ"
                        value={
                          selectedOrder.address ||
                          '--'
                        }
                      />

                      <InfoBox
                        icon={
                          <ShoppingBag className="w-4 h-4" />
                        }
                        label="Ngày tạo"
                        value={formatDate(
                          selectedOrder.created_at
                        )}
                      />

                    </div>

                    {/* STATUS */}

                    <div className="border border-slate-200 rounded-2xl p-4">

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                        <div>

                          <p className="text-xs font-bold text-slate-400 uppercase">
                            Trạng thái
                          </p>

                          <span
                            className={`inline-flex mt-2 px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusClass(
                              selectedOrder.status
                            )}`}
                          >
                            {getStatusLabel(
                              selectedOrder.status
                            )}
                          </span>

                        </div>

                        <select
                          value={
                            selectedOrder.status ||
                            ''
                          }
                          disabled={
                            updatingStatus
                          }
                          onChange={(e) =>
                            handleUpdateStatus(
                              selectedOrder.id,
                              e.target.value
                            )
                          }
                          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                        >

                          {statuses
                            .filter(
                              (status) =>
                                status.value
                            )
                            .map(
                              (status) => (
                                <option
                                  key={
                                    status.value
                                  }
                                  value={
                                    status.value
                                  }
                                >
                                  {
                                    status.label
                                  }
                                </option>
                              )
                            )}

                        </select>

                      </div>

                    </div>

                    {/* ITEMS */}

                    <div className="border border-slate-200 rounded-2xl overflow-hidden">

                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">

                        <h3 className="font-bold text-slate-800">
                          Sản phẩm
                        </h3>

                      </div>

                      <div className="divide-y divide-slate-100">

                        {(selectedOrder.items ||
                          []).map(
                          (item, index) => (
                            <div
                              key={
                                item.id ||
                                index
                              }
                              className="p-4 flex gap-3"
                            >

                              <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">

                                {item.image_url ? (
                                  <img
                                    src={
                                      item.image_url
                                    }
                                    alt={
                                      item.title
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-slate-300 mx-auto mt-4" />
                                )}

                              </div>

                              <div className="flex-1 min-w-0">

                                <p className="font-bold text-sm text-slate-800">
                                  {item.title ||
                                    item.product_title ||
                                    '--'}
                                </p>

                                {item.version_name && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    {
                                      item.version_name
                                    }
                                  </p>
                                )}

                                <p className="text-xs text-slate-500 mt-2">
                                  SL:{' '}
                                  <strong>
                                    {
                                      item.quantity
                                    }
                                  </strong>
                                  {' × '}
                                  {formatMoney(
                                    item.price
                                  )}
                                </p>

                              </div>

                              <div className="text-right shrink-0">

                                <p className="font-black text-sm text-slate-900">
                                  {formatMoney(
                                    Number(
                                      item.price ||
                                        0
                                    ) *
                                      Number(
                                        item.quantity ||
                                          0
                                      )
                                  )}
                                </p>

                              </div>

                            </div>
                          )
                        )}

                      </div>

                      <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 flex items-center justify-between">

                        <span className="font-bold text-slate-600">
                          Tổng cộng
                        </span>

                        <span className="text-xl font-black text-slate-900">
                          {formatMoney(
                            selectedOrder.total_amount
                          )}
                        </span>

                      </div>

                    </div>

                    {/* ACTION */}

                    <div className="flex flex-col sm:flex-row justify-end gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handlePrintBill(
                            selectedOrder
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Printer className="w-4 h-4" />
                        In Bill
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowDetailModal(
                            false
                          )
                        }
                        className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
                      >
                        Đóng
                      </button>

                    </div>

                  </div>
                )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// =========================================================
// EMPTY ORDERS
// =========================================================

function EmptyOrders() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl py-16 px-5 text-center">

      <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />

      <p className="font-bold text-slate-500">
        Không có đơn hàng
      </p>

      <p className="text-sm text-slate-400 mt-1">
        Chưa tìm thấy đơn hàng phù hợp
      </p>

    </div>
  );
}

// =========================================================
// INFO BOX
// =========================================================

function InfoBox({
  icon,
  label,
  value
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-3">

      <div className="flex items-center gap-2 text-slate-400 mb-1">

        {icon}

        <span className="text-xs font-bold">
          {label}
        </span>

      </div>

      <p className="text-sm font-semibold text-slate-800 break-words">
        {value}
      </p>

    </div>
  );
}