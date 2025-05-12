// src/types/room.types.ts

// Giao diện cho mô hình Room, khớp với Room model trong backend
export interface Room {
  id: string | number;
  name: string;
  capacity: number;
  room_type_id: number;
  room_type?: string; // Tên loại phòng (có thể được thêm vào từ frontend)
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null; // Hỗ trợ soft delete từ backend
}

// Giao diện cho loại phòng
export interface RoomType {
  id: number;
  name: string;
}

// Giao diện cho loại ghế
export interface SeatType {
  id: number;
  name: string;
  price: number;
}

// Yêu cầu tạo phòng mới
export interface RoomCreateRequest {
  name: string;
  room_type_id: number;
}

// Phản hồi khi tạo phòng
export interface RoomCreateResponse {
  message: string;
  room: Room;
}

// Yêu cầu cập nhật phòng
export interface RoomUpdateRequest {
  name?: string;
  room_type_id?: number;
}

// Phản hồi khi cập nhật phòng
export interface RoomUpdateResponse {
  message: string;
  room: Room;
}

// Phản hồi danh sách phòng
export interface RoomListResponse {
  message?: string;
  rooms: Room[];
}

// Yêu cầu xóa nhiều phòng
export interface RoomDeleteRequest {
  ids: (string | number)[];
}

// Phản hồi khi xóa phòng
export interface RoomDeleteResponse {
  message: string;
  deletedCount?: number;
  deletedIds?: (string | number)[];
}

// Phản hồi khi khôi phục phòng
export interface RoomRestoreResponse {
  message: string;
  room?: Room;
}

// Định dạng lỗi API từ backend
export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, string[]>; // Chi tiết lỗi validation từ backend
  status?: number;
}