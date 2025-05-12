<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusToSeatsTable extends Migration
{
    public function up()
    {
        Schema::table('seats', function (Blueprint $table) {
            $table->string('status')->default('available'); // Thêm cột status, mặc định là 'available'
        });
    }

    public function down()
    {
        Schema::table('seats', function (Blueprint $table) {
            $table->dropColumn('status'); // Xóa cột status nếu rollback
        });
    }
}
