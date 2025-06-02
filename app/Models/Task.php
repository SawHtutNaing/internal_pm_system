<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['elite_id', 'parent_id', 'task_type_id', 'name', 'task_status_id'];

    public function elite()
    {
        return $this->belongsTo(Elite::class);
    }

    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    public function subTasks()
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    public function taskType()
    {
        return $this->belongsTo(TaskType::class);
    }

    public function taskStatus()
    {
        return $this->belongsTo(TaskStatus::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'task_users')
                    ->withPivot('remark', 'due_date')
                    ->withTimestamps();
    }
}
