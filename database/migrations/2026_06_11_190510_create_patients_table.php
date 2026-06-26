<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('fio');
            $table->string('iin', 12)->unique()->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('address')->nullable();
            $table->string('contacts')->nullable();
            $table->string('photo')->nullable();
            $table->foreignId('clinic_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->boolean('osms_status')->default(false);
            $table->date('osms_end_date')->nullable();
            $table->string('osms_type')->nullable();
            $table->boolean('profile_complete')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
