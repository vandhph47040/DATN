<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    use HasFactory;

    protected $fillable =
    [
        'name_genre',
    ];

    public function movies()
    {
        return $this->belongsToMany(Movies::class, 'genre_movies', 'genre_id', 'movie_id');
    }
}
