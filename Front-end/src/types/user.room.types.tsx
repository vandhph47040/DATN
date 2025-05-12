// src/types/user.room.types.ts

// Room model for user-specific operations (simplified for client-side use)
export interface UserRoom {
    id: string | number; // Room ID can be string or number based on Laravel
    name: string; // Room name (required for display in Booking/Showtimes)
    capacity: number; // Room capacity (optional for user view, used for reference)
    room_type: '2D' | '3D' | '4D'; // Room type (optional for user view, used for filtering or display)
}

// Response for getting a single room for users
export interface UserRoomResponse {
    room: UserRoom;
    message?: string; // Optional message from API
}

// Response for getting multiple rooms (e.g., by showtime)
export interface UserRoomsResponse {
    rooms: UserRoom[];
    message?: string; // Optional message from API
}

// API error response structure for user-specific operations
export interface UserRoomApiError {
    error: string;
    message?: string;
    details?: string | Record<string, any>;
    status?: number;
    [key: string]: any;
}