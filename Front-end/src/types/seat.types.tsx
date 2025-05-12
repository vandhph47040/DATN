// SeatType model
export interface SeatType {
    id: number;
    name: string;
    price: number;
}

// Response format for a list of seats in a room (matrix format)
export interface SeatingMatrix {
    [row: string]: {
        [column: string]: SeatInMatrix;
    };
}

// Individual seat representation within the matrix
export interface SeatInMatrix {
    id: number;
    seatCode: string;
    type: string;
    status: "available" | "booked";
    price: number;
    isHeld?: boolean;
    heldByUser?: boolean;
}

// General seat model
export interface Seat {
    id: number;
    room_id: number;
    row: string;
    column: string;
    seat_type_id: number;
    seat_status: "available" | "booked";
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    seatType?: SeatType;
}

// Request for creating a new seat
export interface SeatCreateRequest {
    room_id: number;
    row: string;
    column: string;
    seat_type_id: number;
    seat_status?: "available" | "booked"; // Optional để tương thích với cả 2 loại API
}

// Request for updating an existing seat
export interface SeatUpdateRequest {
    row?: string;
    column?: string;
    seat_type_id?: number;
    seat_status?: "available" | "booked";
}

// Response for seat status update
export interface SeatUpdateResponse {
    message: string;
    updated_seats: Array<{
        seat_id: number;
        seat_status?: string;
    }>;
}

// API Error response format
export interface ApiError {
    error: string;
    message?: string;
    details?: Record<string, string[]>;
    status?: number;
}
