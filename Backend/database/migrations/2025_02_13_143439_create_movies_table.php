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
        Schema::create('movies', function (Blueprint $table) {
            $table->id();

            $table->string('title')->unique();
            $table->foreignId('director_id')->constrained('directors');
            $table->date('release_date');
            $table->string('running_time');
            $table->string('language');
            $table->string('rated');
            $table->text('description');
            $table->string('poster')->nullable();
            $table->string('trailer')->nullable();
            $table->enum('movie_status', ['coming_soon', 'now_showing']);
            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
