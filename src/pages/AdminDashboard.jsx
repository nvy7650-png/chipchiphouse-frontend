import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dữ liệu mẫu Thống kê
  const stats = [
    { label: 'Tổng doanh thu', value: '128.450.000 ₫', change: '+12.5%', isPositive: true },
    { label: 'Đơn hàng mới', value: '1,420', change: '+8.2%', isPositive: true },
    { label: 'Sản phẩm tồn kho', value: '384', change: '-2.1%', isPositive: false },
    { label: 'Khách hàng mới', value: '89', change: '+5.4%', isPositive: true },
  ];

  // Dữ liệu mẫu Đơn hàng gần đây
  const recentOrders = [
    { id: '#ORD-8801', customer: 'Nguyễn Văn A', amount: '1.250.000 ₫', status: 'Hoàn thành', date: '25/08/2026' },
    { id: '#ORD-8802', customer: 'Trần Thị B', amount: '850.000 ₫', status: 'Đang xử lý', date: '25/08/2026' },
    { id: '#ORD-8803', customer: 'Lê Hoàng C', amount: '3.400.000 ₫', status: 'Đang giao', date: '24/08/2026' },
    { id: '#ORD-8804', customer: 'Phạm Minh D', amount: '450.000 ₫', status: 'Đã hủy', date: '24/08/2026' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 font-bold text-xl"
            >
              ☰
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Tổng quan hệ thống</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">Quản trị viên</p>
            </div>
            <div className="w-9 h-9 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Dashboard Main Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Grid Thống kê */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{item.value}</p>
                  <span className={`text-xs font-bold ${item.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bảng Đơn hàng mới nhất */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Đơn hàng mới nhất</h2>
              <button className="text-xs font-bold text-sky-600 hover:underline">Xem tất cả</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Mã đơn</th>
                    <th className="py-3.5 px-6">Khách hàng</th>
                    <th className="py-3.5 px-6">Tổng tiền</th>
                    <th className="py-3.5 px-6">Trạng thái</th>
                    <th className="py-3.5 px-6">Ngày đặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-bold text-sky-600">{order.id}</td>
                      <td className="py-4 px-6 text-slate-900 font-semibold">{order.customer}</td>
                      <td className="py-4 px-6 font-bold">{order.amount}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'Đang giao' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Đang xử lý' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}