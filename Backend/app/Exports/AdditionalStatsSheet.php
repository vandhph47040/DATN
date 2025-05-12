<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdditionalStatsSheet implements FromArray, WithTitle
{
    protected $additionalStats;

    public function __construct($additionalStats)
    {
        $this->additionalStats = $additionalStats;
    }

    public function array(): array
    {
        // Lấy khung giờ cao điểm nhất (phần tử đầu tiên của peak_showtimes)
        $peakShowtime = !empty($this->additionalStats['peak_showtimes']) ? $this->additionalStats['peak_showtimes'][0] : null;

        return [
            ['Thống kê bổ sung'],
            [],
            ['Tổng số người dùng', $this->additionalStats['total_users'] ?? 0],
            ['Số phim đang chiếu', $this->additionalStats['movies_showing_today'] ?? 0],
            ['Số suất chiếu', $this->additionalStats['showtimes_today'] ?? 0],
            ['Khung giờ cao điểm', $peakShowtime ? $peakShowtime['showtime'] : 'N/A'],
            ['Tổng ghế đặt (cao điểm)', $peakShowtime ? $peakShowtime['total_seats_booked'] : 0],
        ];
    }

    public function title(): string
    {
        return 'Thống kê bổ sung';
    }
}
