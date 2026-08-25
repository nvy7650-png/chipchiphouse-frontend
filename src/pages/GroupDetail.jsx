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
  const { id, groupId } = useParams();
  const navigate = useNavigate();

  // Hỗ trợ cả /admin/groups/:id và /admin/groups/:groupId
  const currentGroupId = id || groupId;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [group, setGroup] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // =====================================================
  // LẤY CHI TIẾT NHÓM
  // =====================================================

  useEffect(() => {
    if (!currentGroupId) {
      console.error('Không có ID nhóm:', {
        id,
        groupId
      });

      setError('Không xác định được nhóm nhạc!');
      setLoading(false);
      return;
    }

    const fetchGroupDetail = async () => {
      try {
        setLoading(true);
        setError('');

        console.log(
          'Đang lấy thông tin nhóm:',
          currentGroupId
        );

        const res = await axios.get(
          `${API_URL}/groups/${currentGroupId}/products`
        );

        console.log(
          'Chi tiết nhóm:',
          res.data
        );

        if (!res.data?.success) {
          setError(
            res.data?.message ||
            'Không thể lấy thông tin nhóm nhạc!'
          );

          return;
        }

        setGroup(res.data.group || null);
        setProducts(res.data.products || []);

      } catch (err) {
        console.error(
          'Lỗi lấy chi tiết nhóm:',
          err
        );

        setGroup(null);
        setProducts([]);

        setError(
          err.response?.data?.message ||
          'Không thể lấy thông tin nhóm nhạc!'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetail();

  }, [currentGroupId, API_URL, id, groupId]);

  // =====================================================
  // FORMAT GIÁ
  // =====================================================

  const formatPrice = (price) => {
    return (
      Number(price || 0).toLocaleString('vi-VN') +
      ' ₫'
    );
  };

  // =====================================================
  // QUAY LẠI
  // =====================================================

  const handleBack = () => {
    navigate('/admin/groups');
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
                w-8 h-8
                text-sky-500
                animate-spin
                mx-auto
                mb-3
              "
            />

            <p className="text-sm text-slate-500">
              Đang tải thông tin nhóm...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex">

        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 lg:ml-64 min-w-0">

          <header
            className="
              h-16
              bg-white
              border-b border-slate-200
              px-4 sm:px-8
              flex items-center
            "
          >

            <button
              type="button"
              onClick={handleBack}
              className="
                flex
                items-center
                gap-2
                text-sm
                font-bold
                text-slate-600
                hover:text-sky-600
                transition
              "
            >
              <ArrowLeft className="w-4 h-4" />

              Quay lại nhóm nhạc
            </button>

          </header>

          <div className="p-4 sm:p-6 lg:p-8">

            <div
              className="
                bg-red-50
                border border-red-200
                rounded-2xl
                p-5
                flex
                items-center
                gap-3
                text-red-600
              "
            >

              <AlertCircle className="w-5 h-5 shrink-0" />

              <span className="font-medium">
                {error}
              </span>

            </div>

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

      {/* SIDEBAR */}

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* MAIN */}

      <main className="flex-1 lg:ml-64 min-w-0">

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            h-16
            bg-white
            border-b border-slate-200
            px-4 sm:px-8
            flex
            items-center
          "
        >

          <button
            type="button"
            onClick={handleBack}
            className="
              flex
              items-center
              gap-2
              text-sm
              font-bold
              text-slate-600
              hover:text-sky-600
              transition
            "
          >

            <ArrowLeft className="w-4 h-4" />

            Quay lại nhóm nhạc

          </button>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-4 sm:p-6 lg:p-8">

          {/* =================================================
              GROUP INFORMATION
          ================================================= */}

          <div
            className="
              bg-white
              rounded-2xl
              border border-slate-200
              shadow-sm
              p-6
              mb-6
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-sky-50
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >

                <Layers
                  className="
                    w-7
                    h-7
                    text-sky-500
                  "
                />

              </div>

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    font-bold
                    text-slate-400
                  "
                >
                  Nhóm nhạc
                </p>

                <h1
                  className="
                    text-2xl
                    sm:text-3xl
                    font-black
                    text-slate-900
                  "
                >
                  {group?.name || 'Không có tên'}
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  {products.length} album
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              ALBUM LIST
          ================================================= */}

          <div
            className="
              bg-white
              rounded-2xl
              border border-slate-200
              shadow-sm
              overflow-hidden
            "
          >

            {/* TITLE */}

            <div
              className="
                p-5
                border-b border-slate-100
              "
            >

              <h2 className="font-bold text-slate-900">
                Danh sách album
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Mỗi album có thể có nhiều version sản phẩm
              </p>

            </div>

            {/* =================================================
                KHÔNG CÓ ALBUM
            ================================================= */}

            {products.length === 0 ? (

              <div
                className="
                  py-16
                  text-center
                "
              >

                <Package
                  className="
                    w-10
                    h-10
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
                  Nhóm này chưa có album
                </p>

                <p
                  className="
                    text-xs
                    text-slate-400
                    mt-1
                  "
                >
                  Hãy thêm album trong phần quản lý sản phẩm
                </p>

              </div>

            ) : (

              /* =================================================
                 DANH SÁCH ALBUM
              ================================================= */

              <div className="divide-y divide-slate-100">

                {products.map((product) => (

                  <div
                    key={product.id}
                    onClick={() =>
                      navigate(
                        `/admin/products/${product.id}`
                      )
                    }
                    className="
                      p-5
                      flex
                      items-center
                      justify-between
                      gap-4
                      hover:bg-slate-50
                      cursor-pointer
                      transition
                    "
                  >

                    {/* LEFT */}

                    <div
                      className="
                        flex
                        items-center
                        gap-4
                        min-w-0
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

                        {product.image_url ? (

                          <img
                            src={product.image_url}
                            alt={product.title}
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

                      {/* INFORMATION */}

                      <div className="min-w-0">

                        <h3
                          className="
                            font-bold
                            text-slate-900
                            truncate
                          "
                        >
                          {product.title}
                        </h3>

                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-3
                            mt-2
                          "
                        >

                          {/* VERSION COUNT */}

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1
                              px-2.5
                              py-1
                              rounded-lg
                              bg-sky-50
                              text-sky-600
                              text-xs
                              font-semibold
                            "
                          >

                            <Layers
                              className="w-3.5 h-3.5"
                            />

                            {product.version_count || 0}
                            {' '}
                            version

                          </span>

                          {/* STOCK */}

                          <span
                            className="
                              text-xs
                              text-slate-500
                            "
                          >
                            Tồn kho:{' '}
                            {product.total_stock || 0}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div
                      className="
                        flex
                        items-center
                        gap-4
                        shrink-0
                      "
                    >

                      <div
                        className="
                          hidden
                          sm:block
                          text-right
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-400
                          "
                        >
                          Giá từ
                        </p>

                        <p
                          className="
                            font-bold
                            text-slate-800
                          "
                        >
                          {formatPrice(
                            product.min_price
                          )}
                        </p>

                      </div>

                      <ChevronRight
                        className="
                          w-5
                          h-5
                          text-slate-400
                        "
                      />

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