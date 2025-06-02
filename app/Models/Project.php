<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function elites()
    {
        return $this->hasMany(Elite::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'project_users')
                    ->withPivot('remark', 'due_date')
                    ->withTimestamps();
    }

    public function tasks()
    {
        return $this->hasManyThrough(Task::class, Elite::class);
    }
}
