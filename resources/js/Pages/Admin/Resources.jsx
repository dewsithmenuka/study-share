import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';

export default function Resources({ auth, resources }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';
    const [filter, setFilter] = useState('all');

    const filtered = resources.data.filter(r => {
        if (filter === 'pending') return r.visibility === 'pending';
        if (filter === 'public') return r.visibility === 'public';
        if (filter === 'private') return r.visibility === 'private';
        return true;
    });

    const visibilityBadge = (v) => {
        if (v === 'public') return 'bg-green-100 text-green-700';
        if (v === 'pending') return 'bg-yellow-100 text-yellow-700';
        return 'bg-gray-100 text-gray-500';
    };

    const pendingCount = resources.data.filter(r => r.visibility === 'pending').length;

    return (
        <MainLayout auth={auth}>
            <Head title="Manage Resources" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className={'text-2xl font-bold ' + (dark ? 'text-white' : 'text-gray-800')}>Manage Resources</h1>
                    {pendingCount > 0 && (
                        <p className="text-yellow-600 font-medium text-sm mt-1">⏳ {pendingCount} pending public share request{pendingCount > 1 ? 's' : ''}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'public', 'private'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ' + (filter === f ? 'bg-blue-600 text-white' : (dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'))}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className={'rounded-xl overflow-hidden ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm')}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                            {/* existing table content */}
                <table className="w-full text-sm">
                    <thead className={dark ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr className={'text-left ' + (dark ? 'text-gray-300' : 'text-gray-500')}>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Uploaded By</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Visibility</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={'text-center py-8 ' + (dark ? 'text-gray-500' : 'text-gray-400')}>No resources found.</td>
                            </tr>
                        ) : filtered.map((r) => (
                            <tr key={r.id} className={'border-t ' + (dark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50')}>
                                <td className={'px-4 py-3 font-medium ' + (dark ? 'text-white' : 'text-gray-800')}>{r.title}</td>
                                <td className={'px-4 py-3 ' + (dark ? 'text-gray-400' : 'text-gray-600')}>{r.subject}</td>
                                <td className={'px-4 py-3 ' + (dark ? 'text-gray-400' : 'text-gray-600')}>{r.user?.name}</td>
                                <td className="px-4 py-3">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs uppercase">{r.file_type}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={'px-2 py-1 rounded text-xs capitalize ' + visibilityBadge(r.visibility)}>{r.visibility}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 flex-wrap">
                                        {r.visibility === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => router.patch('/admin/resources/' + r.id + '/approve-public')}
                                                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition"
                                                >
                                                    Make Public
                                                </button>
                                                <button
                                                    onClick={() => router.patch('/admin/resources/' + r.id + '/reject-public')}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded transition"
                                                >
                                                    Keep Private
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => { if (confirm('Delete this resource?')) router.delete('/admin/resources/' + r.id); }}
                                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </table>
            </div>
            </div>
        </MainLayout>
    );
}
