import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

import {
  ArrowLeft,
  Plus,
  Package,
  Calendar,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
  Music2
} from 'lucide-react';

export default function GroupDetail() {
  // Fix 1: Lấy đúng 'id' từ URL params và đổi tên thành groupId
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [group, setGroup] = useState(null);
  const [albums, setAlbums] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState({
    name: '',
    release_date: '',
    description: '',
    image_url: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // =========================================================
  // LẤY THÔNG TIN NHÓM + SẢN PHẨM / ALBUM
  // =========================================================

  const fetchGroupDetail = async () => {
    if (!groupId) {
      setError('Không xác định được nhóm nhạc!');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fix 2: Đã sửa tên biến thành res nhất quán
      const res = await axios.get(`${API_URL}/groups/${groupId}/products`);
      console.log('Group Data:', res.data);

      setGroup(res.data.group);
      
      // Fix 3: Lấy sản phẩm từ API nhóm
      setAlbums(res.data.products || []);

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
    fetchGroupDetail();
  }, [groupId]);

  // =========================================================
  // FORM
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // =========================================================
  // THÊM ALBUM
  // =========================================================

  const handleAddAlbum = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert('Vui lòng nhập tên album!');
      return;
    }

    try {
      setAdding(true);

      const res = await axios.post(
        `${API_URL}/albums`,
        {
          group_id: Number(groupId),
          name: form.name.trim(),
          release_date: form.release_date || null,
          description: form.description.trim() || null,
          image_url: form.image_url.trim() || null
        }
      );

      console.log('Album created:', res.data);

      alert('Thêm album thành công!');

      // Reset form
      setForm({
        name: '',
        release_date: '',
        description: '',
        image_url: ''
      });

      setShowAddModal(false);

      // Load lại danh sách
      await fetchGroupDetail();

    } catch (err) {
      console.error('Lỗi thêm album:', err);

      alert(
        err.response?.data?.message ||
        'Không thể thêm album!'
      );
    } finally {
      setAdding(false);
    }
  };

  // =========================================================
  // XÓA ALBUM
  // =========================================================

  const handleDeleteAlbum = async (albumId, albumName) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa album "${albumName}" không?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/albums/${albumId}`
      );

      alert('Xóa album thành công!');

      await fetchGroupDetail();

    } catch (err) {
      console.error('Lỗi xóa album:', err);

      alert(
        err.response?.data?.message ||
        'Không thể xóa album!'
      );
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return 'Chưa có ngày phát hành';

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return date;
    }

    return d.toLocaleDateString('vi-VN');
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
              Đang tải thông tin nhóm...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <main className="flex-1 lg:ml-64 p-6 lg:p-8">
          <button
            onClick={() => navigate('/admin/groups')}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-sky-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại nhóm nhạc
          </button>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
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

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/groups')}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-sky-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">

          {/* GROUP HEADER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0">
                <Music2 className="w-7 h-7 text-sky-500" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Nhóm nhạc
                </p>

                <h1 className="text-3xl font-black text-slate-900 mt-1">
                  {group?.name}
                </h1>

                <p className="text-sm text-slate-500 mt-2">
                  {albums.length} album
                </p>
              </div>
            </div>
          </div>

          {/* ALBUM LIST */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Album
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Danh sách album của {group?.name}
                </p>
              </div>

              <span className="text-xs font-bold text-slate-400">
                {albums.length} album
              </span>
            </div>

            {albums.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-500">
                  Chưa có album
                </p>
                <p className="text-sm text-slate-400 mt-1 mb-5">
                  Hãy thêm album đầu tiên cho nhóm này
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600"
                >
                  <Plus className="w-4 h-4" />
                  Thêm album
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {albums.map((album) => {
                  const titleName = album.title || album.name;
                  return (
                    <div
                      key={album.id}
                      className="p-5 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div
                        onClick={() => navigate(`/admin/albums/${album.id}`)}
                        className="flex items-center gap-4 flex-1 cursor-pointer min-w-0"
                      >
                        <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                          {album.image_url ? (
                            <img
                              src={album.image_url}
                              alt={titleName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">
                            {titleName}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(album.release_date)}
                            </span>

                            {album.version_count !== undefined && (
                              <span className="text-xs font-semibold text-sky-600">
                                {album.version_count || 0} version
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => handleDeleteAlbum(album.id, titleName)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition"
                          title="Xóa album"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <ChevronRight
                          onClick={() => navigate(`/admin/albums/${album.id}`)}
                          className="w-5 h-5 text-slate-400 cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* ADD ALBUM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!adding) setShowAddModal(false);
            }}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Thêm album
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Thêm album cho {group?.name}
                </p>
              </div>

              <button
                onClick={() => {
                  if (!adding) setShowAddModal(false);
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAlbum} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Tên album <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: The Album"
                  maxLength={150}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Ngày phát hành
                </label>
                <input
                  type="date"
                  name="release_date"
                  value={form.release_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Link ảnh album
                </label>
                <input
                  type="text"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Mô tả album..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={adding}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 disabled:opacity-60 flex items-center gap-2"
                >
                  {adding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Thêm album
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