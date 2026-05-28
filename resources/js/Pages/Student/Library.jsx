import { Head, router, usePage, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';

export default function Library({ auth, resources }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';
    const { props } = usePage();
    const flash = props.flash || {};
    const icons = { pdf: '📕', pptx: '📊', docx: '📝' };

    const visibilityBadge = (visibility) => {
        if (visibility === 'public') return 'bg-green-100 text-green-700';
        if (visibility === 'pending') return 'bg-yellow-100 text-yellow-700';
        return 'bg-gray-100 text-gray-600';
    };

    const visibilityLabel = (visibility) => {
        if (visibility === 'public') return '✅ Public';
        if (visibility === 'pending') return '⏳ Pending Review';
        return '🔒 Private';
    };

    const handleShare = (id) => {
        if (confirm('Submit this file for public sharing? Admin will review it.')) {
            router.post('/student/share/' + id);
        }
    };

    const handleDelete = (id) => {
        if (confirm('Delete this file? This cannot be undone.')) {
            router.delete('/student/library/' + id);
        }
    };

    return (
        <MainLayout auth={auth}>
            <Head title="My Library" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className={'text-2xl font-bold ' + (dark ? 'text-white' : 'text-gray-800')}>My Library</h1>
                    <p className={dark ? 'text-gray-400' : 'text-gray-500'}>Your personal file collection — private by default</p>
                </div>
                <Link href="/student/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    + Upload File
                </Link>
            </div>

            {flash.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 flex items-center gap-2">
                    ✅ <span>{flash.success}</span>
                </div>
            )}
            {flash.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-2">
                    ❌ <span>{flash.error}</span>
                </div>
            )}

            <div className={'rounded-xl p-4 mb-6 flex flex-wrap gap-4 text-sm ' + (dark ? 'bg-gray-800' : 'bg-blue-50')}>
                <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">🔒 Private</span>
                    <span className={dark ? 'text-gray-400' : 'text-gray-600'}>Only you can see this</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">⏳ Pending</span>
                    <span className={dark ? 'text-gray-400' : 'text-gray-600'}>Waiting for admin approval</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">✅ Public</span>
                    <span className={dark ? 'text-gray-400' : 'text-gray-600'}>Visible to all students</span>
                </div>
            </div>

            {resources.length === 0 ? (
                <div className={'rounded-xl p-16 text-center ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm')}>
                    <p className="text-4xl mb-3">📂</p>
                    <p className={'text-lg font-medium mb-1 ' + (dark ? 'text-white' : 'text-gray-800')}>Your library is empty</p>
                    <p className={'text-sm mb-4 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>Upload your first file to get started</p>
                    <Link href="/student/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
                        Upload a File
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {resources.map((r) => (
                        <div key={r.id} className={'rounded-xl p-5 flex flex-col gap-3 ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm')}>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{icons[r.file_type] || '📄'}</span>
                                <span className={'text-xs px-2 py-1 rounded font-medium ' + visibilityBadge(r.visibility)}>
                                    {visibilityLabel(r.visibility)}
                                </span>
                            </div>
                            <div>
                                <h3 className={'font-semibold text-sm leading-tight ' + (dark ? 'text-white' : 'text-gray-800')}>{r.title}</h3>
                                <p className={'text-xs mt-1 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>{r.subject} • {r.semester}</p>
                                <p className={'text-xs mt-1 ' + (dark ? 'text-gray-500' : 'text-gray-400')}>{r.created_at}</p>
                            </div>
                            {r.description && (
                                <p className={'text-xs line-clamp-2 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>{r.description}</p>
                            )}
                            <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.location.href = '/student/download/' + r.id}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-lg text-center transition"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className={'text-xs px-3 py-1.5 rounded-lg transition ' + (dark ? 'bg-gray-700 hover:bg-red-900 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600')}
                                    >
                                        Delete
                                    </button>
                                </div>
                                {r.visibility === 'private' && (
                                    <button
                                        onClick={() => handleShare(r.id)}
                                        className={'w-full text-xs py-1.5 rounded-lg border-2 border-dashed transition ' + (dark ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400' : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600')}
                                    >
                                        🌐 Share to Public
                                    </button>
                                )}
                                {r.visibility === 'pending' && (
                                    <p className={'text-xs text-center ' + (dark ? 'text-yellow-400' : 'text-yellow-600')}>
                                        Waiting for admin approval...
                                    </p>
                                )}
                                {r.visibility === 'public' && (
                                    <p className={'text-xs text-center ' + (dark ? 'text-green-400' : 'text-green-600')}>
                                        Visible to all students ✅
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}
