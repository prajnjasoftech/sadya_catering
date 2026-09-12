<?php
namespace Tests\Feature;

use App\Models\{Booking,Expense,User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_current_balance_tiles_include_unpaid_bills_and_ignore_report_dates(): void
    {
        $this->seed();
        $this->actingAs(User::first());
        $before=$this->getJson('/api/reports/cash-flow')->assertOk()['current'];
        $base=['date'=>'2030-01-01','paid_to'=>'QA Tiles','description'=>'Tile check','amount'=>500];
        Expense::create($base+['expense_type'=>'Labour']);
        $purchase=Expense::create($base+['expense_type'=>'Purchase']);
        $purchase->payments()->create(['payment_date'=>'2030-01-02','amount'=>200,'payment_method'=>'Cash']);
        $overpaid=Expense::create(array_replace($base,['expense_type'=>'Fuel','amount'=>10]));
        $overpaid->payments()->create(['payment_date'=>'2030-01-02','amount'=>20,'payment_method'=>'Cash']);
        $booking=Booking::first()->replicate();
        $booking->booking_number='QA-TILES';$booking->final_amount=1000;$booking->status='Confirmed';$booking->save();
        $booking->payments()->create(['payment_date'=>'2030-01-02','amount'=>250,'payment_mode'=>'Cash','payment_type'=>'Advance']);
        $cancelled=$booking->replicate();$cancelled->booking_number='QA-CANCELLED';$cancelled->status='Cancelled';$cancelled->save();
        $current=$this->getJson('/api/reports/cash-flow?from=2099-01-01')->assertOk()->assertJsonPath('totals.received',0)->assertJsonPath('totals.paid',0)['current'];
        $this->assertEquals($before['receivables']+750,$current['receivables']);
        $this->assertEquals($before['booking_value']+1000,$current['booking_value']);
        $this->assertEquals($before['payables']+800,$current['payables']);
        $this->assertEquals($before['expense_payables']+500,$current['expense_payables']);
        $this->assertEquals($before['purchase_payables']+300,$current['purchase_payables']);
        $this->assertEquals($before['recorded_costs']+1010,$current['recorded_costs']);
    }

    public function test_history_combines_actual_payments_with_filtered_totals_and_details(): void
    {
        $this->seed();
        $this->getJson('/api/payment-history')->assertUnauthorized();
        $this->getJson('/api/reports/cash-flow')->assertUnauthorized();
        $this->actingAs(User::first());
        $booking=Booking::first();
        $booking->payments()->create(['payment_date'=>'2030-01-10','amount'=>1000,'payment_mode'=>'UPI','payment_type'=>'Part Payment','reference_number'=>'QA-IN','notes'=>'Income note']);
        $expense=Expense::create(['date'=>'2030-01-09','expense_type'=>'Labour','paid_to'=>'QA Worker','description'=>'Service team','amount'=>500]);
        foreach([100,150] as $amount) $expense->payments()->create(['payment_date'=>'2030-01-10','amount'=>$amount,'payment_method'=>'Cash','reference_number'=>'QA-OUT','notes'=>'Outgoing note']);
        $purchase=Expense::create(['date'=>'2030-01-09','expense_type'=>'Purchase','paid_to'=>'QA Supplier','description'=>'Rice','amount'=>400,'invoice_number'=>'QA-BILL']);
        $purchase->payments()->create(['payment_date'=>'2030-01-10','amount'=>200,'payment_method'=>'UPI']);
        Expense::create(['date'=>'2030-01-10','expense_type'=>'Fuel','paid_to'=>'QA Unpaid','description'=>'Unpaid bill','amount'=>999]);
        $url='/api/payment-history?from=2030-01-01&to=2030-01-31';
        $response=$this->getJson($url)->assertOk()->assertJsonPath('payments.total',4)->assertJsonPath('totals.received',1000)->assertJsonPath('totals.paid',450)->assertJsonPath('totals.net',550);
        $this->assertCount(4,array_unique(array_column($response['payments']['data'],'key')));
        $this->getJson($url.'&direction=Outgoing&source=Expense&party=QA%20Worker&method=Cash')->assertOk()->assertJsonPath('payments.total',2)->assertJsonPath('totals.paid',250)->assertJsonPath('totals.received',0)->assertJsonPath('payments.data.0.record_balance',250)->assertJsonPath('payments.data.0.notes','Outgoing note');
        $this->getJson($url.'&source=Purchase')->assertOk()->assertJsonPath('payments.total',1)->assertJsonPath('payments.data.0.record_reference','QA-BILL')->assertJsonPath('payments.data.0.record_balance',200);
        $this->getJson($url.'&party=QA%20Unpaid')->assertOk()->assertJsonPath('payments.total',0)->assertJsonPath('totals.net',0);
        $this->getJson('/api/payment-history?to=2030-01-31')->assertOk();
        $this->getJson('/api/payment-history?from=2030-02-01&to=2030-01-01')->assertUnprocessable();
        for($i=0;$i<26;$i++)$expense->payments()->create(['payment_date'=>'2030-01-11','amount'=>1,'payment_method'=>'Cash']);
        $this->getJson($url.'&page=2')->assertOk()->assertJsonPath('payments.total',30)->assertJsonPath('totals.paid',476)->assertJsonCount(5,'payments.data');
        $this->getJson('/api/reports/cash-flow?from=2030-01-01&to=2030-01-31')->assertOk()
            ->assertJsonCount(30,'rows')->assertJsonPath('totals.received',1000)
            ->assertJsonPath('totals.paid',476)->assertJsonPath('totals.expenses',276)
            ->assertJsonPath('totals.purchases',200)->assertJsonPath('totals.net',524);
        $this->getJson('/api/reports/cash-flow?from=2030-01-11&to=2030-01-11')->assertOk()
            ->assertJsonCount(26,'rows')->assertJsonPath('totals.received',0)->assertJsonPath('totals.paid',26);
        $this->getJson('/api/reports/cash-flow?from=2031-01-01')->assertOk()->assertJsonCount(0,'rows')->assertJsonPath('totals.net',0);
    }
}
