import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingBag,
  FileCheck,
  Tag,
  Users,
  Music2,
  LogOut,
  X
} from 'lucide-react';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================
  // MENU ADMIN ĐẦY ĐỦ CÁC MỤC
  // ==========================================
  const menuItems = [
  {
    name: 'Tổng quan',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Quản lý Danh mục',
    path: '/admin/categories',
    icon: FolderTree,
  },
  {
    name: 'Quản lý Nhóm nhạc',
    path: '/admin/groups',
    icon: Music2,
  },
  {
    name: 'Quản lý Sản phẩm',
    path: '/admin/products',
    icon: Package,
  },
  {
    name: 'Quản lý Đơn hàng',
    path: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    name: 'Quản lý Phiếu nhập',
    path: '/admin/import-notes',
    icon: FileCheck,
  },
  {
    name: 'Quản lý Khuyến mãi',
    path: '/admin/promotions',
    icon: Tag,
  },
  {
    name: 'Quản lý Khách hàng',
    path: '/admin/users',
    icon: Users,
  },
];

  // ==========================================
  // ĐĂNG XUẤT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    if (setIsOpen) {
      setIsOpen(false);
    }

    navigate('/', { replace: true });
  };

  // ==========================================
  // KIỂM TRA MENU ĐANG ACTIVE
  // ==========================================
  const isMenuActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <>
      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-slate-900 text-white
          flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* PHẦN TRÊN */}
        <div>
          {/* BRAND */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="text-xl font-black tracking-wider text-white"
            >
              CHIPCHIP <span className="text-sky-400">ADMIN</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Đóng menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* MENU LIST */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuItems.map((item) => {
              const isActive = isMenuActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen && setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3
                    rounded-xl text-sm font-semibold
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER / LOGOUT */}
        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl
              text-sm font-semibold
              text-red-400 bg-red-500/10
              hover:bg-red-500/20 hover:text-red-300
              transition cursor-pointer
            "
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}