import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect } from 'react';

const fileIcons = { pdf: '📕', pptx: '📊', docx: '📝' };

const quickLinks = [
    { href: '/student/browse',      icon: '🔍', label: 'Browse',    desc: 'Find resources',     color: 'from-blue-500 to-blue-600' },
    { href: '/student/upload',      icon: '📤', label: 'Upload',    desc: 'Share your notes',   color: 'from-purple-500 to-purple-600' },
    { href: '/student/groups',      icon: '👥', label: 'Groups',    desc: 'Study together',     color: 'from-green-500 to-green-600' },
    { href: '/student/ai-analyzer', icon: '🤖', label: 'AI Study',  desc: 'Analyze your PDFs',  color: 'from-orange-500 to-orange-600' },
    { href: '/student/favorites',   icon: '❤️', label: 'Favorites', desc: 'Saved resources',    color: 'from-red-500 to-red-600' },
    { href: '/student/library',     icon: '📚', label: 'Library',   desc: 'Your uploads',       color: 'from-teal-500 to-teal-600' },
];

function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
                <span key={s} className={`text-xs ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
            ))}
            <span className="text-xs text-gray-400 ml-1">{rating > 0 ? rating : 'No ratings'}</span>
        </div>
    );
}

export default function Dashboard({ auth, resources }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';
    const [greeting, setGreeting] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        const update = () => {
            const h = new Date().getHours();
            setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        update();
        const t = setInterval(update, 60000);
        return () => clearInterval(t);
    }, []);

    const card = 'rounded-2xl p-5 ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm');

    return (
        <MainLayout auth={auth}>
            <Head title="Dashboard" />

            {/* ── Hero greeting banner ── */}
            <div className={`rounded-2xl p-6 mb-6 relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600`}>
                {/* decorative circles */}
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-blue-200 text-sm font-medium">{time} · {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                            {greeting}, {auth.user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-blue-100 mt-1 text-sm">Ready to study? Here's what's new on StudyShare.</p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        <Link
                            href="/student/browse"
                            className="bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition"
                        >
                            Browse Resources
                        </Link>
                        <Link
                            href="/student/upload"
                            className="bg-blue-500/40 hover:bg-blue-500/60 text-white font-semibold text-sm px-4 py-2 rounded-xl transition border border-white/20"
                        >
                            Upload
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Quick action grid ── */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                {quickLinks.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="group flex flex-col items-center gap-2 p-3 rounded-2xl transition hover:scale-105"
                        style={{background: dark ? 'rgb(31,41,55)' : 'white', boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)'}}
                    >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-xl shadow-sm group-hover:shadow-md transition`}>
                            {link.icon}
                        </div>
                        <div className="text-center">
                            <p className={`text-xs font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>{link.label}</p>
                            <p className={`text-xs hidden sm:block ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{link.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── Recent resources ── */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>🆕 Recently Added</h2>
                    <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Latest approved resources from the community</p>
                </div>
                <Link href="/student/browse" className="text-sm text-blue-500 hover:text-blue-600 font-medium transition">
                    View all →
                </Link>
            </div>

            {resources.length === 0 ? (
                <div className={`${card} text-center py-16`}>
                    <p className="text-5xl mb-3">📭</p>
                    <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-700'}`}>No resources yet</p>
                    <p className={`text-sm mt-1 mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Be the first to upload a study resource!</p>
                    <Link href="/student/upload" className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition">
                        Upload Now
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map(r => (
                        <div
                            key={r.id}
                            className={`${card} flex flex-col gap-3 hover:shadow-md transition group cursor-pointer`}
                            onClick={() => window.location.href = '/student/download/' + r.id}
                        >
                            {/* File type badge + icon */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                                        r.file_type === 'pdf'  ? 'bg-red-50'    :
                                        r.file_type === 'pptx' ? 'bg-orange-50' : 'bg-blue-50'
                                    }`}>
                                        {fileIcons[r.file_type] || '📄'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold truncate group-hover:text-blue-600 transition ${dark ? 'text-white' : 'text-gray-800'}`}>
                                            {r.title}
                                        </p>
                                        <p className={`text-xs truncate ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {r.subject}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium uppercase ${
                                    r.file_type === 'pdf'  ? 'bg-red-100 text-red-600'    :
                                    r.file_type === 'pptx' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {r.file_type}
                                </span>
                            </div>

                            {/* Rating */}
                            <StarRating rating={r.average_rating} />

                            {/* Footer */}
                            <div className={`flex items-center justify-between pt-2 border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {r.uploaded_by.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`text-xs truncate max-w-24 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{r.uploaded_by}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{r.created_at}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                        Sem {r.semester}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Bottom CTA ── */}
            <div className={`mt-6 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${dark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0">
                        🤖
                    </div>
                    <div>
                        <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>Try the AI Study Assistant</p>
                        <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Upload any PDF and get a summary, quiz, and flashcards instantly</p>
                    </div>
                </div>
                <Link
                    href="/student/ai-analyzer"
                    className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-sm"
                >
                    Try AI Analyzer →
                </Link>
            </div>
        </MainLayout>
    );
}