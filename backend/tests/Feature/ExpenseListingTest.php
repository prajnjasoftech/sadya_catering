<?php
namespace Tests\Feature;

use App\Models\{Expense, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_payee_options_follow_type_and_include_shared_payees(): void
    {
        $this->seed();
        $this->actingAs(User::first());
        $base = ['date'=>'2026-09-10', 'description'=>'Payee filter', 'amount'=>100];
        foreach ([['Labour','QA Worker'], ['Fuel','QA Fuel'], ['Labour','QA Shared'], ['Fuel','QA Shared'], ['Purchase','QA Supplier']] as [$type,$name]) {
            Expense::create($base + ['expense_type'=>$type,'paid_to'=>$name]);
        }
        $labour = $this->getJson('/api/expenses/payees?include_purchases=1&expense_type=Labour')->assertOk()->json();
        $this->assertContains('QA Worker',$labour);
        $this->assertContains('QA Shared',$labour);
        $this->assertNotContains('QA Fuel',$labour);
        $this->assertNotContains('QA Supplier',$labour);
        $fuel = $this->getJson('/api/expenses/payees?include_purchases=1&expense_type=Fuel')->assertOk()->json();
        $this->assertContains('QA Shared',$fuel);
        $this->assertContains('QA Fuel',$fuel);
        $this->assertNotContains('QA Worker',$fuel);
        $all = $this->getJson('/api/expenses/payees?include_purchases=1')->assertOk()->json();
        foreach (['QA Worker','QA Fuel','QA Shared','QA Supplier'] as $name) $this->assertContains($name,$all);
        $this->getJson('/api/expenses/payees?include_purchases=1&expense_type=Unused')->assertOk()->assertExactJson([]);
    }

    public function test_payee_is_required_on_create_and_update(): void
    {
        $this->seed();
        $this->actingAs(User::first());
        $payload = ['date'=>now()->toDateString(), 'expense_type'=>'Labour', 'description'=>'Service', 'amount'=>100];
        foreach ([null, '', '   '] as $name) {
            $this->postJson('/api/expenses', $payload + ['paid_to'=>$name])->assertUnprocessable()->assertJsonValidationErrors('paid_to');
        }
        $expense = $this->postJson('/api/expenses', $payload + ['paid_to'=>'  Test   Worker '])->assertCreated()->assertJsonPath('paid_to', 'Test Worker');
        $this->putJson('/api/expenses/'.$expense['id'], ['paid_to'=>' '])->assertUnprocessable()->assertJsonValidationErrors('paid_to');
        $this->putJson('/api/expenses/'.$expense['id'], ['paid_to'=>'New Worker'])->assertOk()->assertJsonPath('paid_to', 'New Worker');
    }

    public function test_filters_sorting_and_pagination_cover_all_records(): void
    {
        $this->seed();
        $this->actingAs(User::first());
        $base = ['date'=>'2026-09-10', 'expense_type'=>'Labour', 'description'=>'Listing check', 'amount'=>100];
        $first = Expense::create($base + ['paid_to'=>'QA Alpha']);
        $partial = Expense::create($base + ['paid_to'=>'QA Beta']);
        $partial->payments()->create(['payment_date'=>'2026-09-10','amount'=>40,'payment_method'=>'Cash']);
        $paid = Expense::create($base + ['paid_to'=>'QA Gamma']);
        $paid->payments()->create(['payment_date'=>'2026-09-10','amount'=>100,'payment_method'=>'Cash']);
        Expense::create(array_replace($base, ['expense_type'=>'Fuel','paid_to'=>'QA Delta']));
        for($i=0;$i<30;$i++) Expense::create($base + ['paid_to'=>'QA Zulu '.$i]);
        $response = $this->getJson('/api/expenses?expense_type=Labour&paid_to=QA&payment_status=pending&sort=paid_to&direction=asc&per_page=1')->assertOk();
        $response->assertJsonPath('total',32)->assertJsonPath('data.0.id',$first->id);
        $this->getJson('/api/expenses?expense_type=Labour&paid_to=QA&payment_status=pending&sort=paid_to&direction=asc&per_page=1&page=2')->assertOk()->assertJsonPath('data.0.id',$partial->id)->assertJsonPath('data.0.balance_amount',60);
        $this->getJson('/api/expenses?paid_to=QA&payment_status=paid')->assertOk()->assertJsonPath('total',1)->assertJsonPath('data.0.id',$paid->id);
        $this->getJson('/api/expenses?paid_to=QA&sort=expense_type&direction=asc')->assertOk()->assertJsonPath('data.0.expense_type','Fuel');
        $this->getJson('/api/expenses?paid_to=QA&sort=paid_to&direction=desc')->assertOk()->assertJsonPath('data.0.paid_to','QA Zulu 9');
        $this->getJson('/api/expenses?sort=invalid')->assertUnprocessable();
    }
}
