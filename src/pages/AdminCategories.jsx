import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { FolderTree, Plus, Search, Pencil, Trash2, X, Loader2 } from 'lucide-react';

export default function AdminCategories() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data.categories || res.data.data || res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || '',
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await axios.put(`${API_URL}/categories/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/categories`, formData);
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi lưu danh mục:', err);
      alert(err.response?.data?.message || 'Không thể lưu danh mục!');
    }
  };

  const handleDelete = async (id) => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;

    if (category.productCount > 0 || category.product_count > 0) {
      alert('Không thể xóa danh mục đang có sản phẩm!');
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${category.name}"?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi xóa danh mục:', err);
      alert(err.response?.data?.message || 'Không thể xóa danh mục!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                Quản lý Danh mục
              </h1>
              <p className="text-xs text-slate-500">
                Quản lý các nhóm sản phẩm của cửa hàng
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm danh mục</span>
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
              <div>
                <h2 className="font-black text-slate-900">Danh sách danh mục</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tổng cộng {categories.length} danh mục
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm danh mục..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-3" />
                <p className="text-sm text-slate-500">Đang tải danh mục...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase text-slate-500">
                        Danh mục
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase text-slate-500">
                        Mô tả
                      </th>
                      <th className="text-center px-6 py-4 text-xs font-bold uppercase text-slate-500">
                        Sản phẩm
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-bold uppercase text-slate-500">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
                              <FolderTree className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{category.name}</p>
                              <p className="text-xs text-slate-400">{category.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {category.description || 'Chưa có mô tả'}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                            {category.productCount ?? category.product_count ?? 0}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(category)}
                              className="p-2 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredCategories.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-400">
                          Không tìm thấy danh mục
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-black text-lg text-slate-900">
                  {editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Quản lý danh mục sản phẩm
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Album"
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Mô tả danh mục..."
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-sky-500 hover:bg-sky-600"
                >
                  {editingId ? 'Lưu thay đổi' : 'Thêm danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}