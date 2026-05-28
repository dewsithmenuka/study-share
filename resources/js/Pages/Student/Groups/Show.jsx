import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useRef } from 'react';

export default function Show({ auth, group, members, resources, userRole, availableResources }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';

    const [searchQuery, setSearchQuery]           = useState('');
    const [searchResults, setSearchResults]       = useState([]);
    const [searching, setSearching]               = useState(false);
    const [selectedResource, setSelectedResource] = useState('');
    const [flash, setFlash]                       = useState('');
    const [activeTab, setActiveTab]               = useState('resources');

    const [messages, setMessages]       = useState([]);
    const [chatInput, setChatInput]     = useState('');
    const [sendingChat, setSendingChat] = useState(false);
    const [chatLoading, setChatLoading] = useState(true);
    const chatEndRef = useRef(null);
    const pollRef    = useRef(null);

    const icons = { pdf: '📕', pptx: '📊', docx: '📝' };

    const getCsrf = () =>
        document.head.querySelector('meta[name="csrf-token"]')?.content ?? '';

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/student/groups/${group.id}/messages`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            if (res.ok) setMessages(await res.json());
        } catch (e) {
            console.error('Chat fetch error:', e);
        } finally {
            setChatLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        pollRef.current = setInterval(fetchMessages, 5000);
        return () => clearInterval(pollRef.current);
    }, []);

    useEffect(() => {
        if (activeTab === 'chat') {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [messages, activeTab]);

    const handleSendMessage = async () => {
        const trimmed = chatInput.trim();
        if (!trimmed || sendingChat) return;
        setSendingChat(true);
        try {
            await fetch(`/student/groups/${group.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ message: trimmed }),
            });
            setChatInput('');
            await fetchMessages();
        } catch (e) {
            console.error('Send error:', e);
        } finally {
            setSendingChat(false);
        }
    };

    const handleChatKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const showFlash = (msg) => {
        setFlash(msg);
        setTimeout(() => setFlash(''), 3000);
    };

    const handleSearch = async () => {
        if (searchQuery.length < 2) return;
        setSearching(true);
        try {
            const res = await fetch(`/student/groups/${group.id}/members/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ query: searchQuery }),
            });
            setSearchResults(await res.json());
        } catch (e) { console.error(e); }
        setSearching(false);
    };

    const handleInvite = (userId) => {
        router.post(`/student/groups/${group.id}/members/invite`, { user_id: userId }, {
            onSuccess: () => { setSearchResults([]); setSearchQuery(''); showFlash('Member added!'); },
        });
    };

    const handleShareResource = () => {
        if (!selectedResource) return;
        router.post(`/student/groups/${group.id}/resources`, { resource_id: selectedResource }, {
            onSuccess: () => { setSelectedResource(''); showFlash('Resource shared!'); },
        });
    };

    const handleLeave   = () => { if (confirm('Leave this group?')) router.delete(`/student/groups/${group.id}/leave`); };
    const handleDelete  = () => { if (confirm('Delete this group? Cannot be undone.')) router.delete(`/student/groups/${group.id}`); };

    const formatTime = (iso) => {
        if (!iso) return '';
        try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return ''; }
    };

    const tabs = [
        { key: 'resources', label: 'Resources', emoji: '📚' },
        { key: 'chat',      label: 'Chat',      emoji: '💬' },
        { key: 'members',   label: 'Members',   emoji: '👥' },
    ];

    return (
        <MainLayout auth={auth}>
            <Head title={group.name} />

            {flash && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-5 py-2 rounded-full shadow-lg text-sm font-medium">
                    {flash}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4 gap-3">
                <div className="min-w-0">
                    <h1 className={`text-xl sm:text-2xl font-bold truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{group.name}</h1>
                    {group.description && (
                        <p className={`mt-0.5 text-sm line-clamp-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{group.description}</p>
                    )}
                    <p className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Created by {group.created_by}</p>
                </div>
                <div className="flex-shrink-0">
                    {userRole === 'leader' ? (
                        <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm px-3 py-2 rounded-lg transition">
                            Delete Group
                        </button>
                    ) : (
                        <button onClick={handleLeave} className={`text-xs sm:text-sm px-3 py-2 rounded-lg transition ${dark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                            Leave
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile tab bar */}
            <div className={`flex lg:hidden border-b mb-4 ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex-1 py-2.5 text-xs font-medium flex flex-col items-center gap-0.5 transition border-b-2 ${
                            activeTab === t.key
                                ? 'border-blue-600 text-blue-600'
                                : `border-transparent ${dark ? 'text-gray-400' : 'text-gray-500'}`
                        }`}
                    >
                        <span>{t.emoji}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Desktop 3-column */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-5">
                <div className="flex flex-col gap-5">
                    <MembersPanel dark={dark} members={members} userRole={userRole} searchQuery={searchQuery} setSearchQuery={setSearchQuery} searching={searching} handleSearch={handleSearch} searchResults={searchResults} handleInvite={handleInvite} />
                </div>
                <div className="flex flex-col gap-5">
                    <ResourceSharePanel dark={dark} availableResources={availableResources} selectedResource={selectedResource} setSelectedResource={setSelectedResource} handleShareResource={handleShareResource} />
                    <ResourceListPanel dark={dark} resources={resources} icons={icons} />
                </div>
                <div>
                    <ChatPanel dark={dark} messages={messages} chatLoading={chatLoading} chatInput={chatInput} setChatInput={setChatInput} sendingChat={sendingChat} handleSendMessage={handleSendMessage} handleChatKeyDown={handleChatKeyDown} chatEndRef={chatEndRef} currentUserId={auth.user.id} formatTime={formatTime} desktop />
                </div>
            </div>

            {/* Mobile tab panels */}
            <div className="lg:hidden">
                {activeTab === 'members' && (
                    <div className="flex flex-col gap-4">
                        <MembersPanel dark={dark} members={members} userRole={userRole} searchQuery={searchQuery} setSearchQuery={setSearchQuery} searching={searching} handleSearch={handleSearch} searchResults={searchResults} handleInvite={handleInvite} />
                    </div>
                )}
                {activeTab === 'resources' && (
                    <div className="flex flex-col gap-4">
                        <ResourceSharePanel dark={dark} availableResources={availableResources} selectedResource={selectedResource} setSelectedResource={setSelectedResource} handleShareResource={handleShareResource} />
                        <ResourceListPanel dark={dark} resources={resources} icons={icons} />
                    </div>
                )}
                {activeTab === 'chat' && (
                    <ChatPanel dark={dark} messages={messages} chatLoading={chatLoading} chatInput={chatInput} setChatInput={setChatInput} sendingChat={sendingChat} handleSendMessage={handleSendMessage} handleChatKeyDown={handleChatKeyDown} chatEndRef={chatEndRef} currentUserId={auth.user.id} formatTime={formatTime} />
                )}
            </div>
        </MainLayout>
    );
}

// ── MembersPanel ──────────────────────────────────────────────────────────────
function MembersPanel({ dark, members, userRole, searchQuery, setSearchQuery, searching, handleSearch, searchResults, handleInvite }) {
    const card   = `rounded-xl shadow-sm p-5 ${dark ? 'bg-gray-800' : 'bg-white'}`;
    const input  = `flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'}`;

    return (
        <>
            <div className={card}>
                <h2 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Members ({members.length})</h2>
                <div className="flex flex-col gap-2">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <a href={`/student/members/${member.id}`} className={`text-sm hover:text-blue-600 hover:underline transition truncate ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {member.name}
                                </a>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${member.role === 'leader' ? 'bg-purple-100 text-purple-700' : (dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                                {member.role}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {userRole === 'leader' && (
                <div className={card}>
                    <h2 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Add Member</h2>
                    <div className="flex gap-2 mb-3">
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search by name or email..." className={input} />
                        <button onClick={handleSearch} disabled={searching} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg transition flex-shrink-0">
                            {searching ? '...' : 'Search'}
                        </button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {searchResults.map((user) => (
                                <div key={user.id} className={`flex items-center justify-between rounded-lg p-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
                                        <p className={`text-xs truncate ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                                    </div>
                                    <button onClick={() => handleInvite(user.id)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition flex-shrink-0 ml-2">Add</button>
                                </div>
                            ))}
                        </div>
                    )}
                    {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                        <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No users found.</p>
                    )}
                </div>
            )}
        </>
    );
}

// ── ResourceSharePanel ────────────────────────────────────────────────────────
function ResourceSharePanel({ dark, availableResources, selectedResource, setSelectedResource, handleShareResource }) {
    return (
        <div className={`rounded-xl shadow-sm p-5 ${dark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Share a Resource</h2>
            <div className="flex gap-2">
                <select
                    value={selectedResource}
                    onChange={e => setSelectedResource(e.target.value)}
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                    <option value="">Select a resource...</option>
                    {availableResources.map((r) => (
                        <option key={r.id} value={r.id}>{r.title} ({r.subject})</option>
                    ))}
                </select>
                <button onClick={handleShareResource} disabled={!selectedResource} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition flex-shrink-0">
                    Share
                </button>
            </div>
        </div>
    );
}

// ── ResourceListPanel ─────────────────────────────────────────────────────────
function ResourceListPanel({ dark, resources, icons }) {
    return (
        <div className={`rounded-xl shadow-sm p-5 ${dark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Group Resources ({resources.length})</h2>
            {resources.length === 0 ? (
                <div className={`text-center py-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm">No resources shared yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {resources.map((r) => (
                        <div key={r.id} className={`flex items-center justify-between border rounded-lg p-3 transition gap-3 ${dark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xl flex-shrink-0">{icons[r.file_type] || '📄'}</span>
                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{r.title}</p>
                                    <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{r.subject} - {r.semester}</p>
                                    <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Shared by {r.shared_by}</p>
                                </div>
                            </div>
                            <button onClick={() => window.location.href = '/student/download/' + r.id} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition flex-shrink-0">↓</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── ChatPanel ─────────────────────────────────────────────────────────────────
function ChatPanel({ dark, messages, chatLoading, chatInput, setChatInput, sendingChat, handleSendMessage, handleChatKeyDown, chatEndRef, currentUserId, formatTime, desktop }) {
    return (
        <div className={`rounded-xl shadow-sm flex flex-col ${dark ? 'bg-gray-800' : 'bg-white'} ${
            desktop ? 'h-[calc(100vh-220px)] min-h-[500px]' : 'h-[calc(100vh-260px)] min-h-[420px]'
        }`}>
            {/* Header */}
            <div className={`px-5 py-4 border-b flex-shrink-0 ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>💬 Group Chat</h2>
                <p className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Messages refresh every 5 seconds</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                {chatLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-1">
                                <div className={`w-2 h-2 rounded-full animate-bounce ${dark ? 'bg-gray-600' : 'bg-gray-300'}`} style={{animationDelay:'0ms'}}></div>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${dark ? 'bg-gray-600' : 'bg-gray-300'}`} style={{animationDelay:'150ms'}}></div>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${dark ? 'bg-gray-600' : 'bg-gray-300'}`} style={{animationDelay:'300ms'}}></div>
                            </div>
                            <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Loading messages...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-4xl mb-2">💬</p>
                        <p className={`text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No messages yet</p>
                        <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Say hello to your group!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.user_id === currentUserId;
                        return (
                            <div key={msg.id ?? i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                    <span className={`text-xs mb-1 ml-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{msg.user_name}</span>
                                )}
                                {msg.type === 'resource' && msg.resource ? (
                                    <div className={`max-w-[80%] rounded-2xl p-3 border ${
                                        isMe
                                            ? (dark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200')
                                            : (dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')
                                    } ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                                        <p className={`text-xs mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>📎 Shared a resource</p>
                                        <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-800'}`}>{msg.resource.title}</p>
                                        <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{msg.resource.subject}</p>
                                        <button
                                            onClick={() => window.location.href = '/student/download/' + msg.resource.id}
                                            className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition"
                                        >
                                            Download
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm break-words ${
                                        isMe
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : (dark ? 'bg-gray-700 text-gray-100 rounded-bl-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm')
                                    }`}>
                                        {msg.message}
                                    </div>
                                )}
                                <span className={`text-xs mt-0.5 mx-1 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{formatTime(msg.created_at)}</span>
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className={`px-4 py-3 border-t flex gap-2 flex-shrink-0 ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    disabled={sendingChat}
                    className={`flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 disabled:opacity-50 ${
                        dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || sendingChat}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center transition flex-shrink-0"
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}