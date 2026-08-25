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
  ChevronRight
} from 'lucide-react';

export default function AdminGroups() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [formData, setFormData] = useState({
    name: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalError, setModalError] = useState('');

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
  // THÊM
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
  // SỬA
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
  // SUBMIT
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
          { name }
        );

        setSuccess('Cập nhật nhóm nhạc thành công!');
      } else {
        await axios.post(
          `${API_URL}/groups`,
          { name }
        );

        setSuccess('Thêm nhóm nhạc thành công!');
      }

      await fetchGroups();

      handleCloseModal();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {
      console.error('Lỗi lưu nhóm:', err);

      setModalError(
        err.response?.data?.message ||
        'Không thể lưu nhóm nhạc!'
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // XÓA
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

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {
      console.error('Lỗi xóa nhóm:', err);

      setError(
        err.response?.data?.message ||
        'Không thể xóa nhóm nhạc!'
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredGroups = groups.filter((group) =>
    group.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100 flex">

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

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
                Quản lý các nhóm Kpop
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

        <main className="p-4 sm:p-6 lg:p-8">

          {/* ERROR */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">

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

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* TOP */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">

              <div>
                <h2 className="font-bold text-slate-900">
                  Danh sách nhóm nhạc
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Tổng cộng {groups.length} nhóm
                </p>
              </div>

              <div className="relative w-full sm:w-72">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  placeholder="Tìm nhóm nhạc..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="
                    w-full
                    bg-slate-50
                    border border-slate-200
                    rounded-xl
                    pl-9 pr-4 py-2.5
                    text-sm
                    outline-none
                    focus:bg-white
                    focus:ring-2
                    focus:ring-sky-400
                  "
                />

              </div>

            </div>

            {/* TABLE */}

            {loading ? (

              <div className="py-20 flex flex-col items-center justify-center">

                <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-3" />

                <p className="text-sm text-slate-500">
                  Đang tải nhóm nhạc...
                </p>

              </div>

            ) : filteredGroups.length === 0 ? (

              <div className="py-20 text-center">

                <Music2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />

                <p className="font-semibold text-slate-600">
                  Không có nhóm nhạc
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">

                      <th className="px-6 py-4 w-24">
                        ID
                      </th>

                      <th className="px-6 py-4">
                        Nhóm nhạc
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

                        <td className="px-6 py-5">
                          <span className="font-bold text-slate-400">
                            #{group.id}
                          </span>
                        </td>

                        <td className="px-6 py-5">

                          <button
                            onClick={() =>
                              navigate(`/admin/groups/${group.id}`)
                            }
                            className="flex items-center gap-3 group"
                          >

                            <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center">
                              <Music2 className="w-5 h-5 text-sky-500" />
                            </div>

                            <div className="text-left">

                              <p className="font-bold text-slate-900 group-hover:text-sky-600 transition">
                                {group.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                Xem danh sách album
                              </p>

                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500" />

                          </button>

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() => handleEdit(group)}
                              className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(group)}
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

        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">

            <div className="p-5 border-b border-slate-100 flex justify-between items-center">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  {editingGroup
                    ? 'Chỉnh sửa nhóm nhạc'
                    : 'Thêm nhóm nhạc'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Nhập tên nhóm Kpop
                </p>

              </div>

              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5"
            >

              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {modalError}
                </div>
              )}

              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Tên nhóm nhạc
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
                disabled={saving}
                placeholder="Ví dụ: BLACKPINK"
                className="
                  w-full
                  border border-slate-200
                  bg-slate-50
                  rounded-xl
                  px-4 py-3
                  text-sm
                  outline-none
                  focus:bg-white
                  focus:ring-2
                  focus:ring-sky-400
                "
              />

              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={handleCloseModal}
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

                  {saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {editingGroup ? 'Cập nhật' : 'Thêm nhóm'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}