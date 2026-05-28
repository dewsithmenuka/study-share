import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

const icons = { pdf: '📕', pptx: '📊', docx: '📝' };

export default function MemberProfile({ auth, member, sharedGroups, resources }) {
    return (
        <MainLayout auth={auth}>
            <Head title={member.name + "'s Profile"} />

            <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition mb-5">
                ← Back
            </button>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="flex-shrink-0">
                    {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full object-cover border-2 border-blue-100" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                            {member.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-bold text-gray-800">{member.name}</h1>
                    {member.bio && <p className="text-gray-500 mt-1 text-sm max-w-md">{member.bio}</p>}
                    <p className="text-gray-400 text-xs mt-2">📅 Joined {member.joined}</p>
                    <div className="flex gap-4 mt-3 justify-center sm:justify-start">
                        <div className="text-center">
                            <p className="text-lg font-bold text-blue-600">{resources.length}</p>
                            <p className="text-xs text-gray-500">Resources</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-purple-600">{sharedGroups.length}</p>
                            <p className="text-xs text-gray-500">Shared Groups</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h2 className="font-semibold text-gray-800 mb-4">👥 Groups in Common</h2>
                        {sharedGroups.length === 0 ? (
                            <p className="text-sm text-gray-400">No shared groups.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {sharedGroups.map(g => (
                                    <Link key={g.id} href={`/student/groups/${g.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">
                                            {g.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm text-gray-700 truncate">{g.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h2 className="font-semibold text-gray-800 mb-4">📚 Uploaded Resources ({resources.length})</h2>
                        {resources.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-3xl mb-2">📭</p>
                                <p className="text-sm">No resources uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {resources.map(r => (
                                    <div key={r.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-xl flex-shrink-0">{icons[r.file_type] || '📄'}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                                                <p className="text-xs text-gray-500">{r.subject} · {r.semester}</p>
                                                <p className="text-xs text-gray-400">{r.uploaded}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => window.location.href = '/student/download/' + r.id}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition flex-shrink-0"
                                        >
                                            ↓
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
