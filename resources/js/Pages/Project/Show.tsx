import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Task {
    id: number;
    name: string;
    task_type_id: number;
    task_status_id: number;
    parent_id: number | null;
    users: { id: number; name: string; pivot: { remark: string | null; due_date: string | null } }[];
    sub_tasks: Task[];
}

interface Elite {
    id: number;
    name: string;
    tasks: Task[];
}

interface User {
    id: number;
    name: string;
    pivot?: { remark: string | null; due_date: string | null };
}

interface Project {
    id: number;
    name: string;
    description: string;
    elites: Elite[];
    users: User[];
}

interface TaskType {
    id: number;
    name: string;
}

interface TaskStatus {
    id: number;
    name: string;
}

interface PageProps {
    project: Project;
    taskTypes: TaskType[];
    taskStatuses: TaskStatus[];
    availableUsers: User[];
    flash?: { message?: string };
}

export default function Show() {
    const { project, taskTypes, taskStatuses, availableUsers, flash } = usePage<PageProps>().props;
    const [isCreateEliteOpen, setIsCreateEliteOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [selectedElite, setSelectedElite] = useState<Elite | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const eliteForm = useForm({
        name: '',
        project_id: project.id,
    });

    const taskForm = useForm({
        name: '',
        elite_id: 0,
        task_type_id: taskTypes[0]?.id || 0,
        task_status_id: taskStatuses[0]?.id || 0,
        parent_id: null as number | null,
        user_id: null as number | null,
        remark: '',
        due_date: '',
    });

    const handleCreateElite = (e: React.FormEvent) => {
        e.preventDefault();
        eliteForm.post(route('elites.store'), {
            onSuccess: () => {
                setIsCreateEliteOpen(false);
                eliteForm.reset();
            },
        });
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        taskForm.post(route('tasks.store'), {
            onSuccess: () => {
                setIsCreateTaskOpen(false);
                taskForm.reset();
            },
        });
    };

    const handleEditTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTask) {
            taskForm.put(route('tasks.update', selectedTask.id), {
                onSuccess: () => {
                    setIsEditTaskOpen(false);
                    taskForm.reset();
                },
            });
        }
    };

    const openCreateTaskModal = (elite: Elite) => {
        setSelectedElite(elite);
        taskForm.setData({
            name: '',
            elite_id: elite.id,
            task_type_id: taskTypes[0]?.id || 0,
            task_status_id: taskStatuses[0]?.id || 0,
            parent_id: null,
            user_id: null,
            remark: '',
            due_date: '',
        });
        setIsCreateTaskOpen(true);
    };

    const openEditTaskModal = (task: Task) => {
        setSelectedTask(task);
        taskForm.setData({
            name: task.name,
            elite_id: task.elite_id || 0,
            task_type_id: task.task_type_id,
            task_status_id: task.task_status_id,
            parent_id: task.parent_id,
            user_id: task.users[0]?.id || null,
            remark: task.users[0]?.pivot.remark || '',
            due_date: task.users[0]?.pivot.due_date || '',
        });
        setIsEditTaskOpen(true);
    };

    const handleDeleteTask = (taskId: number) => {
        if (confirm('Are you sure you want to delete this task?')) {
            taskForm.delete(route('tasks.destroy', taskId));
        }
    };

    const handleDeleteElite = (eliteId: number) => {
        if (confirm('Are you sure you want to delete this elite?')) {
            eliteForm.delete(route('elites.destroy', eliteId));
        }
    };

    const renderTaskCard = (task: Task) => (
        <div key={task.id} className="bg-white p-4 rounded-lg shadow mb-2">
            <h4 className="font-semibold">{task.name}</h4>
            <p className="text-sm text-gray-600">
                {taskTypes.find(t => t.id === task.task_type_id)?.name || 'N/A'} / {taskStatuses.find(s => s.id === task.task_status_id)?.name || 'N/A'}
            </p>
            {task.users.length > 0 && (
                <p className="text-sm">
                     {task.users[0].name}
                    {/* {task.users[0].pivot.remark && `, Remark: ${task.users[0].pivot.remark}`} */}
                    {task.users[0].pivot.due_date && `,  ${new Date(task.users[0].pivot.due_date).toLocaleDateString()}`}
                </p>
            )}
            <div className="flex space-x-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => openEditTaskModal(task)}>
                    Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                    Delete
                </Button>
            </div>
            {task.sub_tasks.length > 0 && (
                <div className="ml-4 mt-2">
                    {task.sub_tasks.map(renderTaskCard)}
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">{project.name}</h1>

                {flash?.message && (
                    <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg shadow">
                        {flash.message}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Description</h2>
                        <p className="text-gray-700">{project.description}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Assigned Users</h2>
                        {project.users.length ? (
                            <ul className="list-disc pl-6">
                                {project.users.map((user) => (
                                    <li key={user.id}>
                                        {user.name}
                                        {user.pivot?.remark && ` (Remark: ${user.pivot.remark})`}
                                        {user.pivot?.due_date && `, Due: ${new Date(user.pivot.due_date).toLocaleDateString()}`}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No users assigned.</p>
                        )}
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Elites (Kanban Board)</h2>
                            <Dialog open={isCreateEliteOpen} onOpenChange={setIsCreateEliteOpen}>
                                <DialogTrigger asChild>
                                    <Button>Add Elite</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create Elite</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateElite} className="space-y-4">
                                        <div>
                                            <label htmlFor="elite_name" className="block text-sm font-medium">Name</label>
                                            <Input
                                                id="elite_name"
                                                value={eliteForm.data.name}
                                                onChange={(e) => eliteForm.setData('name', e.target.value)}
                                                className="mt-1"
                                            />
                                            {eliteForm.errors.name && <p className="text-red-500 text-sm mt-1">{eliteForm.errors.name}</p>}
                                        </div>
                                        <Button type="submit">Create</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="flex space-x-4 overflow-x-auto pb-4">
                            {project.elites.map((elite) => (
                                <div key={elite.id} className="min-w-[300px] bg-gray-100 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-lg">{elite.name}</h3>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteElite(elite.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full mb-4"
                                        onClick={() => openCreateTaskModal(elite)}
                                    >
                                        Add Task
                                    </Button>
                                    <div className="space-y-2">
                                        {elite.tasks.filter(task => !task.parent_id).map(renderTaskCard)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Task for {selectedElite?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label htmlFor="task_name" className="block text-sm font-medium">Name</label>
                                <Input
                                    id="task_name"
                                    value={taskForm.data.name}
                                    onChange={(e) => taskForm.setData('name', e.target.value)}
                                    className="mt-1"
                                />
                                {taskForm.errors.name && <p className="text-red-500 text-sm mt-1">{taskForm.errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="task_type" className="block text-sm font-medium">Task Type</label>
                                <Select
                                    value={taskForm.data.task_type_id.toString()}
                                    onValueChange={(value) => taskForm.setData('task_type_id', parseInt(value))}
                                    disabled={taskTypes.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={taskTypes.length === 0 ? "No task types available" : "Select type"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taskTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {taskForm.errors.task_type_id && <p className="text-red-500 text-sm mt-1">{taskForm.errors.task_type_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="task_status" className="block text-sm font-medium">Task Status</label>
                                <Select
                                    value={taskForm.data.task_status_id.toString()}
                                    onValueChange={(value) => taskForm.setData('task_status_id', parseInt(value))}
                                    disabled={taskStatuses.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={taskStatuses.length === 0 ? "No task statuses available" : "Select status"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taskStatuses.map((status) => (
                                            <SelectItem key={status.id} value={status.id.toString()}>
                                                {status.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {taskForm.errors.task_status_id && <p className="text-red-500 text-sm mt-1">{taskForm.errors.task_status_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="parent_task" className="block text-sm font-medium">Parent Task (Optional)</label>
                                <Select
                                    value={taskForm.data.parent_id?.toString() || 'none'}
                                    onValueChange={(value) => taskForm.setData('parent_id', value === 'none' ? null : parseInt(value))}
                                    disabled={!selectedElite?.tasks?.length}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent task" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {selectedElite?.tasks?.map((task) => (
                                            <SelectItem key={task.id} value={task.id.toString()}>
                                                {task.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {taskForm.errors.parent_id && <p className="text-red-500 text-sm mt-1">{taskForm.errors.parent_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="user_id" className="block text-sm font-medium">Assign User (Optional)</label>
                                <Select
                                    value={taskForm.data.user_id?.toString() || 'none'}
                                    onValueChange={(value) => taskForm.setData('user_id', value === 'none' ? null : parseInt(value))}
                                    disabled={availableUsers.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={availableUsers.length === 0 ? "No users available" : "Select user"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {taskForm.errors.user_id && <p className="text-red-500 text-sm mt-1">{taskForm.errors.user_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="remark" className="block text-sm font-medium">Remark (Optional)</label>
                                <Textarea
                                    id="remark"
                                    value={taskForm.data.remark}
                                    onChange={(e) => taskForm.setData('remark', e.target.value)}
                                    className="mt-1"
                                />
                                {taskForm.errors.remark && <p className="text-red-500 text-sm mt-1">{taskForm.errors.remark}</p>}
                            </div>
                            <div>
                                <label htmlFor="due_date" className="block text-sm font-medium">Due Date (Optional)</label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={taskForm.data.due_date}
                                    onChange={(e) => taskForm.setData('due_date', e.target.value)}
                                    className="mt-1"
                                />
                                {taskForm.errors.due_date && <p className="text-red-500 text-sm mt-1">{taskForm.errors.due_date}</p>}
                            </div>
                            <Button type="submit" disabled={taskTypes.length === 0 || taskStatuses.length === 0}>Create</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Task: {selectedTask?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditTask} className="space-y-4">
                            <div>
                                <label htmlFor="task_name" className="block text-sm font-medium">Name</label>
                                <Input
                                    id="task_name"
                                    value={taskForm.data.name}
                                    onChange={(e) => taskForm.setData('name', e.target.value)}
                                    className="mt-1"
                                />
                                {taskForm.errors.name && <p className="text-red-500 text-sm mt-1">{taskForm.errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="task_type" className="block text-sm font-medium">Task Type</label>
                                <Select
                                    value={taskForm.data.task_type_id.toString()}
                                    onValueChange={(value) => taskForm.setData('task_type_id', parseInt(value))}
                                    disabled={taskTypes.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={taskTypes.length === 0 ? "No task types available" : "Select type"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taskTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {taskForm.errors.task_type_id && <p className="text-red-500 text-sm mt-1">{taskForm.errors.task_type_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="task_status" className="block text-sm font-medium">Task Status</label>
                                <Select
                                    value={taskForm.data.task_status_id.toString()}
                                    onValueChange={(value) => taskForm.setData('task_status_id', parseInt(value))}
                                    disabled={taskStatuses.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={taskStatuses.length === 0 ? "No task statuses available" : "Select status"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taskStatuses.map((status) => (
                                            <SelectItem key={status.id} value={status.id.toString()}>
                                                {status.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {taskForm.errors.task_status_id && <p className="text-red-500 text-sm mt-1">{taskForm.errors.task_status_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="parent_task" className="block text-sm font-medium">Parent Task (Optional)</label>
                                <Select
                                    value={taskForm.data.parent_id?.toString() || 'none'}
                                    onValueChange={(value) => taskForm.setData('parent_id', value === 'none' ? null : parseInt(value))}
                                    disabled={!selectedElite?.tasks?.length}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent task" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {project.elites.flatMap(elite => elite.tasks).map((task) => (
                                            <SelectItem key={task.id} value={task.id.toString()}>
                                                {task.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {taskForm.errors.parent_id && <p className="text-red-500 text-sm mt-1">{taskForm.errors.parent_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="user_id" className="block text-sm font-medium">Assign User (Optional)</label>
                                <Select
                                    value={taskForm.data.user_id?.toString() || 'none'}
                                    onValueChange={(value) => taskForm.setData('user_id', value === 'none' ? null : parseInt(value))}
                                    disabled={availableUsers.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={availableUsers.length === 0 ? "No users available" : "Select user"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {taskForm.errors.user_id && <p className="text-red-500 text-sm mt-1">{taskForm.errors.user_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="remark" className="block text-sm font-medium">Remark (Optional)</label>
                                <Textarea
                                    id="remark"
                                    value={taskForm.data.remark}
                                    onChange={(e) => taskForm.setData('remark', e.target.value)}
                                    className="mt-1"
                                />
                                {taskForm.errors.remark && <p className="text-red-500 text-sm mt-1">{taskForm.errors.remark}</p>}
                            </div>
                            <div>
                                <label htmlFor="due_date" className="block text-sm font-medium">Due Date (Optional)</label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={taskForm.data.due_date}
                                    onChange={(e) => taskForm.setData('due_date', e.target.value)}
                                    className="mt-1"
                                />
                                {taskForm.errors.due_date && <p className="text-red-500 text-sm mt-1">{taskForm.errors.due_date}</p>}
                            </div>
                            <Button type="submit">Update</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
