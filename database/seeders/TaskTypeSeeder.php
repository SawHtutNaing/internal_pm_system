<?php

namespace Database\Seeders;

use App\Models\TaskType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
           DB::table('task_types')->insert([
            ['name' => 'Bug'],
            ['name' => 'Feature'],
            ['name' => 'Improvement'],
            ['name' => 'Documentation'],
        ]);
    }
}
