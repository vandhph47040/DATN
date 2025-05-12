import axios from 'axios';
import { UserRoom, UserRoomResponse, UserRoomsResponse, UserRoomApiError } from '../types/user.room.types';

// Base URL for API (adjust according to your Laravel setup)
const BASE_URL = "http://localhost:8000/api";

// API endpoints for user-specific room operations
const ENDPOINTS = {
    GET_ROOM: (id: string | number) => `${BASE_URL}/room/${id}`, // GET: Show room details for users
    GET_ROOMS_BY_SHOWTIME: (showtimeId: string | number) => `${BASE_URL}/room/showtime/${showtimeId}`, // Giả định endpoint để lấy phòng theo suất chiếu (cần điều chỉnh dựa trên backend)
};

// Utility to normalize and validate IDs
const normalizeId = (id: string | number): string => {
    const normalized = String(id).trim();
    if (!normalized) {
        throw new Error('Room ID or Showtime ID cannot be empty');
    }
    return normalized;
};

// Get single room details for users (used in booking/showtimes)
export const getRoomForUser = async (id: string | number): Promise<UserRoom> => {
    const roomId = normalizeId(id);
    try {
        const response = await axios.get<UserRoomResponse>(ENDPOINTS.GET_ROOM(roomId));
        return {
            ...response.data.room,
            id: normalizeId(response.data.room.id),
            name: response.data.room.name || "Phòng không xác định",
            capacity: response.data.room.capacity || 0,
            room_type: response.data.room.room_type || "2D",
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Get rooms associated with a showtime (optional, if backend supports)
export const getRoomsByShowtime = async (showtimeId: string | number): Promise<UserRoom[]> => {
    const showtimeIdNormalized = normalizeId(showtimeId);
    try {
        const response = await axios.get<UserRoomsResponse>(ENDPOINTS.GET_ROOMS_BY_SHOWTIME(showtimeIdNormalized));
        return response.data.rooms.map(room => ({
            ...room,
            id: normalizeId(room.id),
            name: room.name || "Phòng không xác định",
            capacity: room.capacity || 0,
            room_type: room.room_type || "2D",
        }));
    } catch (error) {
        throw handleApiError(error);
    }
};

// Handle API errors for user-specific operations
const handleApiError = (error: unknown): UserRoomApiError => {
    if (axios.isAxiosError(error) && error.response) {
        const { data, status } = error.response;
        return {
            error: data.error || 'An error occurred',
            message: data.message,
            details: data.details || data.errors,
            status,
        };
    }
    return {
        error: 'Unexpected error occurred',
        message: String(error),
    };
};

export default {
    getRoomForUser,
    getRoomsByShowtime,
};