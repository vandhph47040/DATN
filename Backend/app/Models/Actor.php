<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Actor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_actor',
    ];

    public function movies()
    {
        return $this->belongsToMany(Movies::class, 'actors_movies', 'actor_id', 'movie_id');
    }
}
