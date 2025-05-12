import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "../services/auth.service";
import { toast } from "react-toastify";
import axios from "axios";

// Component hiển thị khi đang tải
const LoadingComponent = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
    }}
  >
    <div style={{ fontSize: "20px", marginBottom: "10px" }}>Đang tải...</div>
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #3498db",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
  </div>
);

// Hàm thiết lập interceptors cho axios
const setupAxiosInterceptors = (
  navigate: ReturnType<typeof useNavigate>,
  userRole: string
) => {
  const requestInterceptor = axios.interceptors.request.use(
    (config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("[Axios] Token đã được gắn:", token);

        // Thêm header role để backend có thể xác định quyền
        if (userRole) {
          config.headers["X-User-Role"] = userRole;
          console.log("[Axios] User role đã được gắn:", userRole);

          // Thêm role vào params để đảm bảo backend nhận được thông tin quyền
          if (!config.params) {
            config.params = {};
          }
          config.params.role = userRole;
        }
      } else {
        console.warn("[Axios] Không tìm thấy token trong request");
      }

      // Đảm bảo Content-Type luôn được đặt đúng
      if (
        !config.headers["Content-Type"] &&
        !config.headers.get("Content-Type")
      ) {
        config.headers["Content-Type"] = "application/json";
      }

      return config;
    },
    (error) => {
      console.error("[Axios Request Error]:", error);
      return Promise.reject(error);
    }
  );

  const responseInterceptor = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response } = error;
      if (response) {
        if (response.status === 401) {
          console.error("Token hết hạn hoặc không hợp lệ");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          navigate("/auth/login", {
            state: {
              message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            },
            replace: true,
          });
        } else if (response.status === 403) {
          console.error("Không có quyền truy cập");

          // Kiểm tra nếu là staff và đang cố gắng truy cập API dashboard
          if (
            userRole === "staff" &&
            response.config.url &&
            (response.config.url.includes("/dashboard") ||
              response.config.url.includes("/statistics"))
          ) {
            toast.error("Bạn không có quyền truy cập dữ liệu thống kê", {
              position: "top-right",
              autoClose: 3000,
            });
          } else {
            // Xử lý lỗi 403 cho các API khác
            console.log("Không có quyền truy cập:", response.config.url);
            // Không hiển thị toast lỗi cho các API khác để tránh làm phiền người dùng
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return () => {
    axios.interceptors.request.eject(requestInterceptor);
    axios.interceptors.response.eject(responseInterceptor);
  };
};

// Route bảo vệ cho các trang admin và staff
const AdminStaffRoute = () => {
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = authService.isAuthenticated();
        if (!authStatus) {
          console.log("Chưa đăng nhập hoặc không có token");
          navigate("/auth/login", {
            state: { message: "Vui lòng đăng nhập để tiếp tục." },
            replace: true,
          });
          return;
        }

        const userRole = authService.getRole();
        setIsAuthenticated(true);
        setRole(userRole);

        console.log("Vai trò người dùng:", userRole);
        console.log("Đường dẫn hiện tại:", location.pathname);

        // Kiểm tra nếu không phải admin hoặc staff thì chuyển hướng về trang chủ
        if (userRole !== "admin" && userRole !== "staff") {
          console.log(`Vai trò không được phép: ${userRole}`);
          navigate("/", {
            state: {
              message: "Bạn không có quyền truy cập trang này.",
            },
            replace: true,
          });
          return;
        }

        // Kiểm tra nếu là staff và đang cố gắng truy cập trang dashboard
        const currentPath = location.pathname;
        if (
          userRole === "staff" &&
          (currentPath === "/admin" ||
            currentPath.includes("/admin/dashboard") ||
            currentPath.includes("/admin/dashboardFilm") ||
            currentPath.includes("/admin/dashboardUser") ||
            currentPath.includes("/admin/users"))
        ) {
          console.log("Staff đang cố gắng truy cập trang dashboard");
          toast.error("không có quyền truy cập!", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/admin/film", { replace: true });
          return;
        }

        // Thiết lập interceptors cho axios
        const cleanup = setupAxiosInterceptors(navigate, userRole);
        setLoading(false);

        return cleanup;
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        setIsAuthenticated(false);
        navigate("/auth/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  if (loading) {
    return <LoadingComponent />;
  }

  return isAuthenticated && (role === "admin" || role === "staff") ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/login" replace />
  );
};

export default AdminStaffRoute;
