<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'date_of_birth',
        'is_verified',
        'role',
        'total_spent',
        'rank',
        'points',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'total_spent' => 'decimal:2',
        'points' => 'integer',
    ];

    protected $dates = ['deleted_at'];

    /**
     * Quan hệ với bảng user_points (lịch sử tích điểm).
     */
    public function pointsHistory()
    {
        return $this->hasMany(UserPoint::class);
    }

    /**
     * Quan hệ với bảng user_ranks (lịch sử phân hạng).
     */
    public function rankHistory()
    {
        return $this->hasMany(UserRank::class);
    }

    /**
     * Quan hệ với bảng bookings (các đơn đặt vé của người dùng).
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Mối quan hệ nhiều-nhiều với DiscountCode
     */
    public function discountCodes()
    {
        return $this->belongsToMany(DiscountCode::class, 'discount_code_user', 'user_id', 'discount_code_id')
            ->withTimestamps();
    }
}
