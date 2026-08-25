import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  // =====================================================
  // ĐỌC USER TỪ LOCAL STORAGE
  // =====================================================
  const checkUserStatus = () => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      setUser(null);
      setCartCount(0);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      console.log('Navbar - user hiện tại:', parsedUser);
      console.log('Navbar - role:', parsedUser?.role);

      setUser(parsedUser);

    } catch (error) {
      console.error('Lỗi đọc user từ localStorage:', error);

      localStorage.removeItem('user');
      localStorage.removeItem('token');

      setUser(null);
      setCartCount(0);
    }
  };

  // =====================================================
  // LOAD USER
  // =====================================================
  useEffect(() => {
    checkUserStatus();

    // Khi localStorage thay đổi từ tab khác
    const handleStorageChange = () => {
      checkUserStatus();
    };

    // Event storage
    window.addEventListener(
      'storage',
      handleStorageChange
    );

    // Event tự tạo để cập nhật ngay trong cùng tab
    window.addEventListener(
      'userChanged',
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange
      );

      window.removeEventListener(
        'userChanged',
        handleStorageChange
      );
    };
  }, []);

  // =====================================================
  // LẤY GIỎ HÀNG
  // =====================================================
  useEffect(() => {
    const fetchCartData = async () => {

      // Nếu chưa đăng nhập
      if (!user) {
        setCartCount(0);
        return;
      }

      const token = localStorage.getItem('token');

      // Không có token
      if (!token) {
        setCartCount(0);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setCartCount(
          response.data?.totalItems || 0
        );

      } catch (error) {
        console.error(
          'Lỗi lấy giỏ hàng:',
          error
        );

        setCartCount(0);
      }
    };

    fetchCartData();

  }, [user]);

  // =====================================================
  // ĐĂNG XUẤT
  // =====================================================
  const handleLogout = () => {

    console.log('Đang đăng xuất...');

    // Xóa thông tin đăng nhập
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Reset state Navbar
    setUser(null);
    setCartCount(0);

    // Báo cho các component khác biết user đã thay đổi
    window.dispatchEvent(
      new Event('userChanged')
    );

    // Chuyển về trang đăng nhập
    navigate('/login');
  };

  // =====================================================
  // ĐIỀU HƯỚNG ADMIN
  // =====================================================
  const handleAdmin = () => {
    navigate('/admin');
  };

  // =====================================================
  // TÌM KIẾM
  // =====================================================
  const handleSearch = (e) => {
    e.preventDefault();

    const keyword = searchQuery.trim();

    if (!keyword) return;

    navigate(
      `/products?search=${encodeURIComponent(keyword)}`
    );
  };

  // =====================================================
  // LOG USER ĐỂ DEBUG
  // =====================================================
  console.log(
    'Navbar render:',
    user
  );

  // =====================================================
  // GIAO DIỆN
  // =====================================================
  return (
    <header className="bg-chip-blue shadow-md sticky top-0 z-50">

      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">

        {/* =================================================
            LOGO
        ================================================= */}
        <Link
          to="/"
          className="flex items-center space-x-2 cursor-pointer"
        >
          <h1 className="text-2xl font-black tracking-wider text-slate-900">
            CHIPCHIP
            <span className="text-white">
              HOUSE
            </span>
          </h1>
        </Link>


        {/* =================================================
            SEARCH
        ================================================= */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md mx-4"
        >

          <div className="relative w-full">

            <input
              type="text"
              placeholder="Tìm Album, Photocard, Lightstick..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="
                w-full
                bg-white
                text-sm
                text-slate-800
                rounded-full
                py-2
                pl-4
                pr-10
                focus:outline-none
                focus:ring-2
                focus:ring-chip-yellow
                shadow-inner
              "
            />

            <button
              type="submit"
              className="
                absolute
                right-3
                top-2.5
                text-slate-400
                hover:text-slate-600
                cursor-pointer
              "
            >

              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="
                    M21 21l-6-6
                    m2-5a7 7 0 11-14 0
                    7 7 0 0114 0z
                  "
                />

              </svg>

            </button>

          </div>

        </form>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}
        <div className="flex items-center space-x-3">


          {/* =================================================
              ADMIN BUTTON
          ================================================= */}
          {user?.role === 'admin' && (

            <button
              onClick={handleAdmin}
              className="
                hidden
                sm:flex
                items-center
                gap-2
                bg-slate-900
                text-white
                px-4
                py-2
                rounded-full
                text-sm
                font-bold
                hover:bg-slate-700
                transition
                cursor-pointer
              "
            >

              <span>⚙️</span>

              <span>
                Admin
              </span>

            </button>

          )}


          {/* =================================================
              CART
          ================================================= */}
          <Link
            to="/cart"
            className="
              relative
              bg-white
              p-2.5
              rounded-full
              shadow
              hover:bg-chip-yellow
              transition
              cursor-pointer
              flex
              items-center
              justify-center
            "
          >

            <svg
              className="w-5 h-5 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="
                  M3 3h2l.4 2
                  M7 13h10l4-8H5.4
                  M7 13L5.4 5
                  M7 13l-2.293 2.293
                  c-.63.63-.184 1.707.707 1.707H17
                  m0 0a2 2 0 100 4
                  2 2 0 000-4zm-8 2
                  a2 2 0 11-4 0
                  2 2 0 014 0z
                "
              />

            </svg>


            {/* Chỉ hiện khi có sản phẩm */}
            {cartCount > 0 && (

              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  bg-red-500
                  text-white
                  text-xs
                  font-bold
                  w-5
                  h-5
                  rounded-full
                  flex
                  items-center
                  justify-center
                "
              >
                {cartCount}
              </span>

            )}

          </Link>


          {/* =================================================
              ACCOUNT
          ================================================= */}
          <div
            className="
              flex
              items-center
              space-x-2
              pl-2
              border-l
              border-slate-300
            "
          >

            {user ? (

              // =============================================
              // ĐÃ ĐĂNG NHẬP
              // =============================================
              <div className="flex items-center gap-2">

                {/* USERNAME */}
                <span
                  className="
                    text-sm
                    font-bold
                    text-slate-900
                    bg-white/60
                    px-3.5
                    py-1.5
                    rounded-full
                    shadow-sm
                  "
                >
                  {user.name ||
                    user.username ||
                    user.account ||
                    'User'}
                </span>


                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="
                    p-1.5
                    text-slate-700
                    hover:text-red-600
                    transition
                    cursor-pointer
                  "
                >

                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="
                        M17 16l4-4m0 0l-4-4m4 4H7
                        m6 4v1a3 3 0 01-3 3H6
                        a3 3 0 01-3-3V7
                        a3 3 0 013-3h4
                        a3 3 0 013 3v1
                      "
                    />

                  </svg>

                </button>

              </div>

            ) : (

              // =============================================
              // CHƯA ĐĂNG NHẬP
              // =============================================
              <>

                <Link
                  to="/login"
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                    hover:text-white
                    px-3
                    py-1.5
                    rounded-lg
                    transition
                    cursor-pointer
                  "
                >
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  className="
                    text-sm
                    font-bold
                    bg-chip-yellow
                    text-slate-900
                    px-4
                    py-1.5
                    rounded-full
                    hover:bg-yellow-200
                    shadow-sm
                    transition
                    cursor-pointer
                  "
                >
                  Đăng ký
                </Link>

              </>

            )}

          </div>

        </div>

      </div>

    </header>
  );
}