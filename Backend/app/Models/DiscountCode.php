<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscountCode extends Model
{
    use HasFactory;

    protected $table = 'discount_code';

    protected $fillable = [
        'name_code',
        'type',
        'percent',
        'quantity',
        'status',
        'maxPrice',
        'start_date',
        'end_date',
    ];

    //quan hệ 1-n với bảng bookings
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'discount_code_id');
    }

    /**
     * Mối quan hệ nhiều-nhiều với User
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'discount_code_user', 'discount_code_id', 'user_id')
            ->withTimestamps();
    }
}
