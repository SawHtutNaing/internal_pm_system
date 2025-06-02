<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('Project/Index', [
            'projects' => Project::all()->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                ];
            }),
            'flash' => session('message') ? ['message' => session('message')] : null,
        ]);
    }

    public function show(Project $project)
    {
        return Inertia::render('Project/Show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'users' => $project->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'pivot' => [
                            'remark' => $user->pivot->remark,
                            'due_date' => $user->pivot->due_date,
                        ],
                    ];
                }),
                'elites' => $project->elites->map(function ($elite) {
                    return [
                        'id' => $elite->id,
                        'name' => $elite->name,
                        'tasks' => $elite->tasks->map(function ($task) {
                            return [
                                'id' => $task->id,
                                'name' => $task->name,
                                'task_type_id' => $task->task_type_id,
                                'task_status_id' => $task->task_status_id,
                                'parent_id' => $task->parent_id,
                                'users' => $task->users->map(function ($user) {
                                    return [
                                        'id' => $user->id,
                                        'name' => $user->name,
                                        'pivot' => [
                                            'remark' => $user->pivot->remark,
                                            'due_date' => $user->pivot->due_date,
                                        ],
                                    ];
                                }),
                                'sub_tasks' => $task->subTasks->map(function ($subTask) {
                                    return [
                                        'id' => $subTask->id,
                                        'name' => $subTask->name,
                                        'task_type_id' => $subTask->task_type_id,
                                        'task_status_id' => $subTask->task_status_id,
                                        'parent_id' => $subTask->parent_id,
                                        'users' => $subTask->users->map(function ($user) {
                                            return [
                                                'id' => $user->id,
                                                'name' => $user->name,
                                                'pivot' => [
                                                    'remark' => $user->pivot->remark,
                                                    'due_date' => $user->pivot->due_date,
                                                ],
                                            ];
                                        }),
                                    ];
                                }),
                            ];
                        }),
                    ];
                }),
            ],
            'availableUsers' => User::all()->map(function ($user) {
                return ['id' => $user->id, 'name' => $user->name];
            }),
            'flash' => session('message') ? ['message' => session('message')] : null,
        ]);
    }

    public function report()
    {
        $completedStatus = TaskStatus::where('name', 'Done')->first();

        $projects = Project::with(['tasks.taskStatus'])->get()->map(function ($project) use ($completedStatus) {
            $tasks = $project->tasks;
            $totalTasks = $tasks->count();
            $completedTasks = $completedStatus ? $tasks->where('task_status_id', $completedStatus->id)->count() : 0;
            $completionPercentage = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;

            $statusCounts = TaskStatus::all()->mapWithKeys(function ($status) use ($tasks) {
                return [$status->name => $tasks->where('task_status_id', $status->id)->count()];
            })->toArray();

            return [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'completion_percentage' => $completionPercentage,
                'status_counts' => $statusCounts,
                'total_tasks' => $totalTasks,
            ];
        });

        return Inertia::render('Project/Report', [
            'projects' => $projects,
            'flash' => session('message') ? ['message' => session('message')] : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        Project::create($request->all());

        return redirect()->route('projects.index')->with('message', 'Project created successfully.');
    }

    public function update(Request $request, Project $project)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $project->update($request->all());

        return redirect()->route('projects.index')->with('message', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index')->with('message', 'Project deleted successfully.');
    }
}
