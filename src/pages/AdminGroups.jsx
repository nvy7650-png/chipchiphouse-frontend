import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  Music2,
  AlertCircle
} from 'lucide-react';

export default function AdminGroups() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [formData, setFormData] = useState({
    name: ''
  });

  // ==========================================
  // API URL
  // ==========================================

  const API_URL = import.meta.env.VITE_API_URL;

  // ==========================================
  // LẤY DANH SÁCH NHÓM NHẠC
  // ==========================================

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(
        `${API_URL}/groups`
      );

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

  // ==========================================
  // MỞ MODAL THÊM
  // ==========================================

  const handleAdd = () => {
    setEditingGroup(null);

    setFormData({
      name: ''
    });

    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // ==========================================
  // MỞ MODAL SỬA
  // ==========================================

  const handleEdit = (group) => {
    setEditingGroup(group);

    setFormData({
      name: group.name || ''
    });

    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // ==========================================
  // ĐÓNG MODAL
  // ==========================================

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingGroup(null);

    setFormData({
      name: ''
    });
  };

  // ==========================================
  // THAY ĐỔI FORM
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ==========================================
  // THÊM / CẬP NHẬT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();

    if (!name) {
      setError('Vui lòng nhập tên nhóm nhạc!');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editingGroup) {
        // ==============================
        // CẬP NHẬT
        // ==============================

        await axios.put(
          `${API_URL}/groups/${editingGroup.id}`,
          {
            name
          }
        );

        setSuccess('Cập nhật nhóm nhạc thành công!');

      } else {
        // ==============================
        // THÊM MỚI
        // ==============================

        await axios.post(
          `${API_URL}/groups`,
          {
            name
          }
        );

        setSuccess('Thêm nhóm nhạc thành công!');
      }

      await fetchGroups();

      setTimeout(() => {
        setShowModal(false);
        setEditingGroup(null);

        setFormData({
          name: ''
        });

        setSuccess('');
      }, 500);

    } catch (err) {
      console.error('Lỗi lưu nhóm nhạc:', err);

      setError(
        err.response?.data?.message ||
        'Không thể lưu nhóm nhạc!'
      );

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // XÓA NHÓM NHẠC
  // ==========================================

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

    } catch (err) {
      console.error('Lỗi xóa nhóm nhạc:', err);

      setError(
        err.response?.data?.message ||
        'Không thể xóa nhóm nhạc!'
      );
    }
  };

  // ==========================================
  // TÌM KIẾM
  // ==========================================

  const filteredGroups = groups.filter((group) =>
    group.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* SIDEBAR */}

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* MAIN */}

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
                Quản lý nhóm nhạc
              </h1>

              <p className="hidden sm:block text-xs text-slate-500">
                Quản lý các nhóm Kpop trong hệ thống
              </p>
            </div>

          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">
              Thêm nhóm nhạc
            </span>
          </button>

        </header>

        {/* CONTENT */}

        <main className="p-4 sm:p-6 lg:p-8">

          {/* THÔNG BÁO LỖI */}

          {error && !showModal && (
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

          {success && !showModal && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          {/* CARD */}

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
                  onChange={(e) => setSearch(e.target.value)}
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

                        <td className="px-6 py-4">

                          <span className="text-sm font-bold text-slate-500">
                            #{group.id}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
                              <Music2 className="w-5 h-5" />
                            </div>

                            <span className="font-bold text-slate-900">
                              {group.name}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() => handleEdit(group)}
                              className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(group)}
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

        </main>

      </div>

      {/* ==========================================
          MODAL THÊM / SỬA
      ========================================== */}

      {showModal && (

        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">

            {/* MODAL HEADER */}

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

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm">
                  {success}
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
                placeholder="Ví dụ: BLACKPINK"
                autoFocus
                disabled={saving}
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