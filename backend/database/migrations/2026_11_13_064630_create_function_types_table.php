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
        Schema::create('function_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Seed default function types
        $types = ['Wedding', 'Reception', 'Housewarming', 'Birthday', 'Temple Function', 'Corporate Function', 'Family Function', 'Other'];
        foreach ($types as $type) {
            \App\Models\FunctionType::create(['name' => $type]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('function_types');
    }
};
