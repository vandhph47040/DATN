<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('discount_code', function (Blueprint $table) {
            // Thêm cột type với enum public/private
            $table->enum('type', ['public', 'private'])->default('public')->after('name_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('discount_code', function (Blueprint $table) {
            // Xóa cột type
            $table->dropColumn('type');
        });
    }
};
