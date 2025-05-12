// order.service.tsx
import axios from "axios";

const API_URL = "https://your-api-url.com/orders";

// Interface cho Order
type Order = {
  id?: string;
  userId: string;
  items: { productId: string; quantity: number }[];
  totalPrice: number;
  status?: string;
};

// Tạo đơn hàng
export const createOrder = async (order: Order) => {
  try {
    const response = await axios.post(API_URL, order);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng", error);
    throw error;
  }
};

// Lấy danh sách đơn hàng
export const getOrders = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng", error);
    throw error;
  }
};

// Lấy chi tiết đơn hàng theo ID
export const getOrderById = async (orderId: string) => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng", error);
    throw error;
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const response = await axios.put(`${API_URL}/${orderId}`, { status });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật đơn hàng", error);
    throw error;
  }
};

// Xóa đơn hàng
export const deleteOrder = async (orderId: string) => {
  try {
    await axios.delete(`${API_URL}/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi xóa đơn hàng", error);
    throw error;
  }
};
