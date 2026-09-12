<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class BookingMenuItem extends Model { protected $guarded=[]; protected $casts=['included'=>'boolean','extra_price'=>'float']; }
