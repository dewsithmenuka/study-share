import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Favorites({ auth, favorites }) {
    const icons = { pdf: '📕', pptx: '📊', docx: '📝' };

    return (
        <MainLayout auth={auth}>
            <Head title="My Favorites" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Favorites</h1>
                <p className="text-gray-500 mt-1">Resources you've saved for later</p>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">🤍</p>
                    <p className="text-lg font-medium">No favorites yet</p>
                    <p className="text-sm mb-4">Browse resources and click the heart to save them here</p>
                    <Link href="/student/browse" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                        Browse Resources
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {favorites.map((r) => (
                        <div key={r.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{icons[r.file_type] || '📄'}</span>
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded uppercase font-medium">
                                    {r.file_type}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-sm">{r.title}</h3>
                                <p className="text-gray-500 text-xs mt-1">{r.subject} • {r.semester}</p>
                                <p className="text-gray-400 text-xs mt-1">by {r.uploaded_by}</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                                <span className="text-yellow-500 text-xs">
                                    ⭐ {r.average_rating > 0 ? r.average_rating : 'No ratings'}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.post(`/student/favorite/${r.id}`)}
                                        className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded hover:bg-red-200 transition"
                                    >
                                        ❤️ Remove
                                    </button>
                                    <Link
                                        href={`/student/download/${r.id}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition"
                                    >
                                        Download
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}