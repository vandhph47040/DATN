<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class RevenueLastDaysSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $revenueLastDays;

    public function __construct($revenueLastDays)
    {
        $this->revenueLastDays = $revenueLastDays;
    }

    public function collection()
    {
        return collect($this->revenueLastDays)->map(function ($item) {
            return [
                'day' => $item['day'],
                'date' => $item['date'],
                'total_revenue' => $item['total_revenue'],
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Thứ',
            'Ngày',
            'Tổng doanh thu',
        ];
    }

    public function title(): string
    {
        return 'Doanh thu theo ngày';
    }
}
