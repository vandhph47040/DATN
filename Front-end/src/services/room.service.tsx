import axios from "axios";
import {
    Room,
    RoomCreateRequest,
    RoomCreateResponse,
    RoomUpdateRequest,
    RoomUpdateResponse,
    RoomListResponse,
    RoomDeleteResponse,
    RoomRestoreResponse,
    ApiError,
    RoomType,
} from "../types/room.types";

// API base URL
const BASE_URL = "http://localhost:8000/api";

// API endpoints
const ENDPOINTS = {
    GET_ROOMS: `${BASE_URL}/room`,
    GET_ROOM: (id: string | number) => `${BASE_URL}/room/${id}`,
    CREATE_ROOM: `${BASE_URL}/room`,
    UPDATE_ROOM: (id: string | number) => `${BASE_URL}/room/${id}`,
    DELETE_ROOM: (id: string | number) => `${BASE_URL}/room/${id}`,
    RESTORE_ROOM: (id: string | number) => `${BASE_URL}/room/restore/${id}`,
    GET_ROOM_TYPES: `${BASE_URL}/room-types`,
};

// Utility function to normalize ID (convert to string)
const normalizeId = (id: string | number): string => String(id);

// Handle API errors
const handleApiError = (error: any): never => {
    if (axios.isAxiosError(error) && error.response) {
        const apiError: ApiError = {
            error: error.response.data.error || "Đã xảy ra lỗi",
            message: error.response.data.message || error.message,
            details: error.response.data.details,
            status: error.response.status,
        };
        throw apiError;
    }
    throw error;
};

// Lấy danh sách phòng
export const getRooms = async (
    includeDeleted: boolean = false
): Promise<RoomListResponse> => {
    try {
        const url = includeDeleted
            ? `${ENDPOINTS.GET_ROOMS}?include_deleted=1`
            : ENDPOINTS.GET_ROOMS;

        const response = await axios.get<RoomListResponse>(url);
        return {
            ...response.data,
            rooms: response.data.rooms.map((room) => ({
                ...room,
                id: normalizeId(room.id),
            })),
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Lấy danh sách loại phòng
export const getRoomTypes = async (): Promise<RoomType[]> => {
    try {
        const response = await axios.get<{ room_types: RoomType[] }>(
            ENDPOINTS.GET_ROOM_TYPES
        );
        return response.data.room_types || [];
    } catch (error) {
        throw handleApiError(error); // Sử dụng hàm handleApiError để xử lý lỗi
    }
};

// Lấy thông tin chi tiết của một phòng
export const getRoom = async (id: string | number): Promise<Room> => {
    const roomId = normalizeId(id);
    try {
        const response = await axios.get<Room>(ENDPOINTS.GET_ROOM(roomId));
        return { ...response.data, id: normalizeId(response.data.id) };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Tạo phòng mới
export const createRoom = async (
    data: RoomCreateRequest
): Promise<RoomCreateResponse> => {
    try {
        const response = await axios.post<RoomCreateResponse>(
            ENDPOINTS.CREATE_ROOM,
            {
                name: data.name,
                room_type_id: data.room_type_id,
                capacity: 0, // Gán mặc định capacity = 0 để tương thích backend
            },
            { headers: { "Content-Type": "application/json" } }
        );
        return {
            ...response.data,
            room: {
                ...response.data.room,
                id: normalizeId(response.data.room.id),
            },
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Cập nhật phòng
export const updateRoom = async (
    id: string | number,
    data: RoomUpdateRequest
): Promise<RoomUpdateResponse> => {
    const roomId = normalizeId(id);
    try {
        const response = await axios.put<RoomUpdateResponse>(
            ENDPOINTS.UPDATE_ROOM(roomId),
            {
                name: data.name,
                room_type_id: data.room_type_id,
            },
            { headers: { "Content-Type": "application/json" } }
        );
        return {
            ...response.data,
            room: {
                ...response.data.room,
                id: normalizeId(response.data.room.id),
            },
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Xóa một hoặc nhiều phòng (soft delete)
export const deleteRooms = async (data: {
    ids: (string | number)[];
}): Promise<RoomDeleteResponse> => {
    try {
        // Use the individual delete endpoint for each room
        const deletePromises = data.ids.map((id) => deleteRoom(id));
        const results = await Promise.all(deletePromises);

        return {
            message: "Xóa phòng thành công",
            deletedCount: results.length,
            deletedIds: data.ids.map(String),
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Xóa một phòng (soft delete)
export const deleteRoom = async (
    id: string | number
): Promise<RoomDeleteResponse> => {
    try {
        // Using DELETE method with ids in the request body
        const response = await axios.delete<RoomDeleteResponse>(
            `${BASE_URL}/room/${id}`,
            {
                data: { ids: [id] },
            }
        );
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Khôi phục phòng bị xóa mềm
export const restoreRoom = async (
    id: string | number
): Promise<RoomRestoreResponse> => {
    const roomId = normalizeId(id);
    try {
        const response = await axios.put<RoomRestoreResponse>(
            ENDPOINTS.RESTORE_ROOM(roomId)
        );
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Xóa vĩnh viễn một phòng (hard delete)
export const permanentDeleteRoom = async (
    id: string | number
): Promise<RoomDeleteResponse> => {
    const roomId = normalizeId(id);
    try {
        const response = await axios.delete<RoomDeleteResponse>(
            `${ENDPOINTS.DELETE_ROOM(roomId)}?permanent=1`
        );
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Export all functions
export default {
    getRooms,
    getRoom,
    getRoomTypes,
    createRoom,
    updateRoom,
    deleteRoom,
    deleteRooms,
    restoreRoom,
    permanentDeleteRoom,
};
