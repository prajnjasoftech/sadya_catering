<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class MenuItem extends Model { protected $guarded=[]; protected $casts=['is_active'=>'boolean']; public function packages(){return $this->belongsToMany(SadyaPackage::class,'sadya_package_items');} }
