<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPoint extends Model
{
    use HasFactory;
    

    /**
     * Tên bảng liên kết với model.
     *
     * @var string
     */
    protected $table = 'user_points';

    /**
     * Các thuộc tính có thể được gán hàng loạt.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'booking_id',
        'points_earned',
        'description',
        'earned_at',
    ];

    /**
     * Các thuộc tính cần được cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'points_earned' => 'integer',
        'earned_at' => 'datetime',
    ];

    /**
     * Quan hệ với bảng users.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quan hệ với bảng bookings.
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}

