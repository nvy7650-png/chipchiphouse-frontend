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

  // Search frontend
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
  // FORM INITIAL STATE
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

  const categories = [
    { value: 'album', label: 'Album' },
    { value: 'photocard', label: 'Photocard' },
    { value: 'md_event', label: 'MD / Event' },
    { value: 'lightstick', label: 'Lightstick' }
  ];

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN');
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Lỗi lấy sản phẩm:', err);
      setError(
        err.response?.data?.message || 'Không thể lấy danh sách sản phẩm!'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      setLoadingAlbums(true);
      const res = await axios.get(`${API_URL}/products/albums`);
      setAlbums(res.data.albums || []);
    } catch (err) {
      console.error('Lỗi lấy album:', err);
      setAlbums([]);
    } finally {
      setLoadingAlbums(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const keyword = search.trim().toLowerCase();
    const matchSearch =
      !keyword ||
      product.title?.toLowerCase().includes(keyword) ||
      product.version_name?.toLowerCase().includes(keyword) ||
      product.album_name?.toLowerCase().includes(keyword) ||
      product.group_name?.toLowerCase().includes(keyword);

    const matchCategory =
      !categoryFilter || product.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  const filteredAlbums = albums.filter((album) => {
    const keyword = albumSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      album.name?.toLowerCase().includes(keyword) ||
      album.group_name?.toLowerCase().includes(keyword)
    );
  });

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setAlbumSearch('');
    setShowAlbumList(false);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (albums.length === 0) {
      await fetchAlbums();
    }
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setForm((prev) => ({
      ...prev,
      category,
      ...(category !== 'album'
        ? { album_id: '', album_name: '', version_name: '' }
        : {})
    }));
    setAlbumSearch('');
    setShowAlbumList(false);
  };

  const handleAlbumSearchChange = (e) => {
    const value = e.target.value;
    setAlbumSearch(value);
    setShowAlbumList(true);
    if (!value.trim()) {
      setForm((prev) => ({
        ...prev,
        album_id: '',
        album_name: ''
      }));
    }
  };

  const handleSelectAlbum = (album) => {
    const albumDisplayName = `${album.name}${album.group_name ? ` - ${album.group_name}` : ''}`;
    setForm((prev) => ({
      ...prev,
      album_id: album.id,
      album_name: albumDisplayName
    }));
    setAlbumSearch(albumDisplayName);
    setShowAlbumList(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ được chọn ảnh JPG, JPEG, PNG hoặc WEBP!');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh không được vượt quá 5MB!');
      e.target.value = '';
      return;
    }

    setForm((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = async (productId) => {
    try {
      setSaving(true);
      if (albums.length === 0) {
        await fetchAlbums();
      }

      const res = await axios.get(`${API_URL}/products/${productId}`);
      const product = res.data.product || res.data;

      if (product) {
        setEditingId(product.id);
        const releaseDateFormatted = product.release_date
          ? new Date(product.release_date).toISOString().split('T')[0]
          : '';

        setForm({
          category: product.category || 'album',
          album_id: product.album_id || '',
          album_name: product.album_name || '',
          title: product.title || '',
          version_name: product.version_name || '',
          price: product.price ?? '',
          is_preorder: Boolean(product.is_preorder),
          release_date: releaseDateFormatted,
          description: product.description || '',
          image: null
        });

        if (product.album_name) {
          setAlbumSearch(product.album_name);
        }

        setImagePreview(product.image_url || '');
        setShowModal(true);
      }
    } catch (err) {
      console.error('Lỗi lấy chi tiết sản phẩm:', err);
      alert(err.response?.data?.message || 'Không thể lấy thông tin sản phẩm!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.title}"?`
    );
    if (!confirmed) return;

    try {
      const res = await axios.delete(`${API_URL}/products/${product.id}`);
      alert(res.data?.message || 'Xóa sản phẩm thành công!');
      await fetchProducts();
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
      alert(err.response?.data?.message || 'Không thể xóa sản phẩm!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }

    if (form.category === 'album') {
      if (!form.album_id) {
        alert('Vui lòng chọn album!');
        return;
      }
      if (!form.version_name.trim()) {
        alert('Vui lòng nhập tên version!');
        return;
      }
    }

    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) {
      alert('Vui lòng nhập giá bán hợp lệ!');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('category', form.category);
      formData.append('title', form.title.trim());
      formData.append('price', Number(form.price));
      formData.append('is_preorder', form.is_preorder ? '1' : '0');

      if (form.release_date) formData.append('release_date', form.release_date);
      if (form.description.trim()) formData.append('description', form.description.trim());

      if (form.category === 'album') {
        formData.append('album_id', form.album_id);
        formData.append('version_name', form.version_name.trim());
      }

      if (form.image) {
        formData.append('image', form.image);
      }

      let res;
      if (editingId) {
        res = await axios.put(`${API_URL}/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.post(`${API_URL}/products`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert(res.data.message || (editingId ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!'));
      setShowModal(false);
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error('Lỗi lưu sản phẩm:', err);
      alert(err.response?.data?.message || 'Không thể lưu sản phẩm!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 lg:ml-64 min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 text-xl"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Quản lý Sản phẩm
              </h1>
              <p className="hidden sm:block text-xs text-slate-500">
                Quản lý kho hàng và danh mục sản phẩm
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm sản phẩm</span>
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* TOOLBAR */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900">Danh sách sản phẩm</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tổng cộng {filteredProducts.length} sản phẩm
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* TABLE */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-3" />
                <p className="text-sm text-slate-500">Đang tải sản phẩm...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center">
                <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600">Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">Sản phẩm</th>
                      <th className="px-6 py-4">Phân loại</th>
                      <th className="px-6 py-4">Giá bán</th>
                      <th className="px-6 py-4">Ngày phát hành</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt=""
                                className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <Package className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                {product.version_name && (
                                  <span>Ver: {product.version_name}</span>
                                )}
                                {product.album_name && (
                                  <span>• {product.album_name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-600">
                            {categories.find((c) => c.value === product.category)?.label || product.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatMoney(product.price)}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(product.release_date)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product.id)}
                              className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                    Danh mục
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleCategoryChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              {form.category === 'album' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                      Chọn Album
                    </label>
                    <input
                      type="text"
                      value={albumSearch}
                      onChange={handleAlbumSearchChange}
                      onFocus={() => setShowAlbumList(true)}
                      placeholder="Tìm album..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                    />
                    {showAlbumList && filteredAlbums.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredAlbums.map((alb) => (
                          <div
                            key={alb.id}
                            onClick={() => handleSelectAlbum(alb)}
                            className="p-3 hover:bg-sky-50 cursor-pointer text-sm font-medium border-b border-slate-100 last:border-0"
                          >
                            {alb.name} {alb.group_name && `(${alb.group_name})`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                      Tên Version
                    </label>
                    <input
                      type="text"
                      name="version_name"
                      value={form.version_name}
                      onChange={handleChange}
                      placeholder="VD: Ver A / Standard"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Nhập tên sản phẩm đầy đủ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                    Ngày phát hành
                  </label>
                  <input
                    type="date"
                    name="release_date"
                    value={form.release_date}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="is_preorder"
                      checked={form.is_preorder}
                      onChange={handleChange}
                      className="w-4 h-4 text-sky-500 rounded focus:ring-sky-400"
                    />
                    Sản phẩm Pre-order (Đặt trước)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Hình ảnh sản phẩm
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border">
                      <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-sky-400 hover:text-sky-500"
                    >
                      <ImagePlus className="w-6 h-6" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Mô tả sản phẩm
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết sản phẩm..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Cập nhật' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}