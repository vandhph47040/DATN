<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class MovieStatsSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $movieStats;

    public function __construct($movieStats)
    {
        $this->movieStats = $movieStats;
    }

    public function collection()
    {
        return collect($this->movieStats)->map(function ($item) {
            return [
                'movie_title' => $item['movie_title'],
                'total_tickets' => $item['total_tickets'],
                'total_revenue' => $item['total_revenue'],
                'show_date' => $item['show_date'],
                'end_date' => $item['end_date'],
                'movie_status' => $item['movie_status'],
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Tên phim',
            'Tổng vé',
            'Tổng doanh thu',
            'Ngày bắt đầu chiếu',
            'Ngày kết thúc chiếu',
            'Trạng thái', // Thêm cột Trạng thái
        ];
    }

    public function title(): string
    {
        return 'Thống kê phim';
    }
}
