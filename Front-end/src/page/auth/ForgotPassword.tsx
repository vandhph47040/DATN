import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal, Input, message } from "antd";
import { Mail, Lock, RefreshCw } from "lucide-react";
import { useState } from "react";
import authService from "../../services/auth.service";
import styles from "./ForgotPassword.module.css";

// Định nghĩa type cho form quên mật khẩu
type ForgotPasswordFormData = {
  email: string;
};

const ForgotPassword = () => {
  // Quản lý form với react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>();
  const navigate = useNavigate();

  // Quản lý trạng thái với useState
  const [loading, setLoading] = useState(false);
  const [isResetPasswordVisible, setIsResetPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [resendingOtp, setResendingOtp] = useState(false);

  // Hàm ghi log lỗi để hỗ trợ debug
  const logError = (action: string, error: any, requestData?: any) => {
    console.error(`[ForgotPassword Component] ${action} Error:`, {
      message: error.message || "Unknown error",
      status: error.status || "N/A",
      response: error.error || error.response || "No response data",
      requestData: requestData || "N/A",
      stack: error.stack || "No stack trace",
    });
  };

  // Xử lý gửi yêu cầu quên mật khẩu
  const onSubmitForgotPassword = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      console.log(
        "[ForgotPassword Component] Sending Forgot Password Request:",
        data
      );
      const response = await authService.forgotPassword(data);
      console.log(
        "[ForgotPassword Component] Forgot Password API Response:",
        response
      );

      message.success("Mã OTP đã được gửi đến email của bạn!");
      setEmail(data.email);
      // Hiển thị trực tiếp form đặt mật khẩu mới cùng với nhập OTP
      setIsResetPasswordVisible(true);
    } catch (error: any) {
      logError("Forgot Password - API Call", error, data);
      message.error(
        error.message ||
          "Gửi yêu cầu thất bại. Vui lòng kiểm tra email và thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gửi lại OTP
  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      console.log("[ForgotPassword Component] Sending Resend OTP Request:", {
        email,
      });
      const response = await authService.forgotPassword({ email });
      console.log("[ForgotPassword Component] Resend OTP Success:", response);
      message.success("Mã OTP mới đã được gửi đến email của bạn!");
      setOtp("");
    } catch (error: any) {
      logError("Resend OTP - API Call", error, { email });
      message.error(error.message || "Gửi lại OTP thất bại. Vui lòng thử lại.");
    } finally {
      setResendingOtp(false);
    }
  };

  // Xác thực đầu vào trước khi gửi
  const validateInputs = () => {
    let isValid = true;

    // Kiểm tra OTP
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setOtpError("Vui lòng nhập mã OTP 6 chữ số!");
      isValid = false;
    } else {
      setOtpError("");
    }

    // Kiểm tra mật khẩu
    if (!newPassword || newPassword.length < 6) {
      setNewPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự!");
      isValid = false;
    } else {
      setNewPasswordError("");
    }

    // Kiểm tra xác nhận mật khẩu
    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  // Xử lý đặt lại mật khẩu
  const handleResetPassword = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      // Gửi cả OTP và mật khẩu mới trong một request
      console.log(
        "[ForgotPassword Component] Sending Reset Password Request:",
        {
          email,
          otp,
          hasNewPassword: true,
        }
      );

      const response = await authService.resetPassword({
        email,
        otp,
        new_password: newPassword,
        new_password_confirmation: confirmNewPassword,
      });

      console.log(
        "[ForgotPassword Component] Reset Password Success:",
        response
      );
      message.success(response.message || "Đặt lại mật khẩu thành công!");
      setIsResetPasswordVisible(false);

      // Chuyển hướng người dùng đến trang đăng nhập
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } catch (error: any) {
      logError("Reset Password - API Call", error);
      let errorMsg =
        error.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";

      // Xử lý thông báo lỗi cụ thể từ response
      if (
        error.response?.new_password &&
        Array.isArray(error.response.new_password)
      ) {
        errorMsg = error.response.new_password[0];
      } else if (error.response?.otp && Array.isArray(error.response.otp)) {
        errorMsg = error.response.otp[0];
      }

      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.containerInner}>
        <h2 className={styles.title}>Quên mật khẩu</h2>
        <p className={styles.subtitle}>
          Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
        </p>

        <form onSubmit={handleSubmit(onSubmitForgotPassword)}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="email">
              Email
            </label>
            <div className={styles.inputContainer}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                className={styles.formInput}
                type="email"
                id="email"
                placeholder="Nhập email của bạn"
                autoComplete="off" // Tắt autofill cho ô email
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className={styles.errorMessage}>{errors.email.message}</p>
            )}
          </div>

          <Button
            className={styles.submitButton}
            type="primary"
            htmlType="submit"
            loading={isSubmitting || loading}
            size="large"
          >
            Gửi mã OTP
          </Button>
        </form>

        <p className={styles.backToLogin}>
          Quay lại{" "}
          <Link to="/auth/login" className={styles.loginLink}>
            Đăng nhập
          </Link>
        </p>
      </div>

      {/* Modal đặt lại mật khẩu kết hợp nhập OTP */}
      <Modal
        title={<div className={styles.modalTitle}>Đặt lại mật khẩu</div>}
        open={isResetPasswordVisible}
        onCancel={() => setIsResetPasswordVisible(false)}
        footer={null}
        className={styles.resetPasswordModal}
        maskClosable={false}
        width={400}
        centered
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mã OTP</label>
            <div className={styles.inputContainer}>
              <Input
                className={styles.modalInput}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (otpError) setOtpError("");
                }}
                placeholder="Nhập mã OTP (6 chữ số)"
                maxLength={6}
                autoComplete="off" // Tắt autofill cho ô OTP
              />
            </div>
            {otpError && <p className={styles.errorMessage}>{otpError}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mật khẩu mới</label>
            <div className={styles.inputContainer}>
              <Lock className={styles.inputIcon} size={20} />
              <Input.Password
                className={styles.modalInput}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError("");
                }}
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password" // Tắt autofill cho ô mật khẩu mới
              />
            </div>
            {newPasswordError && (
              <p className={styles.errorMessage}>{newPasswordError}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Xác nhận mật khẩu mới</label>
            <div className={styles.inputContainer}>
              <Lock className={styles.inputIcon} size={20} />
              <Input.Password
                className={styles.modalInput}
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
                placeholder="Xác nhận mật khẩu mới"
                autoComplete="new-password" // Tắt autofill cho ô xác nhận mật khẩu
              />
            </div>
            {confirmPasswordError && (
              <p className={styles.errorMessage}>{confirmPasswordError}</p>
            )}
          </div>

          <div className={styles.modalActions}>
            <Button
              key="resend"
              onClick={handleResendOtp}
              className={styles.resendButton}
              icon={<RefreshCw size={16} />}
              loading={resendingOtp}
            >
              Gửi lại OTP
            </Button>

            <div className={styles.modalMainActions}>
              <Button
                key="cancel"
                onClick={() => setIsResetPasswordVisible(false)}
                className={styles.cancelButton}
              >
                Hủy
              </Button>
              <Button
                key="submit"
                type="primary"
                onClick={handleResetPassword}
                className={styles.confirmButton}
                loading={loading}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForgotPassword;
