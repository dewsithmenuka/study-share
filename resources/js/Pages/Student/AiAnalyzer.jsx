import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function AiAnalyzer({ auth }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('summary');
    const [activeSection, setActiveSection] = useState('analyzer');
    const [inputMode, setInputMode] = useState('library');
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const [docChatMessages, setDocChatMessages] = useState([]);
    const [docChatInput, setDocChatInput] = useState('');
    const [docChatLoading, setDocChatLoading] = useState(false);
    const docChatEndRef = useRef(null);

    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: "Hi! I'm StudyBot 🤖 I can help you understand concepts, explain topics, answer academic questions, and give study tips. What would you like to learn about?" }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetch('/student/ai-analyzer/resources', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
        .then(res => res.json())
        .then(data => setResources(data))
        .catch(() => {});
    }, []);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
    useEffect(() => { docChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [docChatMessages]);

    const getCSRF = () => {
        const token = document.head.querySelector('meta[name="csrf-token"]');
        return token ? token.content : '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') { setUploadedFile(file); setError(''); }
        else setError('Only PDF files are supported for analysis.');
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') { setUploadedFile(file); setError(''); }
        else setError('Only PDF files are supported.');
    };

    const isLargeFile = uploadedFile && uploadedFile.size > 1024 * 1024;

    const handleAnalyze = async () => {
        if (inputMode === 'library' && !selectedResource) return;
        if (inputMode === 'upload' && !uploadedFile) return;
        setAnalyzing(true);
        setError('');
        setResult(null);
        setDocChatMessages([]);

        try {
            let res;
            if (inputMode === 'library') {
                res = await fetch('/student/ai-analyzer/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': getCSRF(), 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ resource_id: selectedResource }),
                });
            } else {
                const formData = new FormData();
                formData.append('file', uploadedFile);
                res = await fetch('/student/ai-analyzer/analyze-file', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': getCSRF(), 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                    body: formData,
                });
            }

            const data = await res.json();
            if (data.error || !data.resource) {
                setError(data.error || 'Analysis failed. Please try again.');
            } else {
                setResult(data);
                setActiveTab('summary');
                setDocChatMessages([{ role: 'assistant', content: 'I have read your document! Ask me anything about it — I can explain concepts, clarify points, or answer specific questions.' }]);
            }
        } catch (e) {
            setError('Something went wrong. Please try again.');
        }
        setAnalyzing(false);
    };

    const handleDocChat = async (e) => {
        e.preventDefault();
        if (!docChatInput.trim() || docChatLoading) return;
        const userMessage = docChatInput.trim();
        setDocChatInput('');
        setDocChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setDocChatLoading(true);
        try {
            const history = docChatMessages.map(m => ({ role: m.role, content: m.content }));
            const res = await fetch('/student/ai-analyzer/chat-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': getCSRF(), 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
                body: JSON.stringify({ message: userMessage, history, resource_id: inputMode === 'library' ? selectedResource : null }),
            });
            const data = await res.json();
            setDocChatMessages(prev => [...prev, { role: 'assistant', content: data.error ? 'Sorry, I encountered an error. Please try again.' : data.reply }]);
        } catch (e) {
            setDocChatMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
        }
        setDocChatLoading(false);
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || chatLoading) return;
        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatLoading(true);
        try {
            // FIX: role mapping was sending 'model' for assistant — Groq expects 'assistant'
            const history = chatMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
            const res = await fetch('/student/ai-analyzer/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': getCSRF(), 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
                body: JSON.stringify({ message: userMessage, history }),
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { role: 'assistant', content: data.error ? 'Sorry, I encountered an error.' : data.reply }]);
        } catch (e) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
        }
        setChatLoading(false);
    };

    const cardClass = 'rounded-xl p-4 sm:p-6 ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm');
    const tabClass = (tab) => 'px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ' + (activeTab === tab ? 'bg-blue-600 text-white' : (dark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'));
    const sectionTabClass = (section) => 'flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition text-center ' + (activeSection === section ? 'bg-blue-600 text-white shadow-lg' : (dark ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:text-gray-900 shadow-sm'));

    return (
        <MainLayout auth={auth}>
            <Head title="AI Study Assistant" />
            <div className="mb-4 sm:mb-6">
                <h1 className={'text-xl sm:text-2xl font-bold mb-1 ' + (dark ? 'text-white' : 'text-gray-800')}>🤖 AI Study Assistant</h1>
                <p className={'text-sm ' + (dark ? 'text-gray-400' : 'text-gray-500')}>Analyze study materials or chat with StudyBot for instant help</p>
            </div>

            {/* FIX: Section tabs now flex full-width on mobile */}
            <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                <button onClick={() => setActiveSection('analyzer')} className={sectionTabClass('analyzer')}>📄 PDF Analyzer</button>
                <button onClick={() => setActiveSection('chat')} className={sectionTabClass('chat')}>💬 StudyBot Chat</button>
            </div>

            {activeSection === 'analyzer' && (
                // FIX: Removed fixed height wrapper that was cutting off result section
                <div>
                    <div className={cardClass + ' mb-4 sm:mb-6'}>
                        <h2 className={'font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>Select PDF to Analyze</h2>
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => { setInputMode('library'); setUploadedFile(null); setError(''); }} className={'px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ' + (inputMode === 'library' ? 'bg-blue-600 text-white' : (dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'))}>
                                📚 From My Library
                            </button>
                            <button onClick={() => { setInputMode('upload'); setSelectedResource(''); setError(''); }} className={'px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ' + (inputMode === 'upload' ? 'bg-blue-600 text-white' : (dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'))}>
                                📤 Upload a PDF
                            </button>
                        </div>

                        {inputMode === 'library' && (
                            <select value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className={'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 ' + (dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800')}>
                                <option value="">Choose a PDF from your library...</option>
                                {resources.map(r => (<option key={r.id} value={r.id}>{r.title} — {r.subject}</option>))}
                            </select>
                        )}

                        {inputMode === 'upload' && (
                            <div
                                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={'mb-4 border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition ' + (dragging ? 'border-blue-500 bg-blue-50' : (dark ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-400'))}
                            >
                                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
                                {uploadedFile ? (
                                    <div>
                                        <p className="text-3xl mb-2">📕</p>
                                        <p className={'font-medium text-sm ' + (dark ? 'text-white' : 'text-gray-800')}>{uploadedFile.name}</p>
                                        <p className={'text-xs mt-1 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>
                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB —
                                            {isLargeFile
                                                ? <span className="text-yellow-500"> ⚠️ Large file — best results under 1MB</span>
                                                : <span className="text-green-500"> ✅ Good size</span>
                                            }
                                        </p>
                                        <p className="text-xs mt-1 text-gray-400">Click to change file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-4xl mb-3">📂</p>
                                        <p className={'font-medium text-sm sm:text-base ' + (dark ? 'text-white' : 'text-gray-700')}>Drag and drop your PDF here</p>
                                        <p className={'text-xs sm:text-sm mt-1 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>or click to browse</p>
                                        <p className={'text-xs mt-2 ' + (dark ? 'text-gray-500' : 'text-gray-400')}>PDF files only • Best under 1MB • Not saved to platform</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isLargeFile && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-700 text-xs">⚠️ This file is larger than 1MB. The AI will analyze the first portion of the document. For best results use a smaller PDF or a specific chapter.</p>
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={(inputMode === 'library' && !selectedResource) || (inputMode === 'upload' && !uploadedFile) || analyzing}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                            {analyzing ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Analyzing your PDF...
                                </>
                            ) : '🤖 Analyze with AI'}
                        </button>

                        {analyzing && (
                            <div className={'mt-4 p-4 rounded-lg ' + (dark ? 'bg-blue-900' : 'bg-blue-50')}>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                    </div>
                                    <p className={'text-sm ' + (dark ? 'text-blue-300' : 'text-blue-700')}>AI is reading and analyzing your document... This may take 10-30 seconds.</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">❌ {error}</p>
                            </div>
                        )}
                    </div>

                    {result && (
                        // FIX: Stack to single column on mobile, 2-col on desktop
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <div className={'rounded-xl p-3 sm:p-4 mb-4 ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm')}>
                                    <div className={'text-xs sm:text-sm mb-3 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>
                                        Analyzing: <span className={'font-medium ' + (dark ? 'text-white' : 'text-gray-800')}>{result.resource.title}</span>
                                    </div>
                                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                                        {['summary', 'key_points', 'quiz', 'flashcards'].map(tab => (
                                            <button key={tab} onClick={() => setActiveTab(tab)} className={tabClass(tab)}>
                                                {tab === 'summary' && '📝 Summary'}
                                                {tab === 'key_points' && '🎯 Key Points'}
                                                {tab === 'quiz' && '❓ Quiz'}
                                                {tab === 'flashcards' && '🃏 Flashcards'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {activeTab === 'summary' && (
                                    <div className={cardClass}>
                                        <h2 className={'text-base sm:text-lg font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>📝 Summary</h2>
                                        <p className={'leading-relaxed text-sm sm:text-base ' + (dark ? 'text-gray-300' : 'text-gray-700')}>{result.analysis.summary}</p>
                                    </div>
                                )}
                                {activeTab === 'key_points' && (
                                    <div className={cardClass}>
                                        <h2 className={'text-base sm:text-lg font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>🎯 Key Points</h2>
                                        <div className="flex flex-col gap-3">
                                            {result.analysis.key_points.map((point, i) => (
                                                <div key={i} className={'flex items-start gap-3 p-3 rounded-lg ' + (dark ? 'bg-gray-700' : 'bg-gray-50')}>
                                                    <span className="bg-blue-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                                    <p className={'text-sm ' + (dark ? 'text-gray-300' : 'text-gray-700')}>{point}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'quiz' && (
                                    <div className={cardClass}>
                                        <h2 className={'text-base sm:text-lg font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>❓ Quiz Questions</h2>
                                        <div className="flex flex-col gap-6">
                                            {result.analysis.quiz_questions.map((q, i) => (<QuizQuestion key={i} question={q} index={i} dark={dark} />))}
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'flashcards' && (
                                    <div className={cardClass}>
                                        <h2 className={'text-base sm:text-lg font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>🃏 Flashcards</h2>
                                        <div className="grid grid-cols-1 gap-4">
                                            {result.analysis.flashcards.map((card, i) => (<Flashcard key={i} card={card} dark={dark} />))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* FIX: Replaced fixed 600px height with responsive min/max height */}
                            <div className={'rounded-xl flex flex-col ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm')} style={{height: 'min(600px, 80vh)', minHeight: '400px'}}>
                                <div className={'p-3 sm:p-4 border-b ' + (dark ? 'border-gray-700' : 'border-gray-100')}>
                                    <h2 className={'font-semibold text-sm sm:text-base ' + (dark ? 'text-white' : 'text-gray-800')}>💬 Ask About This Document</h2>
                                    <p className={'text-xs mt-0.5 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>Ask specific questions about the content</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
                                    {docChatMessages.map((msg, i) => (
                                        <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                            <div className={'flex items-start gap-2 max-w-[85%] sm:max-w-sm ' + (msg.role === 'user' ? 'flex-row-reverse' : '')}>
                                                <div className={'w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ' + (msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white')}>
                                                    {msg.role === 'user' ? auth?.user?.name?.charAt(0).toUpperCase() : '🤖'}
                                                </div>
                                                <div className={'px-3 py-2 rounded-xl text-xs sm:text-sm leading-relaxed ' + (msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : (dark ? 'bg-gray-700 text-gray-200 rounded-tl-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'))}>
                                                    {msg.content.split('\n').map((line, j) => (<p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {docChatLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex items-start gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">🤖</div>
                                                <div className={'px-3 py-2 rounded-xl rounded-tl-sm ' + (dark ? 'bg-gray-700' : 'bg-gray-100')}>
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={docChatEndRef} />
                                </div>
                                <div className={'p-3 border-t ' + (dark ? 'border-gray-700' : 'border-gray-100')}>
                                    <form onSubmit={handleDocChat} className="flex gap-2">
                                        <input type="text" value={docChatInput} onChange={e => setDocChatInput(e.target.value)} placeholder="Ask about this document..." className={'flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 ' + (dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-800')} />
                                        <button type="submit" disabled={!docChatInput.trim() || docChatLoading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition flex-shrink-0">Ask</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeSection === 'chat' && (
                // FIX: Responsive height using min() and minHeight instead of fixed 600px
                <div className={'rounded-xl flex flex-col ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm')} style={{height: 'min(600px, 80vh)', minHeight: '400px'}}>
                    <div className={'p-3 sm:p-4 border-b flex items-center gap-3 ' + (dark ? 'border-gray-700' : 'border-gray-100')}>
                        <div className="w-9 sm:w-10 h-9 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg sm:text-xl flex-shrink-0">🤖</div>
                        <div>
                            <h2 className={'font-semibold text-sm sm:text-base ' + (dark ? 'text-white' : 'text-gray-800')}>StudyBot</h2>
                            <p className={'text-xs ' + (dark ? 'text-green-400' : 'text-green-600')}>● Online — Ready to help</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={'flex items-start gap-2 max-w-[85%] sm:max-w-lg ' + (msg.role === 'user' ? 'flex-row-reverse' : '')}>
                                    <div className={'w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm flex-shrink-0 ' + (msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white')}>
                                        {msg.role === 'user' ? auth?.user?.name?.charAt(0).toUpperCase() : '🤖'}
                                    </div>
                                    <div className={'px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ' + (msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : (dark ? 'bg-gray-700 text-gray-200 rounded-tl-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'))}>
                                        {msg.content.split('\n').map((line, j) => (<p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-start gap-2">
                                    <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">🤖</div>
                                    <div className={'px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-tl-sm ' + (dark ? 'bg-gray-700' : 'bg-gray-100')}>
                                        <div className="flex gap-1">
                                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className={'p-3 sm:p-4 border-t ' + (dark ? 'border-gray-700' : 'border-gray-100')}>
                        <div className="mb-2 flex flex-wrap gap-1.5 sm:gap-2">
                            {['Explain recursion', 'What is OOP?', 'Study tips for exams', 'Explain Big O notation'].map(suggestion => (
                                <button key={suggestion} onClick={() => setChatInput(suggestion)} className={'text-xs px-2.5 sm:px-3 py-1 rounded-full border transition ' + (dark ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400' : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600')}>{suggestion}</button>
                            ))}
                        </div>
                        <form onSubmit={handleSendChat} className="flex gap-2">
                            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask StudyBot anything..." className={'flex-1 border rounded-xl px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 ' + (dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-800')} />
                            <button type="submit" disabled={!chatInput.trim() || chatLoading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition flex-shrink-0">Send</button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

function QuizQuestion({ question, index, dark }) {
    const [selected, setSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);
    return (
        <div className={'p-3 sm:p-4 rounded-xl border ' + (dark ? 'border-gray-700' : 'border-gray-200')}>
            <p className={'font-medium mb-3 text-sm sm:text-base ' + (dark ? 'text-white' : 'text-gray-800')}>Q{index + 1}. {question.question}</p>
            <div className="flex flex-col gap-2 mb-3">
                {question.options.map((option, i) => (
                    <button key={i} onClick={() => setSelected(option)} className={'text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition border ' + (selected === option ? (revealed ? (option === question.answer ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800') : 'bg-blue-100 border-blue-500 text-blue-800') : (revealed && option === question.answer ? 'bg-green-100 border-green-500 text-green-800' : (dark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50')))}>
                        {option}
                    </button>
                ))}
            </div>
            <button onClick={() => setRevealed(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg transition">Reveal Answer</button>
            {revealed && (
                <div className={'mt-3 p-3 rounded-lg ' + (dark ? 'bg-green-900' : 'bg-green-50')}>
                    <p className={'text-xs sm:text-sm font-medium ' + (dark ? 'text-green-300' : 'text-green-700')}>Correct: {question.answer}</p>
                    <p className={'text-xs mt-1 ' + (dark ? 'text-green-400' : 'text-green-600')}>{question.explanation}</p>
                </div>
            )}
        </div>
    );
}

function Flashcard({ card, dark }) {
    const [flipped, setFlipped] = useState(false);
    return (
        <div onClick={() => setFlipped(!flipped)} className={'cursor-pointer rounded-xl p-4 sm:p-5 min-h-24 sm:min-h-28 flex flex-col justify-center transition-all duration-300 border-2 ' + (flipped ? 'bg-blue-600 border-blue-600 text-white' : (dark ? 'bg-gray-700 border-gray-600 text-white hover:border-blue-500' : 'bg-white border-gray-200 text-gray-800 hover:border-blue-400'))}>
            <p className={'text-xs mb-2 ' + (flipped ? 'text-blue-200' : (dark ? 'text-gray-400' : 'text-gray-400'))}>{flipped ? 'Definition — click to flip' : 'Term — click to flip'}</p>
            <p className="font-medium text-sm leading-relaxed">{flipped ? card.definition : card.term}</p>
        </div>
    );
}