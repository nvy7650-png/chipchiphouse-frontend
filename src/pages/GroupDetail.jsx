import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import axios from 'axios';
import {
  useParams,
  useNavigate
} from 'react-router-dom';

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
  Music2,
  ImagePlus
} from 'lucide-react';


export default function GroupDetail() {

  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [group, setGroup] = useState(null);
  const [albums, setAlbums] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const [imagePreview, setImagePreview] = useState('');

  const [form, setForm] = useState({
    name: '',
    release_date: '',
    description: '',
    image: null
  });

  const API_URL = import.meta.env.VITE_API_URL;


  // =========================================================
  // LẤY THÔNG TIN NHÓM + ALBUM
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

     const res = await axios.get(
  `${API_URL}/groups/${groupId}/albums`
);

      console.log(
        'Group Detail:',
        res.data
      );

      setGroup(res.data.group);

      // group.routes.js trả về:
      //
      // {
      //   success: true,
      //   group: {...},
      //   albums: [...]
      // }

      setAlbums(
        Array.isArray(res.data.albums)
          ? res.data.albums
          : []
      );

    } catch (err) {

      console.error(
        'Lỗi lấy chi tiết nhóm:',
        err
      );

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
  // CLEANUP PREVIEW
  // =========================================================

  useEffect(() => {

    return () => {

      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );
      }

    };

  }, []);


  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {

    setForm({
      name: '',
      release_date: '',
      description: '',
      image: null
    });

    setImagePreview('');

    if (previewUrlRef.current) {

      URL.revokeObjectURL(
        previewUrlRef.current
      );

      previewUrlRef.current = null;

    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  // =========================================================
  // ĐÓNG MODAL
  // =========================================================

  const closeAddModal = () => {

    if (adding) return;

    setShowAddModal(false);

    resetForm();
  };


  // =========================================================
  // THAY ĐỔI FORM
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  // =========================================================
  // CHỌN ẢNH TỪ THIẾT BỊ
  // =========================================================

  const handleImageChange = (e) => {

    const file = e.target.files?.[0];

    if (!file) return;


    // -------------------------------------------------------
    // Kiểm tra định dạng
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Giới hạn 5MB
    // -------------------------------------------------------

    if (file.size > 5 * 1024 * 1024) {

      alert(
        'Ảnh không được vượt quá 5MB!'
      );

      e.target.value = '';

      return;
    }


    // -------------------------------------------------------
    // Lưu file
    // -------------------------------------------------------

    setForm((prev) => ({
      ...prev,
      image: file
    }));


    // -------------------------------------------------------
    // Xóa preview cũ
    // -------------------------------------------------------

    if (previewUrlRef.current) {

      URL.revokeObjectURL(
        previewUrlRef.current
      );

    }


    // -------------------------------------------------------
    // Tạo preview mới
    // -------------------------------------------------------

    const previewUrl =
      URL.createObjectURL(file);

    previewUrlRef.current =
      previewUrl;

    setImagePreview(previewUrl);

  };


  // =========================================================
  // THÊM ALBUM
  // =========================================================

  const handleAddAlbum = async (e) => {

    e.preventDefault();


    // -------------------------------------------------------
    // Validate tên
    // -------------------------------------------------------

    if (!form.name.trim()) {

      alert(
        'Vui lòng nhập tên album!'
      );

      return;
    }


    if (!groupId) {

      alert(
        'Không xác định được nhóm nhạc!'
      );

      return;
    }


    try {

      setAdding(true);


      // -----------------------------------------------------
      // FormData
      // -----------------------------------------------------

      const formData = new FormData();

      formData.append(
        'group_id',
        String(groupId)
      );

      formData.append(
        'name',
        form.name.trim()
      );


      if (form.release_date) {

        formData.append(
          'release_date',
          form.release_date
        );

      }


      if (form.description.trim()) {

        formData.append(
          'description',
          form.description.trim()
        );

      }


      // -----------------------------------------------------
      // ẢNH
      //
      // Backend album.routes.js sẽ nhận:
      // req.file
      // -----------------------------------------------------

      if (form.image) {

        formData.append(
          'image',
          form.image
        );

      }


      // -----------------------------------------------------
      // POST
      // -----------------------------------------------------

      const res = await axios.post(
        `${API_URL}/albums`,
        formData
      );


      console.log(
        'Album created:',
        res.data
      );


      alert(
        'Thêm album thành công!'
      );


      // -----------------------------------------------------
      // Đóng modal
      // -----------------------------------------------------

      setShowAddModal(false);

      resetForm();


      // -----------------------------------------------------
      // Load lại danh sách album
      // -----------------------------------------------------

      await fetchGroupDetail();

    } catch (err) {

      console.error(
        'Lỗi thêm album:',
        err
      );

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

  const handleDeleteAlbum = async (
    albumId,
    albumName
  ) => {

    const confirmed =
      window.confirm(
        `Bạn có chắc muốn xóa album "${albumName}" không?`
      );

    if (!confirmed) return;


    try {

      await axios.delete(
        `${API_URL}/albums/${albumId}`
      );


      alert(
        'Xóa album thành công!'
      );


      await fetchGroupDetail();

    } catch (err) {

      console.error(
        'Lỗi xóa album:',
        err
      );

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

    if (!date) {

      return 'Chưa có ngày phát hành';

    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {

      return date;

    }

    return d.toLocaleDateString(
      'vi-VN'
    );
  };


  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {

    if (
      price === null ||
      price === undefined
    ) {

      return '—';

    }

    return Number(price)
      .toLocaleString('vi-VN') + ' ₫';
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
            onClick={() =>
              navigate('/admin/groups')
            }
            className="
              flex items-center gap-2
              text-sm font-bold
              text-slate-600
              hover:text-sky-600
              mb-6
            "
          >

            <ArrowLeft className="w-4 h-4" />

            Quay lại nhóm nhạc

          </button>


          <div
            className="
              bg-red-50
              border border-red-200
              rounded-2xl
              p-5
              flex items-center
              gap-3
              text-red-600
            "
          >

            <AlertCircle className="w-5 h-5" />

            <span>
              {error}
            </span>

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


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />


      <main className="flex-1 lg:ml-64 min-w-0">


        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            h-16
            bg-white
            border-b border-slate-200
            px-4 sm:px-8
            flex items-center
            justify-between
          "
        >

          <button
            onClick={() =>
              navigate('/admin/groups')
            }
            className="
              flex items-center gap-2
              text-sm font-bold
              text-slate-600
              hover:text-sky-600
            "
          >

            <ArrowLeft className="w-4 h-4" />

            Quay lại

          </button>


          <button
            onClick={() =>
              setShowAddModal(true)
            }
            className="
              inline-flex
              items-center gap-2
              px-4 py-2.5
              rounded-xl
              bg-sky-500
              text-white
              text-sm font-bold
              hover:bg-sky-600
              transition
            "
          >

            <Plus className="w-4 h-4" />

            Thêm album

          </button>

        </header>


        <div className="p-4 sm:p-6 lg:p-8">


          {/* =================================================
              GROUP HEADER
          ================================================= */}

          <div
            className="
              bg-white
              rounded-2xl
              border border-slate-200
              shadow-sm
              p-6
              mb-6
            "
          >

            <div className="flex items-start gap-4">

              <div
                className="
                  w-14 h-14
                  rounded-2xl
                  bg-sky-50
                  flex items-center
                  justify-center
                  shrink-0
                "
              >

                <Music2
                  className="
                    w-7 h-7
                    text-sky-500
                  "
                />

              </div>


              <div className="min-w-0">

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    font-bold
                    text-slate-400
                  "
                >
                  Nhóm nhạc
                </p>


                <h1
                  className="
                    text-3xl
                    font-black
                    text-slate-900
                    mt-1
                  "
                >
                  {group?.name}
                </h1>


                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-2
                  "
                >
                  {albums.length} album
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              ALBUM LIST
          ================================================= */}

          <div
            className="
              bg-white
              rounded-2xl
              border border-slate-200
              shadow-sm
              overflow-hidden
            "
          >

            {/* HEADER */}

            <div
              className="
                p-5
                border-b border-slate-100
                flex items-center
                justify-between
              "
            >

              <div>

                <h2 className="font-bold text-slate-900">
                  Album
                </h2>

                <p
                  className="
                    text-xs
                    text-slate-500
                    mt-1
                  "
                >
                  Danh sách album của {group?.name}
                </p>

              </div>


              <span
                className="
                  text-xs
                  font-bold
                  text-slate-400
                "
              >
                {albums.length} album
              </span>

            </div>


            {/* EMPTY */}

            {albums.length === 0 ? (

              <div className="py-16 text-center">

                <Package
                  className="
                    w-10 h-10
                    text-slate-300
                    mx-auto mb-3
                  "
                />

                <p
                  className="
                    font-bold
                    text-slate-500
                  "
                >
                  Chưa có album
                </p>

                <p
                  className="
                    text-sm
                    text-slate-400
                    mt-1 mb-5
                  "
                >
                  Hãy thêm album đầu tiên
                  cho nhóm này
                </p>


                <button
                  onClick={() =>
                    setShowAddModal(true)
                  }
                  className="
                    inline-flex
                    items-center gap-2
                    px-4 py-2.5
                    rounded-xl
                    bg-sky-500
                    text-white
                    text-sm font-bold
                    hover:bg-sky-600
                  "
                >

                  <Plus className="w-4 h-4" />

                  Thêm album

                </button>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {albums.map((album) => {

                  const titleName =
                    album.name || 'Album không tên';


                  return (

                    <div
                      key={album.id}
                      className="
                        p-5
                        flex items-center
                        justify-between
                        hover:bg-slate-50
                        transition
                      "
                    >


                      {/* ALBUM INFO */}

                      <div
                        onClick={() =>
                          navigate(
                            `/admin/albums/${album.id}`
                          )
                        }
                        className="
                          flex items-center
                          gap-4
                          flex-1
                          cursor-pointer
                          min-w-0
                        "
                      >


                        {/* IMAGE */}

                        <div
                          className="
                            w-20 h-20
                            aspect-square
                            rounded-xl
                            bg-slate-100
                            overflow-hidden
                            flex items-center
                            justify-center
                            shrink-0
                          "
                        >

                          {album.image_url ? (

                            <img
                              src={album.image_url}
                              alt={titleName}
                              className="
                                w-full h-full
                                object-cover
                              "
                            />

                          ) : (

                            <Package
                              className="
                                w-8 h-8
                                text-slate-300
                              "
                            />

                          )}

                        </div>


                        {/* TEXT */}

                        <div className="min-w-0">

                          <h3
                            className="
                              font-bold
                              text-slate-900
                              truncate
                            "
                          >
                            {titleName}
                          </h3>


                          <div
                            className="
                              flex flex-wrap
                              items-center
                              gap-3
                              mt-2
                            "
                          >

                            <span
                              className="
                                flex items-center
                                gap-1
                                text-xs
                                text-slate-500
                              "
                            >

                              <Calendar
                                className="
                                  w-3.5 h-3.5
                                "
                              />

                              {formatDate(
                                album.release_date
                              )}

                            </span>


                            <span
                              className="
                                text-xs
                                font-semibold
                                text-sky-600
                              "
                            >
                              {Number(
                                album.version_count || 0
                              )}{' '}
                              version
                            </span>


                            <span
                              className="
                                text-xs
                                text-slate-500
                              "
                            >
                              Tồn kho:{' '}
                              {Number(
                                album.total_stock || 0
                              )}
                            </span>


                            {album.min_price !== null &&
                              album.min_price !== undefined && (

                              <span
                                className="
                                  text-xs
                                  font-semibold
                                  text-slate-600
                                "
                              >
                                Từ{' '}
                                {formatPrice(
                                  album.min_price
                                )}
                              </span>

                            )}

                          </div>

                        </div>

                      </div>


                      {/* ACTION */}

                      <div
                        className="
                          flex items-center
                          gap-3 ml-4
                        "
                      >

                        <button
                          onClick={() =>
                            handleDeleteAlbum(
                              album.id,
                              titleName
                            )
                          }
                          className="
                            w-9 h-9
                            rounded-xl
                            flex items-center
                            justify-center
                            text-red-400
                            hover:bg-red-50
                            hover:text-red-500
                            transition
                          "
                          title="Xóa album"
                        >

                          <Trash2
                            className="
                              w-4 h-4
                            "
                          />

                        </button>


                        <button
                          onClick={() =>
                            navigate(
                              `/admin/albums/${album.id}`
                            )
                          }
                          className="
                            w-9 h-9
                            rounded-xl
                            flex items-center
                            justify-center
                            hover:bg-slate-100
                          "
                          title="Xem album"
                        >

                          <ChevronRight
                            className="
                              w-5 h-5
                              text-slate-400
                            "
                          />

                        </button>

                      </div>

                    </div>

                  );

                })}

              </div>

            )}

          </div>

        </div>

      </main>


      {/* =====================================================
          ADD ALBUM MODAL
      ===================================================== */}

      {showAddModal && (

        <div
          className="
            fixed inset-0
            z-50
            flex items-center
            justify-center
            p-4
          "
        >

          {/* OVERLAY */}

          <div
            className="
              absolute inset-0
              bg-black/40
            "
            onClick={closeAddModal}
          />


          {/* MODAL */}

          <div
            className="
              relative
              w-full
              max-w-lg
              bg-white
              rounded-2xl
              shadow-xl
              overflow-hidden
              max-h-[90vh]
              overflow-y-auto
            "
          >


            {/* MODAL HEADER */}

            <div
              className="
                px-6 py-5
                border-b border-slate-100
                flex items-center
                justify-between
              "
            >

              <div>

                <h2
                  className="
                    text-lg
                    font-black
                    text-slate-900
                  "
                >
                  Thêm album
                </h2>

                <p
                  className="
                    text-xs
                    text-slate-500
                    mt-1
                  "
                >
                  Thêm album cho {group?.name}
                </p>

              </div>


              <button
                type="button"
                onClick={closeAddModal}
                disabled={adding}
                className="
                  w-9 h-9
                  rounded-xl
                  flex items-center
                  justify-center
                  hover:bg-slate-100
                  text-slate-500
                  disabled:opacity-50
                "
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleAddAlbum}
              className="
                p-6
                space-y-4
              "
            >


              {/* TÊN ALBUM */}

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-bold
                    text-slate-700
                    mb-1.5
                  "
                >
                  Tên album

                  <span className="text-red-500">
                    {' '}*
                  </span>

                </label>


                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: The Album"
                  maxLength={150}
                  disabled={adding}
                  className="
                    w-full
                    px-4 py-3
                    rounded-xl
                    border border-slate-200
                    outline-none
                    focus:border-sky-400
                    focus:ring-2
                    focus:ring-sky-100
                    disabled:bg-slate-50
                  "
                />

              </div>


              {/* NGÀY PHÁT HÀNH */}

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-bold
                    text-slate-700
                    mb-1.5
                  "
                >
                  Ngày phát hành
                </label>


                <input
                  type="date"
                  name="release_date"
                  value={form.release_date}
                  onChange={handleChange}
                  disabled={adding}
                  className="
                    w-full
                    px-4 py-3
                    rounded-xl
                    border border-slate-200
                    outline-none
                    focus:border-sky-400
                    focus:ring-2
                    focus:ring-sky-100
                    disabled:bg-slate-50
                  "
                />

              </div>


              {/* =================================================
                  ẢNH ALBUM
              ================================================= */}

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-bold
                    text-slate-700
                    mb-2
                  "
                >
                  Ảnh album
                </label>


                {/* INPUT FILE */}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="
                    image/jpeg,
                    image/jpg,
                    image/png,
                    image/webp
                  "
                  onChange={handleImageChange}
                  className="hidden"
                />


                <div
                  className="
                    flex items-start
                    gap-4
                  "
                >


                  {/* PREVIEW 1:1 */}

                  <div
                    className="
                      w-32 h-32
                      aspect-square
                      rounded-2xl
                      border-2
                      border-dashed
                      border-slate-200
                      bg-slate-50
                      overflow-hidden
                      flex items-center
                      justify-center
                      shrink-0
                    "
                  >

                    {imagePreview ? (

                      <img
                        src={imagePreview}
                        alt="Preview album"
                        className="
                          w-full h-full
                          object-cover
                        "
                      />

                    ) : (

                      <div className="text-center">

                        <ImagePlus
                          className="
                            w-8 h-8
                            text-slate-300
                            mx-auto mb-1
                          "
                        />

                        <p
                          className="
                            text-[11px]
                            text-slate-400
                          "
                        >
                          Ảnh 1:1
                        </p>

                      </div>

                    )}

                  </div>


                  {/* UPLOAD */}

                  <div className="flex-1">

                    <button
                      type="button"
                      disabled={adding}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="
                        px-4 py-2.5
                        rounded-xl
                        border border-slate-200
                        bg-white
                        text-sm
                        font-bold
                        text-slate-700
                        hover:bg-slate-50
                        transition
                        disabled:opacity-50
                      "
                    >

                      <span
                        className="
                          flex items-center
                          gap-2
                        "
                      >

                        <ImagePlus
                          className="
                            w-4 h-4
                            text-sky-500
                          "
                        />

                        Chọn ảnh từ thiết bị

                      </span>

                    </button>


                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-2
                        leading-relaxed
                      "
                    >
                      JPG, PNG hoặc WEBP
                      <br />
                      Tối đa 5MB
                      <br />
                      Khuyến nghị ảnh vuông 1:1
                    </p>


                    {form.image && (

                      <p
                        className="
                          text-xs
                          text-sky-600
                          font-semibold
                          mt-2
                          truncate
                        "
                      >
                        {form.image.name}
                      </p>

                    )}

                  </div>

                </div>

              </div>


              {/* MÔ TẢ */}

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-bold
                    text-slate-700
                    mb-1.5
                  "
                >
                  Mô tả
                </label>


                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Mô tả album..."
                  disabled={adding}
                  className="
                    w-full
                    px-4 py-3
                    rounded-xl
                    border border-slate-200
                    outline-none
                    resize-none
                    focus:border-sky-400
                    focus:ring-2
                    focus:ring-sky-100
                    disabled:bg-slate-50
                  "
                />

              </div>


              {/* BUTTON */}

              <div
                className="
                  flex justify-end
                  gap-3
                  pt-2
                "
              >

                <button
                  type="button"
                  disabled={adding}
                  onClick={closeAddModal}
                  className="
                    px-4 py-2.5
                    rounded-xl
                    border border-slate-200
                    text-sm
                    font-bold
                    text-slate-600
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  Hủy
                </button>


                <button
                  type="submit"
                  disabled={adding}
                  className="
                    px-5 py-2.5
                    rounded-xl
                    bg-sky-500
                    text-white
                    text-sm
                    font-bold
                    hover:bg-sky-600
                    disabled:opacity-60
                    flex items-center
                    gap-2
                  "
                >

                  {adding ? (

                    <>
                      <Loader2
                        className="
                          w-4 h-4
                          animate-spin
                        "
                      />

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