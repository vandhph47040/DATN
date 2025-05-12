export type User = {
  id?: number; // ID người dùng, tùy chọn vì có thể không cần khi tạo mới
  name: string;
  email: string;
  password: string;
  phone: string;
  is_verified: boolean;
  role: string;
  is_deleted?: boolean; // Trạng thái khóa/mở khóa
};

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  users?: T; // Dùng cho danh sách người dùng
  error?: string;
}