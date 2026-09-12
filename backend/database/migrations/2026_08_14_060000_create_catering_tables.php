<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $t) { $t->id(); $t->string('name'); $t->string('mobile', 20)->unique(); $t->string('alternate_mobile',20)->nullable(); $t->string('email')->nullable(); $t->text('address')->nullable(); $t->string('place')->nullable(); $t->text('notes')->nullable(); $t->timestamps(); });
        Schema::create('menu_items', function (Blueprint $t) { $t->id(); $t->string('name')->unique(); $t->string('category'); $t->text('description')->nullable(); $t->boolean('is_active')->default(true); $t->timestamps(); });
        Schema::create('sadya_packages', function (Blueprint $t) { $t->id(); $t->string('name'); $t->decimal('price_per_leaf',10,2); $t->text('description')->nullable(); $t->boolean('is_active')->default(true); $t->timestamps(); });
        Schema::create('sadya_package_items', function (Blueprint $t) { $t->foreignId('sadya_package_id')->constrained()->cascadeOnDelete(); $t->foreignId('menu_item_id')->constrained()->cascadeOnDelete(); $t->primary(['sadya_package_id','menu_item_id']); });
        Schema::create('bookings', function (Blueprint $t) { $t->id(); $t->string('booking_number')->unique(); $t->foreignId('customer_id')->constrained(); $t->foreignId('sadya_package_id')->nullable()->constrained()->nullOnDelete(); $t->string('function_type'); $t->date('function_date'); $t->time('serving_time')->nullable(); $t->string('venue'); $t->unsignedInteger('guest_count'); $t->decimal('price_per_leaf',10,2); $t->decimal('base_amount',12,2); $t->decimal('additional_charges',12,2)->default(0); $t->decimal('discount',12,2)->default(0); $t->decimal('final_amount',12,2); $t->string('status')->default('Enquiry'); $t->text('notes')->nullable(); $t->timestamps(); });
        Schema::create('booking_menu_items', function (Blueprint $t) { $t->id(); $t->foreignId('booking_id')->constrained()->cascadeOnDelete(); $t->foreignId('menu_item_id')->nullable()->constrained()->nullOnDelete(); $t->string('dish_name'); $t->decimal('extra_price',10,2)->default(0); $t->boolean('included')->default(true); $t->text('instructions')->nullable(); $t->timestamps(); });
        Schema::create('payments', function (Blueprint $t) { $t->id(); $t->foreignId('booking_id')->constrained()->cascadeOnDelete(); $t->date('payment_date'); $t->decimal('amount',12,2); $t->string('payment_mode'); $t->string('payment_type'); $t->string('reference_number')->nullable(); $t->text('notes')->nullable(); $t->timestamps(); });
        Schema::create('expense_categories', function (Blueprint $t) { $t->id(); $t->string('name')->unique(); $t->timestamps(); });
        Schema::create('suppliers', function (Blueprint $t) { $t->id(); $t->string('name'); $t->string('mobile')->nullable(); $t->text('address')->nullable(); $t->timestamps(); });
        Schema::create('expenses', function (Blueprint $t) { $t->id(); $t->date('date'); $t->string('expense_type'); $t->foreignId('expense_category_id')->nullable()->constrained()->nullOnDelete(); $t->foreignId('booking_id')->nullable()->constrained()->nullOnDelete(); $t->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete(); $t->string('description'); $t->decimal('amount',12,2); $t->string('paid_to')->nullable(); $t->string('payment_method'); $t->string('item_name')->nullable(); $t->decimal('quantity',10,2)->nullable(); $t->string('unit')->nullable(); $t->decimal('rate',10,2)->nullable(); $t->string('invoice_number')->nullable(); $t->text('notes')->nullable(); $t->timestamps(); });
    }
    public function down(): void { Schema::dropIfExists('expenses'); Schema::dropIfExists('suppliers'); Schema::dropIfExists('expense_categories'); Schema::dropIfExists('payments'); Schema::dropIfExists('booking_menu_items'); Schema::dropIfExists('bookings'); Schema::dropIfExists('sadya_package_items'); Schema::dropIfExists('sadya_packages'); Schema::dropIfExists('menu_items'); Schema::dropIfExists('customers'); }
};
