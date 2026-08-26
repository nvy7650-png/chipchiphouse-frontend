import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

import { Search, Eye, X, Loader2, Package, User, Phone, MapPin,
  Mail,
  Calendar,
  Pencil,
  Check,
  Trash2,
  Printer,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  ChevronLeft,
  FileText
} from 'lucide-react';


export default function AdminOrders() {

  const API_URL = import.meta.env.VITE_API_URL;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =====================================================
  // ORDERS
  // =====================================================

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  // =====================================================
  // SEARCH
  // =====================================================

  const [searchInput, setSearchInput] = useState('');

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState('');

  // =====================================================
  // DETAIL
  // =====================================================

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loadingDetail, setLoadingDetail] = useState(false);

  const [detailError, setDetailError] = useState('');

  // =====================================================
  // EDIT PRICE
  // =====================================================

  const [editingItemId, setEditingItemId] = useState(null);

  const [editingPrice, setEditingPrice] = useState('');

  const [savingPrice, setSavingPrice] = useState(false);

  // =====================================================
  // STATUS
  // =====================================================

  const [updatingStatus, setUpdatingStatus] = useState(false);

  // =====================================================
  // DELETE
  // =====================================================

  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // PRINT
  // =====================================================

  const printRef = useRef(null);


  // =====================================================
  // STATUS LIST
  // =====================================================

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
      value: 'PAID',
      label: 'Đã thanh toán'
    },
    {
      value: 'PROCESSING',
      label: 'Đang xử lý'
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


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (value) => {

    const number =
      Number(value) || 0;

    return number.toLocaleString('vi-VN') + 'đ';

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {

    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(
      'vi-VN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  };


  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status) => {

    const item =
      statuses.find(
        (s) => s.value === status
      );

    return item?.label || status || 'Không rõ';

  };


  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusClass = (status) => {

    switch (
      String(status || '').toUpperCase()
    ) {

      case 'PAID':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';

      case 'PROCESSING':
        return 'bg-blue-50 text-blue-600 border-blue-200';

      case 'SHIPPING':
        return 'bg-violet-50 text-violet-600 border-violet-200';

      case 'COMPLETED':
        return 'bg-green-50 text-green-600 border-green-200';

      case 'CANCELLED':
        return 'bg-red-50 text-red-600 border-red-200';

      case 'PENDING':
      default:
        return 'bg-amber-50 text-amber-600 border-amber-200';
    }

  };


  // =====================================================
  // GET ORDERS
  // =====================================================

  const fetchOrders = async (
    currentSearch = search,
    currentStatus = statusFilter
  ) => {

    try {

      setLoading(true);
      setError('');

      const params = {};

      if (
        currentSearch &&
        currentSearch.trim()
      ) {

        params.search =
          currentSearch.trim();

      }

      if (currentStatus) {
        params.status =
          currentStatus;
      }


      const res =
        await axios.get(
          `${API_URL}/orders`,
          {
            params
          }
        );


      setOrders(
        res.data.orders || []
      );

    } catch (err) {

      console.error(
        'Lỗi lấy danh sách đơn:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Không thể lấy danh sách đơn hàng!'
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD INITIAL
  // =====================================================

  useEffect(() => {

    fetchOrders('', '');

  }, []);


  // =====================================================
  // SEARCH SUBMIT
  // =====================================================

  const handleSearch = (e) => {

    e.preventDefault();

    setSearch(
      searchInput.trim()
    );

    fetchOrders(
      searchInput.trim(),
      statusFilter
    );

  };


  // =====================================================
  // CHANGE STATUS FILTER
  // =====================================================

  const handleStatusFilter = (e) => {

    const value =
      e.target.value;

    setStatusFilter(value);

    fetchOrders(
      search,
      value
    );

  };


  // =====================================================
  // RESET SEARCH
  // =====================================================

  const handleResetSearch = () => {

    setSearchInput('');
    setSearch('');
    setStatusFilter('');

    fetchOrders('', '');

  };


  // =====================================================
  // GET ORDER DETAIL
  // =====================================================

  const fetchOrderDetail = async (
    orderId
  ) => {

    try {

      setLoadingDetail(true);
      setDetailError('');

      const res =
        await axios.get(
          `${API_URL}/orders/${orderId}`
        );


      setSelectedOrder(
        res.data.order
      );

    } catch (err) {

      console.error(
        'Lỗi lấy chi tiết đơn:',
        err
      );

      setDetailError(
        err.response?.data?.message ||
        'Không thể lấy chi tiết đơn hàng!'
      );

    } finally {

      setLoadingDetail(false);

    }

  };


  // =====================================================
  // OPEN DETAIL
  // =====================================================

  const handleOpenDetail = (
    orderId
  ) => {

    setEditingItemId(null);
    setEditingPrice('');

    setSelectedOrder(null);

    fetchOrderDetail(orderId);

  };


  // =====================================================
  // CLOSE DETAIL
  // =====================================================

  const closeDetail = () => {

    if (savingPrice || updatingStatus) {
      return;
    }

    setSelectedOrder(null);

    setEditingItemId(null);

    setEditingPrice('');

    setDetailError('');

  };


  // =====================================================
  // START EDIT PRICE
  // =====================================================

  const handleStartEditPrice = (
    item
  ) => {

    setEditingItemId(
      item.id
    );

    setEditingPrice(
      String(
        item.order_price ?? 0
      )
    );

  };


  // =====================================================
  // CANCEL EDIT PRICE
  // =====================================================

  const handleCancelEditPrice = () => {

    setEditingItemId(null);

    setEditingPrice('');

  };


  // =====================================================
  // SAVE PRICE
  // =====================================================

  const handleSavePrice = async (
    item
  ) => {

    const price =
      Number(editingPrice);


    if (
      editingPrice === '' ||
      isNaN(price) ||
      price < 0
    ) {

      alert(
        'Giá bán không hợp lệ!'
      );

      return;
    }


    try {

      setSavingPrice(true);


      const res =
        await axios.put(

          `${API_URL}/orders/${selectedOrder.id}/items/${item.id}/price`,

          {
            price
          }

        );


      // =================================================
      // UPDATE LOCAL DETAIL
      // =================================================

      setSelectedOrder(
        (prev) => {

          if (!prev) {
            return prev;
          }


          const updatedItems =
            prev.items.map(
              (currentItem) => {

                if (
                  currentItem.id !== item.id
                ) {

                  return currentItem;

                }


                return {

                  ...currentItem,

                  order_price:
                    price,

                  subtotal:
                    price *
                    Number(
                      currentItem.quantity
                    )

                };

              }
            );


          const calculatedTotal =
            updatedItems.reduce(
              (
                total,
                currentItem
              ) => {

                return (
                  total +
                  Number(
                    currentItem.subtotal
                  )
                );

              },
              0
            );


          return {

            ...prev,

            items:
              updatedItems,

            total_amount:
              res.data.total_amount,

            calculated_total:
              calculatedTotal

          };

        }
      );


      // =================================================
      // UPDATE LIST
      // =================================================

      setOrders(
        (prev) =>
          prev.map(
            (order) => {

              if (
                order.id ===
                selectedOrder.id
              ) {

                return {

                  ...order,

                  total_amount:
                    res.data.total_amount

                };

              }

              return order;

            }
          )
      );


      setEditingItemId(null);

      setEditingPrice('');

    } catch (err) {

      console.error(
        'Lỗi cập nhật giá:',
        err
      );

      alert(
        err.response?.data?.message ||
        'Không thể cập nhật giá!'
      );

    } finally {

      setSavingPrice(false);

    }

  };


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleUpdateStatus = async (
    newStatus
  ) => {

    if (!selectedOrder) {
      return;
    }


    if (
      newStatus ===
      selectedOrder.status
    ) {

      return;

    }


    try {

      setUpdatingStatus(true);


      await axios.put(

        `${API_URL}/orders/${selectedOrder.id}/status`,

        {
          status:
            newStatus
        }

      );


      setSelectedOrder(
        (prev) => {

          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            status:
              newStatus
          };

        }
      );


      setOrders(
        (prev) =>
          prev.map(
            (order) => {

              if (
                order.id ===
                selectedOrder.id
              ) {

                return {
                  ...order,
                  status:
                    newStatus
                };

              }

              return order;

            }
          )
      );


    } catch (err) {

      console.error(
        'Lỗi cập nhật trạng thái:',
        err
      );

      alert(
        err.response?.data?.message ||
        'Không thể cập nhật trạng thái!'
      );

    } finally {

      setUpdatingStatus(false);

    }

  };


  // =====================================================
  // DELETE ORDER
  // =====================================================

  const handleDeleteOrder = async () => {

    if (!selectedOrder) {
      return;
    }


    const confirmed =
      window.confirm(

        `Bạn có chắc muốn xóa đơn hàng #${selectedOrder.id} không?`

      );


    if (!confirmed) {
      return;
    }


    try {

      setDeleting(true);


      await axios.delete(
        `${API_URL}/orders/${selectedOrder.id}`
      );


      alert(
        'Xóa đơn hàng thành công!'
      );


      setOrders(
        (prev) =>
          prev.filter(
            (order) =>
              order.id !==
              selectedOrder.id
          )
      );


      setSelectedOrder(null);


    } catch (err) {

      console.error(
        'Lỗi xóa đơn:',
        err
      );

      alert(
        err.response?.data?.message ||
        'Không thể xóa đơn hàng!'
      );

    } finally {

      setDeleting(false);

    }

  };


  // =====================================================
  // PRINT BILL
  // =====================================================

  const handlePrintBill = () => {

    if (!selectedOrder) {
      return;
    }


    const printWindow =
      window.open(
        '',
        '_blank',
        'width=900,height=700'
      );


    if (!printWindow) {

      alert(
        'Trình duyệt đã chặn cửa sổ in. Hãy cho phép popup.'
      );

      return;

    }


    const order =
      selectedOrder;


    const items =
      order.items || [];


    const itemsHtml =
      items
        .map(
          (item) => {

            const subtotal =
              Number(
                item.order_price
              ) *
              Number(
                item.quantity
              );


            return `

              <tr>

                <td>

                  ${escapeHtml(
                    item.title ||
                    'Sản phẩm'
                  )}

                  ${
                    item.version_name
                      ? `<br>
                         <small>
                           ${escapeHtml(
                             item.version_name
                           )}
                         </small>`
                      : ''
                  }

                </td>

                <td class="center">
                  ${item.quantity}
                </td>

                <td class="right">
                  ${formatMoneyPrint(
                    item.order_price
                  )}
                </td>

                <td class="right">
                  ${formatMoneyPrint(
                    subtotal
                  )}
                </td>

              </tr>

            `;

          }
        )
        .join('');


    printWindow.document.write(`

      <!DOCTYPE html>

      <html>

      <head>

        <meta charset="UTF-8">

        <title>
          Bill #${order.id}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            margin: 0;
            padding: 30px;

            color: #111;
          }

          .bill {
            max-width: 760px;
            margin: auto;
          }

          .header {
            text-align: center;
            margin-bottom: 25px;
          }

          .header h1 {
            margin: 0 0 5px;
            font-size: 24px;
          }

          .header p {
            margin: 3px 0;
            color: #555;
          }

          .line {
            border-top: 1px solid #ddd;
            margin: 18px 0;
          }

          .info {
            display: grid;
            grid-template-columns:
              1fr 1fr;

            gap: 8px 30px;

            margin-bottom: 20px;
          }

          .info p {
            margin: 4px 0;
          }

          .label {
            font-weight: bold;
          }

          table {
            width: 100%;
            border-collapse:
              collapse;

            margin-top: 15px;
          }

          th,
          td {
            border-bottom:
              1px solid #ddd;

            padding: 10px 8px;

            font-size: 14px;
          }

          th {
            background: #f5f5f5;
            text-align: left;
          }

          .center {
            text-align: center;
          }

          .right {
            text-align: right;
          }

          .total {
            margin-top: 20px;
            text-align: right;
            font-size: 20px;
            font-weight: bold;
          }

          .footer {
            text-align: center;
            margin-top: 35px;
            color: #777;
            font-size: 13px;
          }

          @media print {

            body {
              padding: 10px;
            }

          }

        </style>

      </head>

      <body>

        <div class="bill">

          <div class="header">

            <h1>
              CHIP CHIP HOUSE
            </h1>

            <p>
              HÓA ĐƠN BÁN HÀNG
            </p>

            <p>
              Mã đơn: #${order.id}
            </p>

          </div>


          <div class="line"></div>


          <div class="info">

            <div>
              <p>
                <span class="label">
                  Khách hàng:
                </span>

                ${escapeHtml(
                  order.customer_name ||
                  'Khách hàng'
                )}
              </p>

              <p>
                <span class="label">
                  Email:
                </span>

                ${escapeHtml(
                  order.customer_email ||
                  '—'
                )}
              </p>

              <p>
                <span class="label">
                  SĐT:
                </span>

                ${escapeHtml(
                  order.phone ||
                  order.customer_phone ||
                  '—'
                )}
              </p>
            </div>

            <div>

              <p>
                <span class="label">
                  Ngày đặt:
                </span>

                ${escapeHtml(
                  formatDate(
                    order.created_at
                  )
                )}
              </p>

              <p>
                <span class="label">
                  Trạng thái:
                </span>

                ${escapeHtml(
                  getStatusLabel(
                    order.status
                  )
                )}
              </p>

            </div>

          </div>


          <p>
            <span class="label">
              Địa chỉ giao hàng:
            </span>

            ${escapeHtml(
              order.address ||
              '—'
            )}

          </p>


          <table>

            <thead>

              <tr>

                <th>
                  Sản phẩm
                </th>

                <th class="center">
                  SL
                </th>

                <th class="right">
                  Đơn giá
                </th>

                <th class="right">
                  Thành tiền
                </th>

              </tr>

            </thead>

            <tbody>

              ${itemsHtml}

            </tbody>

          </table>


          <div class="total">

            Tổng cộng:
            ${formatMoneyPrint(
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


  // =====================================================
  // ESCAPE HTML
  // =====================================================

  const escapeHtml = (value) => {

    return String(value ?? '')
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      );

  };


  // =====================================================
  // PRINT MONEY
  // =====================================================

  const formatMoneyPrint = (value) => {

    return (
      Number(value) || 0
    ).toLocaleString('vi-VN') +
      'đ';

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-100 flex">

        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 lg:ml-64 flex items-center justify-center">

          <div className="text-center">

            <Loader2
              className="
                w-8
                h-8
                text-sky-500
                animate-spin
                mx-auto
                mb-3
              "
            />

            <p className="text-sm text-slate-500">

              Đang tải đơn hàng...

            </p>

          </div>

        </main>

      </div>

    );

  }


  // =====================================================
  // MAIN
  // =====================================================

  return (

    <div className="min-h-screen bg-slate-100 flex">

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />


      <main
        className="
          flex-1
          lg:ml-64
          min-w-0
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            h-16
            bg-white
            border-b
            border-slate-200
            px-4
            sm:px-8
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h1
              className="
                text-lg
                sm:text-xl
                font-black
                text-slate-900
              "
            >

              Quản lý đơn hàng

            </h1>

          </div>


          <button

            onClick={() =>
              fetchOrders(
                search,
                statusFilter
              )
            }

            className="
              w-10
              h-10
              rounded-xl
              border
              border-slate-200
              bg-white
              flex
              items-center
              justify-center
              text-slate-500
              hover:bg-slate-50
              hover:text-sky-500
              transition
            "

            title="Làm mới"

          >

            <RefreshCw
              className="w-4 h-4"
            />

          </button>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-4 sm:p-6 lg:p-8">


          {/* =================================================
              SEARCH BAR
          ================================================= */}

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              shadow-sm
              p-4
              mb-6
            "
          >

            <form
              onSubmit={handleSearch}
              className="
                flex
                flex-col
                md:flex-row
                gap-3
              "
            >

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    text-slate-400
                  "
                />

                <input

                  type="text"

                  value={searchInput}

                  onChange={(e) =>
                    setSearchInput(
                      e.target.value
                    )
                  }

                  placeholder="
                    Tìm mã đơn, tên khách,
                    email hoặc số điện thoại...
                  "

                  className="
                    w-full
                    h-11
                    pl-10
                    pr-4
                    rounded-xl
                    border
                    border-slate-200
                    outline-none
                    text-sm
                    text-slate-700
                    focus:border-sky-400
                    focus:ring-2
                    focus:ring-sky-100
                  "

                />

              </div>


              {/* STATUS */}

              <select

                value={statusFilter}

                onChange={
                  handleStatusFilter
                }

                className="
                  h-11
                  px-4
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-sm
                  font-semibold
                  text-slate-600
                  outline-none
                  focus:border-sky-400
                "
              >

                {statuses.map(
                  (status) => (

                    <option
                      key={status.value}
                      value={status.value}
                    >

                      {status.label}

                    </option>

                  )
                )}

              </select>


              {/* SEARCH BUTTON */}

              <button

                type="submit"

                className="
                  h-11
                  px-5
                  rounded-xl
                  bg-sky-500
                  text-white
                  text-sm
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  hover:bg-sky-600
                  transition
                "
              >

                <Search
                  className="w-4 h-4"
                />

                Tìm kiếm

              </button>


              {/* RESET */}

              {(searchInput || search || statusFilter) && (

                <button

                  type="button"

                  onClick={
                    handleResetSearch
                  }

                  className="
                    h-11
                    px-4
                    rounded-xl
                    border
                    border-slate-200
                    text-sm
                    font-bold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >

                  Đặt lại

                </button>

              )}

            </form>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              className="
                mb-6
                bg-red-50
                border
                border-red-200
                rounded-2xl
                p-4
                flex
                items-center
                gap-3
                text-red-600
              "
            >

              <AlertCircle
                className="w-5 h-5 shrink-0"
              />

              <span className="text-sm">

                {error}

              </span>

            </div>

          )}


          {/* =================================================
              TABLE
          ================================================= */}

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-slate-200
              shadow-sm
              overflow-hidden
            "
          >

            {/* TABLE HEADER */}

            <div
              className="
                px-5
                py-4
                border-b
                border-slate-100
                flex
                items-center
                justify-between
              "
            >

              <div>

                <h2
                  className="
                    font-bold
                    text-slate-900
                  "
                >

                  Danh sách đơn hàng

                </h2>

                <p
                  className="
                    text-xs
                    text-slate-500
                    mt-1
                  "
                >

                  {orders.length} đơn hàng

                </p>

              </div>

            </div>


            {orders.length === 0 ? (

              <div
                className="
                  py-20
                  text-center
                "
              >

                <ShoppingBag
                  className="
                    w-12
                    h-12
                    text-slate-300
                    mx-auto
                    mb-3
                  "
                />

                <p
                  className="
                    font-bold
                    text-slate-500
                  "
                >

                  Không có đơn hàng

                </p>

                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-1
                  "
                >

                  Thử thay đổi từ khóa
                  hoặc bộ lọc.

                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table
                  className="
                    w-full
                    min-w-[900px]
                  "
                >

                  <thead>

                    <tr
                      className="
                        bg-slate-50
                        border-b
                        border-slate-100
                      "
                    >

                      <th
                        className="
                          text-left
                          px-5
                          py-3
                          text-xs
                          font-bold
                          text-slate-500
                        "
                      >

                        Đơn hàng

                      </th>


                      <th
                        className="
                          text-left
                          px-5
                          py-3
                          text-xs
                          font-bold
                          text-slate-500
                        "
                      >

                        Khách hàng

                      </th>


                      <th
                        className="
                          text-left
                          px-5
                          py-3
                          text-xs
                          font-bold
                          text-slate-500
                        "
                      >

                        Sản phẩm

                      </th>


                      <th
                        className="
                          text-right
                          px-5
                          py-3
                          text-xs
                          font-bold
                          text-slate-500
                        "
                      >

                        Tổng tiền

                      </th>


                      <th
                        className="
                          text-center
                          px-5
                          py-3
                          text-xs
                          font-bold
                          text-slate-500
                        "
                      >

                        Trạng thái

                      </th>


                      <th
                        className="
                          text-right
                          px-5
                          py-3
                          text-xs
                          font-bold
                          text-slate-500
                        "
                      >

                        Thao tác

                      </th>

                    </tr>

                  </thead>


                  <tbody
                    className="
                      divide-y
                      divide-slate-100
                    "
                  >

                    {orders.map(
                      (order) => (

                        <tr
                          key={order.id}
                          className="
                            hover:bg-slate-50
                            transition
                          "
                        >

                          {/* ORDER */}

                          <td className="px-5 py-4">

                            <div>

                              <p
                                className="
                                  font-black
                                  text-slate-900
                                "
                              >

                                #{order.id}

                              </p>

                              <p
                                className="
                                  text-xs
                                  text-slate-400
                                  mt-1
                                "
                              >

                                {formatDate(
                                  order.created_at
                                )}

                              </p>

                            </div>

                          </td>


                          {/* CUSTOMER */}

                          <td className="px-5 py-4">

                            <div>

                              <p
                                className="
                                  text-sm
                                  font-bold
                                  text-slate-800
                                "
                              >

                                {order.customer_name ||
                                  'Khách hàng'}

                              </p>

                              <p
                                className="
                                  text-xs
                                  text-slate-500
                                  mt-1
                                "
                              >

                                {order.phone ||
                                  order.customer_phone ||
                                  '—'}

                              </p>

                            </div>

                          </td>


                          {/* ITEMS */}

                          <td className="px-5 py-4">

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >

                              <Package
                                className="
                                  w-4
                                  h-4
                                  text-sky-500
                                "
                              />

                              <span
                                className="
                                  text-sm
                                  font-semibold
                                  text-slate-600
                                "
                              >

                                {Number(
                                  order.item_count
                                ) || 0}{' '}

                                sản phẩm

                              </span>

                              <span
                                className="
                                  text-xs
                                  text-slate-400
                                "
                              >

                                (
                                {Number(
                                  order.total_quantity
                                ) || 0}
                                {' '}sp
                                )

                              </span>

                            </div>

                          </td>


                          {/* TOTAL */}

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                            "
                          >

                            <p
                              className="
                                font-black
                                text-slate-900
                              "
                            >

                              {formatMoney(
                                order.total_amount
                              )}

                            </p>

                          </td>


                          {/* STATUS */}

                          <td
                            className="
                              px-5
                              py-4
                              text-center
                            "
                          >

                            <span
                              className={`
                                inline-flex
                                items-center
                                px-3
                                py-1.5
                                rounded-full
                                border
                                text-xs
                                font-bold
                                ${getStatusClass(
                                  order.status
                                )}
                              `}
                            >

                              {getStatusLabel(
                                order.status
                              )}

                            </span>

                          </td>


                          {/* ACTION */}

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                justify-end
                                gap-2
                              "
                            >

                              <button

                                onClick={() =>
                                  handleOpenDetail(
                                    order.id
                                  )
                                }

                                className="
                                  h-9
                                  px-3
                                  rounded-xl
                                  bg-sky-50
                                  text-sky-600
                                  text-xs
                                  font-bold
                                  flex
                                  items-center
                                  gap-1.5
                                  hover:bg-sky-100
                                  transition
                                "
                              >

                                <Eye
                                  className="w-4 h-4"
                                />

                                Xem

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </main>


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedOrder && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            p-4
          "
        >

          {/* OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-black/40
              backdrop-blur-[2px]
            "
            onClick={closeDetail}
          />


          {/* MODAL */}

          <div
            className="
              relative
              w-full
              max-w-5xl
              max-h-[92vh]
              bg-white
              rounded-2xl
              shadow-2xl
              overflow-hidden
              flex
              flex-col
            "
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div
              className="
                px-6
                py-4
                border-b
                border-slate-100
                flex
                items-center
                justify-between
                shrink-0
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <button

                    onClick={closeDetail}

                    className="
                      w-9
                      h-9
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      text-slate-500
                      hover:bg-slate-100
                    "
                  >

                    <ChevronLeft
                      className="w-5 h-5"
                    />

                  </button>


                  <div>

                    <h2
                      className="
                        text-lg
                        font-black
                        text-slate-900
                      "
                    >

                      Đơn hàng #{selectedOrder.id}

                    </h2>

                    <p
                      className="
                        text-xs
                        text-slate-500
                        mt-0.5
                      "
                    >

                      {formatDate(
                        selectedOrder.created_at
                      )}

                    </p>

                  </div>

                </div>

              </div>


              <button

                onClick={closeDetail}

                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-slate-500
                  hover:bg-slate-100
                "
              >

                <X
                  className="w-5 h-5"
                />

              </button>

            </div>


            {/* =================================================
                DETAIL CONTENT
            ================================================= */}

            <div
              className="
                overflow-y-auto
                p-6
                space-y-5
              "
            >

              {detailError && (

                <div
                  className="
                    bg-red-50
                    border
                    border-red-200
                    rounded-xl
                    p-4
                    text-red-600
                    text-sm
                  "
                >

                  {detailError}

                </div>

              )}


              {loadingDetail ? (

                <div
                  className="
                    py-16
                    text-center
                  "
                >

                  <Loader2
                    className="
                      w-8
                      h-8
                      text-sky-500
                      animate-spin
                      mx-auto
                    "
                  />

                  <p
                    className="
                      text-sm
                      text-slate-500
                      mt-3
                    "
                  >

                    Đang tải đơn hàng...

                  </p>

                </div>

              ) : (

                <>

                  {/* =================================================
                      CUSTOMER
                  ================================================= */}

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-4
                    "
                  >

                    <div
                      className="
                        bg-slate-50
                        rounded-2xl
                        p-5
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          mb-4
                        "
                      >

                        <User
                          className="
                            w-4
                            h-4
                            text-sky-500
                          "
                        />

                        <h3
                          className="
                            font-bold
                            text-slate-900
                          "
                        >

                          Thông tin khách hàng

                        </h3>

                      </div>


                      <div
                        className="
                          space-y-3
                        "
                      >

                        <div>

                          <p
                            className="
                              text-xs
                              text-slate-400
                              mb-1
                            "
                          >

                            Họ tên

                          </p>

                          <p
                            className="
                              text-sm
                              font-bold
                              text-slate-800
                            "
                          >

                            {selectedOrder.customer_name ||
                              '—'}

                          </p>

                        </div>


                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <Mail
                            className="
                              w-4
                              h-4
                              text-slate-400
                            "
                          />

                          <span
                            className="
                              text-sm
                              text-slate-600
                            "
                          >

                            {selectedOrder.customer_email ||
                              '—'}

                          </span>

                        </div>


                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <Phone
                            className="
                              w-4
                              h-4
                              text-slate-400
                            "
                          />

                          <span
                            className="
                              text-sm
                              text-slate-600
                            "
                          >

                            {selectedOrder.phone ||
                              selectedOrder.customer_phone ||
                              '—'}

                          </span>

                        </div>

                      </div>

                    </div>


                    {/* ADDRESS */}

                    <div
                      className="
                        bg-slate-50
                        rounded-2xl
                        p-5
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          mb-4
                        "
                      >

                        <MapPin
                          className="
                            w-4
                            h-4
                            text-sky-500
                          "
                        />

                        <h3
                          className="
                            font-bold
                            text-slate-900
                          "
                        >

                          Địa chỉ giao hàng

                        </h3>

                      </div>


                      <p
                        className="
                          text-sm
                          leading-relaxed
                          text-slate-600
                        "
                      >

                        {selectedOrder.address ||
                          'Chưa có địa chỉ'}

                      </p>

                    </div>

                  </div>


                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <div
                    className="
                      bg-white
                      border
                      border-slate-200
                      rounded-2xl
                      p-5
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        justify-between
                        gap-4
                      "
                    >

                      <div>

                        <p
                          className="
                            text-xs
                            font-bold
                            text-slate-400
                            uppercase
                            tracking-wide
                          "
                        >

                          Trạng thái đơn hàng

                        </p>

                        <div
                          className="
                            mt-2
                            flex
                            items-center
                            gap-3
                          "
                        >

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1.5
                              rounded-full
                              border
                              text-xs
                              font-bold
                              ${getStatusClass(
                                selectedOrder.status
                              )}
                            `}
                          >

                            {getStatusLabel(
                              selectedOrder.status
                            )}

                          </span>

                        </div>

                      </div>


                      <select

                        value={
                          selectedOrder.status ||
                          ''
                        }

                        onChange={(e) =>
                          handleUpdateStatus(
                            e.target.value
                          )
                        }

                        disabled={
                          updatingStatus
                        }

                        className="
                          h-10
                          px-3
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          text-sm
                          font-semibold
                          text-slate-700
                          outline-none
                          focus:border-sky-400
                          disabled:opacity-60
                        "
                      >

                        {statuses
                          .filter(
                            (item) =>
                              item.value
                          )
                          .map(
                            (item) => (

                              <option
                                key={
                                  item.value
                                }
                                value={
                                  item.value
                                }
                              >

                                {item.label}

                              </option>

                            )
                          )}

                      </select>

                    </div>

                  </div>


                  {/* =================================================
                      PRODUCTS
                  ================================================= */}

                  <div
                    className="
                      bg-white
                      border
                      border-slate-200
                      rounded-2xl
                      overflow-hidden
                    "
                  >

                    <div
                      className="
                        px-5
                        py-4
                        border-b
                        border-slate-100
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <ShoppingBag
                          className="
                            w-4
                            h-4
                            text-sky-500
                          "
                        />

                        <h3
                          className="
                            font-bold
                            text-slate-900
                          "
                        >

                          Sản phẩm trong đơn

                        </h3>

                      </div>

                      <p
                        className="
                          text-xs
                          text-slate-400
                          mt-1
                        "
                      >

                        Có thể chỉnh giá bán
                        riêng cho đơn hàng này.

                      </p>

                    </div>


                    <div
                      className="
                        divide-y
                        divide-slate-100
                      "
                    >

                      {(selectedOrder.items || [])
                        .map(
                          (item) => (

                            <div
                              key={item.id}
                              className="
                                p-5
                              "
                            >

                              <div
                                className="
                                  flex
                                  flex-col
                                  lg:flex-row
                                  lg:items-center
                                  gap-4
                                "
                              >

                                {/* IMAGE */}

                                <div
                                  className="
                                    w-20
                                    h-20
                                    rounded-xl
                                    bg-slate-100
                                    overflow-hidden
                                    flex
                                    items-center
                                    justify-center
                                    shrink-0
                                  "
                                >

                                  {item.image_url ? (

                                    <img
                                      src={
                                        item.image_url
                                      }
                                      alt={
                                        item.title
                                      }
                                      className="
                                        w-full
                                        h-full
                                        object-cover
                                      "
                                    />

                                  ) : (

                                    <Package
                                      className="
                                        w-8
                                        h-8
                                        text-slate-300
                                      "
                                    />

                                  )}

                                </div>


                                {/* INFO */}

                                <div
                                  className="
                                    flex-1
                                    min-w-0
                                  "
                                >

                                  <h4
                                    className="
                                      font-bold
                                      text-slate-900
                                    "
                                  >

                                    {item.title ||
                                      'Sản phẩm'}

                                  </h4>


                                  {item.version_name && (

                                    <p
                                      className="
                                        text-xs
                                        text-sky-600
                                        font-semibold
                                        mt-1
                                      "
                                    >

                                      {item.version_name}

                                    </p>

                                  )}


                                  <p
                                    className="
                                      text-xs
                                      text-slate-400
                                      mt-2
                                    "
                                  >

                                    Số lượng:
                                    {' '}
                                    {item.quantity}

                                  </p>

                                </div>


                                {/* PRICES */}

                                <div
                                  className="
                                    lg:w-72
                                    shrink-0
                                  "
                                >

                                  <div
                                    className="
                                      grid
                                      grid-cols-2
                                      gap-3
                                    "
                                  >

                                    <div>

                                      <p
                                        className="
                                          text-[11px]
                                          font-bold
                                          text-slate-400
                                          mb-1
                                        "
                                      >

                                        Giá setup

                                      </p>

                                      <p
                                        className="
                                          text-sm
                                          font-semibold
                                          text-slate-500
                                        "
                                      >

                                        {formatMoney(
                                          item.product_price
                                        )}

                                      </p>

                                    </div>


                                    <div>

                                      <p
                                        className="
                                          text-[11px]
                                          font-bold
                                          text-slate-400
                                          mb-1
                                        "
                                      >

                                        Giá bán đơn

                                      </p>


                                      {editingItemId ===
                                      item.id ? (

                                        <div
                                          className="
                                            flex
                                            items-center
                                            gap-1
                                          "
                                        >

                                          <input

                                            type="number"

                                            min="0"

                                            value={
                                              editingPrice
                                            }

                                            onChange={(e) =>
                                              setEditingPrice(
                                                e.target.value
                                              )
                                            }

                                            disabled={
                                              savingPrice
                                            }

                                            autoFocus

                                            className="
                                              w-full
                                              h-9
                                              px-2
                                              rounded-lg
                                              border
                                              border-sky-300
                                              outline-none
                                              text-sm
                                              font-bold
                                              text-slate-800
                                            "
                                          />


                                          <button

                                            onClick={() =>
                                              handleSavePrice(
                                                item
                                              )
                                            }

                                            disabled={
                                              savingPrice
                                            }

                                            className="
                                              w-9
                                              h-9
                                              rounded-lg
                                              bg-emerald-500
                                              text-white
                                              flex
                                              items-center
                                              justify-center
                                              shrink-0
                                              hover:bg-emerald-600
                                              disabled:opacity-60
                                            "
                                          >

                                            {savingPrice ? (

                                              <Loader2
                                                className="
                                                  w-4
                                                  h-4
                                                  animate-spin
                                                "
                                              />

                                            ) : (

                                              <Check
                                                className="
                                                  w-4
                                                  h-4
                                                "
                                              />

                                            )}

                                          </button>


                                          <button

                                            onClick={
                                              handleCancelEditPrice
                                            }

                                            disabled={
                                              savingPrice
                                            }

                                            className="
                                              w-9
                                              h-9
                                              rounded-lg
                                              border
                                              border-slate-200
                                              text-slate-500
                                              flex
                                              items-center
                                              justify-center
                                              shrink-0
                                              hover:bg-slate-50
                                            "
                                          >

                                            <X
                                              className="
                                                w-4
                                                h-4
                                              "
                                            />

                                          </button>

                                        </div>

                                      ) : (

                                        <div
                                          className="
                                            flex
                                            items-center
                                            gap-2
                                          "
                                        >

                                          <p
                                            className="
                                              text-sm
                                              font-black
                                              text-slate-900
                                            "
                                          >

                                            {formatMoney(
                                              item.order_price
                                            )}

                                          </p>


                                          <button

                                            onClick={() =>
                                              handleStartEditPrice(
                                                item
                                              )
                                            }

                                            className="
                                              w-7
                                              h-7
                                              rounded-lg
                                              flex
                                              items-center
                                              justify-center
                                              text-slate-400
                                              hover:bg-sky-50
                                              hover:text-sky-500
                                            "

                                            title="
                                              Chỉnh giá
                                            "
                                          >

                                            <Pencil
                                              className="
                                                w-3.5
                                                h-3.5
                                              "
                                            />

                                          </button>

                                        </div>

                                      )}

                                    </div>

                                  </div>


                                  <div
                                    className="
                                      mt-3
                                      pt-3
                                      border-t
                                      border-slate-100
                                      flex
                                      items-center
                                      justify-between
                                    "
                                  >

                                    <span
                                      className="
                                        text-xs
                                        text-slate-400
                                      "
                                    >

                                      Thành tiền

                                    </span>

                                    <span
                                      className="
                                        text-sm
                                        font-black
                                        text-slate-900
                                      "
                                    >

                                      {formatMoney(
                                        Number(
                                          item.order_price
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

                  </div>


                  {/* =================================================
                      TOTAL
                  ================================================= */}

                  <div
                    className="
                      bg-slate-900
                      rounded-2xl
                      p-5
                      text-white
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <div>

                        <p
                          className="
                            text-sm
                            text-slate-300
                          "
                        >

                          Tổng cộng đơn hàng

                        </p>

                        <p
                          className="
                            text-xs
                            text-slate-400
                            mt-1
                          "
                        >

                          Giá được tính theo
                          giá bán thực tế
                          trong đơn.

                        </p>

                      </div>


                      <p
                        className="
                          text-2xl
                          font-black
                        "
                      >

                        {formatMoney(
                          selectedOrder.total_amount
                        )}

                      </p>

                    </div>

                  </div>

                </>

              )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div
              className="
                px-6
                py-4
                border-t
                border-slate-100
                flex
                flex-col-reverse
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
                shrink-0
                bg-white
              "
            >

              <button

                onClick={
                  handleDeleteOrder
                }

                disabled={
                  deleting ||
                  savingPrice ||
                  updatingStatus
                }

                className="
                  px-4
                  py-2.5
                  rounded-xl
                  text-sm
                  font-bold
                  text-red-500
                  border
                  border-red-100
                  hover:bg-red-50
                  disabled:opacity-50
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                {deleting ? (

                  <Loader2
                    className="
                      w-4
                      h-4
                      animate-spin
                    "
                  />

                ) : (

                  <Trash2
                    className="
                      w-4
                      h-4
                    "
                  />

                )}

                Xóa đơn

              </button>


              <div
                className="
                  flex
                  items-center
                  justify-end
                  gap-3
                "
              >

                <button

                  onClick={
                    handlePrintBill
                  }

                  className="
                    px-4
                    py-2.5
                    rounded-xl
                    bg-slate-900
                    text-white
                    text-sm
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:bg-slate-800
                    transition
                  "
                >

                  <Printer
                    className="
                      w-4
                      h-4
                    "
                  />

                  In bill

                </button>


                <button

                  onClick={closeDetail}

                  className="
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    border-slate-200
                    text-sm
                    font-bold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >

                  Đóng

                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}