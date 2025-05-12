<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class ShowTimeSeat extends Model
{
    use HasFactory;

    protected $table = 'show_time_seat';


    protected $fillable = [
        'show_time_id',
        'seat_id',
        'seat_status',
    ];

    /**
     * Cập nhật trạng thái ghế theo room_id và seat_id cho tất cả suất chiếu
     *
     * @param int $roomId
     * @param int $seatId
     * @param string $status
     * @return int Số lượng bản ghi được cập nhật hoặc tạo
     * @throws \InvalidArgumentException
     */
    public static function updateSeatStatusByRoomId($roomId, $seatId, $status)
    {
        // Kiểm tra trạng thái hợp lệ
        $validStatuses = ['available', 'booked', 'disabled', 'empty'];
        if (!in_array($status, $validStatuses)) {
            throw new \InvalidArgumentException("Trạng thái ghế không hợp lệ: {$status}. Các trạng thái hợp lệ là: " . implode(', ', $validStatuses));
        }

        // Kiểm tra seat_id hợp lệ
        if (!$seatId || !is_numeric($seatId)) {
            throw new \InvalidArgumentException("ID ghế (seat_id) không hợp lệ");
        }

        // Lấy tất cả show_time_id trong phòng
        $showTimes = ShowTime::where('room_id', $roomId)->pluck('id');

        if ($showTimes->isEmpty()) {
            throw new \InvalidArgumentException("Không tìm thấy suất chiếu nào trong phòng ID {$roomId}");
        }

        $updatedCount = 0;

        // Tạo hoặc cập nhật bản ghi trong show_time_seat cho từng show_time_id
        foreach ($showTimes as $showTimeId) {
            $showTimeSeat = self::updateOrCreate(
                [
                    'show_time_id' => $showTimeId,
                    'seat_id' => $seatId,
                ],
                [
                    'seat_status' => $status,
                ]
            );

            if ($showTimeSeat->wasRecentlyCreated || $showTimeSeat->wasChanged()) {
                $updatedCount++;
            }

            // Xóa cache cho suất chiếu này
            Cache::forget("seat_{$showTimeId}_{$seatId}");
        }

        return $updatedCount;
    }

    public function showTime()
    {
        return $this->belongsTo(ShowTime::class);
    }

    // Quan hệ với bảng Seat
    public function seat()
    {
        return $this->belongsTo(Seat::class);
    }

    // Lấy tình trạng ghế (seat_status) nếu cần
    public function getSeatStatusAttribute($value)
    {
        return ucfirst($value);
    }
}
