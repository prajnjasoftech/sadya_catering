<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ExpensePayment extends Model { protected $guarded=[]; protected $casts=['payment_date'=>'date:Y-m-d','amount'=>'float']; public function expense(){return $this->belongsTo(Expense::class);} }
