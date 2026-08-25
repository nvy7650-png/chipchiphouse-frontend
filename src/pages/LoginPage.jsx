const handleSubmit = async (e) => {
  e.preventDefault();

  setError('');
  setLoading(true);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      {
        account: formData.account,
        password: formData.password
      }
    );

    console.log('Login response:', res.data);

    const user = res.data.user;

    // Lưu thông tin người dùng
    localStorage.setItem(
      'user',
      JSON.stringify(user)
    );

    // ==========================================
    // PHÂN QUYỀN
    // ==========================================

    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }

  } catch (err) {
    console.error('Lỗi đăng nhập:', err);

    setError(
      err.response?.data?.message ||
      'Không thể kết nối đến máy chủ!'
    );

  } finally {
    setLoading(false);
  }
};