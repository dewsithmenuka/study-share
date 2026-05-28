import { Link } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect } from 'react';

export default function Welcome() {
    const { theme, toggleTheme } = useTheme();
    const dark = theme === 'dark';
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={'min-h-screen transition-colors duration-300 ' + (dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900')}>

            {/* Navbar */}
            <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ' + (scrolled ? (dark ? 'bg-gray-900 shadow-lg' : 'bg-white shadow-lg') : 'bg-transparent')}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📚</span>
                        <span className={'font-bold text-xl ' + (dark ? 'text-white' : 'text-gray-800')}>StudyShare</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className={'w-10 h-10 rounded-full flex items-center justify-center transition ' + (dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}
                        >
                            {dark ? '☀️' : '🌙'}
                        </button>
                        <Link href="/login" className={'font-medium transition ' + (dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900')}>
                            Login
                        </Link>
                        <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className={'min-h-screen flex items-center justify-center relative overflow-hidden pt-20 ' + (dark ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50')}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className={'absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 ' + (dark ? 'bg-blue-600' : 'bg-blue-400')}></div>
                    <div className={'absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 ' + (dark ? 'bg-purple-600' : 'bg-purple-400')}></div>
                    <div className={'absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 ' + (dark ? 'bg-teal-600' : 'bg-teal-400')}></div>
                </div>

                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <div className={'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ' + (dark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700')}>
                        <span>✨</span>
                        <span>The smart way to study together</span>
                    </div>

                    <h1 className={'text-5xl md:text-7xl font-extrabold mb-6 leading-tight ' + (dark ? 'text-white' : 'text-gray-900')}>
                        Share Knowledge,
                        <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Grow Together
                        </span>
                    </h1>

                    <p className={'text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed ' + (dark ? 'text-gray-300' : 'text-gray-600')}>
                        A platform where students upload notes, share resources, form study groups, and chat — all in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition shadow-lg hover:shadow-blue-500/25"
                        >
                            Get Started Free →
                        </Link>
                        <Link
                            href="/login"
                            className={'text-lg px-8 py-4 rounded-xl font-semibold transition border-2 ' + (dark ? 'border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400')}
                        >
                            Sign In
                        </Link>
                    </div>

                    <div className={'mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto ' + (dark ? 'text-gray-400' : 'text-gray-500')}>
                        {[['500+', 'Resources'], ['50+', 'Study Groups'], ['100%', 'Free']].map(([num, label]) => (
                            <div key={label} className="text-center">
                                <p className={'text-3xl font-bold ' + (dark ? 'text-white' : 'text-gray-900')}>{num}</p>
                                <p className="text-sm">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className={'py-24 ' + (dark ? 'bg-gray-800' : 'bg-gray-50')}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className={'text-4xl font-bold mb-4 ' + (dark ? 'text-white' : 'text-gray-900')}>Everything you need to study smarter</h2>
                        <p className={'text-xl ' + (dark ? 'text-gray-400' : 'text-gray-600')}>Built for students, by students</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: '📁', title: 'Resource Sharing', desc: 'Upload and discover notes, past papers, and study materials from your peers.', color: 'from-blue-500 to-blue-600' },
                            { icon: '👥', title: 'Study Groups', desc: 'Create or join study groups, add friends, and collaborate on shared resources.', color: 'from-purple-500 to-purple-600' },
                            { icon: '💬', title: 'Group Chat', desc: 'Real-time messaging within your study groups. Share files directly in chat.', color: 'from-green-500 to-green-600' },
                            { icon: '⭐', title: 'Smart Ratings', desc: 'Rate resources to help the best content rise to the top for everyone.', color: 'from-yellow-500 to-yellow-600' },
                            { icon: '🔍', title: 'Smart Search', desc: 'Filter by subject, semester, or keyword to find exactly what you need.', color: 'from-red-500 to-red-600' },
                            { icon: '🛡️', title: 'Admin Control', desc: 'All resources are reviewed and approved by admins to ensure quality.', color: 'from-teal-500 to-teal-600' },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className={'rounded-2xl p-6 transition hover:scale-105 ' + (dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:shadow-xl shadow-sm')}
                            >
                                <div className={'w-12 h-12 rounded-xl bg-gradient-to-br ' + feature.color + ' flex items-center justify-center text-2xl mb-4'}>
                                    {feature.icon}
                                </div>
                                <h3 className={'text-lg font-semibold mb-2 ' + (dark ? 'text-white' : 'text-gray-900')}>{feature.title}</h3>
                                <p className={dark ? 'text-gray-400' : 'text-gray-600'}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className={'py-24 ' + (dark ? 'bg-gray-900' : 'bg-white')}>
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className={'text-4xl font-bold mb-4 ' + (dark ? 'text-white' : 'text-gray-900')}>How it works</h2>
                        <p className={'text-xl ' + (dark ? 'text-gray-400' : 'text-gray-600')}>Get started in 3 simple steps</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Create an account', desc: 'Sign up for free and set up your student profile in under a minute.', icon: '👤' },
                            { step: '02', title: 'Upload or browse', desc: 'Share your notes or discover resources uploaded by your classmates.', icon: '📤' },
                            { step: '03', title: 'Study together', desc: 'Join study groups, chat with friends, and ace your exams together.', icon: '🎓' },
                        ].map((item, i) => (
                            <div key={item.step} className="text-center relative">
                                {i < 2 && (
                                    <div className={'hidden md:block absolute top-8 left-full w-full h-0.5 ' + (dark ? 'bg-gray-700' : 'bg-gray-200')} style={{width: '50%', left: '75%'}}></div>
                                )}
                                <div className={'w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ' + (dark ? 'bg-gray-800' : 'bg-blue-50')}>
                                    {item.icon}
                                </div>
                                <span className="text-blue-600 font-bold text-sm">{item.step}</span>
                                <h3 className={'text-xl font-semibold mt-1 mb-2 ' + (dark ? 'text-white' : 'text-gray-900')}>{item.title}</h3>
                                <p className={dark ? 'text-gray-400' : 'text-gray-600'}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">Ready to study smarter?</h2>
                    <p className="text-blue-100 text-xl mb-8">Join thousands of students already using StudyShare</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-xl font-semibold transition shadow-lg"
                        >
                            Create Free Account
                        </Link>
                        <Link
                            href="/login"
                            className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 rounded-xl font-semibold transition"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={'py-8 text-center ' + (dark ? 'bg-gray-900 text-gray-500' : 'bg-gray-50 text-gray-400')}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xl">📚</span>
                    <span className="font-bold">StudyShare</span>
                </div>
                <p className="text-sm">Built for students. Made with ❤️</p>
            </footer>
        </div>
    );
}
