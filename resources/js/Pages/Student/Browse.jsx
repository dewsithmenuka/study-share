import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';

export default function Browse({ auth, resources, categories, filters }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';

    const [search, setSearch]     = useState(filters.search || '');
    const [subject, setSubject]   = useState(filters.subject || '');
    const [semester, setSemester] = useState(filters.semester || '');

    const handleFilter = () => {
        router.get('/student/browse', { search, subject, semester }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch(''); setSubject(''); setSemester('');
        router.get('/student/browse');
    };

    const inputClass = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
    }`;
    const labelClass = `text-xs mb-1 block ${dark ? 'text-gray-400' : 'text-gray-500'}`;

    return (
        <MainLayout auth={auth}>
            <Head title="Browse Resources" />

            <div className="mb-6">
                <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Browse Resources</h1>
                <p className={dark ? 'text-gray-400 mt-1' : 'text-gray-500 mt-1'}>Find notes, past papers and study materials</p>
            </div>

            {/* Filters */}
            <div className={`rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end ${dark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex-1 min-w-[200px]">
                    <label className={labelClass}>Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleFilter()}
                        placeholder="Search by title or subject..."
                        className={inputClass}
                    />
                </div>
                <div className="min-w-[150px]">
                    <label className={labelClass}>Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="e.g. Mathematics"
                        className={inputClass}
                    />
                </div>
                <div className="min-w-[150px]">
                    <label className={labelClass}>Semester</label>
                    <select
                        value={semester}
                        onChange={e => setSemester(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">All Semesters</option>
                        {['Semester 1','Semester 2','Semester 3','Semester 4','Semester 5','Semester 6'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
                    Search
                </button>
                <button onClick={handleReset} className={`px-4 py-2 rounded-lg text-sm transition ${dark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                    Reset
                </button>
            </div>

            {/* Results */}
            {resources.data.length === 0 ? (
                <div className={`text-center py-16 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-lg font-medium">No resources found</p>
                    <p className="text-sm">Try a different search or be the first to upload!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {resources.data.map((r) => (
                        <ResourceCard key={r.id} resource={r} dark={dark} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {resources.links && (
                <div className="flex justify-center gap-2 mt-8">
                    {resources.links.map((link, i) => (
                        <button
                            key={i}
                            onClick={() => link.url && router.get(link.url)}
                            disabled={!link.url}
                            className={`px-3 py-1 rounded text-sm transition ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : dark
                                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                                        : 'bg-white text-gray-600 border'
                            } disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </MainLayout>
    );
}

function StarRating({ resourceId, currentRating }) {
    const [rating, setRating] = useState(currentRating || 0);
    const [hover, setHover]   = useState(0);

    const handleRate = (score) => {
        setRating(score);
        router.post(`/student/rate/${resourceId}`, { score }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="text-lg transition"
                >
                    <span className={hover >= star || rating >= star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                </button>
            ))}
        </div>
    );
}

function ResourceCard({ resource, dark }) {
    const icons = { pdf: '📕', pptx: '📊', docx: '📝' };

    const handleFavorite = () => {
        router.post(`/student/favorite/${resource.id}`);
    };

    return (
        <div className={`rounded-xl shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3 ${dark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
                <span className="text-2xl">{icons[resource.file_type] || '📄'}</span>
                <span className={`text-xs px-2 py-1 rounded uppercase font-medium ${dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    {resource.file_type}
                </span>
            </div>
            <div>
                <h3 className={`font-semibold text-sm leading-tight ${dark ? 'text-white' : 'text-gray-800'}`}>{resource.title}</h3>
                <p className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{resource.subject} • {resource.semester}</p>
                <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>by {resource.uploaded_by} • {resource.created_at}</p>
            </div>
            {resource.description && (
                <p className={`text-xs line-clamp-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{resource.description}</p>
            )}
            <div className={`flex flex-col gap-2 mt-auto pt-2 border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                    <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {resource.average_rating > 0 ? `⭐ ${resource.average_rating}` : 'No ratings yet'}
                    </span>
                    <StarRating resourceId={resource.id} currentRating={resource.user_rating} />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleFavorite}
                        className={`text-xs px-2 py-1 rounded transition ${
                            resource.is_favorited
                                ? 'bg-red-100 text-red-500'
                                : dark
                                    ? 'bg-gray-700 text-gray-400 hover:bg-red-900 hover:text-red-400'
                                    : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-400'
                        }`}
                    >
                        {resource.is_favorited ? '❤️ Saved' : '🤍 Save'}
                    </button>
                    <Link
                        href={`/student/download/${resource.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition"
                    >
                        Download
                    </Link>
                </div>
            </div>
        </div>
    );
}