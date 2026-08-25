import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  Music2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Package,
  Layers
} from 'lucide-react';

export default function AdminGroups() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==============================
  // GROUPS
  // ==============================
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');

  // ==============================
  // PRODUCTS / ALBUMS
  // ==============================
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupProducts, setGroupProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // ==============================
  // MODAL
  // ==============================
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [formData, setFormData] = useState({
    name: ''
  });

  // ==============================
  // MESSAGE
  // ==============================
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  // =====================================================
  // LẤY DANH SÁCH NHÓM
  // =====================================================

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(`${API_URL}/groups`);

      setGroups(
        res.data.groups ||
        res.data.data ||
        []
      );

    } catch (err) {
      console.error('Lỗi lấy nhóm nhạc:', err);

      setError(
        err.response?.data?.message ||
        'Không thể lấy danh sách nhóm nhạc!'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // =====================================================
  // CLICK VÀO NHÓM → LẤY ALBUM
  // =====================================================

  const handleViewGroup = async (group) => {
    try {
      setSelectedGroup(group);
      setLoadingProducts(true);
      setError('');

      const res = await axios.get(
        `${API_URL}/groups/${group.id}/products`
      );

      setGroupProducts(
        res.data.products ||
        res.data.data ||
        []
      );

    } catch (err) {
      console.error('Lỗi lấy sản phẩm của nhóm:', err);

      setGroupProducts([]);

      setError(
        err.response?.data?.message ||
        'Không thể lấy danh sách album của nhóm!'
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  // =====================================================
  // QUAY LẠI DANH SÁCH NHÓM
  // =====================================================

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setGroupProducts([]);
    setError('');
  };

  // =====================================================
  // THÊM NHÓM
  // =====================================================

  const handleAdd = () => {
    setEditingGroup(null);

    setFormData({
      name: ''
    });

    setModalError('');
    setShowModal(true);
  };

  // =====================================================
  // SỬA NHÓM
  // =====================================================

  const handleEdit = (group) => {
    setEditingGroup(group);

    setFormData({
      name: group.name || ''
    });

    setModalError('');
    setShowModal(true);
  };

  // =====================================================
  // ĐÓNG MODAL
  // =====================================================

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingGroup(null);

    setFormData({
      name: ''
    });

    setModalError('');
  };

  // =====================================================
  // INPUT
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =====================================================
  // THÊM / SỬA NHÓM
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();

    if (!name) {
      setModalError('Vui lòng nhập tên nhóm nhạc!');
      return;
    }

    try {
      setSaving(true);
      setModalError('');

      if (editingGroup) {

        await axios.put(
          `${API_URL}/groups/${editingGroup.id}`,
          {
            name
          }
        );

        setSuccess('Cập nhật nhóm nhạc thành công!');

      } else {

        await axios.post(
          `${API_URL}/groups`,
          {
            name
          }
        );

        setSuccess('Thêm nhóm nhạc thành công!');
      }

      await fetchGroups();

      setShowModal(false);
      setEditingGroup(null);

      setFormData({
        name: ''
      });

    } catch (err) {
      console.error('Lỗi lưu nhóm:', err);

      setModalError(
        err.response?.data?.message ||
        'Không thể lưu nhóm nhạc!'
      );
    } finally {
      setSaving(false);

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    }
  };

  // =====================================================
  // XÓA NHÓM
  // =====================================================

  const handleDelete = async (group) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa nhóm "${group.name}" không?`
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await axios.delete(
        `${API_URL}/groups/${group.id}`
      );

      setSuccess('Xóa nhóm nhạc thành công!');

      await fetchGroups();

      if (
        selectedGroup &&
        selectedGroup.id === group.id
      ) {
        setSelectedGroup(null);
        setGroupProducts([]);
      }

    } catch (err) {
      console.error('Lỗi xóa nhóm:', err);

      setError(
        err.response?.data?.message ||
        'Không thể xóa nhóm nhạc!'
      );
    }
  };

  // =====================================================
  // TÌM KIẾM
  // =====================================================

  const filteredGroups = groups.filter((group) =>
    group.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('vi-VN') + ' ₫';
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* ==============================
          SIDEBAR
      ============================== */}

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* ==============================
          MAIN
      ============================== */}

      <div className="flex-1 lg:ml-64 min-w-0">

        {/* ==============================
            HEADER
        ============================== */}

        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 text-xl"
            >
              ☰
            </button>

            <div>

              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Quản lý nhóm nhạc
              </h1>

              <p className="hidden sm:block text-xs text-slate-500">
                Quản lý nhóm Kpop và các album của từng nhóm
              </p>

            </div>

          </div>

          {!selectedGroup && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />

              <span className="hidden sm:inline">
                Thêm nhóm nhạc
              </span>
            </button>
          )}

        </header>

        {/* ==============================
            CONTENT
        ============================== */}

        <main className="p-4 sm:p-6 lg:p-8">

          {/* ERROR */}

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm font-medium">

              <AlertCircle className="w-5 h-5 shrink-0" />

              <span>{error}</span>

              <button
                onClick={() => setError('')}
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          {/* ==================================================
              TRANG CHI TIẾT NHÓM
          ================================================== */}

          {selectedGroup ? (

            <div>

              {/* BACK */}

              <button
                onClick={handleBackToGroups}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-sky-600 mb-5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách nhóm
              </button>

              {/* GROUP HEADER */}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                <div className="flex items-center gap-4">

                  <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">

                    <Music2 className="w-8 h-8" />

                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Nhóm nhạc
                    </p>

                    <h2 className="text-2xl font-black text-slate-900">
                      {selectedGroup.name}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      {groupProducts.length} sản phẩm / album
                    </p>

                  </div>

                </div>

              </div>

              {/* ALBUM LIST */}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                <div className="p-5 border-b border-slate-100">

                  <h2 className="font-bold text-slate-900">
                    Album / Sản phẩm
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Các sản phẩm thuộc nhóm {selectedGroup.name}
                  </p>

                </div>

                {loadingProducts ? (

                  <div className="py-16 flex flex-col items-center justify-center text-slate-500">

                    <Loader2 className="w-7 h-7 animate-spin mb-3 text-sky-500" />

                    <p className="text-sm">
                      Đang tải album...
                    </p>

                  </div>

                ) : groupProducts.length === 0 ? (

                  <div className="py-16 flex flex-col items-center justify-center text-slate-400">

                    <Package className="w-10 h-10 mb-3" />

                    <p className="font-semibold">
                      Nhóm này chưa có album
                    </p>

                    <p className="text-xs mt-1">
                      Hãy thêm sản phẩm cho nhóm này
                    </p>

                  </div>

                ) : (

                  <div className="divide-y divide-slate-100">

                    {groupProducts.map((product) => (

                      <div
                        key={product.id}
                        className="p-5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                        onClick={() =>
                          navigate(`/admin/products/${product.id}`)
                        }
                      >

                        <div className="flex items-center gap-4">

                          {/* IMAGE */}

                          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">

                            {product.image_url ? (

                              <img
                                src={product.image_url}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />

                            ) : (

                              <Package className="w-7 h-7 text-slate-400" />

                            )}

                          </div>

                          {/* INFO */}

                          <div>

                            <h3 className="font-bold text-slate-900">
                              {product.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-3 mt-1">

                              <span className="text-xs text-slate-500">
                                {product.category || 'album'}
                              </span>

                              {product.version_count !== undefined && (

                                <span className="flex items-center gap-1 text-xs font-semibold text-sky-600">

                                  <Layers className="w-3.5 h-3.5" />

                                  {product.version_count} version

                                </span>

                              )}

                            </div>

                          </div>

                        </div>

                        {/* RIGHT */}

                        <div className="flex items-center gap-3">

                          {product.min_price !== undefined && (
                            <span className="hidden sm:block text-sm font-bold text-slate-700">
                              {formatPrice(product.min_price)}
                            </span>
                          )}

                          <ChevronRight className="w-5 h-5 text-slate-400" />

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>

          ) : (

            /* ==================================================
               DANH SÁCH NHÓM
            ================================================== */

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* TOP */}

              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">

                <div>

                  <h2 className="font-bold text-slate-900">
                    Danh sách nhóm nhạc
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Tổng cộng {groups.length} nhóm nhạc
                  </p>

                </div>

                {/* SEARCH */}

                <div className="relative w-full sm:w-72">

                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Tìm tên nhóm..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                  />

                </div>

              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">

                {loading ? (

                  <div className="py-16 flex flex-col items-center justify-center text-slate-500">

                    <Loader2 className="w-7 h-7 animate-spin mb-3 text-sky-500" />

                    <p className="text-sm">
                      Đang tải danh sách nhóm nhạc...
                    </p>

                  </div>

                ) : filteredGroups.length === 0 ? (

                  <div className="py-16 flex flex-col items-center justify-center text-slate-400">

                    <Music2 className="w-10 h-10 mb-3" />

                    <p className="font-semibold">
                      Không có nhóm nhạc nào
                    </p>

                    <p className="text-xs mt-1">
                      Thử tìm kiếm với từ khóa khác
                    </p>

                  </div>

                ) : (

                  <table className="w-full text-left">

                    <thead>

                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">

                        <th className="px-6 py-4 w-24">
                          ID
                        </th>

                        <th className="px-6 py-4">
                          Tên nhóm nhạc
                        </th>

                        <th className="px-6 py-4">
                          Album
                        </th>

                        <th className="px-6 py-4 text-right">
                          Thao tác
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {filteredGroups.map((group) => (

                        <tr
                          key={group.id}
                          className="hover:bg-slate-50 transition"
                        >

                          {/* ID */}

                          <td className="px-6 py-4">

                            <span className="text-sm font-bold text-slate-500">
                              #{group.id}
                            </span>

                          </td>

                          {/* GROUP */}

                          <td className="px-6 py-4">

                            <button
                              onClick={() =>
                                handleViewGroup(group)
                              }
                              className="flex items-center gap-3 text-left"
                            >

                              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">

                                <Music2 className="w-5 h-5" />

                              </div>

                              <span className="font-bold text-slate-900 hover:text-sky-600 transition">
                                {group.name}
                              </span>

                            </button>

                          </td>

                          {/* ALBUM */}

                          <td className="px-6 py-4">

                            <button
                              onClick={() =>
                                handleViewGroup(group)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold hover:bg-sky-100 transition"
                            >

                              <Package className="w-3.5 h-3.5" />

                              Xem album

                              <ChevronRight className="w-3.5 h-3.5" />

                            </button>

                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  handleEdit(group)
                                }
                                className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition"
                                title="Chỉnh sửa"
                              >

                                <Pencil className="w-4 h-4" />

                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(group)
                                }
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                title="Xóa"
                              >

                                <Trash2 className="w-4 h-4" />

                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                )}

              </div>

            </div>

          )}

        </main>

      </div>

      {/* ==================================================
          MODAL THÊM / SỬA
      ================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">

            {/* HEADER */}

            <div className="p-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">

                  {editingGroup
                    ? 'Chỉnh sửa nhóm nhạc'
                    : 'Thêm nhóm nhạc'}

                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Nhập tên nhóm nhạc Kpop
                </p>

              </div>

              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
              >

                <X className="w-5 h-5" />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-5"
            >

              {modalError && (

                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {modalError}
                </div>

              )}

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Tên nhóm nhạc
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
                disabled={saving}
                placeholder="VD: RIIZE, BLACKPINK, IVE..."
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
              />

              {/* BUTTON */}

              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-50 flex items-center gap-2 transition"
                >

                  {saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {editingGroup
                    ? 'Cập nhật'
                    : 'Thêm nhóm'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}