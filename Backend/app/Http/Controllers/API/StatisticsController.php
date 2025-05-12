<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\User;
use App\Models\Movie;
use App\Models\Showtime;
use App\Models\CalendarShow;
use App\Exports\StatsByDateRangeExport;
use App\Models\Movies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        // Lấy ngày hiện tại
        $date = $request->input('date') ?? Carbon::now()->format('Y-m-d');
        $currentDate = Carbon::now()->format('d-m-Y');

        // Xử lý định dạng ngày
        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $date)) {
            $startOfDay = Carbon::createFromFormat('d/m/Y', $date)->startOfDay();
            $endOfDay = Carbon::createFromFormat('d/m/Y', $date)->endOfDay();
            $startOfMonth = Carbon::createFromFormat('d/m/Y', $date)->startOfMonth();
            $endOfMonth = Carbon::createFromFormat('d/m/Y', $date)->endOfMonth();
            $startOfYear = Carbon::createFromFormat('d/m/Y', $date)->startOfYear();
        } else {
            $startOfDay = Carbon::parse($date)->startOfDay();
            $endOfDay = Carbon::parse($date)->endOfDay();
            $startOfMonth = Carbon::parse($date)->startOfMonth();
            $endOfMonth = Carbon::parse($date)->endOfMonth();
            $startOfYear = Carbon::parse($date)->startOfYear();
        }

        // 1. Thống kê tổng quan
        // 1.1. Doanh thu từng ngày từ đầu tháng đến ngày hiện tại
        $dailyRevenueData = Booking::whereBetween('bookings.created_at', [$startOfMonth, $endOfDay])
            ->selectRaw('DATE(bookings.created_at) as date')
            ->selectRaw('SUM(total_price) as total_revenue')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $daysInMonth = $startOfMonth->diffInDays($endOfDay) + 1;
        $dailyRevenue = collect(range(0, $daysInMonth - 1))->map(function ($i) use ($startOfMonth, $dailyRevenueData) {
            $day = Carbon::parse($startOfMonth)->addDays($i);
            $dayString = $day->format('Y-m-d');
            $revenue = $dailyRevenueData->firstWhere('date', $dayString);

            return [
                'date' => $day->format('d/m/Y'),
                'value' => (int) ($revenue ? $revenue->total_revenue : 0),
            ];
        })->toArray();

        // 1.2. Khách hàng mới trong tháng
        $newCustomers = User::whereBetween('created_at', [$startOfMonth, $endOfDay])
            ->count();

        // 1.3. Tổng vé bán ra trong ngày
        $totalTicketsSold = BookingDetail::whereHas('booking', function ($query) use ($startOfDay, $endOfDay) {
            $query->whereBetween('bookings.created_at', [$startOfDay, $endOfDay]);
        })
            ->whereNotNull('seat_id')
            ->count();

        // 1.4. Doanh thu từng tháng từ đầu năm đến tháng hiện tại
        $monthlyRevenueData = Booking::whereBetween('bookings.created_at', [$startOfYear, $endOfDay])
            ->selectRaw('YEAR(bookings.created_at) as year')
            ->selectRaw('MONTH(bookings.created_at) as month')
            ->selectRaw('SUM(total_price) as total_revenue')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        $monthsInYear = $startOfYear->diffInMonths($endOfDay) + 1;
        $monthlyRevenue = collect(range(0, $monthsInYear - 1))->map(function ($i) use ($startOfYear, $monthlyRevenueData) {
            $month = Carbon::parse($startOfYear)->addMonths($i);
            $yearMonth = $month->format('Y-m');
            $revenue = $monthlyRevenueData->firstWhere(function ($item) use ($month) {
                return $item->year == $month->year && $item->month == $month->month;
            });

            return [
                'month_year' => $month->format('m/Y'),
                'value' => (int) ($revenue ? $revenue->total_revenue : 0),
            ];
        })->toArray();

        // 2. Biểu đồ doanh thu phim
        $movieRevenueChart = Booking::whereBetween('bookings.created_at', [$startOfMonth, $endOfDay])
            ->select('movies.title')
            ->selectRaw('SUM(bookings.total_price) as total_revenue')
            ->join('show_times', 'bookings.showtime_id', '=', 'show_times.id')
            ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->groupBy('movies.id', 'movies.title')
            ->orderBy('total_revenue', 'desc')
            ->get()
            ->map(function ($item) use ($startOfMonth) {
                return [
                    'movie_title' => $item->title,
                    'total_revenue' => (int) $item->total_revenue,
                    'month_year' => Carbon::parse($startOfMonth)->format('m/Y'),
                ];
            });

        // 3. Thống kê chi tiết: Doanh thu theo phim
        $movies = Movies::query()
            ->select('id', 'title', 'movie_status')
            ->get();

        $movieStats = collect();
        foreach ($movies as $movie) {
            $calendarShow = CalendarShow::query()
                ->where('movie_id', $movie->id)
                ->select('show_date', 'end_date')
                ->orderBy('show_date', 'asc')
                ->first();

            if (!$calendarShow || !$calendarShow->show_date) {
                continue;
            }

            $showDate = Carbon::parse($calendarShow->show_date)->startOfDay();
            $endDate = $calendarShow->end_date ? Carbon::parse($calendarShow->end_date)->startOfDay() : null;
            if ($showDate->greaterThan($endOfDay)) {
                continue;
            }

            // Thêm đoạn code để đếm tổng số suất chiếu của phim
            $totalShowtimes = Showtime::join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
                ->where('calendar_show.movie_id', $movie->id)
                ->whereBetween('show_times.start_time', [$showDate, $endOfDay])
                ->count();

            $bookings = Booking::whereBetween('bookings.created_at', [$showDate, $endOfDay])
                ->select('movies.title')
                ->selectRaw('SUM(bookings.total_price) as total_revenue')
                ->join('show_times', 'bookings.showtime_id', '=', 'show_times.id')
                ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
                ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
                ->where('movies.id', $movie->id)
                ->groupBy('movies.id', 'movies.title')
                ->first();

            $totalTickets = BookingDetail::whereHas('booking', function ($query) use ($showDate, $endOfDay, $movie) {
                $query->whereBetween('bookings.created_at', [$showDate, $endOfDay])
                    ->whereHas('showtime.calendarShow', function ($query) use ($movie) {
                        $query->where('movie_id', $movie->id);
                    });
            })
                ->whereNotNull('seat_id')
                ->count();

            if ($bookings) {
                $movieStats->push([
                    'movie_title' => $bookings->title,
                    'total_tickets' => (int) $totalTickets,
                    'total_revenue' => (int) ($bookings->total_revenue ?? 0),
                    'show_date' => $showDate->format('d-m-Y'),
                    'end_date' => $endDate ? $endDate->format('d-m-Y') : 'N/A',
                    'movie_status' => $movie->movie_status,
                    'total_showtimes' => (int) $totalShowtimes,
                ]);
            }
        }

        $movieStats = $movieStats->sortByDesc('total_revenue')->values();

        // 4. Thống kê: Doanh thu 7 ngày gần nhất
        $startOf7Days = Carbon::parse($startOfDay)->subDays(6)->startOfDay();
        $endOf7Days = Carbon::parse($endOfDay)->endOfDay();

        $revenueData = Booking::whereBetween('bookings.created_at', [$startOf7Days, $endOf7Days])
            ->selectRaw('DATE(bookings.created_at) as date')
            ->selectRaw('SUM(bookings.total_price) as total_revenue')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $revenueLast7Days = collect(range(0, 6))->map(function ($i) use ($startOf7Days, $revenueData) {
            $day = Carbon::parse($startOf7Days)->addDays($i);
            $dayString = $day->format('Y-m-d');
            $revenue = $revenueData->firstWhere('date', $dayString);

            $dayOfWeek = $day->dayOfWeek;
            $dayLabel = match ($dayOfWeek) {
                1 => 'T2',
                2 => 'T3',
                3 => 'T4',
                4 => 'T5',
                5 => 'T6',
                6 => 'T7',
                0 => 'CN',
                default => 'Unknown',
            };

            return [
                'day' => $dayLabel,
                'date' => $day->format('d/m/Y'),
                'total_revenue' => (int) ($revenue ? $revenue->total_revenue : 0),
            ];
        });

        // 5. Thống kê: Tổng số người dùng, phim đang chiếu, và suất chiếu trong ngày
        $totalUsers = User::count();

        $moviesShowingToday = Showtime::whereBetween('start_time', [$startOfDay, $endOfDay])
            ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->distinct('movies.id')
            ->count('movies.id');

        $showtimesToday = Showtime::whereBetween('start_time', [$startOfDay, $endOfDay])
            ->count();

        // 6. Thống kê khung giờ có số lượng ghế được đặt nhiều nhất trong ngày
        // Chỉ giữ top 5 khung giờ, gộp theo khung giờ (start_time và end_time)
        $peakShowtimes = Showtime::query()
            ->select('show_times.start_time', 'show_times.end_time')
            ->selectRaw('COUNT(booking_details.id) as total_seats_booked')
            ->leftJoin('bookings', 'show_times.id', '=', 'bookings.showtime_id')
            ->leftJoin('booking_details', 'bookings.id', '=', 'booking_details.booking_id')
            ->whereBetween('show_times.start_time', [$startOfDay, $endOfDay])
            ->whereNotNull('booking_details.seat_id')
            ->groupBy('show_times.start_time', 'show_times.end_time')
            ->orderBy('total_seats_booked', 'desc')
            ->take(5)
            ->get()
            ->map(function ($showtime) {
                return [
                    'showtime' => sprintf('%s - %s', Carbon::parse($showtime->start_time)->format('H:i'), Carbon::parse($showtime->end_time)->format('H:i')),
                    'total_seats_booked' => (int) ($showtime->total_seats_booked ?? 0),
                ];
            });

        $peakShowtimesData = $peakShowtimes->isNotEmpty() ? $peakShowtimes->toArray() : [];

        // Trả về phản hồi API
        return response()->json([
            'message' => 'Thống kê hệ thống',
            'current_date' => $currentDate,
            'data' => [
                'overview' => [
                    'daily_revenue' => $dailyRevenue, // Doanh thu từng ngày
                    'new_customers' => (int) $newCustomers,
                    'total_tickets_sold' => (int) $totalTicketsSold,
                    'monthly_revenue' => $monthlyRevenue, // Doanh thu từng tháng
                ],
                'movie_revenue_chart' => $movieRevenueChart,
                'movie_stats' => $movieStats,
                'revenue_last_7_days' => $revenueLast7Days,
                'additional_stats' => [
                    'total_users' => (int) $totalUsers,
                    'movies_showing_today' => (int) $moviesShowingToday,
                    'showtimes_today' => (int) $showtimesToday,
                    'peak_showtimes' => $peakShowtimesData,
                ],
            ],
        ]);
    }

    public function statsByDateRange(Request $request)
    {
        $currentDate = Carbon::now()->format('d-m-Y');

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (!$startDate || !$endDate) {
            return response()->json([
                'message' => 'Vui lòng cung cấp start_date và end_date',
            ], 400);
        }

        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $startDate) && preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $endDate)) {
            $startOfDay = Carbon::createFromFormat('d/m/Y', $startDate)->startOfDay();
            $endOfDay = Carbon::createFromFormat('d/m/Y', $endDate)->endOfDay();
            $startOfMonth = Carbon::createFromFormat('d/m/Y', $startDate)->startOfDay();
            $endOfMonth = Carbon::createFromFormat('d/m/Y', $endDate)->endOfDay();
            $startOfYear = Carbon::createFromFormat('d/m/Y', $startDate)->startOfYear();
        } else {
            $startOfDay = Carbon::parse($startDate)->startOfDay();
            $endOfDay = Carbon::parse($endDate)->endOfDay();
            $startOfMonth = Carbon::parse($startDate)->startOfDay();
            $endOfMonth = Carbon::parse($endDate)->endOfDay();
            $startOfYear = Carbon::parse($startDate)->startOfYear();
        }

        // 1. Thống kê tổng quan
        // 1.1. Doanh thu từng ngày trong khoảng từ start_date đến end_date
        $dailyRevenueData = Booking::whereBetween('bookings.created_at', [$startOfDay, $endOfDay])
            ->selectRaw('DATE(bookings.created_at) as date')
            ->selectRaw('SUM(total_price) as total_revenue')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $daysInRange = $startOfDay->diffInDays($endOfDay) + 1;
        $dailyRevenue = collect(range(0, $daysInRange - 1))->map(function ($i) use ($startOfDay, $dailyRevenueData) {
            $day = Carbon::parse($startOfDay)->addDays($i);
            $dayString = $day->format('Y-m-d');
            $revenue = $dailyRevenueData->firstWhere('date', $dayString);

            return [
                'date' => $day->format('d/m/Y'),
                'value' => (int) ($revenue ? $revenue->total_revenue : 0),
            ];
        })->toArray();

        // 1.2. Khách hàng mới trong khoảng thời gian
        $newCustomers = User::whereBetween('created_at', [$startOfMonth, $endOfDay])
            ->count();

        // 1.3. Tổng vé bán ra trong khoảng thời gian
        $totalTicketsSold = BookingDetail::whereHas('booking', function ($query) use ($startOfDay, $endOfDay) {
            $query->whereBetween('bookings.created_at', [$startOfDay, $endOfDay]);
        })
            ->whereNotNull('seat_id')
            ->count();

        // 1.4. Doanh thu từng tháng từ đầu năm đến tháng của end_date
        $monthlyRevenueData = Booking::whereBetween('bookings.created_at', [$startOfYear, $endOfDay])
            ->selectRaw('YEAR(bookings.created_at) as year')
            ->selectRaw('MONTH(bookings.created_at) as month')
            ->selectRaw('SUM(total_price) as total_revenue')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        $monthsInYear = $startOfYear->diffInMonths($endOfDay) + 1;
        $monthlyRevenue = collect(range(0, $monthsInYear - 1))->map(function ($i) use ($startOfYear, $monthlyRevenueData) {
            $month = Carbon::parse($startOfYear)->addMonths($i);
            $yearMonth = $month->format('Y-m');
            $revenue = $monthlyRevenueData->firstWhere(function ($item) use ($month) {
                return $item->year == $month->year && $item->month == $month->month;
            });

            return [
                'month_year' => $month->format('m/Y'),
                'value' => (int) ($revenue ? $revenue->total_revenue : 0),
            ];
        })->toArray();

        // 2. Biểu đồ doanh thu phim
        $movieRevenueChart = Booking::whereBetween('bookings.created_at', [$startOfMonth, $endOfDay])
            ->select('movies.title')
            ->selectRaw('SUM(bookings.total_price) as total_revenue')
            ->join('show_times', 'bookings.showtime_id', '=', 'show_times.id')
            ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->groupBy('movies.id', 'movies.title')
            ->orderBy('total_revenue', 'desc')
            ->get();

        $movieRevenueChart = $movieRevenueChart->map(function ($item) use ($startOfMonth, $endOfDay) {
            return [
                'movie_title' => $item->title,
                'total_revenue' => $item->total_revenue,
                'period' => Carbon::parse($startOfMonth)->format('d/m/Y') . ' - ' . Carbon::parse($endOfDay)->format('d/m/Y'),
            ];
        });

        // 3. Thống kê chi tiết: Doanh thu theo phim
        $movies = Movies::query()
            ->select('id', 'title', 'movie_status')
            ->get();

        $movieStats = collect();
        foreach ($movies as $movie) {
            $calendarShow = CalendarShow::query()
                ->where('movie_id', $movie->id)
                ->select('show_date', 'end_date')
                ->orderBy('show_date', 'asc')
                ->first();

            if (!$calendarShow || !$calendarShow->show_date) {
                continue;
            }

            $showDate = Carbon::parse($calendarShow->show_date)->startOfDay();
            $endDate = $calendarShow->end_date ? Carbon::parse($calendarShow->end_date)->startOfDay() : null;
            if ($showDate->greaterThan($endOfDay)) {
                continue;
            }

            // Thêm đoạn code để đếm tổng số suất chiếu của phim
            $totalShowtimes = Showtime::join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
                ->where('calendar_show.movie_id', $movie->id)
                ->whereBetween('show_times.start_time', [$showDate, $endOfDay])
                ->count();

            $bookings = Booking::whereBetween('bookings.created_at', [$showDate, $endOfDay])
                ->select('movies.title')
                ->selectRaw('SUM(bookings.total_price) as total_revenue')
                ->join('show_times', 'bookings.showtime_id', '=', 'show_times.id')
                ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
                ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
                ->where('movies.id', $movie->id)
                ->groupBy('movies.id', 'movies.title')
                ->first();

            $totalTickets = BookingDetail::whereHas('booking', function ($query) use ($showDate, $endOfDay, $movie) {
                $query->whereBetween('bookings.created_at', [$showDate, $endOfDay])
                    ->whereHas('showtime.calendarShow', function ($query) use ($movie) {
                        $query->where('movie_id', $movie->id);
                    });
            })
                ->whereNotNull('seat_id')
                ->count();

            if ($bookings) {
                $movieStats->push([
                    'movie_title' => $bookings->title,
                    'total_tickets' => (int) $totalTickets,
                    'total_revenue' => (int) ($bookings->total_revenue ?? 0),
                    'show_date' => $showDate->format('d-m-Y'),
                    'end_date' => $endDate ? $endDate->format('d-m-Y') : 'N/A',
                    'movie_status' => $movie->movie_status,
                    'total_showtimes' => (int) $totalShowtimes,
                ]);
            }
        }

        $movieStats = $movieStats->sortByDesc('total_revenue')->values();

        // 4. Thống kê: Doanh thu theo ngày trong khoảng ngày
        $daysInRange = $startOfDay->diffInDays($endOfDay) + 1;
        $revenueData = Booking::whereBetween('bookings.created_at', [$startOfDay, $endOfDay])
            ->selectRaw('DATE(bookings.created_at) as date')
            ->selectRaw('SUM(bookings.total_price) as total_revenue')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $revenueLastDays = collect(range(0, $daysInRange - 1))->map(function ($i) use ($startOfDay, $revenueData) {
            $day = Carbon::parse($startOfDay)->addDays($i);
            $dayString = $day->format('Y-m-d');
            $revenue = $revenueData->firstWhere('date', $dayString);

            $dayOfWeek = $day->dayOfWeek;
            $dayLabel = match ($dayOfWeek) {
                1 => 'T2',
                2 => 'T3',
                3 => 'T4',
                4 => 'T5',
                5 => 'T6',
                6 => 'T7',
                0 => 'CN',
                default => 'Unknown',
            };

            return [
                'day' => $dayLabel,
                'date' => $day->format('d/m/Y'),
                'total_revenue' => (int) ($revenue ? $revenue->total_revenue : 0),
            ];
        });

        // 5. Thống kê: Tổng số người dùng, phim đang chiếu, và suất chiếu trong khoảng ngày
        $totalUsers = User::count();

        $moviesShowingToday = Showtime::whereBetween('start_time', [$startOfDay, $endOfDay])
            ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->distinct('movies.id')
            ->count('movies.id');

        $showtimesToday = Showtime::whereBetween('start_time', [$startOfDay, $endOfDay])
            ->count();

        // 6. Thống kê khung giờ có số lượng ghế được đặt nhiều nhất trong khoảng ngày
        // Chỉ giữ top 5 khung giờ, gộp theo khung giờ (start_time và end_time)
        $peakShowtimesRaw = Showtime::query()
            ->select('show_times.start_time', 'show_times.end_time')
            ->selectRaw('COUNT(booking_details.id) as total_seats_booked')
            ->leftJoin('bookings', 'show_times.id', '=', 'bookings.showtime_id')
            ->leftJoin('booking_details', 'bookings.id', '=', 'booking_details.booking_id')
            ->whereBetween('show_times.start_time', [$startOfDay, $endOfDay])
            ->whereNotNull('booking_details.seat_id')
            ->groupBy('show_times.start_time', 'show_times.end_time')
            ->orderBy('total_seats_booked', 'desc')
            ->get();

        // Sử dụng mảng tạm thời để gộp khung giờ
        $mergedShowtimes = [];

        foreach ($peakShowtimesRaw as $showtime) {
            $startTime = Carbon::parse($showtime->start_time);
            $endTime = Carbon::parse($showtime->end_time);
            $totalSeats = (int) $showtime->total_seats_booked;

            $merged = false;
            foreach ($mergedShowtimes as &$existing) {
                $existingStart = Carbon::parse($existing['start_time']);
                $existingEnd = Carbon::parse($existing['end_time']);

                // Kiểm tra xem hai khung giờ có giao nhau không
                $hasOverlap = !($startTime->greaterThan($existingEnd) || $endTime->lessThan($existingStart));

                if ($hasOverlap) {
                    $existing['start_time'] = min($existingStart, $startTime)->format('H:i');
                    $existing['end_time'] = max($existingEnd, $endTime)->format('H:i');
                    $existing['total_seats_booked'] += $totalSeats;
                    $merged = true;
                    break;
                }
            }

            if (!$merged) {
                $mergedShowtimes[] = [
                    'start_time' => $startTime->format('H:i'),
                    'end_time' => $endTime->format('H:i'),
                    'total_seats_booked' => $totalSeats,
                ];
            }
        }

        // Chuyển thành Collection, sắp xếp và lấy top 5
        $peakShowtimes = collect($mergedShowtimes)
            ->sortByDesc('total_seats_booked')
            ->take(5)
            ->map(function ($showtime) {
                return [
                    'showtime' => sprintf('%s - %s', $showtime['start_time'], $showtime['end_time']),
                    'total_seats_booked' => (int) $showtime['total_seats_booked'],
                ];
            });

        $peakShowtimesData = $peakShowtimes->isNotEmpty() ? $peakShowtimes->toArray() : [];

        // Trả về phản hồi API
        return response()->json([
            'message' => 'Thống kê hệ thống theo khoảng ngày',
            'current_date' => $currentDate,
            'data' => [
                'overview' => [
                    'daily_revenue' => $dailyRevenue, // Doanh thu từng ngày
                    'new_customers' => (int) $newCustomers,
                    'total_tickets_sold' => (int) $totalTicketsSold,
                    'monthly_revenue' => $monthlyRevenue, // Doanh thu từng tháng
                ],
                'movie_revenue_chart' => $movieRevenueChart,
                'movie_stats' => $movieStats,
                'revenue_last_days' => $revenueLastDays,
                'additional_stats' => [
                    'total_users' => (int) $totalUsers,
                    'movies_showing_today' => (int) $moviesShowingToday,
                    'showtimes_today' => (int) $showtimesToday,
                    'peak_showtimes' => $peakShowtimesData,
                ],
            ],
        ]);
    }

    public function exportStatsByDateRange(Request $request)
    {
        // Lấy dữ liệu từ hàm statsByDateRange
        $statsResponse = $this->statsByDateRange($request);

        // Kiểm tra nếu có lỗi (ví dụ: thiếu start_date hoặc end_date)
        if ($statsResponse->getStatusCode() !== 200) {
            return $statsResponse; // Trả về lỗi nếu có
        }

        $data = $statsResponse->getData(true)['data'];
        $startDate = $request->input('start_date', Carbon::now()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // Định dạng tên file
        $fileName = 'stats_by_date_range_' . Carbon::parse($startDate)->format('Ymd') . '_to_' . Carbon::parse($endDate)->format('Ymd') . '.xlsx';

        return Excel::download(new StatsByDateRangeExport($startDate, $endDate, $data), $fileName);
    }
}
