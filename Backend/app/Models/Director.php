<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Director extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_director',
    ];

    public function movies()
    {
        return $this->hasMany(Movies::class);  // Một đạo diễn có nhiều phim
    }
}
