import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage, Link, useForm } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

interface Project {
    id: number;
    name: string;
    description: string;
}

interface PageProps {
    projects: Project[];
    flash?: { message?: string };
}

export default function Index() {
    const { projects, flash } = usePage<PageProps>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const projectForm = useForm({
        name: '',
        description: '',
    });

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        projectForm.post(route('projects.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                projectForm.reset();
            },
        });
    };

    const handleEditProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            projectForm.put(route('projects.update', editingProject.id), {
                onSuccess: () => {
                    setIsEditOpen(false);
                    projectForm.reset();
                    setEditingProject(null);
                },
            });
        }
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        projectForm.setData({
            name: project.name,
            description: project.description,
        });
        setIsEditOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Projects</h1>

                {flash?.message && (
                    <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg shadow">
                        {flash.message}
                    </div>
                )}

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="mb-6">Create New Project</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Project</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                                <Input
                                    id="name"
                                    value={projectForm.data.name}
                                    onChange={(e) => projectForm.setData('name', e.target.value)}
                                    className="mt-1"
                                />
                                {projectForm.errors.name && <p className="text-red-500 text-sm mt-1">{projectForm.errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                                <Textarea
                                    id="description"
                                    value={projectForm.data.description}
                                    onChange={(e) => projectForm.setData('description', e.target.value)}
                                    className="mt-1"
                                />
                                {projectForm.errors.description && <p className="text-red-500 text-sm mt-1">{projectForm.errors.description}</p>}
                            </div>
                            <Button type="submit">Create</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditProject} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                                <Input
                                    id="name"
                                    value={projectForm.data.name}
                                    onChange={(e) => projectForm.setData('name', e.target.value)}
                                    className="mt-1"
                                />
                                {projectForm.errors.name && <p className="text-red-500 text-sm mt-1">{projectForm.errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                                <Textarea
                                    id="description"
                                    value={projectForm.data.description}
                                    onChange={(e) => projectForm.setData('description', e.target.value)}
                                    className="mt-1"
                                />
                                {projectForm.errors.description && <p className="text-red-500 text-sm mt-1">{projectForm.errors.description}</p>}
                            </div>
                            <Button type="submit">Update</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>{project.name}</TableCell>
                                <TableCell>{project.description}</TableCell>
                                <TableCell>
                                    <Button asChild variant="default" className="mr-2">
                                        <Link href={route('projects.show', project.id)}>Details</Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="mr-2"
                                        onClick={() => openEditModal(project)}
                                    >
                                        Edit
                                    </Button>
                                    <Button asChild variant="destructive">
                                        <Link
                                            href={route('projects.destroy', project.id)}
                                            method="delete"
                                            as="button"
                                            type="button"
                                            onClick={() => confirm('Are you sure you want to delete this project?')}
                                        >
                                            Delete
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
