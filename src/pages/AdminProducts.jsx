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
  ChevronDown,
  AlertCircle
} from 'lucide-react';

export default function AdminProduct() {

  const API_URL = import.meta.env.VITE_API_URL;

  const fileInputRef = useRef(null);

  // =====================================================
  // STATE
  // =====================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search chỉ dùng để FILTER LOCAL
  const [search, setSearch] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);

  const [imagePreview, setImagePreview] = useState('');

  // Album search trong modal
  const [albumSearch, setAlbumSearch] = useState('');

  const [albums, setAlbums] = useState([]);

  const [loadingAlbums, setLoadingAlbums] = useState(false);

  const [showAlbumList, setShowAlbumList] = useState(false);

  // =====================================================
  // FORM
  // =====================================================

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

  // =====================================================
  // CATEGORY
  // =====================================================

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

  // =====================================================
  // LẤY TOÀN BỘ SẢN PHẨM
  //
  // CHỈ GỌI 1 LẦN KHI MỞ TRANG
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
  // CHỈ LOAD 1 LẦN
  // =====================================================

  useEffect(() => {

    fetchProducts();

  }, []);

  // =====================================================
  // FILTER LOCAL
  //
  // KHÔNG GỌI API
  // KHÔNG RELOAD
  // =====================================================

  const filteredProducts =
    products.filter((product) => {

      const keyword =
        search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        String(product.title || '')
          .toLowerCase()
          .includes(keyword) ||

        String(product.version_name || '')
          .toLowerCase()
          .includes(keyword) ||

        String(product.album_name || '')
          .toLowerCase()
          .includes(keyword) ||

        String(product.group_name || '')
          .toLowerCase()
          .includes(keyword);

      const matchesCategory =
        !categoryFilter ||
        product.category === categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );

    });

  // =====================================================
  // LẤY ALBUM
  //
  // Cũng chỉ lấy 1 lần khi mở modal.
  // Sau đó tìm album LOCAL.
  // =====================================================

  const fetchAlbums = async () => {

    try {

      setLoadingAlbums(true);

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

    } finally {

      setLoadingAlbums(false);

    }
  };

  // =====================================================
  // ALBUM LOCAL SEARCH
  // =====================================================

  const filteredAlbums =
    albums.filter((album) => {

      const keyword =
        albumSearch.trim().toLowerCase();

      if (!keyword) {
        return true;
      }

      return (
        String(album.name || '')
          .toLowerCase()
          .includes(keyword) ||

        String(album.group_name || '')
          .toLowerCase()
          .includes(keyword)
      );

    });

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setForm({
      ...emptyForm
    });

    setEditingId(null);

    setImagePreview('');

    setAlbumSearch('');

    setShowAlbumList(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

  };

  // =====================================================
  // MỞ MODAL THÊM
  // =====================================================

  const openAddModal = () => {

    resetForm();

    setShowModal(true);

    // Load album 1 lần
    fetchAlbums();

  };

  // =====================================================
  // MỞ MODAL SỬA
  // =====================================================

  const openEditModal = async (product) => {

    resetForm();

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

    }

    setShowModal(true);

    await fetchAlbums();

  };

  // =====================================================
  // ĐÓNG MODAL
  // =====================================================

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    resetForm();

  };

  // =====================================================
  // CHANGE FORM
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setForm((prev) => ({

      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value

    }));

  };

  // =====================================================
  // CHANGE CATEGORY
  // =====================================================

  const handleCategoryChange = (e) => {

    const category =
      e.target.value;

    setForm((prev) => ({

      ...prev,

      category,

      // Nếu không phải album
      // thì xóa album + version
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

  // =====================================================
  // CHỌN ALBUM
  // =====================================================

  const handleSelectAlbum = (album) => {

    setForm((prev) => ({

      ...prev,

      album_id: album.id,

      album_name:
        `${album.group_name || ''} - ${album.name}`

    }));

    setAlbumSearch('');

    setShowAlbumList(false);

  };

  // =====================================================
  // IMAGE
  // =====================================================

  const handleImageChange = (e) => {

    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {

      alert(
        'Chỉ được chọn ảnh JPG, JPEG, PNG hoặc WEBP!'
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

    setForm((prev) => ({

      ...prev,

      image: file

    }));

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(
      previewUrl
    );

  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    // -----------------------------
    // TITLE
    // -----------------------------

    if (!form.title.trim()) {

      alert(
        'Vui lòng nhập tên sản phẩm!'
      );

      return;
    }

    // -----------------------------
    // PRICE
    // -----------------------------

    if (
      form.price === '' ||
      isNaN(Number(form.price)) ||
      Number(form.price) < 0
    ) {

      alert(
        'Giá bán không hợp lệ!'
      );

      return;
    }

    // -----------------------------
    // ALBUM
    // -----------------------------

    if (
      form.category === 'album'
    ) {

      if (!form.album_id) {

        alert(
          'Vui lòng chọn album!'
        );

        return;
      }

      if (
        !form.version_name.trim()
      ) {

        alert(
          'Album phải có tên version!'
        );

        return;
      }

    }

    try {

      setSaving(true);

      const formData =
        new FormData();

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
        form.is_preorder
          ? '1'
          : '0'
      );

      if (
        form.category === 'album'
      ) {

        formData.append(
          'album_id',
          form.album_id
        );

        formData.append(
          'version_name',
          form.version_name.trim()
        );

      }

      if (form.release_date) {

        formData.append(
          'release_date',
          form.release_date
        );

      }

      if (
        form.description.trim()
      ) {

        formData.append(
          'description',
          form.description.trim()
        );

      }

      if (form.image) {

        formData.append(
          'image',
          form.image
        );

      }

      let res;

      // =================================================
      // UPDATE
      // =================================================

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

      }

      // =================================================
      // CREATE
      // =================================================

      else {

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

      const savedProduct =
        res.data.product;

      // =================================================
      // CẬP NHẬT LOCAL
      //
      // KHÔNG GỌI FETCH PRODUCTS
      // =================================================

      if (editingId) {

        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...savedProduct
                }
              : item
          )
        );

      } else {

        setProducts((prev) => [

          savedProduct,

          ...prev

        ]);

      }

      alert(
        editingId
          ? 'Cập nhật sản phẩm thành công!'
          : 'Thêm sản phẩm thành công!'
      );

      setShowModal(false);

      resetForm();

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
        `Bạn có chắc muốn xóa "${product.title}" không?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await axios.delete(
        `${API_URL}/products/${product.id}`
      );

      // Xóa trực tiếp khỏi state
      setProducts((prev) =>
        prev.filter(
          (item) =>
            item.id !== product.id
        )
      );

      alert(
        'Xóa sản phẩm thành công!'
      );

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

    const number =
      Number(value || 0);

    return number.toLocaleString(
      'vi-VN'
    ) + ' ₫';

  };

  // =====================================================
  // FORMAT CATEGORY
  // =====================================================

  const getCategoryLabel = (
    category
  ) => {

    const item =
      categories.find(
        (c) =>
          c.value === category
      );

    return item?.label ||
      category;

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

        <main className="flex-1 lg:ml-64 flex items-center justify-center">

          <div className="text-center">

            <Loader2
              className="
                w-8 h-8
                text-sky-500
                animate-spin
                mx-auto
                mb-3
              "
            />

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

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="
          min-h-16
          bg-white
          border-b
          border-slate-200
          px-4 sm:px-8
          py-3
          flex
          flex-wrap
          gap-3
          items-center
          justify-between
        ">

          <div>

            <h1 className="
              text-xl
              sm:text-2xl
              font-black
              text-slate-900
            ">
              Quản lý sản phẩm
            </h1>

            <p className="
              text-xs
              text-slate-500
              mt-1
            ">
              Quản lý album, photocard, MD và lightstick
            </p>

          </div>

          <button
            onClick={openAddModal}
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              bg-sky-500
              text-white
              text-sm
              font-bold
              hover:bg-sky-600
              transition
            "
          >

            <Plus className="w-4 h-4" />

            Thêm sản phẩm

          </button>

        </header>

        <div className="
          p-4
          sm:p-6
          lg:p-8
        ">

          {/* =================================================
              SEARCH + FILTER
          ================================================= */}

          <div className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-4
            mb-6
          ">

            <div className="
              flex
              flex-col
              lg:flex-row
              gap-3
            ">

              {/* SEARCH */}

              <div className="
                relative
                flex-1
              ">

                <Search className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-slate-400
                " />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="
                    Tìm sản phẩm, album, nhóm nhạc...
                  "
                  className="
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    outline-none
                    focus:border-sky-400
                    focus:ring-2
                    focus:ring-sky-100
                    text-sm
                  "
                />

              </div>

              {/* CATEGORY */}

              <div className="
                relative
                lg:w-56
              ">

                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    appearance-none
                    px-4
                    py-3
                    pr-10
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    outline-none
                    focus:border-sky-400
                    focus:ring-2
                    focus:ring-sky-100
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >

                  <option value="">
                    Tất cả danh mục
                  </option>

                  {categories.map(
                    (category) => (

                      <option
                        key={
                          category.value
                        }
                        value={
                          category.value
                        }
                      >
                        {category.label}
                      </option>

                    )
                  )}

                </select>

                <ChevronDown className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-slate-400
                  pointer-events-none
                " />

              </div>

            </div>

            {/* RESULT COUNT */}

            <div className="
              flex
              items-center
              justify-between
              mt-3
            ">

              <p className="
                text-xs
                text-slate-500
              ">

                Hiển thị{' '}

                <span className="
                  font-bold
                  text-slate-700
                ">
                  {filteredProducts.length}
                </span>

                {' '}sản phẩm

              </p>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="
              bg-red-50
              border
              border-red-200
              rounded-2xl
              p-5
              flex
              items-center
              gap-3
              text-red-600
              mb-6
            ">

              <AlertCircle className="
                w-5 h-5
                shrink-0
              " />

              <span>
                {error}
              </span>

            </div>

          )}

          {/* =================================================
              PRODUCT LIST
          ================================================= */}

          <div className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            overflow-hidden
          ">

            {filteredProducts.length === 0 ? (

              <div className="
                py-20
                text-center
              ">

                <Package className="
                  w-12
                  h-12
                  text-slate-300
                  mx-auto
                  mb-3
                " />

                <p className="
                  font-bold
                  text-slate-500
                ">
                  Không tìm thấy sản phẩm
                </p>

                <p className="
                  text-sm
                  text-slate-400
                  mt-1
                ">
                  Thử thay đổi từ khóa tìm kiếm
                </p>

              </div>

            ) : (

              <div className="
                divide-y
                divide-slate-100
              ">

                {filteredProducts.map(
                  (product) => (

                    <div
                      key={product.id}
                      className="
                        p-4
                        sm:p-5
                        flex
                        items-center
                        gap-4
                        hover:bg-slate-50
                        transition
                      "
                    >

                      {/* IMAGE */}

                      <div className="
                        w-20
                        h-20
                        sm:w-24
                        sm:h-24
                        rounded-xl
                        bg-slate-100
                        overflow-hidden
                        shrink-0
                        flex
                        items-center
                        justify-center
                      ">

                        {product.image_url ? (

                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.title
                            }
                            className="
                              w-full
                              h-full
                              object-cover
                            "
                          />

                        ) : (

                          <Package className="
                            w-8
                            h-8
                            text-slate-300
                          " />

                        )}

                      </div>

                      {/* INFO */}

                      <div className="
                        flex-1
                        min-w-0
                      ">

                        <div className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        ">

                          <h3 className="
                            font-bold
                            text-slate-900
                            truncate
                          ">
                            {product.title}
                          </h3>

                          <span className="
                            px-2
                            py-1
                            rounded-lg
                            bg-sky-50
                            text-sky-600
                            text-[11px]
                            font-bold
                            shrink-0
                          ">
                            {getCategoryLabel(
                              product.category
                            )}
                          </span>

                        </div>

                        {/* ALBUM */}

                        {product.category ===
                          'album' && (

                          <p className="
                            text-xs
                            text-slate-500
                            mt-1
                            truncate
                          ">

                            {product.album_name ||
                              'Chưa có album'}

                            {product.version_name && (
                              <>
                                {' · '}
                                <span className="
                                  text-slate-700
                                  font-semibold
                                ">
                                  {product.version_name}
                                </span>
                              </>
                            )}

                          </p>

                        )}

                        {/* PRICE */}

                        <div className="
                          flex
                          flex-wrap
                          items-center
                          gap-x-5
                          gap-y-1
                          mt-2
                        ">

                          <div>

                            <span className="
                              text-[11px]
                              text-slate-400
                              block
                            ">
                              Giá bán
                            </span>

                            <span className="
                              text-sm
                              font-black
                              text-sky-600
                            ">
                              {formatMoney(
                                product.price
                              )}
                            </span>

                          </div>

                          <div>

                            <span className="
                              text-[11px]
                              text-slate-400
                              block
                            ">
                              Giá nhập TB
                            </span>

                            <span className="
                              text-sm
                              font-bold
                              text-slate-700
                            ">
                              {formatMoney(
                                product.average_import_price
                              )}
                            </span>

                          </div>

                          <div>

                            <span className="
                              text-[11px]
                              text-slate-400
                              block
                            ">
                              Tồn kho
                            </span>

                            <span className="
                              text-sm
                              font-bold
                              text-slate-700
                            ">
                              {Number(
                                product.stock || 0
                              ).toLocaleString(
                                'vi-VN'
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* ACTION */}

                      <div className="
                        flex
                        items-center
                        gap-2
                        shrink-0
                      ">

                        <button
                          onClick={() =>
                            openEditModal(
                              product
                            )
                          }
                          className="
                            w-9
                            h-9
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            text-slate-400
                            hover:bg-sky-50
                            hover:text-sky-500
                            transition
                          "
                          title="Sửa"
                        >

                          <Pencil className="
                            w-4
                            h-4
                          " />

                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              product
                            )
                          }
                          className="
                            w-9
                            h-9
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            text-red-400
                            hover:bg-red-50
                            hover:text-red-500
                            transition
                          "
                          title="Xóa"
                        >

                          <Trash2 className="
                            w-4
                            h-4
                          " />

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </main>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          p-4
        ">

          {/* OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-black/40
            "
            onClick={closeModal}
          />

          {/* MODAL */}

          <div className="
            relative
            w-full
            max-w-2xl
            max-h-[90vh]
            bg-white
            rounded-2xl
            shadow-xl
            overflow-hidden
            flex
            flex-col
          ">

            {/* HEADER */}

            <div className="
              px-6
              py-5
              border-b
              border-slate-100
              flex
              items-center
              justify-between
              shrink-0
            ">

              <div>

                <h2 className="
                  text-lg
                  font-black
                  text-slate-900
                ">
                  {editingId
                    ? 'Chỉnh sửa sản phẩm'
                    : 'Thêm sản phẩm'}
                </h2>

                <p className="
                  text-xs
                  text-slate-500
                  mt-1
                ">
                  Điền thông tin sản phẩm
                </p>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  hover:bg-slate-100
                  text-slate-500
                "
              >

                <X className="
                  w-5
                  h-5
                " />

              </button>

            </div>

            {/* BODY */}

            <form
              onSubmit={handleSubmit}
              className="
                p-6
                space-y-5
                overflow-y-auto
              "
            >

              {/* CATEGORY */}

              <div>

                <label className="
                  block
                  text-sm
                  font-bold
                  text-slate-700
                  mb-2
                ">
                  Danh mục
                </label>

                <div className="
                  grid
                  grid-cols-2
                  sm:grid-cols-4
                  gap-2
                ">

                  {categories.map(
                    (category) => (

                      <button
                        key={
                          category.value
                        }
                        type="button"
                        onClick={() =>
                          handleCategoryChange({
                            target: {
                              value:
                                category.value
                            }
                          })
                        }
                        className={`
                          px-3
                          py-2.5
                          rounded-xl
                          border
                          text-sm
                          font-bold
                          transition
                          ${
                            form.category ===
                            category.value
                              ? `
                                border-sky-400
                                bg-sky-50
                                text-sky-600
                              `
                              : `
                                border-slate-200
                                text-slate-600
                                hover:bg-slate-50
                              `
                          }
                        `}
                      >
                        {category.label}
                      </button>

                    )
                  )}

                </div>

              </div>

              {/* TITLE */}

              <div>

                <label className="
                  block
                  text-sm
                  font-bold
                  text-slate-700
                  mb-1.5
                ">
                  Tên sản phẩm
                  <span className="
                    text-red-500
                  ">
                    {' '}*
                  </span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder="
                    Ví dụ: RIIZE Photobook
                  "
                  disabled={saving}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    outline-none
                    focus:border-sky-400
                    focus:ring-2
                    focus:ring-sky-100
                  "
                />

              </div>

              {/* ALBUM */}

              {form.category === 'album' && (

                <div>

                  <label className="
                    block
                    text-sm
                    font-bold
                    text-slate-700
                    mb-1.5
                  ">
                    Album
                    <span className="
                      text-red-500
                    ">
                      {' '}*
                    </span>
                  </label>

                  {/* SELECTED ALBUM */}

                  {form.album_id ? (

                    <div className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      px-4
                      py-3
                      rounded-xl
                      bg-sky-50
                      border
                      border-sky-200
                    ">

                      <div className="
                        min-w-0
                      ">

                        <p className="
                          text-sm
                          font-bold
                          text-sky-700
                          truncate
                        ">
                          {form.album_name}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() => {

                          setForm((prev) => ({
                            ...prev,
                            album_id: '',
                            album_name: ''
                          }));

                          setShowAlbumList(
                            true
                          );

                        }}
                        className="
                          text-xs
                          font-bold
                          text-sky-600
                          hover:text-sky-800
                          shrink-0
                        "
                      >
                        Đổi album
                      </button>

                    </div>

                  ) : (

                    <div className="relative">

                      <div className="
                        relative
                      ">

                        <Search className="
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          w-4
                          h-4
                          text-slate-400
                        " />

                        <input
                          type="text"
                          value={albumSearch}
                          onChange={(e) => {

                            setAlbumSearch(
                              e.target.value
                            );

                            setShowAlbumList(
                              true
                            );

                          }}
                          onFocus={() =>
                            setShowAlbumList(
                              true
                            )
                          }
                          placeholder="
                            Nhập tên album hoặc nhóm để tìm...
                          "
                          className="
                            w-full
                            pl-10
                            pr-4
                            py-3
                            rounded-xl
                            border
                            border-slate-200
                            outline-none
                            focus:border-sky-400
                            focus:ring-2
                            focus:ring-sky-100
                          "
                        />

                      </div>

                      {showAlbumList && (

                        <div className="
                          absolute
                          z-20
                          left-0
                          right-0
                          mt-2
                          bg-white
                          border
                          border-slate-200
                          rounded-xl
                          shadow-lg
                          max-h-56
                          overflow-y-auto
                        ">

                          {loadingAlbums ? (

                            <div className="
                              p-4
                              text-center
                            ">

                              <Loader2 className="
                                w-5
                                h-5
                                animate-spin
                                text-sky-500
                                mx-auto
                              " />

                            </div>

                          ) : filteredAlbums.length ===
                            0 ? (

                            <div className="
                              p-4
                              text-center
                              text-sm
                              text-slate-400
                            ">
                              Không tìm thấy album
                            </div>

                          ) : (

                            filteredAlbums.map(
                              (album) => (

                                <button
                                  key={
                                    album.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    handleSelectAlbum(
                                      album
                                    )
                                  }
                                  className="
                                    w-full
                                    text-left
                                    px-4
                                    py-3
                                    hover:bg-sky-50
                                    transition
                                    border-b
                                    border-slate-100
                                    last:border-0
                                  "
                                >

                                  <p className="
                                    text-sm
                                    font-bold
                                    text-slate-800
                                  ">
                                    {album.name}
                                  </p>

                                  <p className="
                                    text-xs
                                    text-slate-400
                                    mt-0.5
                                  ">
                                    {album.group_name ||
                                      'Không có nhóm'}
                                  </p>

                                </button>

                              )
                            )

                          )}

                        </div>

                      )}

                    </div>

                  )}

                </div>

              )}

              {/* VERSION - CHỈ ALBUM */}

              {form.category === 'album' && (

                <div>

                  <label className="
                    block
                    text-sm
                    font-bold
                    text-slate-700
                    mb-1.5
                  ">
                    Version
                    <span className="
                      text-red-500
                    ">
                      {' '}*
                    </span>
                  </label>

                  <input
                    type="text"
                    name="version_name"
                    value={
                      form.version_name
                    }
                    onChange={handleChange}
                    placeholder="
                      Ví dụ: Photobook Ver.
                    "
                    disabled={saving}
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-slate-200
                      outline-none
                      focus:border-sky-400
                      focus:ring-2
                      focus:ring-sky-100
                    "
                  />

                </div>

              )}

              {/* PRICE */}

              <div>

                <label className="
                  block
                  text-sm
                  font-bold
                  text-slate-700
                  mb-1.5
                ">
                  Giá bán
                  <span className="
                    text-red-500
                  ">
                    {' '}*
                  </span>
                </label>

                <div className="
                  relative
                ">

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    placeholder="0"
                    disabled={saving}
                    className="
                      w-full
                      px-4
                      py-3
                      pr-12
                      rounded-xl
                      border
                      border-slate-200
                      outline-none
                      focus:border-sky-400
                      focus:ring-2
                      focus:ring-sky-100
                    "
                  />

                  <span className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    text-slate-400
                  ">
                    VNĐ
                  </span>

                </div>

              </div>

              {/* RELEASE DATE */}

              <div>

                <label className="
                  block
                  text-sm
                  font-bold
                  text-slate-700
                  mb-1.5
                ">
                  Ngày phát hành
                </label>

                <input
                  type="date"
                  name="release_date"
                  value={
                    form.release_date
                  }
                  onChange={handleChange}
                  disabled={saving}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    outline-none
                    focus:border-sky-400
                    focus:ring-2
                    focus:ring-sky-100
                  "
                />

              </div>

              {/* PREORDER */}

              <label className="
                flex
                items-center
                gap-3
                cursor-pointer
              ">

                <input
                  type="checkbox"
                  name="is_preorder"
                  checked={
                    form.is_preorder
                  }
                  onChange={handleChange}
                  disabled={saving}
                  className="
                    w-4
                    h-4
                    accent-sky-500
                  "
                />

                <span className="
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                  Sản phẩm Pre-order
                </span>

              </label>

              {/* IMAGE */}

              <div>

                <label className="
                  block
                  text-sm
                  font-bold
                  text-slate-700
                  mb-2
                ">
                  Hình ảnh
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="
                    image/jpeg,
                    image/jpg,
                    image/png,
                    image/webp
                  "
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

                <div className="
                  flex
                  items-start
                  gap-4
                ">

                  <div className="
                    w-28
                    h-28
                    rounded-2xl
                    border-2
                    border-dashed
                    border-slate-200
                    bg-slate-50
                    overflow-hidden
                    flex
                    items-center
                    justify-center
                    shrink-0
                  ">

                    {imagePreview ? (

                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />

                    ) : (

                      <div className="
                        text-center
                      ">

                        <ImagePlus className="
                          w-7
                          h-7
                          text-slate-300
                          mx-auto
                          mb-1
                        " />

                        <span className="
                          text-[10px]
                          text-slate-400
                        ">
                          Ảnh sản phẩm
                        </span>

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
                      className="
                        px-4
                        py-2.5
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-sm
                        font-bold
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >

                      <span className="
                        flex
                        items-center
                        gap-2
                      ">

                        <ImagePlus className="
                          w-4
                          h-4
                          text-sky-500
                        />

                        Chọn ảnh

                      </span>

                    </button>

                    <p className="
                      text-xs
                      text-slate-400
                      mt-2
                      leading-relaxed
                    ">
                      JPG, PNG hoặc WEBP
                      <br />
                      Tối đa 5MB
                    </p>

                  </div>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="
                  block
                  text-sm
                  font-bold
                  text-slate-700
                  mb-1.5
                ">
                  Mô tả
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  rows={4}
                  placeholder="
                    Mô tả sản phẩm...
                  "
                  disabled={saving}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    outline-none
                    resize-none
                    focus:border-sky-400
                    focus:ring-2
                    focus:ring-sky-100
                  "
                />

              </div>

              {/* BUTTON */}

              <div className="
                flex
                justify-end
                gap-3
                pt-2
                sticky
                bottom-0
                bg-white
              ">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    border-slate-200
                    text-sm
                    font-bold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    bg-sky-500
                    text-white
                    text-sm
                    font-bold
                    hover:bg-sky-600
                    disabled:opacity-60
                    flex
                    items-center
                    gap-2
                  "
                >

                  {saving ? (

                    <>
                      <Loader2 className="
                        w-4
                        h-4
                        animate-spin
                      " />

                      Đang lưu...

                    </>

                  ) : (

                    <>
                      {editingId ? (
                        <Pencil className="
                          w-4
                          h-4
                        " />
                      ) : (
                        <Plus className="
                          w-4
                          h-4
                        " />
                      )}

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