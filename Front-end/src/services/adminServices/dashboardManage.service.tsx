import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthContext } from "../../ClientComponents/UseContext/TokenContext";
import authService from "../../services/auth.service";
import { toast } from "react-toastify";

// Hàm kiểm tra quyền truy cập thống kê
const checkStatisticsAccess = () => {
  const userRole = authService.getRole();
  if (userRole !== "admin") {
    console.log(
      "[Dashboard Service] User không phải admin, không có quyền truy cập thống kê"
    );
    return false;
  }
  return true;
};

// tổng quát doanh thu
export const useDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      try {
        // Kiểm tra quyền truy cập trước khi gọi API
        const hasAccess = checkStatisticsAccess();
        if (!hasAccess) {
          // Trả về dữ liệu mặc định nếu không có quyền
          console.log(
            "[Dashboard Service] Trả về dữ liệu mặc định cho user không có quyền"
          );
          return {
            total_revenue: 0,
            total_orders: 0,
            total_users: 0,
            total_movies: 0,
            recent_orders: [],
            revenue_by_month: [],
          };
        }

        const token = authService.getToken();
        const { data } = await axios.get(
          "http://localhost:8000/api/statistics",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "X-User-Role": authService.getRole() || "",
            },
          }
        );
        console.log("Dữ liệu thống kê:", data.data);

        return (
          data.data || {
            total_revenue: 0,
            total_orders: 0,
            total_users: 0,
            total_movies: 0,
            recent_orders: [],
            revenue_by_month: [],
          }
        );
      } catch (error: any) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error);
        // Trả về dữ liệu mặc định nếu có lỗi
        return {
          total_revenue: 0,
          total_orders: 0,
          total_users: 0,
          total_movies: 0,
          recent_orders: [],
          revenue_by_month: [],
        };
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: false, // Không thử lại nếu lỗi quyền truy cập
    onError: (error: any) => {
      console.error("Lỗi trong useQuery dashboard:", error);
      toast.error(
        "Không thể tải dữ liệu thống kê: " +
          (error.message || "Lỗi không xác định"),
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    },
  });
  return {
    data: data || {
      total_revenue: 0,
      total_orders: 0,
      total_users: 0,
      total_movies: 0,
      recent_orders: [],
      revenue_by_month: [],
    },
    isLoading,
    error,
  };
};

// xuất file excel
export const useExcelExport = () => {
  const mutation = useMutation({
    mutationFn: async ({
      start_date,
      end_date,
    }: {
      start_date: string;
      end_date: string;
    }) => {
      try {
        // Kiểm tra quyền truy cập trước khi gọi API
        const hasAccess = checkStatisticsAccess();
        if (!hasAccess) {
          toast.error("Bạn không có quyền xuất dữ liệu thống kê", {
            position: "top-right",
            autoClose: 3000,
          });
          throw new Error("Không có quyền xuất dữ liệu thống kê");
        }

        const token = authService.getToken();
        const { data } = await axios.get(
          `http://localhost:8000/api/export-stats-by-date-range`,
          {
            params: { start_date, end_date },
            responseType: "blob",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "X-User-Role": authService.getRole() || "",
            },
          }
        );
        return data;
      } catch (error: any) {
        console.error("Lỗi khi xuất dữ liệu Excel:", error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error("Lỗi trong mutation Excel export:", error);
      toast.error(
        "Không thể xuất dữ liệu Excel: " +
          (error.message || "Lỗi không xác định"),
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    },
  });

  return mutation;
};
