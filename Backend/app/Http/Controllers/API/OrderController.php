<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\ShowTimeDate;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index()
    {
        $bookings = Booking::query()
            ->latest('id')
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone');
                },
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'total_price',
                'status',
                'check_in',
                'created_at'
            )
            ->get()
            ->map(function ($booking) {
                // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
                $seats = [];
                $room_name = null;
                $room_type = null;
                $combos = [];
                $movie = null;
                // Khai báo $show_date với giá trị mặc định
                $show_date = 'N/A'; // Giá trị mặc định nếu không tìm thấy show_date

                // Lấy thông tin phim từ showtime -> calendarShow -> movie
                if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
                    $movie = [
                        'id' => $booking->showtime->calendarShow->movie->id,
                        'title' => $booking->showtime->calendarShow->movie->title,
                        'poster' => $booking->showtime->calendarShow->movie->poster,
                    ];
                }

                // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
                if ($booking->showtime && $booking->showtime->showTimeDate) {
                    $showTimeDate = $booking->showtime->showTimeDate instanceof \Illuminate\Support\Collection
                        ? $booking->showtime->showTimeDate->first()
                        : $booking->showtime->showTimeDate;

                    if ($showTimeDate && $showTimeDate->show_date) {
                        // Chuyển show_date thành đối tượng Carbon và định dạng
                        try {
                            $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                        } catch (\Exception $e) {
                            // Nếu parse thất bại, giữ nguyên giá trị hoặc trả về 'N/A'
                            $show_date = $showTimeDate->show_date ?: 'N/A';
                        }
                    }
                }

                if ($booking->bookingDetails) {
                    foreach ($booking->bookingDetails as $detail) {
                        // Thêm ghế nếu có
                        if ($detail->seat) {
                            $seatName = "{$detail->seat->row}{$detail->seat->column}";
                            $seats[] = [
                                'booking_detail_id' => $detail->id,
                                'seat_name' => $seatName,
                                'price' => $detail->price,
                            ];

                            // Lấy tên phòng và loại phòng
                            if ($detail->seat->room) {
                                $room_name = $detail->seat->room->name;
                                $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                            }
                        }

                        // Thêm combo nếu có
                        if ($detail->combo) {
                            $combos[] = [
                                'booking_detail_id' => $detail->id,
                                'combo_name' => $detail->combo->name,
                                'quantity' => $detail->quantity,
                                'price' => $detail->price,
                            ];
                        }
                    }
                }

                return [
                    'id' => $booking->id,
                    'customer_name' => $booking->user->name ?? 'N/A',
                    'phone' => $booking->user->phone ?? 'N/A',
                    'email' => $booking->user->email ?? 'N/A',
                    'showtime' => $booking->showtime
                        ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                        : 'N/A',
                    'show_date' => $show_date, // $show_date đã được đảm bảo có giá trị
                    'movie_title' => $movie ? $movie['title'] : 'N/A',
                    'room_name' => $room_name ?? 'N/A',
                    'room_type' => $room_type ?? 'N/A',
                    'seats' => $seats,
                    'combos' => $combos,
                    'total_ticket_price' => $booking->total_ticket_price,
                    'total_combo_price' => $booking->total_combo_price,
                    'total_price' => $booking->total_price,
                    'status' => $booking->status,
                    'check_in' => $booking->check_in,
                    'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y') : 'N/A',
                ];
            });

        return response()->json([
            'message' => 'Danh sách đơn hàng',
            'data' => $bookings,
        ]);
    }

    public function show($bookingId)
    {
        $booking = Booking::query()
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone');
                },
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'total_price',
                'status',
                'check_in',
                'created_at'
            )
            ->find($bookingId);

        if (!$booking) {
            return response()->json([
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
        $seats = [];
        $room_name = null;
        $room_type = null;
        $movie = null;
        $show_date = 'N/A'; // Khai báo giá trị mặc định cho $show_date

        // Lấy thông tin phim từ showtime -> calendarShow -> movie
        if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
            $movie = [
                'id' => $booking->showtime->calendarShow->movie->id,
                'title' => $booking->showtime->calendarShow->movie->title,
                'poster' => $booking->showtime->calendarShow->movie->poster,
            ];
        }

        // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
        if ($booking->showtime && $booking->showtime->showTimeDate) {
            $showTimeDate = $booking->showtime->showTimeDate instanceof \Illuminate\Support\Collection
                ? $booking->showtime->showTimeDate->first()
                : $booking->showtime->showTimeDate;

            if ($showTimeDate && $showTimeDate->show_date) {
                try {
                    $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                } catch (\Exception $e) {
                    $show_date = $showTimeDate->show_date ?: 'N/A';
                }
            }
        }

        // Tạo danh sách vé (tickets) dựa trên số ghế
        $tickets = [];
        $comboDetails = []; // Lưu thông tin combo riêng

        if ($booking->bookingDetails) {
            foreach ($booking->bookingDetails as $detail) {
                // Xử lý ghế (mỗi ghế là một vé)
                if ($detail->seat) {
                    $seatName = "{$detail->seat->row}{$detail->seat->column}";
                    // Xác định loại ghế (seat_type) dựa trên room_type
                    $seatType = 'Thường'; // Mặc định là Thường
                    if ($detail->seat->room && $detail->seat->room->roomType) {
                        $room_name = $detail->seat->room->name;
                        $room_type = $detail->seat->room->roomType->name;
                        $roomTypeName = $room_type;
                        if (stripos($roomTypeName, 'VIP') !== false) {
                            $seatType = 'VIP';
                        } elseif (stripos($roomTypeName, 'Sweetbox') !== false) {
                            $seatType = 'Sweetbox';
                        }
                    }

                    $ticket = [
                        'ticket_id' => "TICKET-{$booking->id}-{$detail->id}", // ID vé duy nhất
                        'booking_id' => $booking->id,
                        'booking_detail_id' => $detail->id,
                        'customer_name' => $booking->user->name ?? 'N/A',
                        'phone' => $booking->user->phone ?? 'N/A',
                        'email' => $booking->user->email ?? 'N/A',
                        'movie_title' => $movie ? $movie['title'] : 'N/A',
                        'showtime' => $booking->showtime
                            ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                            : 'N/A',
                        'show_date' => $show_date,
                        'room_name' => $room_name ?? 'N/A',
                        'room_type' => $room_type ?? 'N/A',
                        'seat_name' => $seatName,
                        'seat_type' => $seatType,
                        'price' => (int) $detail->price,
                        'status' => $booking->status,
                        'check_in' => $booking->check_in,
                        'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y') : 'N/A',
                    ];

                    $tickets[] = $ticket;
                }

                if ($detail->combo) {
                    $comboDetails[] = [
                        'booking_detail_id' => $detail->id,
                        'combo_name' => $detail->combo->name,
                        'quantity' => (int) $detail->quantity,
                        'price' => (int) $detail->price,
                    ];
                }
            }
        }

        // Tính tổng tiền và giảm giá
        $totalPrice = (int) $booking->total_price;
        if ($totalPrice === 0) {
            $totalPrice = (int) ($booking->total_ticket_price + $booking->total_combo_price);
        }
        $discount = (int) (($booking->total_ticket_price + $booking->total_combo_price) - $totalPrice);

        // Lấy danh sách các giá trị ENUM của check_in
        $checkInOptions = $this->getEnumValues('bookings', 'check_in');

        $formattedBooking = [
            'booking_id' => $booking->id,
            'customer_name' => $booking->user->name ?? 'N/A',
            'phone' => $booking->user->phone ?? 'N/A',
            'email' => $booking->user->email ?? 'N/A',
            'showtime' => $booking->showtime
                ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                : 'N/A',
            'show_date' => $show_date, // Đã đảm bảo $show_date luôn có giá trị
            'movie_title' => $movie ? $movie['title'] : 'N/A',
            'room_name' => $room_name ?? 'N/A',
            'room_type' => $room_type ?? 'N/A',
            'tickets' => $tickets, // Danh sách vé riêng biệt
            'combos' => $comboDetails, // Danh sách combo
            'total_ticket_price' => (int) $booking->total_ticket_price,
            'total_combo_price' => (int) $booking->total_combo_price,
            'total_price' => $totalPrice,
            'discount' => $discount,
            'status' => $booking->status,
            'check_in' => $booking->check_in,
            'check_in_options' => $checkInOptions,
            'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y') : 'N/A',
        ];

        return response()->json([
            'message' => 'Chi tiết đơn hàng',
            'data' => $formattedBooking,
        ]);
    }

    /**
     * Lấy tất cả giá trị ENUM của một cột trong bảng
     */
    private function getEnumValues($table, $column)
    {
        $result = DB::select("SHOW COLUMNS FROM {$table} WHERE Field = ?", [$column]);

        if (empty($result)) {
            return [];
        }

        // Lấy định nghĩa của cột (ví dụ: "enum('absent','checked_in','waiting')")
        $type = $result[0]->Type;

        // Trích xuất các giá trị từ chuỗi enum
        preg_match("/^enum\((.*)\)$/", $type, $matches);
        if (empty($matches[1])) {
            return [];
        }

        // Chuyển chuỗi giá trị thành mảng (bỏ dấu nháy đơn)
        $values = array_map(function ($value) {
            return trim($value, "'");
        }, explode(',', $matches[1]));

        return $values;
    }

    public function updateStatusClient(Request $request, string $id)
    {
        // Tìm đơn theo id
        $booking = Booking::find($id);
        // Log::info('Booking ID: ' . $booking);

        // Kiểm tra xem booking có tồn tại không
        if (!$booking) {
            return response()->json([
                'message' => 'Không tìm thấy đơn hàng với ID này',
            ], 404); // Trả về mã lỗi 404 nếu không tìm thấy
        }

        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'check_in' => 'required|in:absent,checked_in,waiting', // Đảm bảo giá trị nằm trong các giá trị ENUM
        ]);

        // Cập nhật chỉ trường check_in
        $booking->update([
            'check_in' => $validated['check_in'],
        ]);

        // Trả về JSON response
        return response()->json([
            'message' => 'Check-in thành công',
            'data' => $booking,
        ], 200);
    }

    // Tìm kiếm giao dịch
    public function searchOrders(Request $request)
    {
        // Lấy user_id từ auth()
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'message' => 'Người dùng chưa đăng nhập',
            ], 401);
        }

        // Ghi log query string để debug
        // Log::info('Query string: ', $request->query->all());

        // Lấy tham số title hoặc query
        $movieTitle = $request->query('title') ?? $request->query('query');
        // Log::info('Raw movie title input: ' . $movieTitle);

        // Chuẩn hóa input
        $movieTitle = trim($movieTitle ?? '');
        // Log::info('Processed movie title: ' . $movieTitle);

        // Kiểm tra movieTitle
        if (empty($movieTitle)) {
            return response()->json([
                'message' => 'Vui lòng cung cấp tên phim để tìm kiếm',
                'data' => [],
            ], 400);
        }

        // Lấy các tham số khác
        $status = $request->query('status');
        $date = $request->query('date');

        $query = Booking::query()
            ->where('user_id', $userId)
            ->with([
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'total_price',
                'status',
                'created_at'
            );

        // Tìm kiếm theo tên phim
        $query->whereHas('showtime.calendarShow.movie', function ($q) use ($movieTitle) {
            $q->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($movieTitle) . '%']);
        });

        // Tìm kiếm theo trạng thái
        if ($status) {
            $query->where('status', $status);
        }

        // Tìm kiếm theo ngày giao dịch
        if ($date) {
            try {
                $startOfDay = Carbon::parse($date)->startOfDay();
                $endOfDay = Carbon::parse($date)->endOfDay();
                $query->whereBetween('created_at', [$startOfDay, $endOfDay]);
            } catch (\Exception $e) {
                // Log::error('Invalid date format: ' . $date);
            }
        }

        // Ghi log truy vấn SQL
        DB::enableQueryLog();
        $bookings = $query->latest('id')->get();
        // Log::info('Query Log: ', DB::getQueryLog());

        $bookings = $bookings->map(function ($booking) {
            $seats = [];
            $room_name = null;
            $room_type = null;
            $combos = [];
            $movie = ['id' => null, 'title' => 'N/A', 'poster' => null];
            $show_date = 'N/A';

            if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
                $movie = [
                    'id' => $booking->showtime->calendarShow->movie->id,
                    'title' => $booking->showtime->calendarShow->movie->title,
                    'poster' => $booking->showtime->calendarShow->movie->poster,
                ];
            }

            if ($booking->showtime && $booking->showtime->showTimeDate) {
                $showTimeDate = $booking->showtime->showTimeDate instanceof Collection
                    ? $booking->showtime->showTimeDate->first()
                    : $booking->showtime->showTimeDate;

                if ($showTimeDate && $showTimeDate->show_date) {
                    try {
                        $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                    } catch (\Exception $e) {
                        $show_date = $showTimeDate->show_date ?: 'N/A';
                    }
                }
            }

            if ($booking->bookingDetails) {
                foreach ($booking->bookingDetails as $detail) {
                    if ($detail->seat) {
                        $seatName = "{$detail->seat->row}{$detail->seat->column}";
                        $seats[] = [
                            'booking_detail_id' => $detail->id,
                            'seat_name' => $seatName,
                            'price' => $detail->price,
                        ];
                        if ($detail->seat->room) {
                            $room_name = $detail->seat->room->name;
                            $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                        }
                    }
                    if ($detail->combo) {
                        $combos[] = [
                            'booking_detail_id' => $detail->id,
                            'combo_name' => $detail->combo->name,
                            'quantity' => $detail->quantity,
                            'price' => $detail->price,
                        ];
                    }
                }
            }

            $totalPrice = (int) $booking->total_price;
            if ($totalPrice === 0) {
                $totalPrice = (int) ($booking->total_ticket_price + $booking->total_combo_price);
            }
            $discount = (int) (($booking->total_ticket_price + $booking->total_combo_price) - $totalPrice);

            return [
                'id' => $booking->id,
                'showtime' => $booking->showtime
                    ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                    : 'N/A',
                'show_date' => $show_date,
                'movie_title' => $movie['title'],
                'movie_poster' => $movie['poster'],
                'room_name' => $room_name ?? 'N/A',
                'room_type' => $room_type ?? 'N/A',
                'seats' => $seats,
                'combos' => $combos,
                'total_ticket_price' => (int) $booking->total_ticket_price,
                'total_combo_price' => (int) $booking->total_combo_price,
                'total_price' => number_format($totalPrice, 0, ',', '.'),
                'discount' => $discount,
                'status' => $booking->status,
                'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y H:i:s') : 'N/A',
            ];
        });

        return response()->json([
            'message' => 'Kết quả tìm kiếm giao dịch',
            'data' => $bookings,
        ]);
    }

    // Lấy danh sách giao dịch gần đây (20 giao dịch gần nhất)
    public function recentOrders(Request $request)
    {
        // Lấy user_id từ auth()
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'message' => 'Người dùng chưa đăng nhập',
            ], 401);
        }

        $bookings = Booking::query()
            ->where('user_id', $userId) // Chỉ lấy giao dịch của khách hàng hiện tại
            ->latest('id')
            ->take(20) // Lấy 20 giao dịch gần nhất
            ->with([
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'total_price',
                'status',
                'created_at'
            )
            ->get()
            ->map(function ($booking) {
                // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
                $seats = [];
                $room_name = null;
                $room_type = null;
                $combos = [];
                $movie = null;
                $show_date = 'N/A'; // Khai báo giá trị mặc định

                // Lấy thông tin phim từ showtime -> calendarShow -> movie
                if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
                    $movie = [
                        'id' => $booking->showtime->calendarShow->movie->id,
                        'title' => $booking->showtime->calendarShow->movie->title,
                        'poster' => $booking->showtime->calendarShow->movie->poster,
                    ];
                }

                // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
                if ($booking->showtime && $booking->showtime->showTimeDate) {
                    $showTimeDate = $booking->showtime->showTimeDate instanceof Collection
                        ? $booking->showtime->showTimeDate->first()
                        : $booking->showtime->showTimeDate;

                    if ($showTimeDate && $showTimeDate->show_date) {
                        // Chuyển show_date thành đối tượng Carbon và định dạng
                        try {
                            $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                        } catch (\Exception $e) {
                            // Nếu parse thất bại, giữ nguyên giá trị hoặc trả về 'N/A'
                            $show_date = $showTimeDate->show_date ?: 'N/A';
                        }
                    }
                }

                if ($booking->bookingDetails) {
                    foreach ($booking->bookingDetails as $detail) {
                        // Thêm ghế nếu có
                        if ($detail->seat) {
                            $seatName = "{$detail->seat->row}{$detail->seat->column}";
                            $seats[] = [
                                'booking_detail_id' => $detail->id,
                                'seat_name' => $seatName,
                                'price' => (int) $detail->price,
                            ];

                            // Lấy tên phòng và loại phòng
                            if ($detail->seat->room) {
                                $room_name = $detail->seat->room->name;
                                $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                            }
                        }

                        // Thêm combo nếu có
                        if ($detail->combo) {
                            $combos[] = [
                                'booking_detail_id' => $detail->id,
                                'combo_name' => $detail->combo->name,
                                'quantity' => (int) $detail->quantity,
                                'price' => (int) $detail->price,
                            ];
                        }
                    }
                }

                // Tính tổng tiền và giảm giá
                $totalPrice = (int) $booking->total_price;
                if ($totalPrice === 0) {
                    $totalPrice = (int) ($booking->total_ticket_price + $booking->total_combo_price);
                }
                $discount = (int) (($booking->total_ticket_price + $booking->total_combo_price) - $totalPrice);

                return [
                    'id' => $booking->id,
                    'showtime' => $booking->showtime
                        ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                        : 'N/A',
                    'show_date' => $show_date, // Sử dụng biến đã khai báo
                    'movie_title' => $movie ? $movie['title'] : 'N/A',
                    'movie_poster' => $movie ? $movie['poster'] : null,
                    'room_name' => $room_name ?? 'N/A',
                    'room_type' => $room_type ?? 'N/A',
                    'seats' => $seats,
                    'combos' => $combos,
                    'total_ticket_price' => (int) $booking->total_ticket_price,
                    'total_combo_price' => (int) $booking->total_combo_price,
                    'total_price' => $totalPrice,
                    'discount' => $discount,
                    'status' => $booking->status,
                    'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y H:i:s') : 'N/A',
                ];
            });

        return response()->json([
            'message' => 'Danh sách giao dịch gần đây',
            'data' => $bookings,
        ]);
    }

    // Lấy danh sách tất cả giao dịch đã hoàn tất
    public function confirmedOrders(Request $request)
    {
        // Lấy user_id từ auth()
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'message' => 'Người dùng chưa đăng nhập',
            ], 401);
        }

        $bookings = Booking::query()
            ->where('user_id', $userId) // Chỉ lấy giao dịch của khách hàng hiện tại
            ->where('status', 'confirmed') // Chỉ lấy giao dịch đã hoàn tất
            ->latest('id')
            ->with([
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'total_price',
                'status',
                'created_at'
            )
            ->get()
            ->map(function ($booking) {
                // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
                $seats = [];
                $room_name = null;
                $room_type = null;
                $combos = [];
                $movie = null;
                $show_date = 'N/A'; // Khai báo giá trị mặc định

                // Lấy thông tin phim từ showtime -> calendarShow -> movie
                if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
                    $movie = [
                        'id' => $booking->showtime->calendarShow->movie->id,
                        'title' => $booking->showtime->calendarShow->movie->title,
                        'poster' => $booking->showtime->calendarShow->movie->poster,
                    ];
                }

                // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
                if ($booking->showtime && $booking->showtime->showTimeDate) {
                    $showTimeDate = $booking->showtime->showTimeDate instanceof Collection
                        ? $booking->showtime->showTimeDate->first()
                        : $booking->showtime->showTimeDate;

                    if ($showTimeDate && $showTimeDate->show_date) {
                        // Chuyển show_date thành đối tượng Carbon và định dạng
                        try {
                            $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                        } catch (\Exception $e) {
                            // Nếu parse thất bại, giữ nguyên giá trị hoặc trả về 'N/A'
                            $show_date = $showTimeDate->show_date ?: 'N/A';
                        }
                    }
                }

                if ($booking->bookingDetails) {
                    foreach ($booking->bookingDetails as $detail) {
                        // Thêm ghế nếu có
                        if ($detail->seat) {
                            $seatName = "{$detail->seat->row}{$detail->seat->column}";
                            $seats[] = [
                                'booking_detail_id' => $detail->id,
                                'seat_name' => $seatName,
                                'price' => (int) $detail->price,
                            ];

                            // Lấy tên phòng và loại phòng
                            if ($detail->seat->room) {
                                $room_name = $detail->seat->room->name;
                                $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                            }
                        }

                        // Thêm combo nếu có
                        if ($detail->combo) {
                            $combos[] = [
                                'booking_detail_id' => $detail->id,
                                'combo_name' => $detail->combo->name,
                                'quantity' => (int) $detail->quantity,
                                'price' => (int) $detail->price,
                            ];
                        }
                    }
                }

                // Tính tổng tiền và giảm giá
                $totalPrice = (int) $booking->total_price;
                if ($totalPrice === 0) {
                    $totalPrice = (int) ($booking->total_ticket_price + $booking->total_combo_price);
                }
                $discount = (int) (($booking->total_ticket_price + $booking->total_combo_price) - $totalPrice);

                return [
                    'id' => $booking->id,
                    'showtime' => $booking->showtime
                        ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                        : 'N/A',
                    'show_date' => $show_date,
                    'movie_title' => $movie ? $movie['title'] : 'N/A',
                    'movie_poster' => $movie ? $movie['poster'] : null,
                    'room_name' => $room_name ?? 'N/A',
                    'room_type' => $room_type ?? 'N/A',
                    'seats' => $seats,
                    'combos' => $combos,
                    'total_ticket_price' => (int) $booking->total_ticket_price,
                    'total_combo_price' => (int) $booking->total_combo_price,
                    'total_price' => $totalPrice,
                    'discount' => $discount,
                    'status' => $booking->status,
                    'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y H:i:s') : 'N/A',
                ];
            });

        return response()->json([
            'message' => 'Danh sách giao dịch đã hoàn tất',
            'data' => $bookings,
        ]);
    }

    public function showForClient($bookingId)
    {
        $booking = Booking::query()
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone');
                },
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster'); // Lấy thông tin phim
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name'); // Lấy tên loại phòng từ room_types
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'total_price',
                'status',
                'check_in',
                'created_at'
            )
            ->find($bookingId);

        if (!$booking) {
            return response()->json([
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
        $seats = [];
        $room_name = null;
        $room_type = null;
        $combos = [];
        $movie = null;

        // Lấy thông tin phim từ showtime -> calendarShow -> movie
        if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
            $movie = [
                'id' => $booking->showtime->calendarShow->movie->id,
                'title' => $booking->showtime->calendarShow->movie->title,
                'poster' => $booking->showtime->calendarShow->movie->poster,
            ];
        }

        // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
        if ($booking->showtime && $booking->showtime->showTimeDate) {
            $showTimeDate = $booking->showtime->showTimeDate instanceof Collection
                ? $booking->showtime->showTimeDate->first()
                : $booking->showtime->showTimeDate;

            if ($showTimeDate && $showTimeDate->show_date) {
                // Chuyển show_date thành đối tượng Carbon và định dạng
                try {
                    $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                } catch (\Exception $e) {
                    // Nếu parse thất bại, giữ nguyên giá trị hoặc trả về 'N/A'
                    $show_date = $showTimeDate->show_date ?: 'N/A';
                }
            }
        }

        if ($booking->bookingDetails) {
            foreach ($booking->bookingDetails as $detail) {
                if ($detail->seat) {
                    $seatName = "{$detail->seat->row}{$detail->seat->column}";
                    // Xác định loại ghế (seat_type) dựa trên room_type
                    $seatType = 'Thường'; // Mặc định là Thường
                    if ($detail->seat->room && $detail->seat->room->roomType) {
                        $roomTypeName = $detail->seat->room->roomType->name;
                        if (stripos($roomTypeName, 'VIP') !== false) {
                            $seatType = 'VIP';
                        } elseif (stripos($roomTypeName, 'Sweetbox') !== false) {
                            $seatType = 'Sweetbox';
                        }
                    }

                    $seats[] = [
                        'booking_detail_id' => $detail->id,
                        'seat_name' => $seatName,
                        'price' => (int) $detail->price,
                        'seat_type' => $seatType,
                    ];

                    // Lấy tên phòng và loại phòng
                    if ($detail->seat->room) {
                        $room_name = $detail->seat->room->name;
                        $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                    }
                }

                if ($detail->combo) {
                    $combos[] = [
                        'booking_detail_id' => $detail->id,
                        'combo_name' => $detail->combo->name,
                        'quantity' => (int) $detail->quantity,
                        'price' => (int) $detail->price,
                    ];
                }
            }
        }

        // Tính tổng tiền và giảm giá
        $totalPrice = $booking->total_price;
        if ($totalPrice == 0) {
            $totalPrice = $booking->total_ticket_price + $booking->total_combo_price;
        }
        $discount = ($booking->total_ticket_price + $booking->total_combo_price) - $totalPrice;

        // Lấy danh sách các giá trị ENUM của check_in
        $checkInOptions = $this->getEnumValues('bookings', 'check_in');

        $formattedBooking = [
            'id' => $booking->id,
            'customer_name' => $booking->user->name ?? 'N/A',
            'phone' => $booking->user->phone ?? 'N/A',
            'email' => $booking->user->email ?? 'N/A',
            'showtime' => $booking->showtime
                ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                : 'N/A',
            'show_date' => $show_date,
            'movie_title' => $movie ? $movie['title'] : 'N/A',
            'room_name' => $room_name ?? 'N/A',
            'room_type' => $room_type ?? 'N/A',
            'seats' => $seats,
            'combos' => $combos,
            'total_ticket_price' => (int) $booking->total_ticket_price,
            'total_combo_price' => (int) $booking->total_combo_price,
            'total_price' => (int) $totalPrice,
            'discount' => (int) $discount,
            'status' => $booking->status,
            'check_in' => $booking->check_in,
            'check_in_options' => $checkInOptions,
            'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y') : 'N/A',
        ];

        return response()->json([
            'message' => 'Chi tiết giao dịch',
            'data' => $formattedBooking,
        ]);
    }


    //---------------------------------------------test--------------------------------------------//
    public function exportTicketsToPdf($bookingId)
    {
        // Hàm chuyển đổi chuỗi có dấu sang không dấu
        function removeAccents($str)
        {
            $str = mb_strtolower($str, 'UTF-8'); // Chuyển chuỗi về chữ thường
            $accents = [
                'à' => 'a',
                'á' => 'a',
                'ả' => 'a',
                'ã' => 'a',
                'ạ' => 'a',
                'ă' => 'a',
                'ằ' => 'a',
                'ắ' => 'a',
                'ẳ' => 'a',
                'ẵ' => 'a',
                'ặ' => 'a',
                'â' => 'a',
                'ầ' => 'a',
                'ấ' => 'a',
                'ẩ' => 'a',
                'ẫ' => 'a',
                'ậ' => 'a',
                'è' => 'e',
                'é' => 'e',
                'ẻ' => 'e',
                'ẽ' => 'e',
                'ẹ' => 'e',
                'ê' => 'e',
                'ề' => 'e',
                'ế' => 'e',
                'ể' => 'e',
                'ễ' => 'e',
                'ệ' => 'e',
                'ì' => 'i',
                'í' => 'i',
                'ỉ' => 'i',
                'ĩ' => 'i',
                'ị' => 'i',
                'ò' => 'o',
                'ó' => 'o',
                'ỏ' => 'o',
                'õ' => 'o',
                'ọ' => 'o',
                'ô' => 'o',
                'ồ' => 'o',
                'ố' => 'o',
                'ổ' => 'o',
                'ỗ' => 'o',
                'ộ' => 'o',
                'ơ' => 'o',
                'ờ' => 'o',
                'ớ' => 'o',
                'ở' => 'o',
                'ỡ' => 'o',
                'ợ' => 'o',
                'ù' => 'u',
                'ú' => 'u',
                'ủ' => 'u',
                'ũ' => 'u',
                'ụ' => 'u',
                'ư' => 'u',
                'ừ' => 'u',
                'ứ' => 'u',
                'ử' => 'u',
                'ữ' => 'u',
                'ự' => 'u',
                'ỳ' => 'y',
                'ý' => 'y',
                'ỷ' => 'y',
                'ỹ' => 'y',
                'ỵ' => 'y',
                'đ' => 'd',
                'À' => 'A',
                'Á' => 'A',
                'Ả' => 'A',
                'Ã' => 'A',
                'Ạ' => 'A',
                'Ă' => 'A',
                'Ằ' => 'A',
                'Ắ' => 'A',
                'Ẳ' => 'A',
                'Ẵ' => 'A',
                'Ặ' => 'A',
                'Â' => 'A',
                'Ầ' => 'A',
                'Ấ' => 'A',
                'Ẩ' => 'A',
                'Ẫ' => 'A',
                'Ậ' => 'A',
                'È' => 'E',
                'É' => 'E',
                'Ẻ' => 'E',
                'Ẽ' => 'E',
                'Ẹ' => 'E',
                'Ê' => 'E',
                'Ề' => 'E',
                'Ế' => 'E',
                'Ể' => 'E',
                'Ễ' => 'E',
                'Ệ' => 'E',
                'Ì' => 'I',
                'Í' => 'I',
                'Ỉ' => 'I',
                'Ĩ' => 'I',
                'Ị' => 'I',
                'Ò' => 'O',
                'Ó' => 'O',
                'Ỏ' => 'O',
                'Õ' => 'O',
                'Ọ' => 'O',
                'Ô' => 'O',
                'Ồ' => 'O',
                'Ố' => 'O',
                'Ổ' => 'O',
                'Ỗ' => 'O',
                'Ộ' => 'O',
                'Ơ' => 'O',
                'Ờ' => 'O',
                'Ớ' => 'O',
                'Ở' => 'O',
                'Ỡ' => 'O',
                'Ợ' => 'O',
                'Ù' => 'U',
                'Ú' => 'U',
                'Ủ' => 'U',
                'Ũ' => 'U',
                'Ụ' => 'U',
                'Ư' => 'U',
                'Ừ' => 'U',
                'Ứ' => 'U',
                'Ử' => 'U',
                'Ữ' => 'U',
                'Ự' => 'U',
                'Ỳ' => 'Y',
                'Ý' => 'Y',
                'Ỷ' => 'Y',
                'Ỹ' => 'Y',
                'Ỵ' => 'Y',
                'Đ' => 'D'
            ];
            $str = strtr($str, $accents); // Thay thế các ký tự có dấu
            $str = preg_replace('/[^a-zA-Z0-9\s]/', '', $str); // Loại bỏ ký tự đặc biệt, chỉ giữ chữ cái, số và khoảng trắng
            $str = preg_replace('/\s+/', ' ', $str); // Thay thế nhiều khoảng trắng bằng 1 khoảng trắng
            return trim($str);
        }

        // Gọi phương thức show để lấy dữ liệu
        $response = $this->show($bookingId);
        $data = json_decode($response->getContent(), true);

        // Kiểm tra nếu không tìm thấy đơn hàng
        if ($response->getStatusCode() === 404) {
            return $response; // Trả về JSON lỗi 404 từ show
        }

        $bookingData = $data['data'];
        $tickets = $bookingData['tickets'];
        $combos = $bookingData['combos'];

        // Tạo HTML cho PDF với giao diện mới
        $html = '
    <style>
        * {
            font-family: "DejaVu Sans", sans-serif; /* Phông chữ hỗ trợ tiếng Việt */
            box-sizing: border-box;
        }
        .wrapperBackend {
            max-width: 600px;
            margin: 20px auto;
            background-color: #f0bf9f; /* Màu nền đã được thay đổi trước đó */
            padding: 20px;
            border: 3px solid transparent;
            border-image: repeating-linear-gradient(
                to right,
                #333 0px,
                #333 10px,
                transparent 10px,
                transparent 22px
            ) 30;
            position: relative;
            page-break-inside: avoid; /* Đảm bảo mỗi vé không bị cắt giữa các trang */
        }
        .info {
            text-align: center;
            font-weight: 500;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .movieInfo, .bookingContent, .allInfo {
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            position: relative;
        }
        .movieInfo {
            margin-top: 20px;
        }
        .bookingContent {
            margin-top: 10px;
        }
        .allInfo {
            margin-top: 45px;
            margin-bottom: 8px;
        }
        .sectionTitle {
            width: 70px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 10px;
        }
        .subBox, .ticketDetails {
            border: 1px solid #333;
            padding: 10px;
            width: 100%;
        }
        .movieTitle {
            font-weight: 700;
            font-size: 16px;
            margin: 0 0 5px 0;
        }
        .movieDetails {
            font-size: 12px;
            color: #555;
        }
        .movieDetails span {
            margin-right: 10px;
        }
        .rated {
            display: inline-block;
            font-weight: 600;
        }
        .cinemaRoom, .showtime, .seatInfo, .comboInfo {
            font-size: 14px;
            margin-bottom: 5px;
        }
        .seatLabel, .comboLabel {
            font-weight: 600;
            margin-right: 5px;
        }
        .seatName {
            font-weight: 700;
        }
        .comboName {
            font-weight: 600;
        }
        .all {
            font-size: 16px;
            font-weight: 600;
            margin-top: 30px;
        }
        .totalPrice {
            width: 100%; /* Đảm bảo chiều rộng khớp với các phần khác */
            padding: 10px;
            color: #fff;
            font-weight: 600;
            font-size: 14px;
            background-color: #333;
            text-align: center;
        }
        .movieInfo::before, .movieInfo::after,
        .bookingContent::before, .bookingContent::after,
        .allInfo::before, .allInfo::after {
            content: "";
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background-color: #fff;
            position: absolute;
            z-index: 1;
        }
        .movieInfo::before {
            top: -32px;
            left: -32px;
        }
        .movieInfo::after {
            top: -32px;
            right: -32px;
        }
        .bookingContent::before {
            bottom: -32px;
            left: -32px;
        }
        .bookingContent::after {
            bottom: -32px;
            right: -32px;
        }
        .allInfo::before {
            bottom: -32px;
            left: -32px;
        }
        .allInfo::after {
            bottom: -32px;
            right: -32px;
        }
        .all::after {
            content: "";
            width: calc(100% + 30px);
            height: 3px;
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background-image: repeating-linear-gradient(
                to right,
                #333 0px,
                #333 10px,
                transparent 10px,
                transparent 22px
            );
        }
    </style>';

        // Tạo vé riêng cho từng ghế
        foreach ($tickets as $index => $ticket) {
            $html .= '
        <div class="wrapperBackend infoBox">
            <h1 class="info">THONG TIN DAT VE</h1>
            <div class="movieInfo">
                <h2 class="sectionTitle">Phim</h2>
                <div class="subBox">
                    <h3 class="movieTitle">' . htmlspecialchars(removeAccents($ticket['movie_title'])) . '</h3>
                    <div class="movieDetails">
                        <span class="format">' . htmlspecialchars($ticket['room_type']) . '</span>
                        <span class="rated">' . htmlspecialchars($ticket['rated'] ?? 'T16') . '</span>
                    </div>
                </div>
            </div>
            <div class="bookingContent">
                <h2 class="sectionTitle">Noi dung</h2>
                <div class="ticketDetails">
                    <div class="cinemaRoom">' . htmlspecialchars($ticket['room_name']) . '</div>
                    <div class="showtime">' . htmlspecialchars($ticket['showtime']) . ' - ' . htmlspecialchars($ticket['show_date']) . '</div>
                    <div class="seatInfo">
                        <div>
                            <span class="seatLabel">Ghe</span>
                            <span class="seatName">' . htmlspecialchars($ticket['seat_name']) . '</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="allInfo">
                <h2 class="all">Tong</h2>
                <div class="totalPrice">' . number_format($ticket['price'], 0, ',', '.') . ' VND</div>
            </div>
        </div>';
        }

        // Tạo vé riêng cho combo (nếu có)
        if (!empty($combos)) {
            $totalComboPrice = array_sum(array_map(function ($combo) {
                return $combo['price'] * $combo['quantity'];
            }, $combos));

            $html .= '
        <div class="wrapperBackend infoBox">
            <h1 class="info">THONG TIN DICH VU</h1>
            <div class="bookingContent">
                <h2 class="sectionTitle">Noi dung</h2>
                <div class="ticketDetails">
                    <div class="comboInfo">';
            foreach ($combos as $combo) {
                $html .= '
                        <div>
                            <span class="comboLabel">' . htmlspecialchars($combo['quantity']) . '</span>
                            <span>x</span>
                            <span class="comboName">' . htmlspecialchars(removeAccents($combo['combo_name'])) . '</span>
                        </div>';
            }
            $html .= '
                    </div>
                </div>
            </div>
            <div class="allInfo">
                <h2 class="all">Tong</h2>
                <div class="totalPrice">' . number_format($totalComboPrice, 0, ',', '.') . ' VND</div>
            </div>
        </div>';
        }

        // Tạo và trả về PDF
        $pdf = Pdf::loadHTML($html)->setPaper('A4', 'portrait');
        return $pdf->download('tickets_booking_' . $bookingId . '.pdf');
    }
    //---------------------------------------------end-test--------------------------------------------//
}
