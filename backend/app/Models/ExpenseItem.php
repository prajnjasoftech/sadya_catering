<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ExpenseItem extends Model { protected $guarded=[]; protected $casts=['quantity'=>'float','rate'=>'float','amount'=>'float']; public function expense(){return $this->belongsTo(Expense::class);} }
