<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class SeatTypePrice extends Model
{
    use HasFactory;

    protected $table = 'seat_type_price';

    protected $fillable = [
        'seat_type_id',
        'price',
        'day_type',
    ];

    public function seatType()
    {
        return $this->belongsTo(SeatType::class, 'seat_type_id');
    }

    /**
     * Xác định loại ngày: ngày thường, cuối tuần, ngày lễ
     */
    public static function getDayType($date)
    {
        $date = Carbon::parse($date);

        // Kiểm tra nếu là thứ 6, thứ 7 hoặc chủ nhật (coi thứ 6 là cuối tuần)
        if ($date->isFriday() || $date->isWeekend()) {
            return 'weekend';
        }

        // Danh sách ngày lễ không phụ thuộc năm (chỉ lấy tháng và ngày)
        $holidays = [
            '01-01', // Tết Dương lịch
            '04-30', // Ngày Giải phóng miền Nam
            '05-01', // Ngày Quốc tế Lao động
            '09-02', // Quốc khánh
        ];

        // Lấy tháng và ngày từ $date để so sánh
        $monthDay = $date->format('m-d');

        // Kiểm tra nếu ngày hiện tại nằm trong danh sách ngày lễ
        if (in_array($monthDay, $holidays)) {
            return 'holiday';
        }

        return 'weekday';
    }

    /**
     * Lấy giá vé theo ngày cụ thể của suất chiếu
     */
    public static function getPriceByDate($seatTypeId, $showtimeDate)
    {
        Log::info("Showtime Date: " . $showtimeDate);
        $dayType = self::getDayType($showtimeDate);

        return self::where('seat_type_id', $seatTypeId)
            ->where('day_type', $dayType)
            ->value('price'); // Trả về giá hoặc null nếu không có
    }

    public function getFormattedPriceAttribute()
    {
        return ($this->price == floor($this->price)) ? number_format($this->price, 0) : number_format($this->price, 2);
    }
}
