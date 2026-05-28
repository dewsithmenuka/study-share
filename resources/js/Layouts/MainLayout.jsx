import { Link, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import PomodoroWidget from '@/Components/PomodoroWidget';

export default function MainLayout({ children, auth }) {
    const { theme, toggleTheme } = useTheme();
    const dark = theme === 'dark';
    const isAdmin = auth?.user?.roles?.some(r => r.name === 'admin');
    const [menuOpen,       setMenuOpen]       = useState(false);
    const [notifOpen,      setNotifOpen]      = useState(false);
    const [notifications,  setNotifications]  = useState([]);
    const [unread,         setUnread]         = useState(0);
    const [clearing,       setClearing]       = useState(false);
    const notifRef = useRef(null);

    const handleLogout = () => router.post('/logout');

    useEffect(() => { setMenuOpen(false); }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isAdmin && auth?.user) {
            fetch('/student/notifications', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            })
            .then(res => res.json())
            .then(data => {
                setNotifications(data.notifications || []);
                setUnread(data.unread || 0);
            })
            .catch(() => {});

            if (window.Echo) {
                window.Echo.private('user.' + auth.user.id)
                    .listen('.resource.status.changed', (e) => {
                        setNotifications(prev => [{ id: Date.now(), data: e, read_at: null, created_at: 'Just now' }, ...prev]);
                        setUnread(prev => prev + 1);
                    })
                    .listen('.group.member.added', (e) => {
                        setNotifications(prev => [{ id: Date.now(), data: e, read_at: null, created_at: 'Just now' }, ...prev]);
                        setUnread(prev => prev + 1);
                    })
                    .listen('.contact.replied', (e) => {
                        setNotifications(prev => [{ id: Date.now(), data: e, read_at: null, created_at: 'Just now' }, ...prev]);
                        setUnread(prev => prev + 1);
                    });
            }
        }
    }, [auth?.user?.id]);

    const getCsrf = () => document.head.querySelector('meta[name="csrf-token"]')?.content || '';

    const markAllRead = () => {
        fetch('/student/notifications/read', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrf(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        }).then(() => {
            setUnread(0);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        });
    };

    const clearReadNotifications = async () => {
        setClearing(true);
        try {
            await fetch('/student/notifications/clear', {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            setNotifications(prev => prev.filter(n => !n.read_at));
        } catch (e) {
            console.error(e);
        } finally {
            setClearing(false);
        }
    };

    const readCount = notifications.filter(n => n.read_at).length;

    const studentLinks = [
        { href: '/student/dashboard',   label: 'Dashboard', icon: '🏠' },
        { href: '/student/library',     label: 'Library',   icon: '📚' },
        { href: '/student/browse',      label: 'Browse',    icon: '🔍' },
        { href: '/student/upload',      label: 'Upload',    icon: '📤' },
        { href: '/student/favorites',   label: 'Favorites', icon: '❤️' },
        { href: '/student/groups',      label: 'Groups',    icon: '👥' },
        { href: '/student/ai-analyzer', label: 'AI',        icon: '🤖' },
        { href: '/student/pomodoro',    label: 'Pomodoro',  icon: '🍅' },
        { href: '/student/contact',     label: 'Contact',   icon: '✉️' },
        { href: '/student/profile',     label: 'Profile',   icon: '👤' },
    ];

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/admin/resources', label: 'Resources', icon: '📁' },
        { href: '/admin/users',     label: 'Users',     icon: '👥' },
        { href: '/admin/contact',   label: 'Messages',  icon: '✉️' },
    ];

    const links  = isAdmin ? adminLinks : studentLinks;
    const navBg  = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

    // ── Single return ─────────────────────────────────────────────────────────
    return (
        <>
            <Head>
                <title>StudyShare - AI Powered Student Collaboration Platform</title>
                <meta name="description" content="StudyShare is an AI-powered academic collaboration platform where university students can share resources, study together, chat in groups, and use AI tools for learning." />
                <meta name="keywords" content="student platform, AI study assistant, academic resource sharing, university collaboration, real-time chat" />
                <meta property="og:title" content="StudyShare" />
                <meta property="og:description" content="AI-powered student collaboration platform for university students." />
                <meta property="og:image" content="/preview.png" />
                <meta property="og:url" content="https://studyshareapp.tech" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="StudyShare" />
                <meta name="twitter:description" content="AI-powered student collaboration platform" />
                <meta name="twitter:image" content="/preview.png" />
                <link rel="canonical" href="https://studyshareapp.tech" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            </Head>

            <div className={'min-h-screen transition-colors duration-300 ' + (dark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900')}>

                {/* ── Navbar ── */}
                <nav className={'fixed top-0 left-0 right-0 z-40 border-b shadow-sm transition-colors ' + navBg}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">

                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                                <img
                                    src="/images/studyshare-logo.svg"
                                    alt="StudyShare"
                                    className="h-8 w-auto"
                                />
                            </Link>

                            {/* Desktop nav links */}
                            <div className="hidden lg:flex items-center gap-1">
                                {links.map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={'px-3 py-2 rounded-lg text-sm font-medium transition ' + (dark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            {/* Right-side actions */}
                            <div className="flex items-center gap-2">

                                {/* Theme toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className={'w-9 h-9 rounded-full flex items-center justify-center transition ' + (dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}
                                >
                                    {dark ? '☀️' : '🌙'}
                                </button>

                                {/* Notifications (students only) */}
                                {!isAdmin && auth?.user && (
                                    <div className="relative" ref={notifRef}>
                                        <button
                                            onClick={() => { setNotifOpen(!notifOpen); if (unread > 0) markAllRead(); }}
                                            className={'w-9 h-9 rounded-full flex items-center justify-center transition relative ' + (dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}
                                        >
                                            <span>🔔</span>
                                            {unread > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                    {unread > 9 ? '9+' : unread}
                                                </span>
                                            )}
                                        </button>

                                        {notifOpen && (
                                            <div className={'absolute right-0 top-11 w-72 sm:w-80 rounded-xl shadow-xl z-50 overflow-hidden border ' + (dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
                                                <div className={'px-4 py-3 border-b flex items-center justify-between ' + (dark ? 'border-gray-700' : 'border-gray-100')}>
                                                    <h3 className={'font-semibold text-sm ' + (dark ? 'text-white' : 'text-gray-800')}>
                                                        Notifications
                                                        {notifications.length > 0 && (
                                                            <span className={'ml-2 text-xs font-normal ' + (dark ? 'text-gray-400' : 'text-gray-500')}>
                                                                ({notifications.length})
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        {readCount > 0 && (
                                                            <button
                                                                onClick={clearReadNotifications}
                                                                disabled={clearing}
                                                                className={'text-xs px-2 py-1 rounded-lg transition ' + (dark ? 'bg-gray-700 hover:bg-red-900 text-gray-400 hover:text-red-400' : 'bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500')}
                                                                title="Clear read notifications"
                                                            >
                                                                {clearing ? '...' : `🗑 Clear read (${readCount})`}
                                                            </button>
                                                        )}
                                                        <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                                                    </div>
                                                </div>

                                                <div className="max-h-64 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <p className="text-2xl mb-1">🔔</p>
                                                            <p className={'text-sm ' + (dark ? 'text-gray-400' : 'text-gray-500')}>No notifications yet</p>
                                                        </div>
                                                    ) : (
                                                        notifications.slice(0, 10).map((n, i) => (
                                                            <div
                                                                key={n.id || i}
                                                                className={'px-4 py-3 border-b last:border-0 ' +
                                                                    (dark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-50 hover:bg-gray-50') +
                                                                    (!n.read_at ? (dark ? ' bg-blue-900/20' : ' bg-blue-50') : '')
                                                                }
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <p className={'text-sm flex-1 ' + (dark ? 'text-gray-200' : 'text-gray-700')}>
                                                                        {!n.read_at && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1.5 mb-0.5"></span>}
                                                                        {n.data?.message}
                                                                    </p>
                                                                </div>
                                                                <p className={'text-xs mt-1 ' + (dark ? 'text-gray-500' : 'text-gray-400')}>{n.created_at}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {notifications.length > 0 && (
                                                    <div className={'px-4 py-2 border-t text-center ' + (dark ? 'border-gray-700' : 'border-gray-100')}>
                                                        <p className={'text-xs ' + (dark ? 'text-gray-500' : 'text-gray-400')}>
                                                            {readCount > 0
                                                                ? `${readCount} read · ${notifications.length - readCount} unread`
                                                                : `${notifications.length} unread`
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* User avatar + name */}
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {auth?.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={'text-sm hidden md:block ' + (dark ? 'text-gray-300' : 'text-gray-600')}>
                                        {auth?.user?.name}
                                    </span>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="hidden sm:block bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
                                >
                                    Logout
                                </button>

                                {/* Mobile hamburger */}
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className={'lg:hidden w-9 h-9 rounded-lg flex items-center justify-center transition ' + (dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <span className={'block w-5 h-0.5 transition-all ' + (dark ? 'bg-gray-300' : 'bg-gray-600') + (menuOpen ? ' rotate-45 translate-y-2' : '')}></span>
                                        <span className={'block w-5 h-0.5 transition-all ' + (dark ? 'bg-gray-300' : 'bg-gray-600') + (menuOpen ? ' opacity-0' : '')}></span>
                                        <span className={'block w-5 h-0.5 transition-all ' + (dark ? 'bg-gray-300' : 'bg-gray-600') + (menuOpen ? ' -rotate-45 -translate-y-2' : '')}></span>
                                    </div>
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {menuOpen && (
                        <div className={'lg:hidden border-t ' + (dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white')}>
                            <div className="px-4 py-3 flex flex-col gap-1">
                                {links.map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className={'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ' + (dark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}
                                    >
                                        <span>{link.icon}</span>
                                        {link.label}
                                    </Link>
                                ))}
                                <div className={'mt-2 pt-2 border-t flex items-center justify-between ' + (dark ? 'border-gray-700' : 'border-gray-100')}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                            {auth?.user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={'text-sm font-medium ' + (dark ? 'text-white' : 'text-gray-800')}>{auth?.user?.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                {/* ── Page content ── */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">
                    {children}
                </main>

                {/* ── Global draggable Pomodoro widget (students only) ── */}
                {!isAdmin && auth?.user && <PomodoroWidget />}

            </div>
        </>
    );
}