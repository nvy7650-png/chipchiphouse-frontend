import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Album,
  CalendarDays,
  Package,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [group, setGroup] = useState(null);
  const [albums, setAlbums] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    release_date: '',
    description: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // =====================================================
  // LOAD GROUP + ALBUM
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const groupRes = await axios.get(
        `${API_URL}/groups/${id}`
      );

      const albumRes = await axios.get(
        `${API_URL}/groups/${id}/albums`
      );

      setGroup(
        groupRes.data.group ||
        groupRes.data.data
      );

      setAlbums(
        albumRes.data.albums ||
        albumRes.data.data ||
        []
      );

    } catch (err) {
      console.error('Lỗi lấy chi tiết nhóm:', err);

      setError(
        err.response?.data?.message ||
        'Không thể lấy thông tin nhóm nhạc!'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // =====================================================
  // ADD ALBUM
  // =====================================================

  const handleAdd = () => {
    setEditingAlbum(null);

    setFormData({
      title: '',
      release_date: '',
      description: ''
    });

    setModalError('');
    setShowModal(true);
  };

  // =====================================================
  // EDIT ALBUM
  // =====================================================

  const handleEdit = (album) => {
    setEditingAlbum(album);

    setFormData({
      title: album.title || '',
      release_date: album.release_date
        ? album.release_date.substring(0, 10)
        : '',
      description: album.description || ''
    });

    setModalError('');
    setShowModal(true);
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingAlbum(null);

    setFormData({
      title: '',
      release_date: '',
      description: ''
    });

    setModalError('');
  };

  // =====================================================
  // CHANGE
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

    if (!formData.title.trim()) {
      setModalError('Vui lòng nhập tên album!');
      return;
    }

    try {
      setSaving(true);
      setModalError('');

      const payload = {
        title: formData.title.trim(),
        release_date: formData.release_date || null,
        description: formData.description.trim()
      };

      if (editingAlbum) {

        await axios.put(
          `${API_URL}/albums/${editingAlbum.id}`,
          payload
        );

        setSuccess('Cập nhật album thành công!');

      } else {

        await axios.post(
          `${API_URL}/groups/${id}/albums`,
          payload
        );

        setSuccess('Thêm album thành công!');
      }

      await fetchData();

      handleCloseModal();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {
      console.error('Lỗi lưu album:', err);

      setModalError(
        err.response?.data?.message ||
        'Không thể lưu album!'
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (album) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa album "${album.title}" không?`
    );

    if (!confirmed) return;

    try {
      setError('');

      await axios.delete(
        `${API_URL}/albums/${album.id}`
      );

      setSuccess('Xóa album thành công!');

      await fetchData();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {
      console.error('Lỗi xóa album:', err);

      setError(
        err.response?.data?.message ||
        'Không thể xóa album!'
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return 'Chưa cập nhật';

    return new Date(date).toLocaleDateString('vi-VN');
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

        <div className="flex-1 lg:ml-64 flex items-center justify-center">

          <div className="text-center">

            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />

            <p className="text-sm text-slate-500">
              Đang tải thông tin nhóm...
            </p>

          </div>

        </div>

      </div>
    );
  }

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
                Quản lý album
              </h1>

              <p className="text-xs text-slate-500">
                {group?.name}
              </p>

            </div>

          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
          >

            <Plus className="w-4 h-4" />

            <span className="hidden sm:inline">
              Thêm album
            </span>

          </button>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {/* BACK */}

          <button
            onClick={() => navigate('/admin/groups')}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-sky-600 mb-6"
          >

            <ArrowLeft className="w-4 h-4" />

            Quay lại nhóm nhạc

          </button>

          {/* ERROR */}

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">

              <AlertCircle className="w-5 h-5" />

              {error}

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
              {success}
            </div>
          )}

          {/* GROUP INFO */}

          <div className="bg-slate-900 rounded-2xl p-6 mb-6 text-white">

            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              KPOP GROUP
            </p>

            <h2 className="text-3xl font-black mt-1">
              {group?.name}
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              {albums.length} album
            </p>

          </div>

          {/* ALBUMS */}

          {albums.length === 0 ? (

            <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">

              <Album className="w-12 h-12 mx-auto text-slate-300 mb-3" />

              <p className="font-bold text-slate-600">
                Chưa có album
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Hãy thêm album đầu tiên cho nhóm này
              </p>

              <button
                onClick={handleAdd}
                className="mt-5 px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold"
              >
                + Thêm album
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {albums.map((album) => (

                <div
                  key={album.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
                >

                  <div className="p-6">

                    <div className="flex items-start justify-between">

                      <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
                        <Album className="w-6 h-6 text-sky-500" />
                      </div>

                      <div className="flex gap-1">

                        <button
                          onClick={() => handleEdit(album)}
                          className="p-2 rounded-lg hover:bg-sky-50 text-sky-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(album)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                    </div>

                    <h3 className="text-xl font-black text-slate-900 mt-5">
                      {album.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">

                      <CalendarDays className="w-4 h-4" />

                      {formatDate(album.release_date)}

                    </div>

                    <div className="flex items-center gap-2 mt-4">

                      <Package className="w-4 h-4 text-sky-500" />

                      <span className="text-sm font-semibold text-slate-600">
                        {album.product_count || 0} version
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        navigate(`/admin/albums/${album.id}`)
                      }
                      className="
                        w-full
                        mt-5
                        flex items-center justify-center gap-2
                        px-4 py-2.5
                        rounded-xl
                        bg-slate-100
                        hover:bg-sky-50
                        hover:text-sky-600
                        text-sm
                        font-bold
                        text-slate-700
                        transition
                      "
                    >

                      Quản lý version

                      <ChevronRight className="w-4 h-4" />

                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </main>

      </div>

      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">

            <div className="p-5 border-b border-slate-100 flex justify-between">

              <div>

                <h2 className="text-lg font-bold">
                  {editingAlbum
                    ? 'Chỉnh sửa album'
                    : 'Thêm album'}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Album của {group?.name}
                </p>

              </div>

              <button
                onClick={handleCloseModal}
                disabled={saving}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-5"
            >

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {modalError}
                </div>
              )}

              {/* TITLE */}

              <div>

                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Tên album
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ví dụ: BORN PINK"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                />

              </div>

              {/* DATE */}

              <div>

                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Ngày phát hành
                </label>

                <input
                  type="date"
                  name="release_date"
                  value={formData.release_date}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Mô tả
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Mô tả album..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-400 resize-none"
                />

              </div>

              <div className="flex justify-end gap-3">

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

                  {editingAlbum
                    ? 'Cập nhật'
                    : 'Thêm album'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}