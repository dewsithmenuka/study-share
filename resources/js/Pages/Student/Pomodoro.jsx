import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useRef } from 'react';

const SESSION_TYPES = {
    focus:      { label: '🍅 Focus Session', color: 'from-red-500 to-orange-500',   minutes: 25 },
    shortBreak: { label: '☕ Short Break',   color: 'from-green-500 to-emerald-500', minutes: 5  },
    longBreak:  { label: '🌴 Long Break',    color: 'from-blue-500 to-cyan-500',     minutes: 15 },
};

const QUOTES = [
    "Small consistent progress beats motivation.",
    "Focus is the key to all success.",
    "One step at a time leads to great distances.",
    "The secret of getting ahead is getting started.",
    "Productivity is never an accident.",
];

const DEFAULT_SETTINGS = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    soundEnabled: true,
    notificationsEnabled: true,
};

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS = {
    get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
    del: (key) => { try { localStorage.removeItem(key); } catch {} },
};

// ─── Compute how much time is actually left, accounting for elapsed wall-clock
//     time since the timer was started (so navigation away doesn't freeze it).
function computeTimeLeft(savedTimeLeft, startedAt) {
    if (!startedAt) return savedTimeLeft;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, savedTimeLeft - elapsed);
}

export default function Pomodoro({ auth }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';

    const [settings,          setSettings]          = useState(DEFAULT_SETTINGS);
    const [sessionType,       setSessionType]        = useState('focus');
    const [timeLeft,          setTimeLeft]           = useState(25 * 60);
    const [isRunning,         setIsRunning]          = useState(false);
    const [sessionsCompleted, setSessionsCompleted]  = useState(0);
    const [totalFocusMinutes, setTotalFocusMinutes]  = useState(0);
    const [showSettings,      setShowSettings]       = useState(false);
    const [showWidget,        setShowWidget]         = useState(true);
    const [quote,             setQuote]              = useState(QUOTES[0]);

    const timerRef       = useRef(null);
    const sessionTypeRef = useRef(sessionType);   // kept in sync so interval closure can read it
    const settingsRef    = useRef(settings);

    useEffect(() => { sessionTypeRef.current = sessionType; }, [sessionType]);
    useEffect(() => { settingsRef.current    = settings;    }, [settings]);

    // ── Restore persisted state on mount ──────────────────────────────────────
    useEffect(() => {
        // Settings
        const savedSettings = LS.get('pomo_settings');
        if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });

        // Statistics
        const savedState = LS.get('pomo_state');
        if (savedState) {
            setSessionsCompleted(savedState.sessionsCompleted || 0);
            setTotalFocusMinutes(savedState.totalFocusMinutes || 0);
        }

        // Running timer — use wall-clock diff to catch up
        const running = LS.get('pomo_running');
        if (running && running.isRunning) {
            const actualTimeLeft = computeTimeLeft(running.timeLeft, running.startedAt);
            const type = running.sessionType || 'focus';

            setSessionType(type);
            sessionTypeRef.current = type;

            if (actualTimeLeft > 0) {
                // Timer still has time left — resume it
                setTimeLeft(actualTimeLeft);
                setIsRunning(true);
                // Persist the corrected snapshot immediately
                LS.set('pomo_running', { ...running, timeLeft: actualTimeLeft, startedAt: Date.now() });
            } else {
                // Timer would have already finished while away — complete the session silently
                setTimeLeft(0);
                setIsRunning(false);
                LS.del('pomo_running');
                // We trigger completion via a flag so handleSessionComplete has fresh state
                setTimeout(() => handleSessionCompleteRef.current(), 0);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Persist settings ──────────────────────────────────────────────────────
    useEffect(() => {
        LS.set('pomo_settings', settings);
    }, [settings]);

    // ── Persist statistics ────────────────────────────────────────────────────
    useEffect(() => {
        LS.set('pomo_state', { sessionsCompleted, totalFocusMinutes });
    }, [sessionsCompleted, totalFocusMinutes]);

    // ── Tick interval ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isRunning) {
            clearInterval(timerRef.current);
            return;
        }

        // Record the wall-clock moment the timer (re)started
        const startSnapshot = LS.get('pomo_running');
        const startedAt = (startSnapshot && startSnapshot.startedAt) ? startSnapshot.startedAt : Date.now();

        // Write/update the running snapshot with the fresh startedAt
        LS.set('pomo_running', {
            sessionType: sessionTypeRef.current,
            timeLeft,
            isRunning: true,
            startedAt,
        });

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev > 0 ? prev - 1 : 0;
                // Keep localStorage in sync every tick (for tab-switch recovery)
                LS.set('pomo_running', {
                    sessionType: sessionTypeRef.current,
                    timeLeft: next,
                    isRunning: true,
                    startedAt,
                });
                return next;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Detect session end ────────────────────────────────────────────────────
    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            LS.del('pomo_running');
            handleSessionCompleteRef.current();
        }
    }, [timeLeft, isRunning]);

    // ── Session-complete logic (kept in a ref so the mount effect can call it) ─
    const handleSessionComplete = () => {
        const type = sessionTypeRef.current;
        const cfg  = settingsRef.current;

        playNotificationSound(type, cfg);

        setSessionsCompleted(prev => {
            const next = type === 'focus' ? prev + 1 : prev;
            if (type === 'focus') {
                setTotalFocusMinutes(m => m + cfg.focusDuration);
                if (next % cfg.sessionsBeforeLongBreak === 0) {
                    setSessionType('longBreak');
                    sessionTypeRef.current = 'longBreak';
                    setTimeLeft(cfg.longBreakDuration * 60);
                } else {
                    setSessionType('shortBreak');
                    sessionTypeRef.current = 'shortBreak';
                    setTimeLeft(cfg.shortBreakDuration * 60);
                }
            } else {
                setSessionType('focus');
                sessionTypeRef.current = 'focus';
                setTimeLeft(cfg.focusDuration * 60);
            }
            return next;
        });

        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    };

    const handleSessionCompleteRef = useRef(handleSessionComplete);
    useEffect(() => { handleSessionCompleteRef.current = handleSessionComplete; });

    // ── Sound / notification ──────────────────────────────────────────────────
    const playNotificationSound = (type, cfg) => {
        if (cfg.soundEnabled) {
            try {
                const ctx   = new (window.AudioContext || window.webkitAudioContext)();
                const osc   = ctx.createOscillator();
                const gain  = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 880;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.5);
            } catch {}
        }

        if (cfg.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(SESSION_TYPES[type]?.label + ' Complete!', {
                body: type === 'focus' ? 'Time for a break ☕' : 'Ready to focus again? 🍅',
            });
        }
    };

    // ── Controls ──────────────────────────────────────────────────────────────
    const startTimer = () => {
        if (settings.notificationsEnabled && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        // Write startedAt before setting isRunning so the effect sees it
        LS.set('pomo_running', {
            sessionType,
            timeLeft,
            isRunning: true,
            startedAt: Date.now(),
        });
        setIsRunning(true);
    };

    const pauseTimer = () => {
        setIsRunning(false);
        LS.set('pomo_running', { sessionType, timeLeft, isRunning: false, startedAt: null });
    };

    const resetTimer = () => {
        setIsRunning(false);
        const minutes =
            sessionType === 'focus'      ? settings.focusDuration :
            sessionType === 'shortBreak' ? settings.shortBreakDuration :
                                           settings.longBreakDuration;
        setTimeLeft(minutes * 60);
        LS.del('pomo_running');
    };

    const skipSession = () => {
        setIsRunning(false);
        LS.del('pomo_running');
        handleSessionCompleteRef.current();
    };

    const changeSessionType = (type) => {
        setIsRunning(false);
        LS.del('pomo_running');
        setSessionType(type);
        sessionTypeRef.current = type;
        const minutes =
            type === 'focus'      ? settings.focusDuration :
            type === 'shortBreak' ? settings.shortBreakDuration :
                                    settings.longBreakDuration;
        setTimeLeft(minutes * 60);
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const formatTime = (s) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const totalSeconds =
        sessionType === 'focus'      ? settings.focusDuration * 60 :
        sessionType === 'shortBreak' ? settings.shortBreakDuration * 60 :
                                       settings.longBreakDuration * 60;

    const progressPct      = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    const circumference    = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (progressPct / 100) * circumference;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <MainLayout auth={auth}>
            <Head title="🍅 Focus Timer" />

            {/* ── Floating bubble ── */}
            <button
                onClick={() => setShowWidget(!showWidget)}
                className={`fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-r ${SESSION_TYPES[sessionType].color} rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform`}
                title="Toggle mini timer"
            >
                {isRunning ? '🍅' : '⏱️'}
            </button>

            {/* ── Mini widget ── */}
            {showWidget && (
                <div className={`fixed bottom-20 right-4 z-50 w-72 backdrop-blur-xl ${dark ? 'bg-gray-800/95' : 'bg-white/95'} rounded-2xl shadow-2xl border border-white/20 p-4`}>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2">
                            {Object.keys(SESSION_TYPES).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => changeSessionType(type)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                                        sessionType === type
                                            ? `bg-gradient-to-r ${SESSION_TYPES[type].color} text-white`
                                            : dark ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}
                                    title={SESSION_TYPES[type].label}
                                >
                                    {type === 'focus' ? '🍅' : type === 'shortBreak' ? '☕' : '🌴'}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowWidget(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    <div className={`text-center text-4xl font-bold mb-3 ${dark ? 'text-white' : 'text-gray-800'}`}>
                        {formatTime(timeLeft)}
                    </div>

                    <div className="flex justify-center gap-2">
                        {!isRunning
                            ? <button onClick={startTimer} className={`px-6 py-2 bg-gradient-to-r ${SESSION_TYPES[sessionType].color} text-white rounded-xl font-semibold`}>▶️</button>
                            : <button onClick={pauseTimer} className="px-6 py-2 bg-yellow-500 text-white rounded-xl font-semibold">⏸️</button>
                        }
                        <button onClick={resetTimer} className={`px-4 py-2 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>🔄</button>
                    </div>
                </div>
            )}

            {/* ── Main page ── */}
            <div className={`min-h-screen ${dark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
                <div className="max-w-lg mx-auto">

                    <div className="text-center mb-8">
                        <h1 className={`text-3xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>🍅 Focus Timer</h1>
                        {isRunning && (
                            <p className="text-sm text-green-500 font-medium mt-1 animate-pulse">
                                ● Timer running — it keeps going even if you navigate away
                            </p>
                        )}
                    </div>

                    {/* Session type tabs */}
                    <div className="flex justify-center gap-2 mb-8">
                        {Object.keys(SESSION_TYPES).map((type) => (
                            <button
                                key={type}
                                onClick={() => changeSessionType(type)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    sessionType === type
                                        ? `bg-gradient-to-r ${SESSION_TYPES[type].color} text-white shadow-lg`
                                        : dark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
                                }`}
                            >
                                {type === 'focus' ? '🍅 Focus' : type === 'shortBreak' ? '☕ Break' : '🌴 Long'}
                            </button>
                        ))}
                    </div>

                    {/* Timer card */}
                    <div className={`relative backdrop-blur-xl ${dark ? 'bg-white/5' : 'bg-white/80'} rounded-3xl shadow-2xl border border-white/20 p-8 mb-6`}>
                        <h2 className={`text-center text-xl font-semibold mb-6 ${dark ? 'text-white' : 'text-gray-700'}`}>
                            {SESSION_TYPES[sessionType].label}
                        </h2>

                        {/* Circular progress */}
                        <div className="relative w-64 h-64 mx-auto mb-6">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
                                <circle cx="128" cy="128" r="120"
                                    stroke={dark ? '#374151' : '#E5E7EB'}
                                    strokeWidth="8" fill="none" />
                                <circle cx="128" cy="128" r="120"
                                    stroke="url(#timerGradient)"
                                    strokeWidth="8" fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{ transition: 'stroke-dashoffset 0.9s linear' }} />
                                <defs>
                                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%"   stopColor={sessionType === 'focus' ? '#ef4444' : sessionType === 'shortBreak' ? '#22c55e' : '#3b82f6'} />
                                        <stop offset="100%" stopColor={sessionType === 'focus' ? '#f97316' : sessionType === 'shortBreak' ? '#10b981' : '#06b6d4'} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                <span className={`text-6xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                                {isRunning && (
                                    <span className="text-xs text-green-400 font-medium animate-pulse">running</span>
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-3 mb-6">
                            {!isRunning
                                ? <button onClick={startTimer}  className={`px-8 py-3 bg-gradient-to-r ${SESSION_TYPES[sessionType].color} text-white rounded-xl font-semibold shadow-lg`}>Start 🍅</button>
                                : <button onClick={pauseTimer}  className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold shadow-lg">Pause ⏸</button>
                            }
                            <button onClick={resetTimer}  className={`px-4 py-3 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} title="Reset">🔄</button>
                            <button onClick={skipSession} className={`px-4 py-3 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} title="Skip">⏭</button>
                        </div>

                        <p className={`text-center text-sm italic ${dark ? 'text-gray-400' : 'text-gray-500'}`}>"{quote}"</p>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`absolute top-4 right-4 p-2 rounded-lg ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                            title="Settings"
                        >⚙️</button>
                    </div>

                    {/* Settings panel */}
                    {showSettings && (
                        <div className={`backdrop-blur-xl ${dark ? 'bg-white/5' : 'bg-white/80'} rounded-3xl shadow-xl border border-white/20 p-6 mb-6`}>
                            <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-700'}`}>⚙️ Settings</h3>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Focus (min)',          key: 'focusDuration',          min: 1, max: 60, def: 25 },
                                    { label: 'Short Break (min)',    key: 'shortBreakDuration',     min: 1, max: 30, def: 5  },
                                    { label: 'Long Break (min)',     key: 'longBreakDuration',      min: 1, max: 60, def: 15 },
                                    { label: 'Sessions Before Long', key: 'sessionsBeforeLongBreak', min: 1, max: 10, def: 4 },
                                ].map(({ label, key, min, max, def }) => (
                                    <div key={key}>
                                        <label className={`block text-sm mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</label>
                                        <input
                                            type="number"
                                            value={settings[key]}
                                            onChange={(e) => setSettings(s => ({ ...s, [key]: parseInt(e.target.value) || def }))}
                                            className={`w-full px-3 py-2 rounded-lg text-center font-semibold ${dark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
                                            min={min} max={max}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                                    className={`flex-1 py-2 rounded-lg transition ${settings.soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}
                                >
                                    {settings.soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
                                </button>
                                <button
                                    onClick={() => {
                                        const next = !settings.notificationsEnabled;
                                        setSettings(s => ({ ...s, notificationsEnabled: next }));
                                        if (next && Notification.permission === 'default') Notification.requestPermission();
                                    }}
                                    className={`flex-1 py-2 rounded-lg transition ${settings.notificationsEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}
                                >
                                    {settings.notificationsEnabled ? '🔔 Notifications On' : '🔕 Notifications Off'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className={`backdrop-blur-xl ${dark ? 'bg-white/5' : 'bg-white/80'} rounded-3xl shadow-xl border border-white/20 p-6`}>
                        <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-700'}`}>📊 Today's Statistics</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className={`text-3xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{sessionsCompleted}</div>
                                <div className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Sessions</div>
                            </div>
                            <div>
                                <div className={`text-3xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{totalFocusMinutes}</div>
                                <div className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Minutes</div>
                            </div>
                            <div>
                                <div className={`text-3xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{sessionsCompleted >= 4 ? '🔥' : '❄️'}</div>
                                <div className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Streak</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}