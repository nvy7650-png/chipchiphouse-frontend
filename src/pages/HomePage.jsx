import React from 'react';
import Navbar from '../components/Navbar';

export default function HomePage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        {/* NAVBAR */}
        <Navbar />

        {/* BANNER */}
        <section className="bg-gradient-to-r from-chip-blue via-sky-100 to-chip-yellow py-12 px-4 text-center border-b-4 border-white shadow-inner">
          <div className="max-w-3xl mx-auto">
            <span className="bg-white text-slate-800 text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm tracking-wider">
              ✨ Official Store ✨
            </span>

            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-3 drop-shadow-sm">
              Kpop Album & Unofficial Merch
            </h2>

            <p className="text-base md:text-lg text-slate-700 font-medium max-w-xl mx-auto">
              Săn Photocard hiếm, Order Album chốt SOTY và Lightstick chính hãng
              giá tốt nhất tại CHIPCHIP HOUSE!
            </p>
          </div>
        </section>

        {/* TẠM THỜI CHƯA CÓ SẢN PHẨM */}
        <main className="container mx-auto py-10 px-4">
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-slate-500 font-medium">
              Sản phẩm đang được cập nhật...
            </p>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t-4 border-chip-blue">
        <p className="font-bold text-slate-200">
          🏠 CHIPCHIP HOUSE - Kpop Album & Goods Store
        </p>

        <p className="text-xs mt-1 text-slate-500">
          © 2026 All rights reserved. Designed for Kpop Fans.
        </p>
      </footer>
    </div>
  );
}