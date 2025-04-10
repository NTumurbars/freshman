<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Section;

class CheckDeliveryMethods extends Command
{
    protected $signature = 'sections:check-delivery-methods';
    protected $description = 'Display the distribution of delivery methods across sections';

    public function handle()
    {
        $sections = Section::all();
        $deliveryMethods = $sections->groupBy('delivery_method')->map->count();

        $this->info("\nDelivery Method Distribution:");
        foreach ($deliveryMethods as $method => $count) {
            $percentage = ($count / $sections->count()) * 100;
            $this->info("{$method}: {$count} sections ({$percentage}%)");
        }
    }
}
