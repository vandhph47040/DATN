const BASE_URL = "http://localhost:8000/api";
const URL_IMAGE = "http://localhost:8000";

const GET_FILM_LIST = `${BASE_URL}/movies`;
const GET_FILM_DETAIL = (id: number) => `${BASE_URL}/movies/${id}`;
const CREATE_FILM = `${BASE_URL}/movies`;
const UPDATE_FILM = (id: number) => `${BASE_URL}/movies/${id}`;
const DELETE_FILM = (id: number) => `${BASE_URL}/movies/${id}`;
const RESTORE_FILM = (id: number) => `${BASE_URL}/movies/restore/${id}`;
const DETAIL_DELETE_FILM = (id: number) =>
    `${BASE_URL}/movies/show-movie-destroy/${id}`;
const CREATE_FILM_WITH_EXCEL = `${BASE_URL}/movies/import`; // thêm mới film mới file excel
const DEFAULT_TERMINAL_EXCEL = `${BASE_URL}/template-excel`; // tải file excel mẫu

const GET_DIRECTORS_LIST = `${BASE_URL}/directors`;
const UPDATE_DIRECTORS = (id: number) => `${BASE_URL}/directors/${id}`;
const DELETE_DIRECTORS = (id: number) => `${BASE_URL}/directors/${id}`;

const GET_ACTOR_LIST = `${BASE_URL}/actors`;
const UPDATE_ACTOR = (id: number) => `${BASE_URL}/actors/${id}`;
const DELETE_ACTOR = (id: number) => `${BASE_URL}/actors/${id}`;

const GET_GENRES = `${BASE_URL}/genres`;
const DELETE_GENRES = (id: number) => `${BASE_URL}/genres/${id}`;

const GET_CALENDAR = `${BASE_URL}/calendarShow`;
const CREATE_CALENDAR = `${BASE_URL}/calendarShow`;
const DELETE_CALENDAR = (id: number) => `${BASE_URL}/calendarShow/${id}`;
const UPDATE_CALENDAR = (id: number) => `${BASE_URL}/calendarShow/${id}`;
const DETAIL_CALENDAR = (id: number) => `${BASE_URL}/calendarShow/${id}`;
const ON_PUBLISH_CALENDARSHOW = (canlendarId: number) =>
    `${BASE_URL}/calendarShow/${canlendarId}/publish`; // thực hiện render ra ngoài client

const GET_ONE_SHOWTIMES = `${BASE_URL}/show-times/by-date`; // tìm kiếm suất chiếu qua ngày và phòng chiếu
const UPDATE_SHOWTIMES = `${BASE_URL}/showTime`;
const DELETE_ONE_SHOWTIMES = (id: number, selected_date: string) =>
    `${BASE_URL}/showtimes/${id}/destroy-by-date/${selected_date}`; // xóa suất chiếu
const GET_DETAIL_ONE_SHOWTIMES = (id: number) => `${BASE_URL}/showTime/${id}`; // chi tiết suất chiếu
const UPDATE_ONE_SHOWTIMES = (id: number) => `${BASE_URL}/showTime/${id}`; // cập nhật suất chiếu
const GET_DATES_BY_CALENDAR = `${BASE_URL}/show-times/get-date-range-by-calendar`; // lấy những ngày trong lịch chiếu
const GET_SHOWTIMES_BY_FILM = (movie_id: number) =>
    `${BASE_URL}/showtimes/movie/${movie_id}`; // lấy danh sách suất chiếu của 1 phim

const GET_ROOMS = `${BASE_URL}/room`; // lấy danh sách phòng chiếu
const GET_ONE_ROOM = (id: string | number) => `${BASE_URL}/room/${id}`; // lấy chi tiết 1 phòng chiếu
const CREATE_ROOM = `${BASE_URL}/room`; // thêm phòng chiếu
const UPDATE_ROOM = (id: string | number) => `${BASE_URL}/room/${id}`; // cập nhật phòng chiếu
const DELETE_ROOM = (id: string | number) => `${BASE_URL}/room/${id}`; // Xóa phòng chiếu
const GET_ROOM_TYPES = `${BASE_URL}/room-type`; // lấy danh sách loại phòng
const BACKGROUND_IMG_SEATS = (roomId: number) =>
    `${BASE_URL}/rooms/${roomId}/background`; // lấy ảnh nền ghế
const DELETE_AT_ROOM = (id: number) => `${BASE_URL}/room/${id}`; // xóa mềm phòng( bảo trì )
const RESTORE_ROOM = (room: number) => `${BASE_URL}/room/restore/${room}`; // khôi phục phòng

const GET_SEATS_BY_ROOM = (roomId: number) =>
    `${BASE_URL}/seats/room/${roomId}`; // lấy ma trận ghế của phòng chiếu
const GET_SEATS_TYPE = `${BASE_URL}/seat-type`; // lấy danh sách các loại ghế
const UPDATE_SEAT_STATUS = (roomId: number) =>
    `${BASE_URL}/show-time-seats/update-status/${roomId}`; // cập nhật trạng thái ghế
const HOLD_SEAT = `${BASE_URL}/seats/hold`; // giữ ghế
const RELEASE_SEAT = `${BASE_URL}/seats/release`; // giải phóng ghế
const HOLD_SELECTED_SEATS = `${BASE_URL}/seats/hold-selected`; // giữ chọn ghế
const CREATE_SEAT = `${BASE_URL}/seats`; // thêm mới ghế
const UPDATE_SEAT = (seatId: number) => `${BASE_URL}/seats/${seatId}`; // cập nhật ghế
const DELETE_SEAT = (seatId: number) => `${BASE_URL}/seats/${seatId}`; // xóa 1 ghế
const DELETE_ALL_SEATS_IN_ROOM = (roomId: number) =>
    `${BASE_URL}/delete-seats/room/${roomId}`; // xóa tất cả ghế của phòng

const GET_SHOW_BY_FILM_DATE = `${BASE_URL}/showtimes-client/by-date`; // lấy suất chiếu qua ngày chiếu

const GET_USER = `${BASE_URL}/user`; // lấy thông tin user
const UPDATE_USER_CLIENT = `${BASE_URL}/update-profile`;
const GET_ARTICLE = `${BASE_URL}/article`;
const CREATE_ARTICLE = `${BASE_URL}/article`;
const UPDATE_ARTICLE = (id: number) => `${BASE_URL}/article/${id}`;
const DELETE_ARTICLE = (id: number) => `${BASE_URL}/article/${id}`;
const GOOGLE_CALLBACK = `${BASE_URL}/auth/google/callback`;
const GET_COMBOS = `${BASE_URL}/combos`;

const GET_DISCOUNT_CODE = `${BASE_URL}/discount-code`;
const CREATE_DISCOUNT_CODE = `${BASE_URL}/discount-code`;
const UPDATE_DISCOUNT_CODE = (id: number) => `${BASE_URL}/discount-code/${id}`;
const DELETE_DISCOUNT_CODE = (id: number) => `${BASE_URL}/discount-code/${id}`;

const GET_TICKETSPRICE = `${BASE_URL}/ticket-management`; // danh sách giá vé
const DETAIL_TICKETPRICE = (id: number) => `${BASE_URL}/ticket-show/${id}`; // chi tiết giá vé
const ADD_TICKETSPRICE = `${BASE_URL}/ticket-prices`; // thêm mới giá vé
const DELETE_TICKETPRICE = (id: number) => `${BASE_URL}/ticket-delete/${id}`; // xóa giá vé
const UPDATE_TICKETPRICE = (id: number) => `${BASE_URL}/ticket-prices/${id}`; // cập nhật giá

const PAYMENT_WITH_VNPAY = `${BASE_URL}/VNPay/create`; // thanh toán bằng VNPay
const PAYMENT_WITH_PAYPAL = `${BASE_URL}/paypal/create`; // thanh toán bằng Paypal

const GET_VOUCHER = (code: string) =>
    `${BASE_URL}/apply-discount-code?name_code=${encodeURIComponent(
        code.trim()
    )}`; // nhập voucher giảm giá

const ORDERS_LIST = `${BASE_URL}/order`; // danh sách đơn hàng
const DETAIL_ORDER = (bookingId: number) =>
    `${BASE_URL}/order/${bookingId}/order-details`; // chi tiết đơn hàng
const CHANGE_CHECKIN_ORDER = (bookingId: number) =>
    `${BASE_URL}/order/${bookingId}/update-status`; // thay đổi trạng thái check in đơn hàng

const Orders_Recent = `${BASE_URL}/orders-recent`;
const Orders_Search = `${BASE_URL}/orders-search`;
const Orders_Confirmed = `${BASE_URL}/orders-confirmed`;
const CHANGE_PASSWORD = `${BASE_URL}/change-password`; // đổi mật khẩu

const TICKET_DETAIL = `${BASE_URL}/ticket-details`; // chi tiết ticket để lấy QR

const EXPORT_PDF_ORDER = (bookingId: number) =>
    `${BASE_URL}/order/${bookingId}/export-tickets-pdf`; // xuất vé với file PDF

const Orders_Details_Client = (bookingId: number) =>
    `${BASE_URL}/orders-details-client/${bookingId}`;

const MY_DISCOUNT_CODE = `${BASE_URL}/my-discount-code`;

export {
    MY_DISCOUNT_CODE,
    Orders_Details_Client,
    CHANGE_PASSWORD,
    Orders_Confirmed,
    Orders_Search,
    Orders_Recent,
    GET_DISCOUNT_CODE,
    CREATE_DISCOUNT_CODE,
    UPDATE_DISCOUNT_CODE,
    DELETE_DISCOUNT_CODE,
    GOOGLE_CALLBACK,
    UPDATE_USER_CLIENT,
    GET_USER,
    GET_ARTICLE,
    CREATE_ARTICLE,
    UPDATE_ARTICLE,
    DELETE_ARTICLE,
    GET_FILM_LIST,
    GET_FILM_DETAIL,
    CREATE_FILM,
    UPDATE_FILM,
    DELETE_FILM,
    RESTORE_FILM,
    DETAIL_DELETE_FILM,
    CREATE_FILM_WITH_EXCEL,
    DEFAULT_TERMINAL_EXCEL,
    GET_DIRECTORS_LIST,
    UPDATE_DIRECTORS,
    DELETE_DIRECTORS,
    GET_ACTOR_LIST,
    UPDATE_ACTOR,
    DELETE_ACTOR,
    GET_GENRES,
    DELETE_GENRES,
    URL_IMAGE,
    GET_ONE_SHOWTIMES,
    GET_CALENDAR,
    DELETE_CALENDAR,
    CREATE_CALENDAR,
    UPDATE_CALENDAR,
    DETAIL_CALENDAR,
    ON_PUBLISH_CALENDARSHOW,
    UPDATE_SHOWTIMES,
    DELETE_ONE_SHOWTIMES,
    GET_DETAIL_ONE_SHOWTIMES,
    GET_DATES_BY_CALENDAR,
    UPDATE_ONE_SHOWTIMES,
    GET_ROOMS,
    GET_SHOW_BY_FILM_DATE,
    GET_COMBOS,
    GET_TICKETSPRICE,
    ADD_TICKETSPRICE,
    DELETE_TICKETPRICE,
    UPDATE_TICKETPRICE,
    DETAIL_TICKETPRICE,
    PAYMENT_WITH_VNPAY,
    PAYMENT_WITH_PAYPAL,
    GET_VOUCHER,
    ORDERS_LIST,
    DETAIL_ORDER,
    CHANGE_CHECKIN_ORDER,
    RELEASE_SEAT,
    HOLD_SELECTED_SEATS,
    CREATE_SEAT,
    UPDATE_SEAT,
    DELETE_SEAT,
    DELETE_ALL_SEATS_IN_ROOM,
    GET_ONE_ROOM,
    CREATE_ROOM,
    UPDATE_ROOM,
    DELETE_ROOM,
    GET_ROOM_TYPES,
    DELETE_AT_ROOM,
    RESTORE_ROOM,
    BACKGROUND_IMG_SEATS,
    GET_SEATS_BY_ROOM,
    GET_SEATS_TYPE,
    UPDATE_SEAT_STATUS,
    HOLD_SEAT,
    TICKET_DETAIL,
    GET_SHOWTIMES_BY_FILM,
    EXPORT_PDF_ORDER,
};
