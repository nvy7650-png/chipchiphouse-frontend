import React, {
  useEffect,
  useRef,
  useState
} from 'react';

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
  AlertCircle,
  RefreshCw
} from 'lucide-react';


export default function AdminProducts() {

  const API_URL =
    import.meta.env.VITE_API_URL;

  const fileInputRef = useRef(null);


  // =====================================================
  // STATE
  // =====================================================

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [products, setProducts] =
    useState([]);

  const [albums, setAlbums] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [categoryFilter, setCategoryFilter] =
    useState('all');


  // MODAL

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [saving, setSaving] =
    useState(false);


  // IMAGE

  const [imagePreview, setImagePreview] =
    useState('');


  // FORM

  const [form, setForm] = useState({

    album_id: '',

    title: '',

    version_name: '',

    price: '',

    category: 'album',

    is_preorder: false,

    release_date: '',

    description: '',

    image: null

  });


  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

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


  // =====================================================
  // FETCH ALBUMS
  // =====================================================

  const fetchAlbums = async () => {

    try {

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

    }

  };


  useEffect(() => {

    fetchProducts();
    fetchAlbums();

  }, []);


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setForm({

      album_id: '',

      title: '',

      version_name: '',

      price: '',

      category: 'album',

      is_preorder: false,

      release_date: '',

      description: '',

      image: null

    });

    setImagePreview('');

    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

  };


  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddModal = () => {

    resetForm();

    setShowModal(true);

  };


  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditModal = (product) => {

    setEditingId(product.id);

    setForm({

      album_id:
        product.album_id || '',

      title:
        product.title || '',

      version_name:
        product.version_name || '',

      price:
        product.price || '',

      category:
        product.category || 'album',

      is_preorder:
        Boolean(product.is_preorder),

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

    setImagePreview(
      product.image_url || ''
    );

    setShowModal(true);

  };


  // =====================================================
  // CLOSE
  // =====================================================

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);

    resetForm();

  };


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setForm(prev => ({

      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value

    }));

  };


  // =====================================================
  // IMAGE
  // =====================================================

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
        'Chỉ được chọn JPG, PNG hoặc WEBP!'
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


    setForm(prev => ({

      ...prev,

      image: file

    }));


    const url =
      URL.createObjectURL(file);

    setImagePreview(url);

  };


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!form.album_id) {

      alert(
        'Vui lòng chọn album!'
      );

      return;

    }


    if (!form.title.trim()) {

      alert(
        'Vui lòng nhập tên sản phẩm!'
      );

      return;

    }


    if (!form.version_name.trim()) {

      alert(
        'Vui lòng nhập tên version!'
      );

      return;

    }


    if (
      form.price === '' ||
      Number(form.price) < 0
    ) {

      alert(
        'Vui lòng nhập giá bán hợp lệ!'
      );

      return;

    }


    try {

      setSaving(true);


      const data =
        new FormData();


      data.append(
        'album_id',
        form.album_id
      );

      data.append(
        'title',
        form.title.trim()
      );

      data.append(
        'version_name',
        form.version_name.trim()
      );

      data.append(
        'price',
        form.price
      );

      data.append(
        'category',
        form.category
      );

      data.append(
        'is_preorder',
        form.is_preorder
          ? '1'
          : '0'
      );


      if (form.release_date) {

        data.append(
          'release_date',
          form.release_date
        );

      }


      if (
        form.description.trim()
      ) {

        data.append(
          'description',
          form.description.trim()
        );

      }


      if (form.image) {

        data.append(
          'image',
          form.image
        );

      }


      let res;


      if (editingId) {

        res =
          await axios.put(
            `${API_URL}/products/${editingId}`,
            data,
            {
              headers: {
                'Content-Type':
                  'multipart/form-data'
              }
            }
          );

      } else {

        res =
          await axios.post(
            `${API_URL}/products`,
            data,
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
        'Thành công!'
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


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    product
  ) => {

    const confirmed =
      window.confirm(

        `Bạn có chắc muốn xóa sản phẩm "${product.title} - ${product.version_name}" không?`

      );


    if (!confirmed) return;


    try {

      await axios.delete(
        `${API_URL}/products/${product.id}`
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


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (value) => {

    return Number(value || 0)
      .toLocaleString('vi-VN') + 'đ';

  };


  // =====================================================
  // FILTER
  // =====================================================

  const filteredProducts =
    products.filter(product => {

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
        categoryFilter === 'all' ||
        product.category ===
          categoryFilter;


      return (
        matchSearch &&
        matchCategory
      );

    });


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


  // =====================================================
  // MAIN
  // =====================================================

  return (

    <div className="min-h-screen bg-slate-100 flex">

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />


      <main className="flex-1 lg:ml-64 min-w-0">


        {/* HEADER */}

        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">

          <div>

            <h1 className="text-xl font-black text-slate-900">
              Quản lý sản phẩm
            </h1>

            <p className="text-xs text-slate-500">
              Quản lý album, version và giá bán
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


          {/* TOP CARD */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">


            <div className="p-5 border-b border-slate-100">

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">


                <div>

                  <h2 className="font-bold text-slate-900">
                    Danh sách sản phẩm
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Tổng cộng {products.length} sản phẩm
                  </p>

                </div>


                <div className="flex flex-col sm:flex-row gap-3">


                  {/* SEARCH */}

                  <div className="relative">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      value={search}
                      onChange={e =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Tìm sản phẩm..."
                      className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-400"
                  >

                    <option value="all">
                      Tất cả danh mục
                    </option>

                    <option value="album">
                      Album
                    </option>

                    <option value="card">
                      Card
                    </option>

                    <option value="goods">
                      Goods
                    </option>

                    <option value="lightstick">
                      Lightstick
                    </option>

                  </select>

                </div>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="m-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">

                <AlertCircle className="w-5 h-5" />

                <span>
                  {error}
                </span>

              </div>

            )}


            {/* TABLE */}

            {filteredProducts.length === 0 ? (

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

                    <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase">

                      <th className="px-5 py-4">
                        Sản phẩm
                      </th>

                      <th className="px-5 py-4">
                        Album
                      </th>

                      <th className="px-5 py-4">
                        Giá bán
                      </th>

                      <th className="px-5 py-4">
                        Giá nhập bình quân
                      </th>

                      <th className="px-5 py-4">
                        Lãi dự kiến
                      </th>

                      <th className="px-5 py-4">
                        Tồn kho
                      </th>

                      <th className="px-5 py-4 text-right">
                        Thao tác
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {filteredProducts.map(
                      product => {

                        const profit =
                          Number(
                            product.estimated_profit ||
                            0
                          );

                        return (

                          <tr
                            key={product.id}
                            className="hover:bg-slate-50 transition"
                          >


                            {/* PRODUCT */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">


                                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">

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

                                  <p className="font-bold text-slate-900">
                                    {product.title}
                                  </p>

                                  <p className="text-xs text-sky-600 font-semibold mt-1">
                                    {product.version_name}
                                  </p>

                                </div>

                              </div>

                            </td>


                            {/* ALBUM */}

                            <td className="px-5 py-4">

                              <p className="text-sm font-semibold text-slate-700">
                                {product.album_name || '-'}
                              </p>

                              <p className="text-xs text-slate-400 mt-1">
                                {product.group_name || ''}
                              </p>

                            </td>


                            {/* PRICE */}

                            <td className="px-5 py-4">

                              <span className="font-bold text-slate-900">
                                {formatMoney(
                                  product.price
                                )}
                              </span>

                            </td>


                            {/* IMPORT PRICE */}

                            <td className="px-5 py-4">

                              <span className="text-sm text-slate-600">
                                {formatMoney(
                                  product.average_import_price
                                )}
                              </span>

                            </td>


                            {/* PROFIT */}

                            <td className="px-5 py-4">

                              <span
                                className={
                                  profit >= 0
                                    ? 'font-bold text-emerald-600'
                                    : 'font-bold text-red-500'
                                }
                              >

                                {formatMoney(
                                  profit
                                )}

                              </span>

                            </td>


                            {/* STOCK */}

                            <td className="px-5 py-4">

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  px-2.5
                                  py-1
                                  rounded-lg
                                  text-xs
                                  font-bold
                                  ${
                                    Number(
                                      product.stock
                                    ) > 0

                                      ? 'bg-emerald-50 text-emerald-600'

                                      : 'bg-red-50 text-red-500'
                                  }
                                `}
                              >

                                {product.stock || 0}

                              </span>

                            </td>


                            {/* ACTION */}

                            <td className="px-5 py-4">

                              <div className="flex justify-end gap-2">

                                <button
                                  onClick={() =>
                                    openEditModal(
                                      product
                                    )
                                  }
                                  className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 hover:bg-sky-100 flex items-center justify-center"
                                  title="Sửa"
                                >

                                  <Pencil className="w-4 h-4" />

                                </button>


                                <button
                                  onClick={() =>
                                    handleDelete(
                                      product
                                    )
                                  }
                                  className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"
                                  title="Xóa"
                                >

                                  <Trash2 className="w-4 h-4" />

                                </button>

                              </div>

                            </td>

                          </tr>

                        );

                      }
                    )}

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


          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">


            {/* HEADER */}

            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-black text-slate-900">

                  {editingId
                    ? 'Chỉnh sửa sản phẩm'
                    : 'Thêm sản phẩm'}

                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Quản lý thông tin sản phẩm
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


              {/* ALBUM */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-1.5">

                  Album
                  <span className="text-red-500">
                    {' '}*
                  </span>

                </label>


                <select
                  name="album_id"
                  value={form.album_id}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >

                  <option value="">
                    -- Chọn album --
                  </option>


                  {albums.map(
                    album => (

                      <option
                        key={album.id}
                        value={album.id}
                      >

                        {album.group_name}
                        {' - '}
                        {album.name}

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* TITLE + VERSION */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


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
                    disabled={saving}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />

                </div>


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
                    placeholder="Ví dụ: Photobook Ver."
                    maxLength={100}
                    disabled={saving}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />

                </div>

              </div>


              {/* PRICE + CATEGORY */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


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
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      VNĐ
                    </span>

                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Giá bán hiện tại của sản phẩm
                  </p>

                </div>


                <div>

                  <label className="block text-sm font-bold text-slate-700 mb-1.5">

                    Danh mục

                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400"
                  >

                    <option value="album">
                      Album
                    </option>

                    <option value="card">
                      Card
                    </option>

                    <option value="goods">
                      Goods
                    </option>

                    <option value="lightstick">
                      Lightstick
                    </option>

                  </select>

                </div>

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
                  onChange={handleImageChange}
                  className="hidden"
                />


                <div className="flex gap-4">


                  <div className="w-32 h-32 aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">

                    {imagePreview ? (

                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="text-center">

                        <ImagePlus className="w-8 h-8 text-slate-300 mx-auto" />

                        <p className="text-[11px] text-slate-400 mt-1">
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
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
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

                  </div>

                </div>

              </div>


              {/* PREORDER */}

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  name="is_preorder"
                  checked={form.is_preorder}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-4 h-4 accent-sky-500"
                />

                <div>

                  <p className="text-sm font-bold text-slate-700">
                    Sản phẩm Pre-order
                  </p>

                  <p className="text-xs text-slate-400">
                    Đánh dấu nếu sản phẩm đang mở đặt trước
                  </p>

                </div>

              </label>


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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400"
                />

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
                  disabled={saving}
                  placeholder="Mô tả sản phẩm..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />

              </div>


              {/* NOTE */}

              {!editingId && (

                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">

                  <p className="text-xs text-sky-700 leading-relaxed">

                    <strong>Lưu ý:</strong>{' '}

                    Sản phẩm mới sẽ có tồn kho bằng 0.
                    Tồn kho sẽ được cập nhật thông qua
                    chức năng <strong>Quản lý Phiếu nhập</strong>.

                  </p>

                </div>

              )}


              {/* BUTTON */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
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