import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  Loader2,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Calendar,
  Layers,
  ShoppingBag
} from 'lucide-react';

export default function AdminProduct() {
  const API_URL = import.meta.env.VITE_API_URL;

  const fileInputRef = useRef(null);

  // =========================================================
  // SIDEBAR
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================================================
  // PRODUCT
  // =========================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // =========================================================
  // MODAL
  // =========================================================

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // IMAGE
  // =========================================================

  const [imagePreview, setImagePreview] = useState('');

  // =========================================================
  // ALBUM SEARCH
  // =========================================================

  const [albumSearch, setAlbumSearch] = useState('');
  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [showAlbumList, setShowAlbumList] = useState(false);

  // =========================================================
  // PAGINATION
  // =========================================================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    {
      value: 'album',
      label: 'Album'
    },
    {
      value: 'photocard',
      label: 'Photocard'
    },
    {
      value: 'md_event',
      label: 'MD / Event'
    },
    {
      value: 'lightstick',
      label: 'Lightstick'
    }
  ];

  // =========================================================
  // EMPTY FORM
  // =========================================================

  const emptyForm = {
    category: 'album',

    album_id: '',
    album_name: '',

    title: '',
    version_name: '',

    price: '',

    is_preorder: false,

    release_date: '',

    description: '',

    image: null
  };

  const [form, setForm] = useState(emptyForm);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (categoryFilter) {
        params.category = categoryFilter;
      }

      const res = await axios.get(
        `${API_URL}/products`,
        {
          params
        }
      );

      setProducts(
        res.data.products || []
      );

      setCurrentPage(1);

    } catch (err) {
      console.error(
        'Lỗi lấy sản phẩm:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Không thể lấy danh sách sản phẩm!'
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEARCH PRODUCT
  //
  // Không gọi API ngay từng phím.
  // Chờ 500ms sau khi người dùng ngừng nhập.
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    search,
    categoryFilter
  ]);

  // =========================================================
  // FETCH ALBUMS
  // =========================================================

  const fetchAlbums = async (
    keyword = ''
  ) => {
    try {
      setLoadingAlbums(true);

      const params = {};

      if (keyword.trim()) {
        params.search = keyword.trim();
      }

      const res = await axios.get(
        `${API_URL}/products/albums`,
        {
          params
        }
      );

      setAlbums(
        res.data.albums || []
      );

    } catch (err) {
      console.error(
        'Lỗi lấy album:',
        err
      );

    } finally {
      setLoadingAlbums(false);
    }
  };

  // =========================================================
  // SEARCH ALBUM
  //
  // Chỉ search khi đang mở modal
  // và category là album.
  // =========================================================

  useEffect(() => {
    if (
      !showModal ||
      form.category !== 'album'
    ) {
      return;
    }

    const timer = setTimeout(() => {
      fetchAlbums(albumSearch);
    }, 500);

    return () => {
      clearTimeout(timer);
    };

  }, [
    albumSearch,
    showModal,
    form.category
  ]);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      ...emptyForm
    });

    setEditingId(null);

    setImagePreview('');

    setAlbumSearch('');

    setAlbums([]);

    setShowAlbumList(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = () => {
    resetForm();

    setShowModal(true);

    fetchAlbums('');
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = async (
    product
  ) => {
    try {
      setEditingId(product.id);

      setForm({
        category:
          product.category || 'album',

        album_id:
          product.album_id || '',

        album_name:
          product.album_name || '',

        title:
          product.title || '',

        version_name:
          product.version_name || '',

        price:
          product.price ?? '',

        is_preorder:
          Boolean(product.is_preorder),

        release_date:
          product.release_date
            ? String(
                product.release_date
              ).slice(0, 10)
            : '',

        description:
          product.description || '',

        image: null
      });

      setImagePreview(
        product.image_url || ''
      );

      setAlbumSearch(
        product.album_name || ''
      );

      setShowAlbumList(false);

      setShowModal(true);

      if (
        product.category === 'album'
      ) {
        await fetchAlbums(
          product.album_name || ''
        );
      }

    } catch (err) {
      console.error(
        'Lỗi mở sản phẩm:',
        err
      );
    }
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    resetForm();
  };

  // =========================================================
  // CHANGE FORM
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value
    }));
  };

  // =========================================================
  // CHANGE CATEGORY
  // =========================================================

  const handleCategoryChange = (
    e
  ) => {
    const category =
      e.target.value;

    setForm((prev) => ({
      ...prev,

      category,

      // Nếu không phải album
      // thì xóa album + version
      album_id:
        category === 'album'
          ? prev.album_id
          : '',

      album_name:
        category === 'album'
          ? prev.album_name
          : '',

      version_name:
        category === 'album'
          ? prev.version_name
          : ''
    }));

    setAlbumSearch('');

    setShowAlbumList(false);

    if (category === 'album') {
      fetchAlbums('');
    }
  };

  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  const handleImageChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        'Chỉ được chọn ảnh JPG, JPEG, PNG hoặc WEBP!'
      );

      e.target.value = '';

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        'Ảnh không được vượt quá 5MB!'
      );

      e.target.value = '';

      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file
    }));

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // =========================================================
  // SELECT ALBUM
  // =========================================================

  const handleSelectAlbum = (
    album
  ) => {
    setForm((prev) => ({
      ...prev,

      album_id: album.id,

      album_name: album.name
    }));

    setAlbumSearch(
      `${album.name}${
        album.group_name
          ? ` - ${album.group_name}`
          : ''
      }`
    );

    setShowAlbumList(false);
  };

  // =========================================================
  // ADD / UPDATE PRODUCT
  // =========================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    // =====================================================
    // VALIDATE TITLE
    // =====================================================

    if (!form.title.trim()) {
      alert(
        'Vui lòng nhập tên sản phẩm!'
      );

      return;
    }

    // =====================================================
    // VALIDATE PRICE
    // =====================================================

    const price =
      Number(form.price);

    if (
      form.price === '' ||
      isNaN(price) ||
      price < 0
    ) {
      alert(
        'Giá bán không hợp lệ!'
      );

      return;
    }

    // =====================================================
    // ALBUM VALIDATION
    // =====================================================

    if (
      form.category === 'album'
    ) {
      if (
        !form.album_id
      ) {
        alert(
          'Vui lòng chọn album!'
        );

        return;
      }

      if (
        !form.version_name.trim()
      ) {
        alert(
          'Vui lòng nhập tên version!'
        );

        return;
      }
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        'category',
        form.category
      );

      formData.append(
        'title',
        form.title.trim()
      );

      formData.append(
        'price',
        price
      );

      formData.append(
        'is_preorder',
        form.is_preorder
          ? '1'
          : '0'
      );

      if (
        form.category === 'album'
      ) {
        formData.append(
          'album_id',
          form.album_id
        );

        formData.append(
          'version_name',
          form.version_name.trim()
        );
      }

      if (
        form.release_date
      ) {
        formData.append(
          'release_date',
          form.release_date
        );
      }

      if (
        form.description.trim()
      ) {
        formData.append(
          'description',
          form.description.trim()
        );
      }

      if (form.image) {
        formData.append(
          'image',
          form.image
        );
      }

      let res;

      // ===================================================
      // UPDATE
      // ===================================================

      if (editingId) {
        res = await axios.put(
          `${API_URL}/products/${editingId}`,
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data'
            }
          }
        );

      } else {

        // =================================================
        // CREATE
        // =================================================

        res = await axios.post(
          `${API_URL}/products`,
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data'
            }
          }
        );
      }

      alert(
        res.data.message ||
        (
          editingId
            ? 'Cập nhật sản phẩm thành công!'
            : 'Thêm sản phẩm thành công!'
        )
      );

      setShowModal(false);

      resetForm();

      await fetchProducts();

    } catch (err) {
      console.error(
        'Lỗi lưu sản phẩm:',
        err
      );

      alert(
        err.response?.data?.message ||
        'Không thể lưu sản phẩm!'
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDelete = async (
    product
  ) => {
    const confirmed =
      window.confirm(
        `Bạn có chắc muốn xóa sản phẩm "${product.title}" không?`
      );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/products/${product.id}`
      );

      alert(
        'Xóa sản phẩm thành công!'
      );

      await fetchProducts();

    } catch (err) {
      console.error(
        'Lỗi xóa sản phẩm:',
        err
      );

      alert(
        err.response?.data?.message ||
        'Không thể xóa sản phẩm!'
      );
    }
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      'vi-VN'
    ) + 'đ';
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      isNaN(date.getTime())
    ) {
      return value;
    }

    return date.toLocaleDateString(
      'vi-VN'
    );
  };

  // =========================================================
  // CATEGORY LABEL
  // =========================================================

  const getCategoryLabel = (
    category
  ) => {
    const found =
      categories.find(
        (item) =>
          item.value === category
      );

    return (
      found?.label ||
      category
    );
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Math.ceil(
      products.length /
        itemsPerPage
    );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const currentProducts =
    products.slice(
      startIndex,
      startIndex +
        itemsPerPage
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex">

        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={
            setSidebarOpen
          }
        />

        <main className="flex-1 lg:ml-64 flex items-center justify-center">

          <div className="text-center">

            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />

            <p className="text-sm text-slate-500">
              Đang tải sản phẩm...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={
          setSidebarOpen
        }
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="flex-1 lg:ml-64 min-w-0">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">

          <div>

            <h1 className="text-xl font-black text-slate-900">
              Quản lý sản phẩm
            </h1>

            <p className="text-xs text-slate-500">
              Quản lý album, photocard, MD và lightstick
            </p>

          </div>

          <button
            onClick={
              openAddModal
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition"
          >
            <Plus className="w-4 h-4" />

            Thêm sản phẩm
          </button>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-4 sm:p-6 lg:p-8">

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-red-600">

              <div className="flex items-center gap-3">

                <AlertCircle className="w-5 h-5 shrink-0" />

                <span className="text-sm font-medium">
                  {error}
                </span>

              </div>

              <button
                onClick={
                  fetchProducts
                }
                className="text-xs font-bold hover:underline"
              >
                Thử lại
              </button>

            </div>
          )}

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">

            <div className="flex flex-col lg:flex-row gap-3">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm sản phẩm, version, album hoặc nhóm..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                />

              </div>

              {/* CATEGORY */}

              <select
                value={
                  categoryFilter
                }
                onChange={(e) => {
                  setCategoryFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                className="lg:w-52 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm font-medium text-slate-700"
              >

                <option value="">
                  Tất cả danh mục
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.value
                      }
                      value={
                        category.value
                      }
                    >
                      {
                        category.label
                      }
                    </option>
                  )
                )}

              </select>

              {/* REFRESH */}

              <button
                onClick={
                  fetchProducts
                }
                className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-sky-500 transition"
                title="Làm mới"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

            </div>

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <div className="bg-white rounded-2xl border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">

                  <Package className="w-5 h-5 text-sky-500" />

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Sản phẩm
                  </p>

                  <p className="text-xl font-black text-slate-900">
                    {
                      products.length
                    }
                  </p>

                </div>

              </div>

            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">

                  <Layers className="w-5 h-5 text-purple-500" />

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Album
                  </p>

                  <p className="text-xl font-black text-slate-900">
                    {
                      products.filter(
                        (p) =>
                          p.category ===
                          'album'
                      ).length
                    }
                  </p>

                </div>

              </div>

            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">

                  <ShoppingBag className="w-5 h-5 text-pink-500" />

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Photocard
                  </p>

                  <p className="text-xl font-black text-slate-900">
                    {
                      products.filter(
                        (p) =>
                          p.category ===
                          'photocard'
                      ).length
                    }
                  </p>

                </div>

              </div>

            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">

                  <Package className="w-5 h-5 text-amber-500" />

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Tồn kho
                  </p>

                  <p className="text-xl font-black text-slate-900">
                    {products.reduce(
                      (
                        total,
                        product
                      ) =>
                        total +
                        Number(
                          product.stock ||
                            0
                        ),
                      0
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              PRODUCT TABLE
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="font-bold text-slate-900">
                  Danh sách sản phẩm
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {
                    products.length
                  } sản phẩm
                </p>

              </div>

            </div>

            {products.length === 0 ? (

              <div className="py-20 text-center">

                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />

                <p className="font-bold text-slate-500">
                  Không có sản phẩm
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Thử thay đổi từ khóa hoặc bộ lọc
                </p>

              </div>

            ) : (

              <>

                {/* TABLE DESKTOP */}

                <div className="hidden lg:block overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="bg-slate-50 border-b border-slate-100">

                        <th className="text-left px-5 py-4 text-xs font-bold text-slate-500">
                          Sản phẩm
                        </th>

                        <th className="text-left px-5 py-4 text-xs font-bold text-slate-500">
                          Danh mục
                        </th>

                        <th className="text-left px-5 py-4 text-xs font-bold text-slate-500">
                          Album / Version
                        </th>

                        <th className="text-right px-5 py-4 text-xs font-bold text-slate-500">
                          Giá
                        </th>

                        <th className="text-center px-5 py-4 text-xs font-bold text-slate-500">
                          Tồn kho
                        </th>

                        <th className="text-right px-5 py-4 text-xs font-bold text-slate-500">
                          Thao tác
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {currentProducts.map(
                        (product) => (

                          <tr
                            key={
                              product.id
                            }
                            className="hover:bg-slate-50 transition"
                          >

                            {/* PRODUCT */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3 min-w-[280px]">

                                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">

                                  {product.image_url ? (

                                    <img
                                      src={
                                        product.image_url
                                      }
                                      alt={
                                        product.title
                                      }
                                      className="w-full h-full object-cover"
                                    />

                                  ) : (

                                    <Package className="w-6 h-6 text-slate-300" />

                                  )}

                                </div>

                                <div className="min-w-0">

                                  <p className="font-bold text-slate-900 truncate max-w-[250px]">
                                    {
                                      product.title
                                    }
                                  </p>

                                  <p className="text-xs text-slate-400 mt-1">
                                    #{product.id}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* CATEGORY */}

                            <td className="px-5 py-4">

                              <span className="inline-flex px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold">
                                {
                                  getCategoryLabel(
                                    product.category
                                  )
                                }
                              </span>

                            </td>

                            {/* ALBUM / VERSION */}

                            <td className="px-5 py-4">

                              {product.category ===
                              'album' ? (

                                <div>

                                  <p className="text-sm font-semibold text-slate-700">
                                    {
                                      product.album_name ||
                                      '—'
                                    }
                                  </p>

                                  <p className="text-xs text-slate-400 mt-1">
                                    {
                                      product.version_name ||
                                      '—'
                                    }
                                  </p>

                                </div>

                              ) : (

                                <span className="text-sm text-slate-400">
                                  Không thuộc album
                                </span>

                              )}

                            </td>

                            {/* PRICE */}

                            <td className="px-5 py-4 text-right">

                              <p className="font-bold text-slate-900 whitespace-nowrap">
                                {formatMoney(
                                  product.price
                                )}
                              </p>

                            </td>

                            {/* STOCK */}

                            <td className="px-5 py-4 text-center">

                              <span
                                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  Number(
                                    product.stock
                                  ) > 0
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-red-50 text-red-500'
                                }`}
                              >
                                {
                                  product.stock ||
                                  0
                                }
                              </span>

                            </td>

                            {/* ACTION */}

                            <td className="px-5 py-4">

                              <div className="flex justify-end gap-2">

                                <button
                                  onClick={() =>
                                    openEditModal(
                                      product
                                    )
                                  }
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sky-500 hover:bg-sky-50 transition"
                                  title="Sửa"
                                >

                                  <Pencil className="w-4 h-4" />

                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      product
                                    )
                                  }
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition"
                                  title="Xóa"
                                >

                                  <Trash2 className="w-4 h-4" />

                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {/* =================================================
                    MOBILE
                ================================================= */}

                <div className="lg:hidden divide-y divide-slate-100">

                  {currentProducts.map(
                    (product) => (

                      <div
                        key={
                          product.id
                        }
                        className="p-4"
                      >

                        <div className="flex gap-3">

                          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">

                            {product.image_url ? (

                              <img
                                src={
                                  product.image_url
                                }
                                alt={
                                  product.title
                                }
                                className="w-full h-full object-cover"
                              />

                            ) : (

                              <Package className="w-6 h-6 text-slate-300" />

                            )}

                          </div>

                          <div className="flex-1 min-w-0">

                            <div className="flex justify-between gap-3">

                              <h3 className="font-bold text-slate-900">
                                {
                                  product.title
                                }
                              </h3>

                              <span className="text-xs text-slate-400">
                                #{product.id}
                              </span>

                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">

                              <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-600 text-[11px] font-bold">
                                {
                                  getCategoryLabel(
                                    product.category
                                  )
                                }
                              </span>

                              {product.category ===
                                'album' &&
                                product.version_name && (

                                  <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-semibold">
                                    {
                                      product.version_name
                                    }
                                  </span>

                                )}

                            </div>

                            {product.category ===
                              'album' && (

                              <p className="text-xs text-slate-400 mt-2">
                                {
                                  product.album_name ||
                                  '—'
                                }
                              </p>

                            )}

                            <div className="flex items-center justify-between mt-3">

                              <p className="font-bold text-slate-900">
                                {formatMoney(
                                  product.price
                                )}
                              </p>

                              <span
                                className={`text-xs font-bold ${
                                  Number(
                                    product.stock
                                  ) > 0
                                    ? 'text-emerald-600'
                                    : 'text-red-500'
                                }`}
                              >
                                Tồn: {
                                  product.stock ||
                                  0
                                }
                              </span>

                            </div>

                          </div>

                        </div>

                        <div className="flex justify-end gap-2 mt-4">

                          <button
                            onClick={() =>
                              openEditModal(
                                product
                              )
                            }
                            className="px-3 py-2 rounded-xl bg-sky-50 text-sky-600 text-xs font-bold flex items-center gap-2"
                          >

                            <Pencil className="w-3.5 h-3.5" />

                            Sửa

                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                            className="px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-bold flex items-center gap-2"
                          >

                            <Trash2 className="w-3.5 h-3.5" />

                            Xóa

                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </>

            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {totalPages > 1 && (

              <div className="p-4 border-t border-slate-100 flex items-center justify-between">

                <p className="text-xs text-slate-500">

                  Hiển thị{' '}

                  <span className="font-bold text-slate-700">
                    {startIndex + 1}
                  </span>

                  {' – '}

                  <span className="font-bold text-slate-700">
                    {Math.min(
                      startIndex +
                        itemsPerPage,
                      products.length
                    )}
                  </span>

                  {' / '}

                  <span className="font-bold text-slate-700">
                    {
                      products.length
                    }
                  </span>

                </p>

                <div className="flex items-center gap-2">

                  <button
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page - 1
                      )
                    }
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50"
                  >

                    <ChevronLeft className="w-4 h-4" />

                  </button>

                  <span className="text-xs font-bold text-slate-600 px-2">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page + 1
                      )
                    }
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50"
                  >

                    <ChevronRight className="w-4 h-4" />

                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </main>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* OVERLAY */}

          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />

          {/* MODAL */}

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col">

            {/* HEADER */}

            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">

              <div>

                <h2 className="text-lg font-black text-slate-900">

                  {editingId
                    ? 'Chỉnh sửa sản phẩm'
                    : 'Thêm sản phẩm'}

                </h2>

                <p className="text-xs text-slate-500 mt-1">

                  {editingId
                    ? 'Cập nhật thông tin sản phẩm'
                    : 'Tạo sản phẩm mới'}

                </p>

              </div>

              <button
                onClick={
                  closeModal
                }
                disabled={saving}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-500 disabled:opacity-50"
              >

                <X className="w-5 h-5" />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="p-6 space-y-5 overflow-y-auto"
            >

              {/* =================================================
                  CATEGORY
              ================================================= */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Danh mục
                  <span className="text-red-500">
                    {' '}*
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                  {categories.map(
                    (category) => (

                      <button
                        key={
                          category.value
                        }
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          setForm(
                            (prev) => ({
                              ...prev,

                              category:
                                category.value,

                              album_id:
                                category.value ===
                                'album'
                                  ? prev.album_id
                                  : '',

                              album_name:
                                category.value ===
                                'album'
                                  ? prev.album_name
                                  : '',

                              version_name:
                                category.value ===
                                'album'
                                  ? prev.version_name
                                  : ''
                            })
                          )
                        }
                        className={`px-3 py-3 rounded-xl border text-xs font-bold transition ${
                          form.category ===
                          category.value
                            ? 'border-sky-400 bg-sky-50 text-sky-600'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >

                        {
                          category.label
                        }

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* =================================================
                  ALBUM
              ================================================= */}

              {form.category ===
                'album' && (

                <div>

                  <label className="block text-sm font-bold text-slate-700 mb-2">

                    Album

                    <span className="text-red-500">
                      {' '}*
                    </span>

                  </label>

                  {/* SEARCH ALBUM */}

                  <div className="relative">

                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="text"
                      value={
                        albumSearch
                      }
                      onFocus={() =>
                        setShowAlbumList(
                          true
                        )
                      }
                      onChange={(e) => {

                        setAlbumSearch(
                          e.target.value
                        );

                        setForm(
                          (prev) => ({
                            ...prev,

                            album_id: '',

                            album_name: ''
                          })
                        );

                        setShowAlbumList(
                          true
                        );

                      }}
                      placeholder="Nhập tên album hoặc tên nhóm để tìm..."
                      disabled={saving}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                    />

                  </div>

                  {/* SELECTED ALBUM */}

                  {form.album_id && (

                    <div className="mt-2 px-4 py-3 rounded-xl bg-sky-50 border border-sky-100">

                      <p className="text-xs text-sky-500 font-bold">
                        Album đã chọn
                      </p>

                      <p className="text-sm font-bold text-sky-700 mt-1">
                        {
                          form.album_name
                        }
                      </p>

                    </div>

                  )}

                  {/* ALBUM LIST */}

                  {showAlbumList && (

                    <div className="mt-2 border border-slate-200 rounded-xl bg-white shadow-lg max-h-56 overflow-y-auto">

                      {loadingAlbums ? (

                        <div className="p-5 text-center">

                          <Loader2 className="w-5 h-5 animate-spin text-sky-500 mx-auto" />

                          <p className="text-xs text-slate-400 mt-2">
                            Đang tìm album...
                          </p>

                        </div>

                      ) : albums.length ===
                        0 ? (

                        <div className="p-5 text-center">

                          <Package className="w-7 h-7 text-slate-300 mx-auto mb-2" />

                          <p className="text-xs text-slate-400">
                            Không tìm thấy album
                          </p>

                        </div>

                      ) : (

                        albums.map(
                          (album) => (

                            <button
                              key={
                                album.id
                              }
                              type="button"
                              onClick={() =>
                                handleSelectAlbum(
                                  album
                                )
                              }
                              className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b border-slate-50 last:border-0 transition"
                            >

                              <p className="text-sm font-bold text-slate-800">
                                {
                                  album.name
                                }
                              </p>

                              {album.group_name && (

                                <p className="text-xs text-slate-400 mt-1">
                                  {
                                    album.group_name
                                  }
                                </p>

                              )}

                            </button>

                          )
                        )

                      )}

                    </div>

                  )}

                </div>

              )}

              {/* =================================================
                  VERSION
              ================================================= */}

              {form.category ===
                'album' && (

                <div>

                  <label className="block text-sm font-bold text-slate-700 mb-1.5">

                    Version

                    <span className="text-red-500">
                      {' '}*
                    </span>

                  </label>

                  <input
                    type="text"
                    name="version_name"
                    value={
                      form.version_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ví dụ: Photobook Ver., Digipack Ver."
                    disabled={saving}
                    maxLength={150}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                  />

                  <p className="text-xs text-slate-400 mt-1.5">
                    Mỗi version là một sản phẩm riêng của album.
                  </p>

                </div>

              )}

              {/* =================================================
                  PRODUCT NAME
              ================================================= */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-1.5">

                  Tên sản phẩm

                  <span className="text-red-500">
                    {' '}*
                  </span>

                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder={
                    form.category ===
                    'photocard'
                      ? 'Ví dụ: RIIZE Wonbin Photocard'
                      : form.category ===
                        'md_event'
                      ? 'Ví dụ: SMTOWN MD 2026'
                      : 'Tên sản phẩm'
                  }
                  disabled={saving}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                />

              </div>

              {/* =================================================
                  PRICE
              ================================================= */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-1.5">

                  Giá bán

                  <span className="text-red-500">
                    {' '}*
                  </span>

                </label>

                <div className="relative">

                  <input
                    type="number"
                    name="price"
                    value={
                      form.price
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="1000"
                    placeholder="0"
                    disabled={saving}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </span>

                </div>

              </div>

              {/* =================================================
                  IMAGE
              ================================================= */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Ảnh sản phẩm
                </label>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

                <div className="flex items-start gap-4">

                  {/* PREVIEW */}

                  <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">

                    {imagePreview ? (

                      <img
                        src={
                          imagePreview
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="text-center">

                        <ImagePlus className="w-8 h-8 text-slate-300 mx-auto mb-1" />

                        <p className="text-[11px] text-slate-400">
                          Chưa có ảnh
                        </p>

                      </div>

                    )}

                  </div>

                  {/* BUTTON */}

                  <div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                    >

                      <span className="flex items-center gap-2">

                        <ImagePlus className="w-4 h-4 text-sky-500" />

                        Chọn ảnh

                      </span>

                    </button>

                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      JPG, PNG hoặc WEBP
                      <br />
                      Tối đa 5MB
                    </p>

                    {form.image && (

                      <p className="text-xs text-sky-600 font-semibold mt-2 max-w-[250px] truncate">
                        {
                          form.image.name
                        }
                      </p>

                    )}

                  </div>

                </div>

              </div>

              {/* =================================================
                  PREORDER
              ================================================= */}

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">

                <div>

                  <p className="text-sm font-bold text-slate-700">
                    Sản phẩm Pre-order
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Đánh dấu nếu sản phẩm đang nhận đặt trước.
                  </p>

                </div>

                <label className="relative inline-flex items-center cursor-pointer">

                  <input
                    type="checkbox"
                    name="is_preorder"
                    checked={
                      form.is_preorder
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    className="sr-only peer"
                  />

                  <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-sky-500 transition" />

                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5" />

                </label>

              </div>

              {/* =================================================
                  RELEASE DATE
              ================================================= */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Ngày phát hành
                </label>

                <div className="relative">

                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="date"
                    name="release_date"
                    value={
                      form.release_date
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                  />

                </div>

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Mô tả
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Mô tả sản phẩm..."
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                />

              </div>

              {/* =================================================
                  BUTTON
              ================================================= */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    closeModal
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 disabled:opacity-60 flex items-center gap-2"
                >

                  {saving ? (

                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />

                      Đang lưu...

                    </>

                  ) : (

                    <>
                      {editingId ? (
                        <Pencil className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}

                      {editingId
                        ? 'Cập nhật'
                        : 'Thêm sản phẩm'}

                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}