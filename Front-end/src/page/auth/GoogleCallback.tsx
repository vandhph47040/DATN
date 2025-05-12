import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message, Spin } from "antd";
import authService from "../../services/auth.service";

const GoogleCallbackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    console.log("GoogleCallbackHandler mounted. Received code from URL:", code);
    console.log("Current location:", location);

    if (!code) {
      console.error("No code found in URL");
      message.error("Không tìm thấy mã xác thực.");
      navigate("/auth/login", { replace: true });
      setLoading(false);
      return;
    }

    authService
      .handleGoogleCallback(code)
      .then((response) => {
        console.log("Full response from authService:", response); // Debug chi tiết
        const { redirect_url, auth_token } = response; // Sử dụng auth_token thay vì token

        if (!auth_token) {
          throw new Error("Access token không được trả về từ server");
        }

        message.success("Đăng nhập với Google thành công!");
        navigate(redirect_url || "/", { replace: true });
      })
      .catch((error) => {
        console.error("Error processing Google callback:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        message.error(
          error.message || "Đăng nhập với Google thất bại. Vui lòng thử lại."
        );
        navigate("/auth/login", { replace: true });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {loading ? (
        <Spin tip="Đang xử lý đăng nhập Google..." />
      ) : (
        <p>Đăng nhập hoàn tất, đang chuyển hướng...</p>
      )}
    </div>
  );
};

export default GoogleCallbackHandler;
