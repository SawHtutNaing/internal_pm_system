import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useReactHookForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional(),
});

// Main component
export default function InputForm({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [editingUserId, setEditingUserId] = useState(null);

  // React Hook Form setup
  const form = useReactHookForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Inertia form for API calls
  const { post, put, delete: deleteRequest, processing } = useForm();


  const onSubmit = (values) => {
    if (editingUserId) {

      put(`/api/users/${editingUserId}`, {
        ...values,
        onSuccess: () => {
          setUsers(users.map((user) => (user.id === editingUserId ? { ...user, ...values } : user)));
          resetForm();
        },
      });
    } else {

      post('/api/users', {
        ...values,
        onSuccess: (page) => {
          setUsers([...users, page.props.user]);
          resetForm();
        },
      });
    }
  };

  // Handle edit user
  const editUser = (user) => {
    setEditingUserId(user.id);
    form.reset({
      name: user.name,
      email: user.email,
      password: '',
    });
  };

  // Handle delete user
  const deleteUser = (id) => {
    deleteRequest(`/api/users/${id}`, {
      onSuccess: () => {
        setUsers(users.filter((user) => user.id !== id));
      },
    });
  };

  // Reset form
  const resetForm = () => {
    setEditingUserId(null);
    form.reset({
      name: '',
      email: '',
      password: '',
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          User Management Form
        </h2>
      }
    >
      <Head title="User Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-4">
                  <Button type="submit" disabled={processing}>
                    {editingUserId ? 'Update' : 'Create'} User
                  </Button>
                  {editingUserId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>


            <div className="mt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user?.id}>
                      <TableCell>{user?.id}</TableCell>
                      <TableCell>{user?.name}</TableCell>
                      <TableCell>{user?.email}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          className="mr-2"
                          onClick={() => editUser(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteUser(user.id)}
                          disabled={processing}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
