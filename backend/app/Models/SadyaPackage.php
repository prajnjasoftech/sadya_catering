<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SadyaPackage extends Model { protected $guarded=[]; protected $casts=['is_active'=>'boolean','price_per_leaf'=>'float']; public function items(){return $this->belongsToMany(MenuItem::class,'sadya_package_items');} }
