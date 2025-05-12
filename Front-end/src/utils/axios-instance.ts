import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import authService from "../services/auth.service";
import { toast } from "react-toastify";

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor cho request
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = authService.getToken();
    const userRole = authService.getRole();

    if (!config.headers) {
      config.headers = {};
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[Axios Instance] Đã thêm token:", token);
    }

    if (userRole) {
      // Thêm role vào header
      config.headers["X-User-Role"] = userRole;
      console.log("[Axios Instance] Đã thêm X-User-Role header:", userRole);

      // Thêm role vào params
      if (!config.params) {
        config.params = {};
      }
      config.params.role = userRole;
      console.log("[Axios Instance] Đã thêm role vào params:", userRole);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("[Axios Instance] Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor cho response
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.error(
          "[Axios Instance] Unauthorized (401) - Token có thể đã hết hạn"
        );
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_role");
        window.location.href = "/auth/login";
      } else if (status === 403) {
        console.error(
          "[Axios Instance] Forbidden (403) - Không có quyền truy cập"
        );
        const url = error.config?.url || "";

        // Kiểm tra nếu là API dashboard
        if (url.includes("/dashboard") || url.includes("/statistics")) {
          toast.error("Bạn không có quyền truy cập dữ liệu thống kê", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          console.log("[Axios Instance] Không có quyền truy cập:", url);
        }
      } else {
        console.error(`[Axios Instance] Error ${status}:`, error.response.data);
      }
    } else if (error.request) {
      console.error("[Axios Instance] No response received:", error.request);
    } else {
      console.error("[Axios Instance] Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
