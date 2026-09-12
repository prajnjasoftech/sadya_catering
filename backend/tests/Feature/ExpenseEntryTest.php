<?php

namespace Tests\Feature;

use App\Models\{Expense, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_purchase_entry_and_edits_require_purchase_routes(): void
    {
        $this->seed();
        $this->actingAs(User::first());
        $payload = ['paid_to' => 'Test Worker', 'date' => now()->toDateString(), 'expense_type' => 'Purchase', 'description' => 'Test purchase', 'amount' => 100];
        foreach (['Purchase', ' purchase ', 'PURCHASE'] as $type) {
            $this->postJson('/api/expenses', array_replace($payload, ['expense_type' => $type]))->assertUnprocessable()->assertJsonValidationErrors('expense_type');
        }
        $purchase = $this->postJson('/api/purchases', $payload)->assertCreated();
        $this->putJson('/api/expenses/'.$purchase['id'], ['paid_to' => 'Test Worker', 'description' => 'Changed'])->assertUnprocessable();
        $this->putJson('/api/purchases/'.$purchase['id'], ['description' => 'Changed'])->assertOk()->assertJsonPath('description', 'Changed');
        $this->getJson('/api/expenses')->assertOk()->assertJsonFragment(['id' => $purchase['id'], 'expense_type' => 'Purchase']);
        $expense = $this->postJson('/api/expenses', array_replace($payload, ['expense_type' => 'Labour']))->assertCreated();
        $this->putJson('/api/expenses/'.$expense['id'], ['expense_type' => 'Purchase'])->assertUnprocessable();
        $this->putJson('/api/purchases/'.$expense['id'], ['amount' => 200])->assertNotFound();
    }

    public function test_payees_include_all_expense_history_without_purchase_names_or_duplicates(): void
    {
        $this->seed();
        $this->getJson('/api/expenses/payees')->assertUnauthorized();
        $this->actingAs(User::first());
        $base = ['date' => now()->toDateString(), 'expense_type' => 'Labour', 'description' => 'Test payee', 'amount' => 100];
        foreach (['  QA   Worker  ', 'qa worker', '', '   ', null] as $name) {
            Expense::create($base + ['paid_to' => $name]);
        }
        Expense::create(array_replace($base, ['expense_type' => 'Purchase', 'paid_to' => 'QA Supplier Only']));
        for ($i = 0; $i < 30; $i++) Expense::create($base + ['paid_to' => 'QA Person '.$i]);
        $names = $this->getJson('/api/expenses/payees')->assertOk()->json();
        $this->assertContains('QA Worker', $names);
        $this->assertNotContains('qa worker', $names);
        $this->assertNotContains('QA Supplier Only', $names);
        $this->assertNotContains('', $names);
        $this->assertContains('QA Person 29', $names);
    }
}
