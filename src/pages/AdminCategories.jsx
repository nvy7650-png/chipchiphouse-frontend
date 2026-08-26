import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { FolderTree, Plus, Search, Pencil, Trash2, X } from 'lucide-react';

export default function AdminCategories() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [categories, setCategories] = useState([
    {
      id: 'album',
      name: 'Album',
      description: 'Album Kpop chính hãng',
      productCount: 0
    },
    {
      id: 'card',
      name: 'Photocard',
      description: 'Photocard và trading card',
      productCount: 0
    },
    {
      id: 'goods',
      name: 'Goods',
      description: 'Các sản phẩm Kpop merchandise',
      productCount: 0
    },
    {
      id: 'lightstick',
      name: 'Lightstick',
      description: 'Lightstick chính hãng',
      productCount: 0
    }
  ]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const filteredCategories = categories.filter(category =>
    category.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdd = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const newCategory = {
      id: formData.name
        .toLowerCase()
        .replace(/\s+/g, '-'),
      name: formData.name,
      description:
        formData.description || 'Chưa có mô tả',
      productCount: 0
    };

    setCategories([
      ...categories,
      newCategory
    ]);

    setFormData({
      name: '',
      description: ''
    });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const category = categories.find(
      item => item.id === id
    );
    if (!category) return;

    if (category.productCount > 0) {
      alert(
        'Không thể xóa danh mục đang có sản phẩm!'
      );
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${category.name}"?`
    );

    if (!confirmed) return;

    setCategories(
      categories.filter(
        item => item.id !== id
      )
    );
  };

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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">
              Thêm danh mục
            </span>
          </button>

        </header>

        {/* CONTENT */}
        <main className="p-4 sm:p-6 lg:p-8">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* TOOLBAR */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">

              <div>
                <h2 className="font-black text-slate-900">
                  Danh sách danh mục
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Tổng cộng {categories.length} danh mục
                </p>
              </div>

              {/* SEARCH */}
              <div className="relative w-full sm:w-72">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  placeholder="Tìm danh mục..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
                />

              </div>

            </div>

            {/* TABLE */}
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

                  {filteredCategories.map(category => (

                    <tr
                      key={category.id}
                      className="hover:bg-slate-50 transition"
                    >

                      {/* NAME */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">

                            <FolderTree className="w-5 h-5" />

                          </div>

                          <div>

                            <p className="font-bold text-slate-900">
                              {category.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {category.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* DESCRIPTION */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {category.description}
                      </td>

                      {/* COUNT */}
                      <td className="px-6 py-4 text-center">

                        <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                          {category.productCount}
                        </span>

                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            className="p-2 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(category.id)
                            }
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

                      <td
                        colSpan="4"
                        className="py-12 text-center text-slate-400"
                      >
                        Không tìm thấy danh mục
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>

      {/* ========================================
          MODAL THÊM DANH MỤC
      ======================================== */}
      {showModal && (

        <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

            {/* MODAL HEADER */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">

              <div>

                <h2 className="font-black text-lg text-slate-900">
                  Thêm danh mục
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Tạo danh mục sản phẩm mới
                </p>

              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleAdd}
              className="p-5 space-y-4"
            >

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
                  Thêm danh mục
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}