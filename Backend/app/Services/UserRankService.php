<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPoint;
use App\Models\UserRank;

class UserRankService
{
    /**
     * Cập nhật điểm và hạng cho người dùng dựa trên giao dịch.
     *
     * @param int $userId ID của người dùng
     * @param float $totalPrice Tổng số tiền giao dịch
     * @param int|null $bookingId ID của booking (nếu có)
     * @return array|false Trả về thông tin cập nhật hoặc false nếu không tìm thấy user
     */
    public function updateRankAndPoints($userId, $totalPrice, $bookingId = null)
    {
        $user = User::find($userId);
        if (!$user) {
            return false;
        }

        // Cập nhật tổng chi tiêu
        $user->total_spent += $totalPrice;

        // Phân hạng
        $oldRank = $user->rank;
        if ($user->total_spent >= 4000000) {
            $user->rank = 'diamond';
            // Tích điểm: 10% tổng số tiền (làm tròn xuống)
            $pointsEarned = floor($totalPrice * 0.1 / 1000);
        } elseif ($user->total_spent >= 2000000) {
            $user->rank = 'gold';
            // Tích điểm: 5% tổng số tiền (làm tròn xuống)
            $pointsEarned = floor($totalPrice * 0.05 / 1000);
        } else {
            $user->rank = 'regular';
            // Tích điểm: 3% tổng số tiền (làm tròn xuống)
            $pointsEarned = floor($totalPrice * 0.03 / 1000);
        }

        $user->points += $pointsEarned;

        // Lưu thay đổi
        $user->save();

        // Ghi điểm kiếm được vào user_points
        if ($pointsEarned > 0) {
            UserPoint::create([
                'user_id' => $userId,
                'booking_id' => $bookingId,
                'points_earned' => $pointsEarned,
                'description' => "Kiếm $pointsEarned điểm từ booking #$bookingId",
            ]);
        }

        // Ghi lịch sử thay đổi hạng vào user_ranks
        if ($oldRank !== $user->rank) {
            UserRank::create([
                'user_id' => $userId,
                'rank' => $user->rank,
                'total_spent_at_rank' => $user->total_spent,
            ]);
        }

        return [
            'points_earned' => $pointsEarned,
            'total_points' => $user->points,
            'rank' => $user->rank,
            'total_spent' => $user->total_spent,
            'rank_changed' => $oldRank !== $user->rank, // Kiểm tra xem hạng có thay đổi không
        ];
    }

    /**
     * Lấy thông tin hạng và điểm của người dùng.
     *
     * @param int $userId ID của người dùng
     * @return array|false Trả về thông tin hoặc false nếu không tìm thấy user
     */
    public function getRankAndPoints($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return false;
        }

        return [
            'user_id' => $user->id,
            'name' => $user->name,
            'total_spent' => $user->total_spent,
            'rank' => $user->rank,
            'points' => $user->points,
        ];
    }

    /**
     * Trừ điểm tích lũy của người dùng
     *
     * @param int $userId ID của người dùng
     * @param int $points Số điểm cần trừ
     * @return bool Trả về true nếu thành công, false nếu thất bại
     */
    public function deductPoints($userId, $points)
    {
        $user = User::find($userId);
        if (!$user || $user->points < $points) {
            return false;
        }

        $user->points -= $points;
        $user->save();

        // Ghi log trừ điểm vào user_points
        UserPoint::create([
            'user_id' => $userId,
            'booking_id' => null,
            'points_earned' => -$points,
            'description' => "Sử dụng $points điểm để giảm giá",
        ]);

        return true;
    }
}
