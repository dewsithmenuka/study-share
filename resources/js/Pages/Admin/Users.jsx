import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Users({ auth, users }) {
    return (
        <MainLayout auth={auth}>
            <Head title="Manage Users" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
                <p className="text-gray-500 mt-1">View and manage registered students</p>
            </div>

            
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left text-gray-500">
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Joined</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400">No users found.</td>
                            </tr>
                        ) : users.data.map((u) => (
                            <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs capitalize ${u.roles[0]?.name === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {u.roles[0]?.name || 'student'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    {u.roles[0]?.name !== 'admin' && (
                                        <button
                                            onClick={() => { if (confirm('Delete this user?')) router.delete(`/admin/users/${u.id}`); }}
                                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
}