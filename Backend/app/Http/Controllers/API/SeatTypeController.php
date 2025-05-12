<?php

namespace App\Http\Controllers\API;

use App\Models\SeatType;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SeatTypeController extends Controller
{
    public function index()
    {
        $seatTypes = SeatType::query()->latest('id')->with(['seatTypePrice:id,price,day_type,seat_type_id'])->get();

        return response()->json($seatTypes, 200);
    }
}
