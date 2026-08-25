import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Hàm đọc user từ LocalStorage
  const checkUserStatus = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // 1. Lấy thông tin User khi nạp trang
    checkUserStatus();

    // 2. Lắng nghe sự kiện khi đăng nhập/đăng xuất ở trang khác
    window.addEventListener('storage', checkUserStatus);

    // 3. Gọi API lấy giỏ hàng
    const fetchCartData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartCount(response.data?.totalItems || 0);
      } catch (error) {
        console.error('Lỗi lấy giỏ hàng:', error);
      }
    };

    fetchCartData();

    return () => {
      window.removeEventListener('storage', checkUserStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-chip-blue shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 cursor-pointer">
          <h1 className="text-2xl font-black tracking-wider text-slate-900">
            CHIPCHIP<span className="text-white">HOUSE</span>
          </h1>
        </Link>

        {/* Ô Tìm kiếm */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Tìm Album, Photocard, Lightstick..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-sm text-slate-800 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-chip-yellow shadow-inner"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Giỏ hàng + Cụm Tài khoản */}
        <div className="flex items-center space-x-3">
          
          <Link to="/cart" className="relative bg-white p-2.5 rounded-full shadow hover:bg-chip-yellow transition cursor-pointer flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </Link>

          {/* VÙNG THAY ĐỔI: ĐÃ ĐĂNG NHẬP VS CHƯA ĐĂNG NHẬP */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-300">
            {user ? (
              /* Đã đăng nhập -> Đổi nút thành tên User + Nút Đăng xuất */
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 bg-white/60 px-3.5 py-1.5 rounded-full shadow-sm">
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1.5 text-slate-700 hover:text-red-600 transition cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Chưa đăng nhập -> Hiện cụm Đăng nhập / Đăng ký */
              <>
                <Link 
                  to="/login" 
                  className="text-sm font-bold text-slate-800 hover:text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm font-bold bg-chip-yellow text-slate-900 px-4 py-1.5 rounded-full hover:bg-yellow-200 shadow-sm transition cursor-pointer"
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