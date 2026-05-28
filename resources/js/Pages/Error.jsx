import { Link } from '@inertiajs/react';

export default function Error({ status }) {
    const errors = {
        404: {
            title: 'Page Not Found',
            description: "Oops! The page you're looking for doesn't exist or has been moved.",
            icon: '🔍',
            color: 'from-blue-500 to-purple-600',
        },
        403: {
            title: 'Access Denied',
            description: "You don't have permission to access this page.",
            icon: '🔒',
            color: 'from-red-500 to-orange-600',
        },
        500: {
            title: 'Server Error',
            description: 'Something went wrong on our end. Please try again later.',
            icon: '⚠️',
            color: 'from-yellow-500 to-red-500',
        },
        503: {
            title: 'Service Unavailable',
            description: 'The service is temporarily unavailable. Please try again soon.',
            icon: '🔧',
            color: 'from-gray-500 to-gray-700',
        },
    };

    const error = errors[status] || errors[404];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                <div className={'w-24 h-24 rounded-full bg-gradient-to-br ' + error.color + ' flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg'}>
                    {error.icon}
                </div>
                <h1 className="text-8xl font-extrabold text-gray-200 mb-2">{status}</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{error.title}</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">{error.description}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition">
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition"
                    >
                        Go Back
                    </button>
                </div>
                <div className="mt-8 flex items-center justify-center gap-2">
                    <span className="text-xl">📚</span>
                    <span className="font-bold text-gray-400">StudyShare</span>
                </div>
            </div>
        </div>
    );
}