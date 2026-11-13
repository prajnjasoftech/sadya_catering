<?php

namespace Database\Seeders;

use App\Models\{User,Customer,MenuItem,MenuCategory,SadyaPackage,Booking,ExpenseCategory,Expense,Payment,Supplier};
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create(['name'=>'Sadya Admin','email'=>'admin@sadyacatering.test','password'=>bcrypt('password')]);
        $customers=collect([
            ['name'=>'Anand Menon','mobile'=>'9847012345','email'=>'anand@example.com','place'=>'Thrissur','address'=>'Punkunnam, Thrissur'],
            ['name'=>'Lakshmi Nair','mobile'=>'9847023456','email'=>'lakshmi@example.com','place'=>'Ernakulam','address'=>'Kadavanthra, Kochi'],
            ['name'=>'Suresh Kumar','mobile'=>'9847034567','place'=>'Guruvayur','address'=>'East Nada, Guruvayur'],
            ['name'=>'Meera Varma','mobile'=>'9847045678','place'=>'Palakkad','address'=>'Olavakkode, Palakkad'],
        ])->map(fn($x)=>Customer::create($x));
        collect(['Main','Curry','Condiment','Side','Fruit','Payasam','Snack','Dessert','Beverage'])->each(fn($n)=>MenuCategory::create(['name'=>$n]));
        $names=['Rice'=>'Main','Parippu'=>'Curry','Sambar'=>'Curry','Avial'=>'Curry','Thoran'=>'Curry','Kootu Curry'=>'Curry','Kichadi'=>'Curry','Pachadi'=>'Curry','Mango Pickle'=>'Condiment','Pappadam'=>'Side','Banana'=>'Fruit','Ada Pradhaman'=>'Payasam','Palada Payasam'=>'Payasam','Banana Chips'=>'Snack','Sharkara Upperi'=>'Snack','Rasam'=>'Curry','Moru Curry'=>'Curry'];
        $items=collect($names)->map(fn($category,$name)=>MenuItem::create(compact('name','category')));
        $basic=SadyaPackage::create(['name'=>'Basic Sadya','price_per_leaf'=>120,'description'=>'A wholesome traditional Sadya for intimate functions.']);$basic->items()->sync($items->take(11)->pluck('id'));
        $standard=SadyaPackage::create(['name'=>'Standard Sadya','price_per_leaf'=>150,'description'=>'Our most popular complete Kerala feast.']);$standard->items()->sync($items->take(15)->pluck('id'));
        $premium=SadyaPackage::create(['name'=>'Premium Sadya','price_per_leaf'=>190,'description'=>'An elaborate feast with two payasams and premium sides.']);$premium->items()->sync($items->pluck('id'));
        $bookings=[
          [$customers[0],$standard,'Wedding',now()->addDays(8),'Lulu Convention Centre',500,'Confirmed',5000,2500],
          [$customers[1],$premium,'Housewarming',now()->addDays(15),'Edappally Residence',220,'Preparation',3000,0],
          [$customers[2],$basic,'Temple Function',now()->addDays(2),'Sree Krishna Temple Hall',800,'Confirmed',8000,5000],
          [$customers[3],$standard,'Corporate Function',now()->subDays(5),'IT Park Auditorium',300,'Completed',2000,1000],
          [$customers[0],$premium,'Family Function',now()->addMonth(),'Casino Hotel',150,'Enquiry',0,0],
        ];
        foreach($bookings as $i=>$x){[$c,$p,$type,$date,$venue,$guests,$status,$add,$discount]=$x;$base=$guests*$p->price_per_leaf;$b=Booking::create(['booking_number'=>'SC-'.now()->format('ym').'-'.str_pad($i+1,4,'0',STR_PAD_LEFT),'customer_id'=>$c->id,'sadya_package_id'=>$p->id,'function_type'=>$type,'function_date'=>$date,'serving_time'=>'12:30','venue'=>$venue,'guest_count'=>$guests,'price_per_leaf'=>$p->price_per_leaf,'base_amount'=>$base,'additional_charges'=>$add,'discount'=>$discount,'final_amount'=>$base+$add-$discount,'status'=>$status]);$b->menuItems()->createMany($p->items->map(fn($d)=>['menu_item_id'=>$d->id,'dish_name'=>$d->name,'included'=>true])->all());Payment::create(['booking_id'=>$b->id,'payment_date'=>now()->subDays(2),'amount'=>round($b->final_amount*.4),'payment_mode'=>'UPI','payment_type'=>'Advance','reference_number'=>'UPI'.rand(10000,99999)]);}
        $cats=collect(['Purchase','Labour','Transport','Fuel','Rental','Gas','Miscellaneous'])->map(fn($n)=>ExpenseCategory::create(['name'=>$n]));$supplier=Supplier::create(['name'=>'Kerala Wholesale Mart','mobile'=>'9876501234']);
        Expense::create(['date'=>now(),'expense_type'=>'Purchase','expense_category_id'=>$cats[0]->id,'booking_id'=>1,'supplier_id'=>$supplier->id,'description'=>'Matta rice purchase','amount'=>6000,'paid_to'=>$supplier->name,'payment_method'=>'UPI','item_name'=>'Matta Rice','quantity'=>100,'unit'=>'Kg','rate'=>60,'invoice_number'=>'KWM-2041']);
        Expense::create(['date'=>now()->subDay(),'expense_type'=>'Labour','expense_category_id'=>$cats[1]->id,'booking_id'=>1,'description'=>'Kitchen team advance','amount'=>8500,'paid_to'=>'Kitchen crew','payment_method'=>'Cash']);
        Expense::create(['date'=>now()->subDays(3),'expense_type'=>'Transport','expense_category_id'=>$cats[2]->id,'booking_id'=>3,'description'=>'Delivery vehicle','amount'=>3200,'paid_to'=>'Balu Travels','payment_method'=>'UPI']);
    }
}
