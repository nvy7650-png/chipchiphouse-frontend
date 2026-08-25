import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

import {
  ArrowLeft,
  Package,
  Layers,
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export default function GroupDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [group, setGroup] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {

    if (!id) {
      setError('Không xác định được nhóm nhạc!');
      setLoading(false);
      return;
    }

    const fetchGroupDetail = async () => {

      try {

        setLoading(true);
        setError('');

        console.log('Group ID:', id);

        const res = await axios.get(
          `${API_URL}/groups/${id}/products`
        );

        console.log('Group detail:', res.data);

        setGroup(res.data.group);
        setProducts(res.data.products || []);

      } catch (err) {

        console.error(
          'Lỗi lấy chi tiết nhóm:',
          err
        );

        setError(
          err.response?.data?.message ||
          'Không thể lấy thông tin nhóm nhạc!'
        );

      } finally {

        setLoading(false);

      }

    };

    fetchGroupDetail();

  }, [id]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('vi-VN') + ' ₫';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex">

        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 lg:ml-64 flex items-center justify-center">

          <div className="text-center">

            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />

            <p className="text-sm text-slate-500">
              Đang tải thông tin nhóm...
            </p>

          </div>

        </main>

      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex">

        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 lg:ml-64 p-6 lg:p-8">

          <button
            onClick={() => navigate('/admin/groups')}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-sky-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại nhóm nhạc
          </button>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-600">

            <AlertCircle className="w-5 h-5" />

            <span>{error}</span>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 lg:ml-64 min-w-0">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center">

          <button
            onClick={() => navigate('/admin/groups')}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-sky-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

        </header>

        <div className="p-4 sm:p-6 lg:p-8">

          {/* GROUP HEADER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Nhóm nhạc
            </p>

            <h1 className="text-3xl font-black text-slate-900 mt-1">
              {group?.name}
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              {products.length} album
            </p>

          </div>

          {/* ALBUM */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-slate-100">

              <h2 className="font-bold text-slate-900">
                Album
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Mỗi album có thể có nhiều version sản phẩm
              </p>

            </div>

            {products.length === 0 ? (

              <div className="py-16 text-center">

                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />

                <p className="font-bold text-slate-500">
                  Chưa có album
                </p>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {products.map((product) => (

                  <div
                    key={product.id}
                    onClick={() =>
                      navigate(`/admin/products/${product.id}`)
                    }
                    className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">

                        {product.image_url ? (

                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <Package className="w-8 h-8 text-slate-300" />

                        )}

                      </div>

                      <div>

                        <h3 className="font-bold text-slate-900">
                          {product.title}
                        </h3>

                        <div className="flex flex-wrap gap-3 mt-2">

                          <span className="flex items-center gap-1 text-xs font-semibold text-sky-600">

                            <Layers className="w-3.5 h-3.5" />

                            {product.version_count || 0} version

                          </span>

                          <span className="text-xs text-slate-500">
                            Tồn kho: {product.total_stock || 0}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center gap-4">

                      <div className="hidden sm:block text-right">

                        <p className="text-xs text-slate-400">
                          Giá
                        </p>

                        <p className="font-bold text-slate-800">
                          {formatPrice(product.min_price)}
                        </p>

                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-400" />

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}