<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $table = 'cart_items';

    protected $fillable = [
        'cart_id',
        'seat_id',
        'combo_id',
        'price_SATOBK',
        'price_FATOBK',
        'total_price',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * quan hệ với bảng Seat
     */
    public function seat()
    {
        return $this->belongsTo(Seat::class);
    }

    /**
     * quan hệ với bảng Combo
     */
    public function combo()
    {
        return $this->belongsTo(Combo::class);
    }
}
