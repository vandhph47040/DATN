<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class OverviewSheet implements FromArray, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;

        // Thêm log để kiểm tra dữ liệu
        Log::info('Dữ liệu trong OverviewSheet:', $this->data);
    }

    public function array(): array
    {
        // Truy cập dữ liệu trực tiếp từ $this->data
        $dailyRevenue = $this->data['daily_revenue'] ?? [];
        $newCustomers = $this->data['new_customers'] ?? 0;
        $totalTicketsSold = $this->data['total_tickets_sold'] ?? 0;
        $monthlyRevenue = $this->data['monthly_revenue'] ?? [];

        // Tính tổng doanh thu từ daily_revenue
        $dailyRevenueTotal = collect($dailyRevenue)->sum('value');
        $dailyRevenueTotalFormatted = $dailyRevenueTotal ? number_format($dailyRevenueTotal, 0, ',', '.') : 'N/A';

        // Lấy khoảng thời gian từ start_date và end_date
        $dailyRevenuePeriod = 'N/A';
        if (isset($this->data['start_date']) && isset($this->data['end_date'])) {
            $startDate = $this->data['start_date'];
            $endDate = $this->data['end_date'];
            $dailyRevenuePeriod = $startDate === $endDate
                ? $startDate
                : "$startDate - $endDate";
        }

        // Tính tổng doanh thu từ monthly_revenue
        $monthlyRevenueTotal = collect($monthlyRevenue)->sum('value');
        $monthlyRevenueTotalFormatted = $monthlyRevenueTotal ? number_format($monthlyRevenueTotal, 0, ',', '.') : 'N/A';

        // Lấy khoảng thời gian từ monthly_revenue
        $monthlyRevenuePeriod = 'N/A';
        if (!empty($monthlyRevenue)) {
            $monthlyDates = collect($monthlyRevenue)->pluck('month_year')->sort();
            $startMonth = $monthlyDates->first();
            $endMonth = $monthlyDates->last();
            $monthlyRevenuePeriod = $startMonth === $endMonth
                ? $startMonth
                : "$startMonth - $endMonth";
        }

        return [
            ['Thống kê tổng quan'],
            [],
            ['Thời gian', $dailyRevenuePeriod],
            ['Doanh thu trong khoảng', $dailyRevenueTotalFormatted],
            ['Khách hàng mới', $newCustomers == 0 ? 0 : ($newCustomers ?: 'N/A')],
            ['Tổng vé bán ra', $totalTicketsSold == 0 ? 0 : ($totalTicketsSold ?: 'N/A')],
            ['Thời gian kinh doanh từ đầu năm', $monthlyRevenuePeriod],
            ['Doanh thu tính từ đầu năm', $monthlyRevenueTotalFormatted],
        ];
    }

    public function title(): string
    {
        return 'Tổng quan';
    }
}
