import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Input, Space, Modal, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import styles from "./OrderHistory.module.css";
import {
  Orders_Recent,
  Orders_Confirmed,
  Orders_Search,
} from "../../config/ApiConfig";

// Utility to get auth token from localStorage
const getAuthToken = (): string | null => localStorage.getItem("auth_token");

// Decode JWT token to check expiration
const decodeToken = (token: string): { exp?: number } | null => {
  if (!token || typeof token !== "string") {
    console.error("Invalid token: Token is null or not a string");
    return null;
  }
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid token: Token does not have 3 parts");
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Get status label and style for orders
const getStatusLabelAndStyle = (
  status: string
): { label: string; style: string } => {
  switch (status) {
    case "confirmed":
      return { label: "Đã xác nhận", style: styles.confirmed };
    case "pending":
      return { label: "Đang xử lý", style: styles.pending };
    case "cancelled":
      return { label: "Đã hủy", style: styles.cancelled };
    case "failed":
      return { label: "Thất bại", style: styles.failed };
    default:
      return { label: "Không xác định", style: styles.pending };
  }
};

// Format date safely with explicit format
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  const date = dayjs(dateString, "YYYY-MM-DD");
  return date.isValid() ? date.format("DD-MM-YYYY") : "N/A";
};

// Format time safely
const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return "N/A";
  const time = dayjs(timeString, "HH:mm:ss");
  return time.isValid() ? time.format("HH:mm") : "N/A";
};

// Format price in VND
const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null) return "0 VND";
  return `${price.toLocaleString("vi-VN")} VND`;
};

// Interfaces for type safety
interface Seat {
  booking_detail_id: number;
  seat_id: number;
  seat_name: string;
  price: number;
}

interface Combo {
  booking_detail_id: number;
  combo_id: number;
  combo_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  user_id: number;
  showtime_id: number;
  total_ticket_price: number;
  total_combo_price: number;
  total_price: number;
  discount: number;
  code_id: number | null;
  status: string;
  payment_method: string;
  check_in: boolean;
  created_at: string;
  updated_at: string;
  show_date: string;
  showtime: string;
  movie_title: string;
  movie_poster: string;
  room_name: string;
  cinema_name: string;
  seats: Seat[];
  combos: Combo[];
}

const OrderHistory: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const URL_IMAGE = "http://localhost:8000";
  const fallbackPoster = "https://via.placeholder.com/80x80?text=Ảnh";

  // Fetch recent orders on component mount
  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("Bạn cần đăng nhập để xem lịch sử giao dịch!");
        window.location.href = "/login";
        return;
      }

      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      }

      const response = await axios.get(Orders_Recent, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setRecentOrders(orders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giao dịch:", error);
      handleError(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchConfirmedOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("Bạn cần đăng nhập để xem lịch sử giao dịch!");
        window.location.href = "/login";
        return;
      }

      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      }

      const response = await axios.get(Orders_Confirmed, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setRecentOrders(orders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giao dịch đã xác nhận:", error);
      handleError(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchSearchOrders = async (query: string) => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("Bạn cần đăng nhập để tìm kiếm lịch sử giao dịch!");
        window.location.href = "/login";
        return;
      }

      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      }

      const response = await axios.get(Orders_Search, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query },
      });

      const orders = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setRecentOrders(orders);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm lịch sử giao dịch:", error);
      handleError(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Handle errors consistently
  const handleError = (error: any) => {
    if (error.response && error.response.status === 401) {
      message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    } else {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const handleBuyAgain = (order: Order) => {
    console.log(`Mua lại vé cho giao dịch #${order.id}`);
    message.info("Tính năng mua lại đang được phát triển!");
  };

  return (
    <>
      <div className={styles.searchSection}>
        <Space>
          <Input
            placeholder="Tìm kiếm giao dịch (mã ID, tên phim...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Button
            type="primary"
            onClick={() => fetchSearchOrders(searchQuery)}
            disabled={!searchQuery.trim()}
            className={styles.customButton}
          >
            Tìm kiếm
          </Button>
        </Space>
      </div>
      <div className={styles.buttonGroup}>
        <Space>
          <Button
            type="primary"
            onClick={fetchRecentOrders}
            className={styles.customButton}
          >
            Giao dịch gần đây
          </Button>
          <Button
            type="primary"
            onClick={fetchConfirmedOrders}
            className={styles.customButton}
          >
            Giao dịch đã xác nhận
          </Button>
        </Space>
      </div>
      {ordersLoading ? (
        <div className={styles.loading}>Đang tải lịch sử giao dịch...</div>
      ) : recentOrders.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles.orderList}
        >
          {recentOrders.map((order) => {
            console.log(`Order ID: ${order.id}, show_date: ${order.show_date}`);
            return (
              <div
                key={order.id}
                className={styles.orderCard}
                onClick={() => handleShowDetails(order)}
              >
                <img
                  src={
                    order.movie_poster
                      ? `${URL_IMAGE}${order.movie_poster}`
                      : fallbackPoster
                  }
                  alt={order.movie_title || "Movie Poster"}
                  className={styles.moviePoster}
                  onError={(e) => {
                    e.currentTarget.src = fallbackPoster;
                  }}
                />
                <div className={styles.orderContent}>
                  <h2 className={styles.movieTitle}>
                    {order.movie_title || "N/A"}
                  </h2>
                  <p className={styles.info}>
                    Phòng: <span>{order.room_name || "N/A"}</span> | Ghế:{" "}
                    <span>
                      {order.seats?.length > 0
                        ? order.seats.map((seat) => seat.seat_name).join(", ")
                        : "N/A"}
                    </span>
                  </p>
                  <p className={styles.info}>
                    Ngày chiếu: <span>{order.show_date}</span> | Suất:{" "}
                    <span>{formatTime(order.showtime)}</span>
                  </p>
                  <div className={styles.footer}>
                    <span className={styles.price}>
                      {formatPrice(order.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      ) : (
        <div className={styles.emptyContent}>
          <p>Chưa có dữ liệu giao dịch nào.</p>
          <Button
            type="primary"
            onClick={fetchRecentOrders}
            className={styles.customButton}
          >
            Thử lại
          </Button>
        </div>
      )}
      <Modal
        title={`Chi tiết giao dịch #${selectedOrder?.id || ""}`}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
        width={700}
        className={styles.orderDetailsModal}
      >
        {selectedOrder ? (
          <div className={styles.orderDetails}>
            <div className={styles.orderHeader}>
              <span>THÔNG TIN GIAO DỊCH</span>
            </div>
            <div className={styles.orderContent}>
              <div className={styles.movieInfo}>
                <img
                  src={
                    selectedOrder.movie_poster
                      ? `${URL_IMAGE}${selectedOrder.movie_poster}`
                      : fallbackPoster
                  }
                  alt={selectedOrder.movie_title || "Movie Poster"}
                  className={styles.moviePoster}
                  onError={(e) => {
                    e.currentTarget.src = fallbackPoster;
                  }}
                  style={{ width: "50px", height: "50px", marginRight: "10px" }}
                />
                <span>{selectedOrder.movie_title || "N/A"}</span>
              </div>
              <p className={styles.roomSeats}>
                <span>
                  {selectedOrder.room_name || "N/A"} Số ghế:{" "}
                  {selectedOrder.seats?.length > 0
                    ? selectedOrder.seats
                        .map((seat) => seat.seat_name)
                        .join(", ")
                    : "N/A"}
                </span>
              </p>
              <p className={styles.showInfo}>
                <span>
                  Ngày chiếu: {selectedOrder.show_date} Suất chiếu:{" "}
                  {formatTime(selectedOrder.showtime)}
                </span>
              </p>
              {selectedOrder.combos && selectedOrder.combos.length > 0 && (
                <p className={styles.combos}>
                  <span>
                    {selectedOrder.combos
                      .map(
                        (combo) => `${combo.combo_name} ${combo.quantity} phần`
                      )
                      .join(", ")}
                  </span>
                </p>
              )}
              <p className={styles.price}>
                <span>{formatPrice(selectedOrder.total_price)}</span>
              </p>
              <p className={styles.status}>
                <strong>Trạng thái:</strong>{" "}
                <span
                  className={`${styles.statusBadge} ${
                    getStatusLabelAndStyle(selectedOrder.status).style
                  }`}
                >
                  {getStatusLabelAndStyle(selectedOrder.status).label}
                </span>
              </p>
              <p className={styles.priceDetail}>
                <strong>Tổng tiền vé:</strong>{" "}
                <span>{formatPrice(selectedOrder.total_ticket_price)}</span>
              </p>
              <p className={styles.priceDetail}>
                <strong>Tổng tiền combo:</strong>{" "}
                <span>{formatPrice(selectedOrder.total_combo_price)}</span>
              </p>
              {/* New Discount Line */}
              <p className={styles.discount}>
                <strong>Giảm giá:</strong>{" "}
                <span>{formatPrice(selectedOrder.discount)}</span>
              </p>
              <p className={styles.priceDetail}>
                <strong>Tổng tiền:</strong>{" "}
                <span>{formatPrice(selectedOrder.total_price)}</span>
              </p>
              <p className={styles.createdAt}>
                <strong>Ngày đặt:</strong>{" "}
                <span>{selectedOrder.created_at}</span>
              </p>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu chi tiết.</p>
        )}
      </Modal>
    </>
  );
};

export default OrderHistory;
