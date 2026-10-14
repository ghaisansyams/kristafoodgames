<?php

namespace Database\Seeders;

use App\Models\BusinessCase;
use App\Models\Market;
use App\Models\PackagingOption;
use App\Models\Priority;
use Illuminate\Database\Seeder;

/**
 * Placeholder content for the Packaging Decision Lab.
 *
 * Every packaging option's 1-5 factor scores are illustrative game-model values so the
 * experience is demoable end-to-end. Per the proposal (slide 10C, "Perlu validasi"), these
 * must be replaced with real figures validated by the ALLPACK product/technical team before
 * the booth goes live. Swap the arrays below — the scoring engine and UI need no changes.
 */
class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $priorities = [
            ['slug' => 'protection', 'title' => 'Protection', 'description' => 'Product integrity', 'icon' => 'shield', 'sort_order' => 1],
            ['slug' => 'shelf_life', 'title' => 'Shelf Life', 'description' => 'Maintain quality over time', 'icon' => 'hourglass', 'sort_order' => 2],
            ['slug' => 'cost', 'title' => 'Cost', 'description' => 'Packaging efficiency', 'icon' => 'coins', 'sort_order' => 3],
            ['slug' => 'sustainability', 'title' => 'Sustainability', 'description' => 'Environmental consideration', 'icon' => 'leaf', 'sort_order' => 4],
            ['slug' => 'convenience', 'title' => 'Convenience', 'description' => 'Ease of use', 'icon' => 'hand', 'sort_order' => 5],
            ['slug' => 'presentation', 'title' => 'Presentation', 'description' => 'Brand & shelf appeal', 'icon' => 'star', 'sort_order' => 6],
        ];
        foreach ($priorities as $priority) {
            Priority::updateOrCreate(['slug' => $priority['slug']], $priority);
        }

        $markets = [
            ['slug' => 'retail', 'title' => 'Retail', 'description' => 'Supermarket, minimarket, specialty store', 'sort_order' => 1],
            ['slug' => 'e-commerce', 'title' => 'E-Commerce', 'description' => 'Marketplace, online, D2C', 'sort_order' => 2],
            ['slug' => 'food-service', 'title' => 'Food Service', 'description' => 'Café, restaurant, hotel, catering', 'sort_order' => 3],
            ['slug' => 'export', 'title' => 'Export', 'description' => 'International distribution', 'sort_order' => 4],
            ['slug' => 'multi-channel', 'title' => 'Multi-Channel', 'description' => 'Combination of channels', 'sort_order' => 5],
        ];
        foreach ($markets as $market) {
            Market::updateOrCreate(['slug' => $market['slug']], $market);
        }

        $businessCases = [
            [
                'slug' => 'coffee-powder',
                'title' => 'Coffee & Powder',
                'description' => 'Protect quality & freshness.',
                'icon' => 'coffee',
                'sort_order' => 1,
                'options' => [
                    ['label' => 'Coffee Bag — Vertical Pack & Vacuum Sealing', 'description' => 'Maximum protection and freshness for roasted beans or ground coffee.', 'scores' => ['protection' => 5, 'shelf_life' => 5, 'cost' => 2, 'sustainability' => 4, 'convenience' => 3, 'presentation' => 4]],
                    ['label' => 'Stand-Up Pouch with Valve', 'description' => 'Balanced protection and shelf presence for everyday retail coffee.', 'scores' => ['protection' => 4, 'shelf_life' => 4, 'cost' => 3, 'sustainability' => 3, 'convenience' => 4, 'presentation' => 4]],
                    ['label' => 'Simple Sachet Pack', 'description' => 'Cost-efficient single-serve format for high-volume distribution.', 'scores' => ['protection' => 3, 'shelf_life' => 3, 'cost' => 5, 'sustainability' => 3, 'convenience' => 4, 'presentation' => 3]],
                ],
            ],
            [
                'slug' => 'snack-confectionery',
                'title' => 'Snack & Confectionery',
                'description' => 'Balance protection, cost & presentation.',
                'icon' => 'cookie',
                'sort_order' => 2,
                'options' => [
                    ['label' => 'Laminated Flow Wrap — High Barrier', 'description' => 'Strong moisture and oxygen barrier for premium snack lines.', 'scores' => ['protection' => 5, 'shelf_life' => 4, 'cost' => 2, 'sustainability' => 3, 'convenience' => 4, 'presentation' => 5]],
                    ['label' => 'Stand-Up Pouch — Balanced', 'description' => 'Resealable format with solid shelf appeal for retail.', 'scores' => ['protection' => 4, 'shelf_life' => 4, 'cost' => 3, 'sustainability' => 3, 'convenience' => 4, 'presentation' => 4]],
                    ['label' => 'Mono-Material Flow Wrap — Economical', 'description' => 'Simple, recyclable, cost-efficient wrap for high-volume snacks.', 'scores' => ['protection' => 3, 'shelf_life' => 3, 'cost' => 5, 'sustainability' => 4, 'convenience' => 4, 'presentation' => 3]],
                ],
            ],
            [
                'slug' => 'ready-to-eat',
                'title' => 'Ready-to-Eat Food',
                'description' => 'Protect food through storage & distribution.',
                'icon' => 'utensils',
                'sort_order' => 3,
                'options' => [
                    ['label' => 'Vacuum Skin Pack', 'description' => 'Maximum protection for chilled or frozen ready meals.', 'scores' => ['protection' => 5, 'shelf_life' => 5, 'cost' => 2, 'sustainability' => 2, 'convenience' => 3, 'presentation' => 4]],
                    ['label' => 'Microwaveable Tray & Lid', 'description' => 'Balanced protection with heat-and-eat convenience.', 'scores' => ['protection' => 4, 'shelf_life' => 4, 'cost' => 3, 'sustainability' => 3, 'convenience' => 5, 'presentation' => 4]],
                    ['label' => 'Compostable Bowl', 'description' => 'Sustainable, cost-efficient format for food service.', 'scores' => ['protection' => 3, 'shelf_life' => 3, 'cost' => 4, 'sustainability' => 5, 'convenience' => 4, 'presentation' => 3]],
                ],
            ],
            [
                'slug' => 'beverage',
                'title' => 'Beverage',
                'description' => 'Choose the right solution for liquid products.',
                'icon' => 'droplet',
                'sort_order' => 4,
                'options' => [
                    ['label' => 'Glass Bottle', 'description' => 'Premium protection and presentation for liquid products.', 'scores' => ['protection' => 5, 'shelf_life' => 5, 'cost' => 2, 'sustainability' => 3, 'convenience' => 2, 'presentation' => 5]],
                    ['label' => 'PET Bottle', 'description' => 'Balanced protection, cost, and convenience.', 'scores' => ['protection' => 4, 'shelf_life' => 4, 'cost' => 4, 'sustainability' => 3, 'convenience' => 4, 'presentation' => 4]],
                    ['label' => 'Aseptic Carton Pack', 'description' => 'Cost-efficient, lightweight format for high-volume distribution.', 'scores' => ['protection' => 3, 'shelf_life' => 3, 'cost' => 5, 'sustainability' => 4, 'convenience' => 4, 'presentation' => 3]],
                ],
            ],
            [
                'slug' => 'pharma-healthcare',
                'title' => 'Pharma & Healthcare',
                'description' => 'Balance protection, safety & efficiency.',
                'icon' => 'pill',
                'sort_order' => 5,
                'options' => [
                    ['label' => 'Alu-Alu Blister', 'description' => 'Maximum moisture and light protection for sensitive formulations.', 'scores' => ['protection' => 5, 'shelf_life' => 5, 'cost' => 2, 'sustainability' => 2, 'convenience' => 3, 'presentation' => 4]],
                    ['label' => 'PVC/PVDC Blister', 'description' => 'Balanced protection for standard tablet and capsule lines.', 'scores' => ['protection' => 4, 'shelf_life' => 4, 'cost' => 3, 'sustainability' => 3, 'convenience' => 4, 'presentation' => 4]],
                    ['label' => 'Bottle with Desiccant', 'description' => 'Cost-efficient bulk format for pharmacy dispensing.', 'scores' => ['protection' => 3, 'shelf_life' => 4, 'cost' => 4, 'sustainability' => 3, 'convenience' => 4, 'presentation' => 3]],
                ],
            ],
            [
                'slug' => 'cosmetic-personal-care',
                'title' => 'Cosmetic & Personal Care',
                'description' => 'Combine protection, usability & presentation.',
                'icon' => 'sparkles',
                'sort_order' => 6,
                'options' => [
                    ['label' => 'Airless Pump Bottle', 'description' => 'Premium protection and presentation for active formulations.', 'scores' => ['protection' => 5, 'shelf_life' => 4, 'cost' => 2, 'sustainability' => 3, 'convenience' => 4, 'presentation' => 5]],
                    ['label' => 'Tube with Flip Cap', 'description' => 'Balanced everyday format for retail personal care.', 'scores' => ['protection' => 4, 'shelf_life' => 4, 'cost' => 3, 'sustainability' => 3, 'convenience' => 4, 'presentation' => 4]],
                    ['label' => 'Refill Pouch', 'description' => 'Sustainable, cost-efficient refill format.', 'scores' => ['protection' => 3, 'shelf_life' => 3, 'cost' => 4, 'sustainability' => 5, 'convenience' => 4, 'presentation' => 3]],
                ],
            ],
        ];

        foreach ($businessCases as $businessCaseData) {
            $options = $businessCaseData['options'];
            unset($businessCaseData['options']);

            $businessCase = BusinessCase::updateOrCreate(['slug' => $businessCaseData['slug']], $businessCaseData);

            foreach ($options as $index => $optionData) {
                PackagingOption::updateOrCreate(
                    ['business_case_id' => $businessCase->id, 'label' => $optionData['label']],
                    [...$optionData, 'business_case_id' => $businessCase->id, 'sort_order' => $index + 1]
                );
            }
        }
    }
}
