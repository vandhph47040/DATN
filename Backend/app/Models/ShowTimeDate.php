<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShowTimeDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'show_time_id',
        'show_date',
    ];
    protected $table = 'show_time_date';

    // Quan hệ nhiều - một với model ShowTime
    public function showTime()
    {
        return $this->belongsTo(ShowTime::class);
    }
}
