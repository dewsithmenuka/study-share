import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useState } from 'react';

export default function Contact({ auth, messages }) {
    const unreadCount = messages.filter(m => m.status === 'unread').length;
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    const handleReply = (msgId) => {
        if (!replyText.trim()) return;
        setSending(true);
        router.post('/admin/contact/' + msgId + '/reply', { reply: replyText }, {
            onSuccess: () => {
                setReplyingTo(null);
                setReplyText('');
            },
            onFinish: () => setSending(false),
        });
    };

    return (
        <MainLayout auth={auth}>
            <Head title="Contact Messages" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Contact Messages</h1>
                    <p className="text-gray-500 mt-1">
                        {unreadCount > 0 ? (
                            <span className="text-blue-600 font-medium">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</span>
                        ) : 'All messages read'}
                    </p>
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-lg font-medium">No messages yet</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={'bg-white rounded-xl shadow-sm p-5 border-l-4 ' + (msg.status === 'unread' ? 'border-blue-500' : 'border-gray-200')}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-800">{msg.name}</span>
                                        <span className="text-gray-400 text-xs">•</span>
                                        <span className="text-gray-500 text-xs">{msg.email}</span>
                                        {msg.status === 'unread' && (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">New</span>
                                        )}
                                        {msg.reply && (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Replied</span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">📌 {msg.subject}</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">{msg.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">{msg.created_at}</p>

                                    {/* Show existing reply */}
                                    {msg.reply && (
                                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                            <p className="text-xs font-medium text-green-700 mb-1">✅ Admin Reply — {msg.replied_at}</p>
                                            <p className="text-sm text-green-800">{msg.reply}</p>
                                        </div>
                                    )}

                                    {/* Reply form */}
                                    {replyingTo === msg.id && (
                                        <div className="mt-3">
                                            <textarea
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                placeholder="Type your reply..."
                                                rows={3}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleReply(msg.id)}
                                                    disabled={sending}
                                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-3 py-1 rounded transition"
                                                >
                                                    {sending ? 'Sending...' : 'Send Reply'}
                                                </button>
                                                <button
                                                    onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => { setReplyingTo(msg.id); setReplyText(msg.reply || ''); }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition whitespace-nowrap"
                                    >
                                        {msg.reply ? 'Edit Reply' : 'Reply'}
                                    </button>
                                    {msg.status === 'unread' && (
                                        <button
                                            onClick={() => router.patch('/admin/contact/' + msg.id + '/read')}
                                            className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded transition whitespace-nowrap"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { if (confirm('Delete this message?')) router.delete('/admin/contact/' + msg.id); }}
                                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}