<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRank extends Model
{
    use HasFactory;

   

    /**
     * Tên bảng liên kết với model.
     *
     * @var string
     */
    protected $table = 'user_ranks';

    /**
     * Các thuộc tính có thể được gán hàng loạt.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'rank',
        'total_spent_at_rank',
        'ranked_at',
    ];

    /**
     * Các thuộc tính cần được cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_spent_at_rank' => 'decimal:2',
        'ranked_at' => 'datetime',
    ];

    /**
     * Quan hệ với bảng users.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

