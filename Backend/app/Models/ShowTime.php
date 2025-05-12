<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShowTime extends Model
{
    protected $fillable = [
        'calendar_show_id',
        'room_id',
        'start_time',
        'end_time',
        'status',
    ];

    // Quan hệ nhiều - một với model Room
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function calendarShow()
    {
        return $this->belongsTo(CalendarShow::class, 'calendar_show_id');
    }

    public function showTimeDate()
    {
        return $this->hasMany(ShowTimeDate::class, 'show_time_id');
    }

    public function showTimeSeat()
    {
        return $this->hasMany(ShowTimeSeat::class);
    }
}
