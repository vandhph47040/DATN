<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Support\Facades\Log;


class SeatHeldEvent implements ShouldBroadcastNow
{
    use SerializesModels, InteractsWithSockets;

    public $seats;
    public $userId;
    public $roomId;
    public $showTimeId;
    public $actionType; // Thêm biến để xác định loại hành động

    public function __construct($seats, $userId, $roomId, $showTimeId, $actionType = 'held')
    {
        $this->seats = $seats;
        $this->userId = $userId;
        $this->roomId = $roomId;
        $this->showTimeId = $showTimeId;
        $this->actionType = $actionType; // 'held', 'booked', 'released'
        Log::info('Room ID: ' . $this->roomId); // Sửa thành \Log::info
        Log::info('Show Time ID: ' . $this->showTimeId);
        Log::info('Action Type: ' . $this->actionType);

        if ($actionType === 'booked') {
            Log::info('Ghế đã được đặt:', ['seat_ids' => is_array($this->seats) ? $this->seats : [$this->seats]]);
        }
    }

    public function broadcastOn()
    {
        return new Channel('seats'  . $this->roomId . '.' . $this->showTimeId);
    }

    //định nghĩa tên sự kiện phát đi
    public function broadcastAs()
    {
        // Trả về tên sự kiện dựa trên loại hành động
        return match ($this->actionType) {
            'held' => 'seat-held',
            'booked' => 'seat-booked',
            'released' => 'seat-released',
            default => 'seat-held'
        };
    }
}
