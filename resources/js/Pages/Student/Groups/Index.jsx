import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Index({ auth, myGroups }) {
    return (
        <MainLayout auth={auth}>
            <Head title="My Study Groups" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Study Groups</h1>
                    <p className="text-gray-500 mt-1">Collaborate and share resources with your peers</p>
                </div>
                <Link
                    href="/student/groups/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    + Create Group
                </Link>
            </div>

            {myGroups.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-lg font-medium">No groups yet</p>
                    <p className="text-sm mb-4">Create a group or ask a friend to invite you</p>
                    <Link
                        href="/student/groups/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                        Create a Group
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {myGroups.map((group) => (
                        <div key={group.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">👥</span>
                                <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${group.role === 'leader' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {group.role}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">{group.name}</h3>
                                {group.description && (
                                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{group.description}</p>
                                )}
                                <p className="text-gray-400 text-xs mt-2">
                                    👤 {group.member_count} members • Created by {group.created_by}
                                </p>
                            </div>
                            
                            <Link
                            href={`/student/groups/${group.id}`}
                            className="mt-auto bg-blue-600 hover:bg-blue-700 text-white text-sm text-center py-2 rounded-lg transition"
                            >
                            Open Group →
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}