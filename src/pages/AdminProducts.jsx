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
  AlertCircle
} from 'lucide-react';

export default function AdminProducts() {
  const API_URL = import.meta.env.VITE_API_URL;

  const fileInputRef = useRef(null);

  // =========================================================
  // STATE
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [albums, setAlbums] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(false);

  const [error, setError] = useState('');

  // Search frontend - KHÔNG gọi API
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Album search frontend
  const [albumSearch, setAlbumSearch] = useState('');
  const [showAlbumList, setShowAlbumList] = useState(false);

  // Image
  const [imagePreview, setImagePreview] = useState('');

  // =========================================================
  // FORM
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
  // CATEGORY
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
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' ₫';
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) return '—';

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('vi-VN');
  };

  // =========================================================
  // LOAD PRODUCTS
  //
  // CHỈ GỌI API:
  // - Khi mở trang
  // - Sau khi thêm
  // - Sau khi sửa
  // - Sau khi xóa
  //
  // SEARCH KHÔNG GỌI API
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(
        `${API_URL}/products`
      );

      setProducts(
        res.data.products || []
      );

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
  // LOAD ALBUMS
  //
  // CHỈ LOAD 1 LẦN KHI MỞ MODAL
  // Sau đó tìm kiếm album ở FRONTEND
  // =========================================================

  const fetchAlbums = async () => {
    try {
      setLoadingAlbums(true);

      const res = await axios.get(
        `${API_URL}/products/albums`
      );

      setAlbums(
        res.data.albums || []
      );

    } catch (err) {
      console.error(
        'Lỗi lấy album:',
        err
      );

      setAlbums([]);

    } finally {
      setLoadingAlbums(false);
    }
  };

  // =========================================================
  // LOAD PRODUCTS KHI MỞ TRANG
  // =========================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // FILTER FRONTEND
  //
  // KHÔNG RELOAD
  // KHÔNG API
  // =========================================================

  const filteredProducts = products.filter(
    (product) => {

      const keyword =
        search
          .trim()
          .toLowerCase();

      const matchSearch =
        !keyword ||

        product.title
          ?.toLowerCase()
          .includes(keyword) ||

        product.version_name
          ?.toLowerCase()
          .includes(keyword) ||

        product.album_name
          ?.toLowerCase()
          .includes(keyword) ||

        product.group_name
          ?.toLowerCase()
          .includes(keyword);

      const matchCategory =
        !categoryFilter ||
        product.category === categoryFilter;

      return (
        matchSearch &&
        matchCategory
      );
    }
  );

  // =========================================================
  // FILTER ALBUM FRONTEND
  // =========================================================

  const filteredAlbums = albums.filter(
    (album) => {

      const keyword =
        albumSearch
          .trim()
          .toLowerCase();

      if (!keyword) {
        return true;
      }

      return (
        album.name
          ?.toLowerCase()
          .includes(keyword) ||

        album.group_name
          ?.toLowerCase()
          .includes(keyword)
      );
    }
  );

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {

    setForm({
      ...emptyForm
    });

    setEditingId(null);

    setAlbumSearch('');

    setShowAlbumList(false);

    setImagePreview('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = async () => {

    resetForm();

    setShowModal(true);

    // Chỉ lấy album một lần
    if (albums.length === 0) {
      await fetchAlbums();
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
  // FORM CHANGE
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
  // CATEGORY CHANGE
  // =========================================================

  const handleCategoryChange = (e) => {

    const category =
      e.target.value;

    setForm((prev) => ({
      ...prev,

      category,

      // Sản phẩm không phải album
      // thì không có album + version
      ...(category !== 'album'
        ? {
            album_id: '',
            album_name: '',
            version_name: ''
          }
        : {})
    }));

    setAlbumSearch('');

    setShowAlbumList(false);
  };

  // =========================================================
  // ALBUM SEARCH CHANGE
  // =========================================================

  const handleAlbumSearchChange = (e) => {

    const value =
      e.target.value;

    setAlbumSearch(value);

    setShowAlbumList(true);

    // Nếu xóa ô tìm kiếm
    // thì bỏ album đang chọn
    if (!value.trim()) {

      setForm((prev) => ({
        ...prev,

        album_id: '',
        album_name: ''
      }));
    }
  };

  // =========================================================
  // SELECT ALBUM
  // =========================================================

  const handleSelectAlbum = (album) => {

    setForm((prev) => ({
      ...prev,

      album_id: album.id,

      album_name:
        `${album.name}${
          album.group_name
            ? ` - ${album.group_name}`
            : ''
        }`
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
  // IMAGE CHANGE
  // =========================================================

  const handleImageChange = (e) => {

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

    setImagePreview(
      previewUrl
    );
  };

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  const removeImage = () => {

    setForm((prev) => ({
      ...prev,
      image: null
    }));

    setImagePreview('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    // -------------------------
    // TITLE
    // -------------------------

    if (!form.title.trim()) {

      alert(
        'Vui lòng nhập tên sản phẩm!'
      );

      return;
    }

    // -------------------------
    // ALBUM
    // -------------------------

    if (
      form.category === 'album'
    ) {

      if (!form.album_id) {

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

    // -------------------------
    // PRICE
    // -------------------------

    if (
      form.price === '' ||
      isNaN(Number(form.price)) ||
      Number(form.price) < 0
    ) {

      alert(
        'Vui lòng nhập giá bán hợp lệ!'
      );

      return;
    }

    try {

      setSaving(true);

      const formData =
        new FormData();

      // CATEGORY

      formData.append(
        'category',
        form.category
      );

      // TITLE

      formData.append(
        'title',
        form.title.trim()
      );

      // PRICE

      formData.append(
        'price',
        Number(form.price)
      );

      // PREORDER

      formData.append(
        'is_preorder',
        form.is_preorder
          ? '1'
          : '0'
      );

      // RELEASE DATE

      if (form.release_date) {

        formData.append(
          'release_date',
          form.release_date
        );
      }

      // DESCRIPTION

      if (
        form.description.trim()
      ) {

        formData.append(
          'description',
          form.description.trim()
        );
      }

      // -------------------------
      // ALBUM PRODUCT
      // -------------------------

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

      // -------------------------
      // IMAGE
      // -------------------------

      if (form.image) {

        formData.append(
          'image',
          form.image
        );
      }

      let res;

      // -------------------------
      // EDIT
      // -------------------------

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

      }

      // -------------------------
      // ADD
      // -------------------------

      else {

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
            ? 'Cập nhật thành công!'
            : 'Thêm sản phẩm thành công!'
        )
      );

      setShowModal(false);

      resetForm();

      // Chỉ reload dữ liệu SAU KHI
      // thêm / sửa thành công
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
  // EDIT PRODUCT
  // =========================================================

  const handleEdit = async (productId) => {

    try {

      setSaving(true);

      const res =
        await axios.get(
          `${API_URL}/products/${productId}`
        );

      const product =
        res.data.product;

      setEditingId(
        product.id
      );

      setForm({

        category:
          product.category ||
          'album',

        album_id:
          product.album_id || '',

        album_name:
          product.album_name
            ? `${product.album_name}${
                product.group_name
                  ? ` - ${product.group_name}`
                  : ''
              }`
            : '',

        title:
          product.title || '',

        version_name:
          product.version_name || '',

        price:
          product.price ?? '',

        is_preorder:
          Boolean(
            product.is_preorder
          ),

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

      setAlbumSearch(
        product.album_name
          ? `${product.album_name}${
              product.group_name
                ? ` - ${product.group_name}`
                : ''
            }`
          : ''
      );

      setImagePreview(
        product.image_url || ''
      );

      setShowModal(true);

      // Nếu chưa có album
      if (albums.length === 0) {
        await fetchAlbums();
      }

    } catch (err) {

      console.error(
        'Lỗi lấy chi tiết sản phẩm:',
        err
      );

      alert(
        err.response?.data?.message ||
        'Không thể lấy thông tin sản phẩm!'
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

      // Chỉ reload sau khi xóa
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
  // CLEAR FILTER
  // =========================================================

  const clearFilter = () => {

    setSearch('');
    setCategoryFilter('');
  };

  // =========================================================
  // LOADING
  // =========================================================

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

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 lg:ml-64 min-w-0">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">

          <div>

            <h1 className="text-lg font-black text-slate-900">
              Quản lý sản phẩm
            </h1>

            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách sản phẩm trong cửa hàng
            </p>

          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition"
          >

            <Plus className="w-4 h-4" />

            Thêm sản phẩm

          </button>

        </header>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="p-4 sm:p-6 lg:p-8">

          {/* ===================================================
              SEARCH
          =================================================== */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">

            <div className="flex flex-col sm:flex-row gap-3">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Tìm tên sản phẩm, version, album, nhóm..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

              </div>

              {/* CATEGORY */}

              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value
                  )
                }
                className="sm:w-52 px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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
                      {category.label}
                    </option>

                  )
                )}

              </select>

              {/* CLEAR */}

              {(search ||
                categoryFilter) && (

                <button
                  type="button"
                  onClick={clearFilter}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Xóa lọc
                </button>

              )}

            </div>

          </div>

          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (

            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-600">

              <AlertCircle className="w-5 h-5 shrink-0" />

              <span className="text-sm font-medium">
                {error}
              </span>

              <button
                type="button"
                onClick={fetchProducts}
                className="ml-auto text-sm font-bold underline"
              >
                Thử lại
              </button>

            </div>

          )}

          {/* ===================================================
              EMPTY
          =================================================== */}

          {filteredProducts.length === 0 ? (

            <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">

              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />

              <p className="font-bold text-slate-500">
                Không tìm thấy sản phẩm
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Thử thay đổi từ khóa hoặc danh mục
              </p>

            </div>

          ) : (

            /* =================================================
               PRODUCT LIST
            ================================================= */

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="divide-y divide-slate-100">

                {filteredProducts.map(
                  (product) => {

                    const categoryLabel =
                      categories.find(
                        (item) =>
                          item.value ===
                          product.category
                      )?.label ||
                      product.category;

                    return (

                      <div
                        key={product.id}
                        className="p-5 flex items-center gap-4 hover:bg-slate-50 transition"
                      >

                        {/* IMAGE */}

                        <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">

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

                            <Package className="w-8 h-8 text-slate-300" />

                          )}

                        </div>

                        {/* INFO */}

                        <div className="flex-1 min-w-0">

                          <div className="flex items-center gap-2 flex-wrap">

                            <h3 className="font-bold text-slate-900">
                              {product.title}
                            </h3>

                            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-sky-50 text-sky-600">
                              {categoryLabel}
                            </span>

                          </div>

                          {/* ALBUM / VERSION */}

                          {product.category === 'album' ? (

                            <div className="text-xs text-slate-500 mt-1">

                              <span>
                                {product.group_name
                                  ? `${product.group_name} • `
                                  : ''}
                              </span>

                              <span>
                                {product.album_name ||
                                  'Chưa có album'}
                              </span>

                              {product.version_name && (

                                <span>
                                  {' • '}
                                  {product.version_name}
                                </span>

                              )}

                            </div>

                          ) : (

                            <p className="text-xs text-slate-400 mt-1">
                              Sản phẩm độc lập
                            </p>

                          )}

                          {/* PRICE */}

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">

                            {/* GIÁ BÁN */}

                            <div>

                              <p className="text-[11px] text-slate-400">
                                Giá bán
                              </p>

                              <p className="text-sm font-black text-slate-900">
                                {formatMoney(
                                  product.price
                                )}
                              </p>

                            </div>

                            {/* GIÁ NHẬP */}

                            <div>

                              <p className="text-[11px] text-slate-400">
                                Giá nhập TB
                              </p>

                              <p className="text-sm font-bold text-amber-600">
                                {formatMoney(
                                  product.average_import_price
                                )}
                              </p>

                            </div>

                            {/* STOCK */}

                            <div>

                              <p className="text-[11px] text-slate-400">
                                Tồn kho
                              </p>

                              <p className="text-sm font-bold text-slate-700">
                                {Number(
                                  product.stock || 0
                                ).toLocaleString(
                                  'vi-VN'
                                )}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* ACTION */}

                        <div className="flex items-center gap-2 shrink-0">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                product.id
                              )
                            }
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition"
                            title="Sửa sản phẩm"
                          >

                            <Pencil className="w-4 h-4" />

                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition"
                            title="Xóa sản phẩm"
                          >

                            <Trash2 className="w-4 h-4" />

                          </button>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          )}

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

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-black text-slate-900">

                  {editingId
                    ? 'Chỉnh sửa sản phẩm'
                    : 'Thêm sản phẩm'}

                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {editingId
                    ? 'Cập nhật thông tin sản phẩm'
                    : 'Thêm sản phẩm mới vào cửa hàng'}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >

                <X className="w-5 h-5" />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* CATEGORY */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Danh mục
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={
                    handleCategoryChange
                  }
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >

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
                        {category.label}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* ALBUM */}

              {form.category === 'album' && (

                <div className="relative">

                  <label className="block text-sm font-bold text-slate-700 mb-2">

                    Album

                    <span className="text-red-500">
                      {' '}*
                    </span>

                  </label>

                  <div className="relative">

                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="text"
                      value={albumSearch}
                      onChange={
                        handleAlbumSearchChange
                      }
                      onFocus={() =>
                        setShowAlbumList(true)
                      }
                      placeholder="Nhập tên album hoặc nhóm để tìm..."
                      disabled={saving}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />

                  </div>

                  {/* SELECTED */}

                  {form.album_id && (

                    <p className="text-xs text-sky-600 font-semibold mt-2">
                      Album đã chọn:
                      {' '}
                      {form.album_name}
                    </p>

                  )}

                  {/* ALBUM LIST */}

                  {showAlbumList && (

                    <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">

                      {loadingAlbums ? (

                        <div className="p-5 text-center">

                          <Loader2 className="w-5 h-5 text-sky-500 animate-spin mx-auto" />

                          <p className="text-xs text-slate-400 mt-2">
                            Đang tải album...
                          </p>

                        </div>

                      ) : filteredAlbums.length === 0 ? (

                        <div className="p-5 text-center">

                          <Package className="w-7 h-7 text-slate-300 mx-auto mb-2" />

                          <p className="text-sm text-slate-500">
                            Không tìm thấy album
                          </p>

                        </div>

                      ) : (

                        filteredAlbums
                          .slice(0, 30)
                          .map(
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
                                className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b border-slate-100 last:border-b-0 transition"
                              >

                                <p className="text-sm font-bold text-slate-800">
                                  {album.name}
                                </p>

                                {album.group_name && (

                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {album.group_name}
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

              {/* TITLE */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">

                  Tên sản phẩm

                  <span className="text-red-500">
                    {' '}*
                  </span>

                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={200}
                  disabled={saving}
                  placeholder={
                    form.category === 'album'
                      ? 'Ví dụ: RIIZE The 1st Album'
                      : 'Ví dụ: Wonbin Photocard'
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

              </div>

              {/* VERSION */}

              {form.category === 'album' && (

                <div>

                  <label className="block text-sm font-bold text-slate-700 mb-2">

                    Version

                    <span className="text-red-500">
                      {' '}*
                    </span>

                  </label>

                  <input
                    type="text"
                    name="version_name"
                    value={form.version_name}
                    onChange={handleChange}
                    maxLength={150}
                    disabled={saving}
                    placeholder="Ví dụ: Photobook Ver."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />

                </div>

              )}

              {/* PRICE */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">

                  Giá bán

                  <span className="text-red-500">
                    {' '}*
                  </span>

                </label>

                <div className="relative">

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    disabled={saving}
                    placeholder="0"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </span>

                </div>

              </div>

              {/* PREORDER */}

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  name="is_preorder"
                  checked={
                    form.is_preorder
                  }
                  onChange={handleChange}
                  disabled={saving}
                  className="w-4 h-4 accent-sky-500"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Sản phẩm Pre-order
                </span>

              </label>

              {/* RELEASE DATE */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Ngày phát hành
                </label>

                <input
                  type="date"
                  name="release_date"
                  value={
                    form.release_date
                  }
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

              </div>

              {/* IMAGE */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Ảnh sản phẩm
                </label>

                <input
                  ref={fileInputRef}
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
                          Ảnh sản phẩm
                        </p>

                      </div>

                    )}

                  </div>

                  {/* BUTTON */}

                  <div>

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >

                      <ImagePlus className="w-4 h-4 text-sky-500" />

                      Chọn ảnh

                    </button>

                    {imagePreview && (

                      <button
                        type="button"
                        onClick={
                          removeImage
                        }
                        disabled={saving}
                        className="ml-2 px-4 py-2.5 rounded-xl border border-red-100 text-sm font-bold text-red-500 hover:bg-red-50"
                      >
                        Xóa ảnh
                      </button>

                    )}

                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      JPG, PNG hoặc WEBP
                      <br />
                      Tối đa 5MB
                    </p>

                  </div>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Mô tả
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  rows={4}
                  disabled={saving}
                  placeholder="Mô tả sản phẩm..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

              </div>

              {/* BUTTON */}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 disabled:opacity-60"
                >

                  {saving ? (

                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>

                  ) : (

                    <>
                      <Plus className="w-4 h-4" />

                      {editingId
                        ? 'Lưu thay đổi'
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