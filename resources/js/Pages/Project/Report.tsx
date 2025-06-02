import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface Project {
    id: number;
    name: string;
    description: string;
    completion_percentage: number;
    status_counts: { [key: string]: number };
    total_tasks: number;
}

interface PageProps {
    projects: Project[];
    flash?: { message?: string };
}

export default function Report() {
    const { projects, flash } = usePage<PageProps>().props;

    return (
        <AuthenticatedLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Project Progress Report</h1>

                {flash?.message && (
                    <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg shadow">
                        {flash.message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Card key={project.id} className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl">{project.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">{project.description}</p>
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">Progress</span>
                                        <span>{project.completion_percentage}% Complete</span>
                                    </div>
                                    <Progress value={project.completion_percentage} className="w-full" />
                                </div>
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2">Task Statuses</h3>
                                    {project.total_tasks > 0 ? (
                                        <ul className="list-disc pl-5">
                                            {Object.entries(project.status_counts).map(([status, count]) => (
                                                <li key={status} className="text-sm">
                                                    {status}: {count}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No tasks found.</p>
                                    )}
                                </div>
                                <Button asChild variant="default">
                                    <Link href={route('projects.show', project.id)}>View Details</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
