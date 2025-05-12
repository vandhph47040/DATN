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
            $table->decimal('maxPrice', 10, 2)->nullable()->after('percent'); // Thêm cột maxPrice sau cột percent
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('discount_code', function (Blueprint $table) {
            $table->dropColumn('maxPrice'); // Xóa cột maxPrice nếu rollback
        });
    }
};
