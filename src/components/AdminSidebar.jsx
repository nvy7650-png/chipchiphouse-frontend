import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================
  // MENU ADMIN
  // ==========================================
  const menuItems = [
    {
      name: 'Tổng quan',
      path: '/admin',
    },
    {
      name: 'Quản lý Sản phẩm',
      path: '/admin/products',
    },
    {
      name: 'Quản lý Đơn hàng',
      path: '/admin/orders',
    },
    {
      name: 'Quản lý Khách hàng',
      path: '/admin/users',
    },
    {
      name: 'Cài đặt Hệ thống',
      path: '/admin/settings',
    },
  ];

  // ==========================================
  // ĐĂNG XUẤT
  // ==========================================
  const handleLogout = () => {
    // Xóa thông tin đăng nhập
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Đóng sidebar trên mobile
    if (setIsOpen) {
      setIsOpen(false);
    }

    // Về trang đăng nhập
    navigate('/login', { replace: true });
  };

  // ==========================================
  // KIỂM TRA MENU ĐANG ACTIVE
  // ==========================================
  const isMenuActive = (path) => {
    // Trang tổng quan
    if (path === '/admin') {
      return location.pathname === '/admin';
    }

    // Các trang con
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <>
      {/* ==========================================
          OVERLAY MOBILE
      ========================================== */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-slate-900 text-white
          flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >

        {/* ========================================
            PHẦN TRÊN
        ======================================== */}
        <div>

          {/* BRAND */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">

            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="text-xl font-black tracking-wider text-white"
            >
              CHIPCHIP{' '}
              <span className="text-sky-400">
                ADMIN
              </span>
            </Link>

            {/* Nút đóng mobile */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white font-bold text-xl transition"
              aria-label="Đóng menu"
            >
              ✕
            </button>

          </div>

          {/* ========================================
              MENU
          ======================================== */}
          <nav className="p-4 space-y-1.5">

            {menuItems.map((item) => {
              const isActive = isMenuActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    block px-4 py-3
                    rounded-xl
                    text-sm font-semibold
                    transition
                    ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}

          </nav>

        </div>

        {/* ==========================================
            FOOTER / LOGOUT
        ========================================== */}
        <div className="p-4 border-t border-slate-800">

          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full
              flex items-center justify-center gap-2
              px-4 py-2.5
              rounded-xl
              text-sm font-semibold
              text-red-400
              bg-red-500/10
              hover:bg-red-500/20
              hover:text-red-300
              transition
              cursor-pointer
            "
          >
            <FiLogOut className="w-4 h-4" />

            <span>
              Đăng xuất
            </span>

          </button>

        </div>

      </aside>
    </>
  );
}