import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';

export default function Dashboard({ auth, stats, resourcesByType, resourcesBySubject, userGrowth, topUploaders, recentResources, pending_resources }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';

    const card = 'rounded-xl p-5 ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm');

    const statCards = [
        { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'bg-blue-500' },
        { label: 'Total Resources', value: stats.total_resources, icon: '📁', color: 'bg-purple-500' },
        { label: 'Pending Approval', value: stats.pending, icon: '⏳', color: 'bg-yellow-500' },
        { label: 'Public Resources', value: stats.approved, icon: '✅', color: 'bg-green-500' },
        { label: 'Study Groups', value: stats.total_groups, icon: '👥', color: 'bg-teal-500' },
        { label: 'Chat Messages', value: stats.total_messages, icon: '💬', color: 'bg-indigo-500' },
        { label: 'Unread Contacts', value: stats.unread_contacts, icon: '✉️', color: 'bg-red-500' },
        { label: 'Private Files', value: stats.private_files, icon: '🔒', color: 'bg-gray-500' },
    ];

    const maxSubject = Math.max(...(resourcesBySubject?.map(r => r.count) || [1]));
    const maxUploader = Math.max(...(topUploaders?.map(u => u.count) || [1]));

    return (
        <MainLayout auth={auth}>
            <Head title="Admin Dashboard" />

            <div className="mb-6">
                <h1 className={'text-2xl font-bold ' + (dark ? 'text-white' : 'text-gray-800')}>Admin Dashboard</h1>
                <p className={dark ? 'text-gray-400' : 'text-gray-500'}>Platform overview and analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className={card + ' flex items-center gap-3'}>
                        <div className={'w-10 h-10 rounded-lg ' + stat.color + ' flex items-center justify-center text-xl flex-shrink-0'}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className={'text-xs ' + (dark ? 'text-gray-400' : 'text-gray-500')}>{stat.label}</p>
                            <p className={'text-xl font-bold ' + (dark ? 'text-white' : 'text-gray-800')}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Resources by Type */}
                <div className={card}>
                    <h2 className={'font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>📊 Resources by File Type</h2>
                    <div className="flex flex-col gap-3">
                        {resourcesByType?.map((r) => (
                            <div key={r.type} className="flex items-center gap-3">
                                <span className={'text-xs font-medium w-12 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>{r.type}</span>
                                <div className={'flex-1 h-6 rounded-lg overflow-hidden ' + (dark ? 'bg-gray-700' : 'bg-gray-100')}>
                                    <div
                                        className="h-full bg-blue-500 rounded-lg flex items-center px-2 transition-all"
                                        style={{ width: Math.max((r.count / (stats.total_resources || 1)) * 100, 5) + '%' }}
                                    >
                                        <span className="text-white text-xs font-bold">{r.count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!resourcesByType || resourcesByType.length === 0) && (
                            <p className={'text-sm ' + (dark ? 'text-gray-500' : 'text-gray-400')}>No resources yet.</p>
                        )}
                    </div>
                </div>

                {/* Top Subjects */}
                <div className={card}>
                    <h2 className={'font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>📚 Top Subjects</h2>
                    <div className="flex flex-col gap-3">
                        {resourcesBySubject?.map((r, i) => (
                            <div key={r.subject} className="flex items-center gap-3">
                                <span className={'text-xs font-bold w-5 ' + (dark ? 'text-gray-400' : 'text-gray-400')}>#{i + 1}</span>
                                <span className={'text-xs flex-1 truncate ' + (dark ? 'text-gray-300' : 'text-gray-700')}>{r.subject}</span>
                                <div className={'w-24 h-4 rounded-full overflow-hidden ' + (dark ? 'bg-gray-700' : 'bg-gray-100')}>
                                    <div
                                        className="h-full bg-purple-500 rounded-full"
                                        style={{ width: (r.count / maxSubject) * 100 + '%' }}
                                    ></div>
                                </div>
                                <span className={'text-xs font-bold w-6 text-right ' + (dark ? 'text-white' : 'text-gray-800')}>{r.count}</span>
                            </div>
                        ))}
                        {(!resourcesBySubject || resourcesBySubject.length === 0) && (
                            <p className={'text-sm ' + (dark ? 'text-gray-500' : 'text-gray-400')}>No data yet.</p>
                        )}
                    </div>
                </div>

                {/* Top Uploaders */}
                <div className={card}>
                    <h2 className={'font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>🏆 Top Uploaders</h2>
                    <div className="flex flex-col gap-3">
                        {topUploaders?.map((u, i) => (
                            <div key={u.name} className="flex items-center gap-3">
                                <div className={'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ' + ['bg-yellow-500', 'bg-gray-400', 'bg-orange-400', 'bg-blue-400', 'bg-purple-400'][i]}>
                                    {i + 1}
                                </div>
                                <span className={'text-sm flex-1 ' + (dark ? 'text-gray-300' : 'text-gray-700')}>{u.name}</span>
                                <div className={'w-24 h-4 rounded-full overflow-hidden ' + (dark ? 'bg-gray-700' : 'bg-gray-100')}>
                                    <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: (u.count / maxUploader) * 100 + '%' }}
                                    ></div>
                                </div>
                                <span className={'text-xs font-bold w-6 text-right ' + (dark ? 'text-white' : 'text-gray-800')}>{u.count}</span>
                            </div>
                        ))}
                        {(!topUploaders || topUploaders.length === 0) && (
                            <p className={'text-sm ' + (dark ? 'text-gray-500' : 'text-gray-400')}>No uploaders yet.</p>
                        )}
                    </div>
                </div>

                {/* User Growth */}
                <div className={card}>
                    <h2 className={'font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>📈 User Growth (Last 6 Months)</h2>
                    {userGrowth && userGrowth.length > 0 ? (
                        <div className="flex items-end gap-2 h-32">
                            {userGrowth.map((g) => {
                                const maxCount = Math.max(...userGrowth.map(x => x.count));
                                const height = Math.max((g.count / maxCount) * 100, 5);
                                return (
                                    <div key={g.month} className="flex-1 flex flex-col items-center gap-1">
                                        <span className={'text-xs font-bold ' + (dark ? 'text-white' : 'text-gray-800')}>{g.count}</span>
                                        <div
                                            className="w-full bg-blue-500 rounded-t-lg transition-all"
                                            style={{ height: height + '%' }}
                                        ></div>
                                        <span className={'text-xs ' + (dark ? 'text-gray-400' : 'text-gray-500')} style={{fontSize: '10px'}}>{g.month.split(' ')[0]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className={'text-sm ' + (dark ? 'text-gray-500' : 'text-gray-400')}>No growth data yet.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className={card}>
                    <h2 className={'font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>🕐 Recent Uploads</h2>
                    <div className="flex flex-col gap-2">
                        {recentResources?.map((r, i) => (
                            <div key={i} className={'flex items-center gap-3 p-2 rounded-lg ' + (dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50')}>
                                <span className="text-lg">{r.file_type === 'pdf' ? '📕' : r.file_type === 'pptx' ? '📊' : '📝'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={'text-sm font-medium truncate ' + (dark ? 'text-white' : 'text-gray-800')}>{r.title}</p>
                                    <p className={'text-xs ' + (dark ? 'text-gray-400' : 'text-gray-500')}>by {r.user} • {r.created_at}</p>
                                </div>
                                <span className={'text-xs px-2 py-0.5 rounded-full capitalize ' + (r.visibility === 'public' ? 'bg-green-100 text-green-700' : r.visibility === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500')}>
                                    {r.visibility}
                                </span>
                            </div>
                        ))}
                        {(!recentResources || recentResources.length === 0) && (
                            <p className={'text-sm ' + (dark ? 'text-gray-500' : 'text-gray-400')}>No recent uploads.</p>
                        )}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className={card}>
                    <h2 className={'font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>⏳ Pending Approvals</h2>
                    {pending_resources.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-3xl mb-2">✅</p>
                            <p className={'text-sm ' + (dark ? 'text-gray-400' : 'text-gray-500')}>All caught up! No pending approvals.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {pending_resources.map((r) => (
                                <div key={r.id} className={'flex items-center justify-between p-2 rounded-lg ' + (dark ? 'bg-gray-700' : 'bg-gray-50')}>
                                    <div className="flex-1 min-w-0">
                                        <p className={'text-sm font-medium truncate ' + (dark ? 'text-white' : 'text-gray-800')}>{r.title}</p>
                                        <p className={'text-xs ' + (dark ? 'text-gray-400' : 'text-gray-500')}>by {r.user?.name}</p>
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                        <button
                                            onClick={() => router.patch('/admin/resources/' + r.id + '/approve-public')}
                                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => router.patch('/admin/resources/' + r.id + '/reject-public')}
                                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}