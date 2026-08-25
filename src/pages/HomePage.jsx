import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Lỗi lấy danh sách sản phẩm:', err));
  }, []);

  // Lọc sản phẩm theo Tab
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        {/* 1. THANH NAVBAR */}
        <Navbar />

        {/* 2. BANNER */}
        <section className="bg-gradient-to-r from-chip-blue via-sky-100 to-chip-yellow py-12 px-4 text-center border-b-4 border-white shadow-inner">
          <div className="max-w-3xl mx-auto">
            <span className="bg-white text-slate-800 text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm tracking-wider">
              ✨ Official Store ✨
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-3 drop-shadow-sm">
              Kpop Album & Unofficial Merch
            </h2>
            <p className="text-base md:text-lg text-slate-700 font-medium max-w-xl mx-auto">
              Săn Photocard hiếm, Order Album chốt SOTY và Lightstick chính hãng giá tốt nhất tại CHIPCHIP HOUSE!
            </p>
          </div>
        </section>

        {/* 3. DANH SÁCH SẢN PHẨM */}
        <main className="container mx-auto py-10 px-4">
          
          {/* Header danh mục & Filter Tab */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="text-2xl font-black text-slate-900 border-l-4 border-chip-blue pl-3">
              🔥 Sản Phẩm Nổi Bật
            </h3>

            {/* Tab lọc nhanh */}
            <div className="flex space-x-2 bg-slate-200 p-1 rounded-xl text-xs font-bold">
              {['all', 'album', 'card', 'goods'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'all' ? 'Tất cả' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Lưới sản phẩm */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-slate-500 font-medium">Chưa có sản phẩm nào trong danh mục này...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col justify-between group"
                >
                  {/* Khung ảnh sản phẩm */}
                  <div className="relative overflow-hidden bg-slate-100">
                    <img 
                      src={item.image_url || 'https://via.placeholder.com/300'} 
                      alt={item.title} 
                      className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.is_preorder === 1 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow">
                        Pre-Order
                      </span>
                    )}
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase bg-chip-blue text-slate-800 px-2.5 py-1 rounded-md tracking-wider">
                        {item.group_name || item.category || 'Kpop'}
                      </span>
                      <h4 className="font-bold text-base text-slate-900 mt-2.5 line-clamp-2 group-hover:text-sky-600 transition">
                        {item.title}
                      </h4>
                    </div>
                    
                    {/* Giá tiền & Nút Mua */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Giá chỉ từ</p>
                        <span className="text-red-500 font-black text-lg">
                          {Number(item.price || item.min_price || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <button className="bg-chip-yellow hover:bg-yellow-300 text-slate-900 font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition transform active:scale-95 cursor-pointer">
                        + Thêm giỏ
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t-4 border-chip-blue">
        <p className="font-bold text-slate-200">🏠 CHIPCHIP HOUSE - Kpop Album & Goods Store</p>
        <p className="text-xs mt-1 text-slate-500">© 2026 All rights reserved. Designed for Kpop Fans.</p>
      </footer>
    </div>
  );
}