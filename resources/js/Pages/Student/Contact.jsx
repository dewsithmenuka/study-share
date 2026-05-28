import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';

export default function Contact({ auth, previousMessages }) {
    const { props } = usePage();
    const { theme } = useTheme();
    const dark = theme === 'dark';
    const flash = props.flash || {};

    const [form, setForm] = useState({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        subject: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!form.name) newErrors.name = 'Name is required.';
        else if (!/^[a-zA-Z\s]+$/.test(form.name)) newErrors.name = 'Name can only contain letters and spaces.';
        if (!form.email) newErrors.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Please enter a valid email.';
        if (!form.subject) newErrors.subject = 'Subject is required.';
        if (!form.message) newErrors.message = 'Message is required.';
        else if (form.message.length < 10) newErrors.message = 'Message must be at least 10 characters.';
        else if (form.message.length > 1000) newErrors.message = 'Message cannot exceed 1000 characters.';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setSending(true);
        router.post('/student/contact', form, {
            onSuccess: () => {
                setForm({ ...form, subject: '', message: '' });
                setErrors({});
            },
            onError: (e) => setErrors(e),
            onFinish: () => setSending(false),
        });
    };

    // Reusable class strings
    const inputClass = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        dark
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
    }`;
    const labelClass = `block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`;
    const cardClass = `rounded-xl shadow-sm p-6 mb-6 ${dark ? 'bg-gray-800' : 'bg-white'}`;

    return (
        <MainLayout auth={auth}>
            <Head title="Contact Admin" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Contact Admin</h1>
                    <p className={dark ? 'text-gray-400 mt-1' : 'text-gray-500 mt-1'}>Have a question or issue? Send a message to the admin.</p>
                </div>

                {flash.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 flex items-center gap-2">
                        ✅ <span>{flash.success}</span>
                    </div>
                )}

                <div className={cardClass}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Your Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className={inputClass}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Email Address</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className={inputClass}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Subject</label>
                            <input
                                type="text"
                                value={form.subject}
                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                placeholder="e.g. Issue with file upload"
                                className={inputClass}
                            />
                            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Message</label>
                            <textarea
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                placeholder="Describe your issue or question in detail..."
                                rows={5}
                                className={inputClass}
                            />
                            <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{form.message.length}/1000 characters</p>
                            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg transition"
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>

                {/* Previous messages */}
                {previousMessages.length > 0 && (
                    <div>
                        <h2 className={`text-lg font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-800'}`}>Previous Messages</h2>
                        <div className="flex flex-col gap-3">
                            {previousMessages.map((msg) => (
                                <div key={msg.id} className={`rounded-xl shadow-sm p-4 border-l-4 border-blue-400 ${dark ? 'bg-gray-800' : 'bg-white'}`}>
                                    <p className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-700'}`}>📌 {msg.subject}</p>
                                    <p className={`text-sm mt-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{msg.message}</p>
                                    <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{msg.created_at}</p>
                                    {msg.reply ? (
                                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                            <p className="text-xs font-medium text-green-700 mb-1">✅ Admin replied — {msg.replied_at}</p>
                                            <p className="text-sm text-green-800">{msg.reply}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                            <p className="text-xs text-yellow-700">⏳ Awaiting admin reply...</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`rounded-xl p-4 mt-4 ${dark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50'}`}>
                    <p className={`text-sm font-medium ${dark ? 'text-blue-300' : 'text-blue-700'}`}>📌 Note</p>
                    <p className={`text-xs mt-1 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>The admin typically responds within 24 hours.</p>
                </div>
            </div>
        </MainLayout>
    );
}
