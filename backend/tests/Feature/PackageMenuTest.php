<?php

namespace Tests\Feature;

use App\Models\{MenuItem, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackageMenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_package_menu_can_be_created_replaced_and_cleared(): void
    {
        $this->actingAs(User::factory()->create());
        $first = MenuItem::create(['name' => 'Avial', 'category' => 'Curry']);
        $second = MenuItem::create(['name' => 'Sambar', 'category' => 'Curry']);
        $package = $this->postJson('/api/packages', ['name' => 'Test Sadya', 'price_per_leaf' => 200, 'item_ids' => [$first->id]])
            ->assertCreated()->assertJsonPath('items.0.id', $first->id)->json();
        $url = '/api/packages/'.$package['id'];
        $this->getJson('/api/packages')->assertOk()->assertJsonPath('data.0.items.0.id', $first->id);
        $this->putJson($url, ['item_ids' => [$second->id], 'items' => $package['items']])
            ->assertOk()->assertJsonCount(1, 'items')->assertJsonPath('items.0.id', $second->id);
        $this->putJson($url, ['name' => 'Updated Sadya'])->assertOk()->assertJsonPath('items.0.id', $second->id);
        $this->putJson($url, ['item_ids' => []])->assertOk()->assertJsonCount(0, 'items');
        $this->postJson('/api/packages', ['name' => 'Invalid', 'price_per_leaf' => 200, 'item_ids' => [999999]])
            ->assertUnprocessable()->assertJsonValidationErrors('item_ids.0');
        $this->assertDatabaseMissing('sadya_packages', ['name' => 'Invalid']);
    }
}
