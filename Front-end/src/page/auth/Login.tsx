import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, Divider, message, Spin } from "antd";
import { Facebook, Mail, Lock, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import authService from "../../services/auth.service";
import "./Login.css";

type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const location = useLocation();
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [facebookAuthLoading, setFacebookAuthLoading] = useState(false);

  // Kiểm tra thông báo lỗi hoặc state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get("error");

    if (errorMsg === "google-auth-failed") {
      message.error("Đăng nhập với Google thất bại. Vui lòng thử lại.");
    }

    if (location.state && location.state.message && !isSubmitting) {
      message.info(location.state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, isSubmitting]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log("Bắt đầu gửi yêu cầu đăng nhập:", data);
      const response = await authService.login(data);
      console.log("Phản hồi từ authService.login:", response);

      const savedToken = localStorage.getItem("auth_token");
      const savedRole = localStorage.getItem("user_role");
      console.log("Token sau khi lưu:", savedToken);
      console.log("Role sau khi lưu:", savedRole);

      if (!savedToken) {
        throw new Error("Token không được lưu vào localStorage!");
      }
      if (!savedRole) {
        console.warn("Role không được lưu vào localStorage!");
      }

      message.success("Đăng nhập thành công!");
      const redirectUrl = authService.getRedirectUrl();
      console.log("Chuyển hướng đến:", redirectUrl);
      navigate(redirectUrl);
    } catch (error) {
      console.error("Lỗi đầy đủ:", error);
      console.error("error.message:", error.message);
      const errorMessage =
        error.message || "Đăng nhập thất bại. Vui lòng thử lại!";
      console.log("Hiển thị thông báo lỗi:", errorMessage);
      message.error(errorMessage, 5);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleAuthLoading(true);
      const authUrl = await authService.getGoogleAuthUrl();
      console.log("Đang chuyển hướng đến URL đăng nhập Google:", authUrl);
      window.location.href = authUrl; // Không cần thêm source=google-auth vì không sử dụng
    } catch (error) {
      console.error("Lỗi khi lấy URL đăng nhập Google:", error);
      message.error("Không thể kết nối với Google. Vui lòng thử lại sau.");
      setGoogleAuthLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    setFacebookAuthLoading(true);
    message.info("Tính năng đăng nhập với Facebook đang được phát triển.");
    setFacebookAuthLoading(false);
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Đăng nhập</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <div className="input-container">
            <Mail className="input-icon" size={20} />
            <input
              className="form-input"
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              {...register("email", {
                required: "Email là bắt buộc",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              })}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="password-header">
            <label className="form-label" htmlFor="password">
              Mật khẩu
            </label>
            <Link to="/auth/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="input-container">
            <Lock className="input-icon" size={20} />
            <input
              className="form-input"
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              })}
            />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>
        </div>

        <Button
          className="login-button"
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          size="large"
        >
          <LogIn size={20} className="button-icon" />
          Đăng nhập
        </Button>
      </form>

      <Divider className="auth-divider" plain>
        Hoặc đăng nhập với
      </Divider>

      <div className="social-login-section">
        <Button
          className="social-button google-button"
          type="default"
          size="large"
          onClick={handleGoogleLogin}
          loading={googleAuthLoading}
          disabled={googleAuthLoading || facebookAuthLoading}
        >
          <div className="button-content">
            {!googleAuthLoading && (
              <svg
                className="google-icon"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.60 3.30-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>Đăng nhập với Google</span>
          </div>
        </Button>

        <Button
          className="social-button facebook-button"
          type="primary"
          size="large"
          onClick={handleFacebookLogin}
          loading={facebookAuthLoading}
          disabled={googleAuthLoading || facebookAuthLoading}
        >
          <div className="button-content">
            {!facebookAuthLoading && <Facebook size={24} />}
            <span>Đăng nhập với Facebook</span>
          </div>
        </Button>
      </div>

      <p className="register-link-container">
        Chưa có tài khoản?{" "}
        <Link to="/auth/register" className="register-link">
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default Login;
