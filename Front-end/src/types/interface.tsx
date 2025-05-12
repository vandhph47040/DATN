export interface FormData {
    title: string;
    trailer: string;
    movie: any;
    name_director: number[];
    name_actor: number[];
    movie_status: string;
    release_date: string;
    running_time: number;
    rated: string;
    language: string;
    genre_id: number;
    genres: string;
    name_genres: string;
    description: string;
    directors: string; //filmManage type
    genre: string; //filmManage type
    id: number; // editFilmManage type
    excel_file: any;
}

export interface DataTypeGenresActorsDirectors {
    key: string;
    id: number;
    genre: string;
    name_actor: string;
    name_director: string;
    movie: string;
    title: string;
    movieTitle: string;
    is_public: boolean;
}

export interface SelectFormProps {
    queryKey: string;
    endpoint: string;
    labelKey?: string;
    valueKey?: string;
    dataName?: { label: string; value: string | number }[];
    refetchDataName?: () => void;
    onChange?: (value: string[], fieldName: string) => void;
    form?: any;
    name: string;
    placeholder?: string;
}

export interface RefreshBtnProps {
    queryKey: (string | number)[];
}

export interface FieldType {
    room_id: string;
    room_type_id: string;
    show_date: string;
    date: string;
    movie_id: string;
}

export interface RoomSHowtimesType {
    key: string;
    id: number;
    name: string;
    age: number;
    address: string;
    show_date: string;
}

// onError: (error: any) => {
//     const errorMessage =
//         JSON.parse(error.request.responseText) || "Có lỗi xảy ra";
//     messageApi.error(errorMessage);
// },

export interface AuthResponse {
    token: string;
    role: string; // Thêm thuộc tính role vào đây
}

export interface BookingType {
    id: number;
    roomId: number;
    row: string;
    column: number;
    seatCode: string;
    seatType: string;
    price: string;
    type: string;
    dayType: "weekday" | "weekend" | "holiday";
    status?: string;
    heldByCurrentUser?: boolean;
}

export interface Showtime {
    id: number;
    start_time: string;
    room: {
        room_type: {
            name: string;
        };
    };
}

export interface ComboFoodType {
    key: string;
    image: string;
    title: string;
    price: string;
    description: string;
    quantity: number;
}

export interface OrdersType {
    id: number;
    movie_title: string;
    key: string;
    name: string;
    age: number;
    address: string;
    status: string;
    total_combo_price: string;
    created_at: string;
    room_name: string;
    showtime: string;
    check_in: string;
}
