<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ] : null,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
            ],
            'taskTypes' => \App\Models\TaskType::all()->map(fn($type) => ['id' => $type->id, 'name' => $type->name]),
            'taskStatuses' => \App\Models\TaskStatus::all()->map(fn($status) => ['id' => $status->id, 'name' => $status->name]),
            'availableUsers' => \App\Models\User::all()->map(fn($user) => ['id' => $user->id, 'name' => $user->name]),
        ]);
    }
}
