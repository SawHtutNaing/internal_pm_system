<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'elite_id' => 'required|exists:elites,id',
            'task_type_id' => 'required|exists:task_types,id',
            'task_status_id' => 'required|exists:task_statuses,id',
            'parent_id' => 'nullable|exists:tasks,id',
            'user_id' => 'nullable|exists:users,id',
            'remark' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $task = Task::create($request->only(['name', 'elite_id', 'task_type_id', 'task_status_id', 'parent_id']));

        if ($request->user_id) {
            $task->users()->attach($request->user_id, [
                'remark' => $request->remark,
                'due_date' => $request->due_date,
            ]);
        }

        return redirect()->back()->with('message', 'Task created successfully.');
    }

    public function update(Request $request, Task $task)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'task_type_id' => 'required|exists:task_types,id',
            'task_status_id' => 'required|exists:task_statuses,id',
            'parent_id' => 'nullable|exists:tasks,id',
            'user_id' => 'nullable|exists:users,id',
            'remark' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $task->update($request->only(['name', 'task_type_id', 'task_status_id', 'parent_id']));

        $task->users()->detach();
        if ($request->user_id) {
            $task->users()->attach($request->user_id, [
                'remark' => $request->remark,
                'due_date' => $request->due_date,
            ]);
        }

        return redirect()->back()->with('message', 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->back()->with('message', 'Task deleted successfully.');
    }
}
