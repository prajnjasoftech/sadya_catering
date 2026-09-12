<?php
use Illuminate\Database\Migrations\Migration; use Illuminate\Database\Schema\Blueprint; use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up():void {Schema::table('expense_items',function(Blueprint $t){$t->decimal('quantity',10,2)->nullable()->change();$t->string('unit')->nullable()->change();$t->decimal('rate',12,2)->nullable()->change();});} public function down():void {} };
