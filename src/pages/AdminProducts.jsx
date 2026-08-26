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
  RefreshCw
} from 'lucide-react';

export default function AdminProduct() {
  const API_URL = import.meta.env.VITE_API_URL;

  const fileInputRef = useRef(null);

  // =========================================================
  // STATE
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [imagePreview, setImagePreview] = useState('');

  // Album search
  const [albumSearch, setAlbumSearch] = useState('');
  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [showAlbumList, setShowAlbumList] = useState(false);

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
  // LẤY SẢN PHẨM
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
        { params }
      );

      setProducts(res.data.products || []);

    } catch (err) {
      console.error('Lỗi lấy sản phẩm:', err);

      setError(
        err.response?.data?.message ||
        'Không thể lấy danh sách sản phẩm!'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  // =========================================================
  // LẤY ALBUM
  // =========================================================

  const fetchAlbums = async (keyword = '') => {
    try {
      setLoadingAlbums(true);

      const res = await axios.get(
        `${API_URL}/products/albums`,
        {
          params: {
            search: keyword
          }
        }
      );

      setAlbums(res.data.albums || []);

    } catch (err) {
      console.error('Lỗi lấy album:', err);
    } finally {
      setLoadingAlbums(false);
    }
  };

  // =========================================================
  // SEARCH ALBUM
  // =========================================================

  useEffect(() => {
    if (!showModal || form.category !== 'album') {
      return;
    }

    const timer = setTimeout(() => {
      fetchAlbums(albumSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    albumSearch,
    showModal,
    form.category
  ]);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm(emptyForm);

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
  // OPEN ADD
  // =========================================================

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
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
    const { name, value, type, checked } = e.target;

    setForm(prev => ({
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

  const handleCategoryChange = (e) => {
    const category = e.target.value;

    setForm(prev => ({
      ...prev,
      category,

      // Nếu không phải album
      // thì bỏ album + version
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
  // SELECT ALBUM
  // =========================================================

  const selectAlbum = (album) => {
    setForm(prev => ({
      ...prev,
      album_id: album.id,
      album_name: album.name
    }));

    setAlbumSearch(
      `${album.name}${album.group_name
        ? ` - ${album.group_name}`
        : ''}`
    );

    setShowAlbumList(false);
  };

  // =========================================================
  // IMAGE
  // =========================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        'Chỉ được chọn JPG, JPEG, PNG hoặc WEBP!'
      );

      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh không được vượt quá 5MB!');

      e.target.value = '';
      return;
    }

    setForm(prev => ({
      ...prev,
      image: file
    }));

    const url = URL.createObjectURL(file);

    setImagePreview(url);
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '0 ₫';
    }

    return Number(value).toLocaleString('vi-VN') + ' ₫';
  };

  // =========================================================
  // FORMAT CATEGORY
  // =========================================================

  const getCategoryLabel = (category) => {
    const item = categories.find(
      x => x.value === category
    );

    return item?.label || category;
  };

  // =========================================================
  // ADD / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -----------------------------------------------
    // VALIDATE TITLE
    // -----------------------------------------------

    if (!form.title.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }

    // -----------------------------------------------
    // VALIDATE PRICE
    // -----------------------------------------------

    if (
      form.price === '' ||
      isNaN(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      alert('Giá bán không hợp lệ!');
      return;
    }

    // -----------------------------------------------
    // ALBUM
    // -----------------------------------------------

    if (form.category === 'album') {

      if (!form.album_id) {
        alert('Vui lòng chọn album!');
        return;
      }

      if (!form.version_name.trim()) {
        alert(
          'Sản phẩm album phải có tên version!'
        );
        return;
      }
    }

    try {
      setSaving(true);

      const formData = new FormData();

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
        Number(form.price)
      );

      formData.append(
        'is_preorder',
        form.is_preorder ? '1' : '0'
      );

      if (form.release_date) {
        formData.append(
          'release_date',
          form.release_date
        );
      }

      if (form.description.trim()) {
        formData.append(
          'description',
          form.description.trim()
        );
      }

      // ---------------------------------------------
      // ALBUM
      // ---------------------------------------------

      if (form.category === 'album') {
        formData.append(
          'album_id',
          form.album_id
        );

        formData.append(
          'version_name',
          form.version_name.trim()
        );
      }

      // ---------------------------------------------
      // IMAGE
      // ---------------------------------------------

      if (form.image) {
        formData.append(
          'image',
          form.image
        );
      }

      let res;

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

      closeModal();

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
  // EDIT
  // =========================================================

  const handleEdit = async (productId) => {
    try {
      setSaving(true);

      const res = await axios.get(
        `${API_URL}/products/${productId}`
      );

      const product =
        res.data.product;

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
            ? String(product.release_date).slice(0, 10)
            : '',

        description:
          product.description || '',

        image: null
      });

      if (product.image_url) {
        setImagePreview(
          product.image_url
        );
      } else {
        setImagePreview('');
      }

      setAlbumSearch(
        product.album_name
          ? `${product.album_name}${
              product.group_name
                ? ` - ${product.group_name}`
                : ''
            }`
          : ''
      );

      setShowModal(true);

    } catch (err) {

      console.error(
        'Lỗi lấy sản phẩm:',
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
  // DELETE
  // =========================================================

  const handleDelete = async (
    productId,
    productTitle
  ) => {

    const confirmed =
      window.confirm(
        `Bạn có chắc muốn xóa sản phẩm "${productTitle}" không?`
      );

    if (!confirmed) return;

    try {

      await axios.delete(
        `${API_URL}/products/${productId}`
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

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">

          <div>

            <h1 className="text-xl font-black text-slate-900">
              Quản lý sản phẩm
            </h1>

            <p className="text-xs text-slate-400">
              Quản lý album, photocard và merchandise
            </p>

          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition"
          >

            <Plus className="w-4 h-4" />

            Thêm sản phẩm

          </button>

        </header>


        <div className="p-4 sm:p-6 lg:p-8">

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-600">

              <AlertCircle className="w-5 h-5" />

              <span className="text-sm">
                {error}
              </span>

              <button
                onClick={fetchProducts}
                className="ml-auto text-xs font-bold underline"
              >
                Thử lại
              </button>

            </div>

          )}


          {/* =================================================
              FILTER
          ================================================= */}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">

            <div className="flex flex-col lg:flex-row gap-3">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={e =>
                    setSearch(e.target.value)
                  }
                  placeholder="Tìm sản phẩm, version, album, nhóm..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                />

              </div>


              {/* CATEGORY */}

              <select
                value={categoryFilter}
                onChange={e =>
                  setCategoryFilter(
                    e.target.value
                  )
                }
                className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 text-sm bg-white"
              >

                <option value="">
                  Tất cả danh mục
                </option>

                {categories.map(category => (

                  <option
                    key={category.value}
                    value={category.value}
                  >
                    {category.label}
                  </option>

                ))}

              </select>


              <button
                onClick={fetchProducts}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                title="Làm mới"
              >

                <RefreshCw className="w-4 h-4" />

              </button>

            </div>

          </div>


          {/* =================================================
              TABLE
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="font-bold text-slate-900">
                  Danh sách sản phẩm
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  {products.length} sản phẩm
                </p>

              </div>

            </div>


            {products.length === 0 ? (

              <div className="py-20 text-center">

                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />

                <p className="font-bold text-slate-500">
                  Không có sản phẩm
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Hãy thêm sản phẩm đầu tiên
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px]">

                  <thead>

                    <tr className="bg-slate-50 border-b border-slate-100">

                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500">
                        Sản phẩm
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500">
                        Danh mục
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500">
                        Album / Version
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold text-slate-500">
                        Giá bán
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold text-slate-500">
                        Giá nhập bình quân
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold text-slate-500">
                        Lãi dự kiến
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold text-slate-500">
                        Tồn kho
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold text-slate-500">
                        Thao tác
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {products.map(product => {

                      const profit =
                        Number(
                          product.estimated_profit || 0
                        );

                      return (

                        <tr
                          key={product.id}
                          className="hover:bg-slate-50 transition"
                        >

                          {/* PRODUCT */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">

                                {product.image_url ? (

                                  <img
                                    src={product.image_url}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                  />

                                ) : (

                                  <Package className="w-6 h-6 text-slate-300" />

                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="font-bold text-slate-900 max-w-[260px] truncate">
                                  {product.title}
                                </p>

                                {product.is_preorder ? (

                                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                                    PRE-ORDER
                                  </span>

                                ) : null}

                              </div>

                            </div>

                          </td>


                          {/* CATEGORY */}

                          <td className="px-5 py-4">

                            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold">

                              {getCategoryLabel(
                                product.category
                              )}

                            </span>

                          </td>


                          {/* ALBUM */}

                          <td className="px-5 py-4">

                            {product.album_name ? (

                              <div>

                                <p className="text-sm font-semibold text-slate-700">
                                  {product.album_name}
                                </p>

                                {product.version_name && (

                                  <p className="text-xs text-slate-400 mt-1">
                                    Version: {product.version_name}
                                  </p>

                                )}

                              </div>

                            ) : (

                              <span className="text-xs text-slate-400">
                                Không thuộc album
                              </span>

                            )}

                          </td>


                          {/* PRICE */}

                          <td className="px-5 py-4 text-right">

                            <p className="font-bold text-slate-900">
                              {formatMoney(
                                product.price
                              )}
                            </p>

                          </td>


                          {/* IMPORT PRICE */}

                          <td className="px-5 py-4 text-right">

                            <p className="text-sm font-semibold text-slate-600">
                              {formatMoney(
                                product.average_import_price
                              )}
                            </p>

                          </td>


                          {/* PROFIT */}

                          <td className="px-5 py-4 text-right">

                            <p
                              className={`font-bold ${
                                profit >= 0
                                  ? 'text-emerald-600'
                                  : 'text-red-500'
                              }`}
                            >
                              {formatMoney(
                                profit
                              )}
                            </p>

                          </td>


                          {/* STOCK */}

                          <td className="px-5 py-4 text-right">

                            <span
                              className={`font-bold ${
                                Number(product.stock) > 0
                                  ? 'text-slate-700'
                                  : 'text-red-400'
                              }`}
                            >
                              {product.stock || 0}
                            </span>

                          </td>


                          {/* ACTION */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  handleEdit(
                                    product.id
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
                                    product.id,
                                    product.title
                                  )
                                }
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 transition"
                                title="Xóa"
                              >

                                <Trash2 className="w-4 h-4" />

                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    })}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </main>


      {/* =====================================================
          MODAL
      ===================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />


          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-black text-slate-900">

                  {editingId
                    ? 'Chỉnh sửa sản phẩm'
                    : 'Thêm sản phẩm'}

                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Thông tin sản phẩm bán tại cửa hàng
                </p>

              </div>


              <button
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center"
              >

                <X className="w-5 h-5 text-slate-500" />

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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                  {categories.map(category => (

                    <button
                      key={category.value}
                      type="button"
                      onClick={() =>
                        handleCategoryChange({
                          target: {
                            value:
                              category.value
                          }
                        })
                      }
                      className={`px-3 py-3 rounded-xl border text-sm font-bold transition ${
                        form.category === category.value
                          ? 'border-sky-400 bg-sky-50 text-sky-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {category.label}
                    </button>

                  ))}

                </div>

              </div>


              {/* TITLE */}

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
                  value={form.title}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder={
                    form.category === 'album'
                      ? 'Ví dụ: RIIZE - The 1st Album'
                      : form.category === 'photocard'
                      ? 'Ví dụ: Eunseok Lucky Draw Photocard'
                      : form.category === 'md_event'
                      ? 'Ví dụ: RIIZE FANCON MD'
                      : 'Ví dụ: RIIZE OFFICIAL LIGHT STICK'
                  }
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                />

              </div>


              {/* =================================================
                  ALBUM
              ================================================= */}

              {form.category === 'album' && (

                <>

                  <div>

                    <label className="block text-sm font-bold text-slate-700 mb-1.5">

                      Album

                      <span className="text-red-500">
                        {' '}*
                      </span>

                    </label>


                    <div className="relative">

                      <input
                        type="text"
                        value={albumSearch}
                        onChange={e => {

                          setAlbumSearch(
                            e.target.value
                          );

                          setShowAlbumList(true);

                          // Nếu người dùng sửa text
                          // thì reset album đã chọn
                          setForm(prev => ({
                            ...prev,
                            album_id: ''
                          }));

                        }}
                        onFocus={() => {

                          setShowAlbumList(true);

                          if (
                            albums.length === 0
                          ) {
                            fetchAlbums(
                              albumSearch
                            );
                          }

                        }}
                        placeholder="Gõ tên album hoặc nhóm để tìm..."
                        disabled={saving}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                      />


                      {showAlbumList && (

                        <div className="absolute z-30 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">

                          {loadingAlbums ? (

                            <div className="p-4 text-center">

                              <Loader2 className="w-5 h-5 animate-spin text-sky-500 mx-auto" />

                              <p className="text-xs text-slate-400 mt-2">
                                Đang tìm album...
                              </p>

                            </div>

                          ) : albums.length === 0 ? (

                            <div className="p-4 text-center">

                              <p className="text-sm font-semibold text-slate-500">
                                Không tìm thấy album
                              </p>

                              <p className="text-xs text-slate-400 mt-1">
                                Thử tìm bằng tên nhóm hoặc album khác
                              </p>

                            </div>

                          ) : (

                            albums.map(album => (

                              <button
                                key={album.id}
                                type="button"
                                onClick={() =>
                                  selectAlbum(
                                    album
                                  )
                                }
                                className={`w-full text-left px-4 py-3 hover:bg-sky-50 transition ${
                                  Number(
                                    form.album_id
                                  ) ===
                                  Number(album.id)
                                    ? 'bg-sky-50'
                                    : ''
                                }`}
                              >

                                <p className="text-sm font-bold text-slate-800">
                                  {album.name}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                  {album.group_name ||
                                    'Chưa có nhóm'}
                                </p>

                              </button>

                            ))

                          )}

                        </div>

                      )}

                    </div>


                    {form.album_id && (

                      <p className="text-xs text-emerald-600 font-semibold mt-2">
                        ✓ Đã chọn: {form.album_name}
                      </p>

                    )}

                  </div>


                  {/* VERSION */}

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
                      value={form.version_name}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="Ví dụ: Photobook Ver."
                      disabled={saving}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                    />

                    <p className="text-xs text-slate-400 mt-1.5">
                      Mỗi version trong cùng một album phải có tên khác nhau.
                    </p>

                  </div>

                </>

              )}


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
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    placeholder="0"
                    disabled={saving}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₫
                  </span>

                </div>

                <p className="text-xs text-slate-400 mt-1.5">
                  Giá nhập sẽ được lấy từ phiếu nhập hàng và tính bình quân.
                </p>

              </div>


              {/* =================================================
                  PREORDER
              ================================================= */}

              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4">

                <div>

                  <p className="text-sm font-bold text-slate-700">
                    Sản phẩm Pre-order
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Đánh dấu nếu sản phẩm đang mở đặt trước.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      is_preorder:
                        !prev.is_preorder
                    }))
                  }
                  disabled={saving}
                  className={`relative w-11 h-6 rounded-full transition ${
                    form.is_preorder
                      ? 'bg-sky-500'
                      : 'bg-slate-300'
                  }`}
                >

                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                      form.is_preorder
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />

                </button>

              </div>


              {/* RELEASE DATE */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Ngày phát hành
                </label>

                <input
                  type="date"
                  name="release_date"
                  value={form.release_date}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                />

              </div>


              {/* =================================================
                  IMAGE
              ================================================= */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Ảnh sản phẩm
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />


                <div className="flex items-start gap-4">

                  {/* PREVIEW */}

                  <div className="w-32 h-32 aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">

                    {imagePreview ? (

                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="text-center">

                        <ImagePlus className="w-8 h-8 text-slate-300 mx-auto mb-1" />

                        <p className="text-[11px] text-slate-400">
                          Ảnh 1:1
                        </p>

                      </div>

                    )}

                  </div>


                  <div>

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={saving}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                    >

                      <span className="flex items-center gap-2">

                        <ImagePlus className="w-4 h-4 text-sky-500" />

                        Chọn ảnh từ thiết bị

                      </span>

                    </button>

                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      JPG, PNG hoặc WEBP
                      <br />
                      Tối đa 5MB
                      <br />
                      Khuyến nghị ảnh vuông 1:1
                    </p>

                    {form.image && (

                      <p className="text-xs text-sky-600 font-semibold mt-2 max-w-[300px] truncate">
                        {form.image.name}
                      </p>

                    )}

                  </div>

                </div>

              </div>


              {/* DESCRIPTION */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Mô tả
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
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
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
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