<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Xóa cột is_admin cũ
            $table->dropColumn('is_admin');

            // Thêm cột role mới, giá trị mặc định là 'customer'
            $table->string('role')->default('customer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Xóa cột role mới
            $table->dropColumn('role');

            // Thêm lại is_admin
            $table->boolean('is_admin')->default(false);
        });
    }
};
