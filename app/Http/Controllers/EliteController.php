<?php

namespace App\Http\Controllers;

use App\Models\Elite;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EliteController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
        ]);

        Elite::create([
            'name' => $request->name,
            'project_id' => $request->project_id,
        ]);

        return redirect()->back()->with('message', 'Elite created successfully.');
    }

    public function destroy(Elite $elite)
    {
        $elite->delete();

        return redirect()->back()->with('message', 'Elite deleted successfully.');
    }
}
