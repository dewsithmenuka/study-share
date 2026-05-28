import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

const SESSION_TYPES = {
    focus:      { label: '🍅 Focus Session', color: 'from-red-500 to-orange-500'   },
    shortBreak: { label: '☕ Short Break',   color: 'from-green-500 to-emerald-500' },
    longBreak:  { label: '🌴 Long Break',    color: 'from-blue-500 to-cyan-500'     },
};

const DEFAULT_SETTINGS = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    soundEnabled: true,
    notificationsEnabled: true,
};

const LS = {
    get: (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del: (k)    => { try { localStorage.removeItem(k); }                catch {} },
};

function computeTimeLeft(saved, startedAt) {
    if (!startedAt) return saved;
    return Math.max(0, saved - Math.floor((Date.now() - startedAt) / 1000));
}

const BUBBLE = 56;

export default function PomodoroWidget() {
    const { theme } = useTheme();
    const dark = theme === 'dark';

    /* ── timer state ── */
    const [settings,          setSettings]         = useState(DEFAULT_SETTINGS);
    const [sessionType,       setSessionType]       = useState('focus');
    const [timeLeft,          setTimeLeft]          = useState(25 * 60);
    const [isRunning,         setIsRunning]         = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [open,              setOpen]              = useState(false);

    /* ── drag state (all in refs — zero re-renders during drag) ── */
    const bubbleRef   = useRef(null);
    const isDragging  = useRef(false);
    const hasMoved    = useRef(false);
    const startMouse  = useRef({ x: 0, y: 0 });
    const startPos    = useRef({ x: 0, y: 0 });

    const getSavedPos = () => {
        const s = LS.get('pomo_bubble_pos');
        return (s && typeof s.x === 'number')
            ? s
            : { x: window.innerWidth - BUBBLE - 24, y: 80 };
    };

    /* Apply position directly to DOM — no React state, no lag */
    const applyPos = (x, y) => {
        if (!bubbleRef.current) return;
        bubbleRef.current.style.left = x + 'px';
        bubbleRef.current.style.top  = y + 'px';
    };

    /* ── attach drag listeners once on mount ── */
    useEffect(() => {
        const el = bubbleRef.current;
        if (!el) return;

        /* Set initial position */
        const saved = getSavedPos();
        applyPos(saved.x, saved.y);
        startPos.current = saved;

        const onDown = (e) => {
            /* ignore right-click */
            if (e.type === 'mousedown' && e.button !== 0) return;
            e.preventDefault();

            isDragging.current = true;
            hasMoved.current   = false;

            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;

            /* current DOM position */
            const rect = el.getBoundingClientRect();
            startPos.current  = { x: rect.left, y: rect.top };
            startMouse.current = { x: cx, y: cy };

            el.style.cursor    = 'grabbing';
            el.style.transition = 'none';
        };

        const onMove = (e) => {
            if (!isDragging.current) return;
            e.preventDefault();

            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;

            const dx = cx - startMouse.current.x;
            const dy = cy - startMouse.current.y;

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;

            const nx = Math.min(Math.max(0, startPos.current.x + dx), window.innerWidth  - BUBBLE);
            const ny = Math.min(Math.max(0, startPos.current.y + dy), window.innerHeight - BUBBLE);

            applyPos(nx, ny);
        };

        const onUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            el.style.cursor    = 'grab';

            /* Save final position */
            const rect = el.getBoundingClientRect();
            LS.set('pomo_bubble_pos', { x: rect.left, y: rect.top });
        };

        /* Listeners on the bubble for start */
        el.addEventListener('mousedown',  onDown, { passive: false });
        el.addEventListener('touchstart', onDown, { passive: false });

        /* Listeners on window for move / end (so dragging outside bubble works) */
        window.addEventListener('mousemove',  onMove, { passive: false });
        window.addEventListener('mouseup',    onUp);
        window.addEventListener('touchmove',  onMove, { passive: false });
        window.addEventListener('touchend',   onUp);

        return () => {
            el.removeEventListener('mousedown',  onDown);
            el.removeEventListener('touchstart', onDown);
            window.removeEventListener('mousemove',  onMove);
            window.removeEventListener('mouseup',    onUp);
            window.removeEventListener('touchmove',  onMove);
            window.removeEventListener('touchend',   onUp);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* Click = only if the bubble didn't actually move */
    const handleClick = () => {
        if (hasMoved.current) return;
        setOpen(o => !o);
    };

    /* ── timer refs ── */
    const timerRef       = useRef(null);
    const sessionTypeRef = useRef(sessionType);
    const settingsRef    = useRef(settings);
    useEffect(() => { sessionTypeRef.current = sessionType; }, [sessionType]);
    useEffect(() => { settingsRef.current    = settings;    }, [settings]);

    /* ── restore from localStorage ── */
    useEffect(() => {
        const saved = LS.get('pomo_settings');
        if (saved) setSettings({ ...DEFAULT_SETTINGS, ...saved });

        const state = LS.get('pomo_state');
        if (state) setSessionsCompleted(state.sessionsCompleted || 0);

        const running = LS.get('pomo_running');
        if (running?.isRunning) {
            const actual = computeTimeLeft(running.timeLeft, running.startedAt);
            const type   = running.sessionType || 'focus';
            setSessionType(type);
            sessionTypeRef.current = type;
            if (actual > 0) {
                setTimeLeft(actual);
                setIsRunning(true);
                LS.set('pomo_running', { ...running, timeLeft: actual, startedAt: Date.now() });
            } else {
                LS.del('pomo_running');
                setTimeout(() => handleSessionCompleteRef.current(), 0);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { LS.set('pomo_settings', settings); }, [settings]);
    useEffect(() => { LS.set('pomo_state', { sessionsCompleted }); }, [sessionsCompleted]);

    /* ── tick ── */
    useEffect(() => {
        if (!isRunning) { clearInterval(timerRef.current); return; }
        const snap      = LS.get('pomo_running');
        const startedAt = snap?.startedAt ?? Date.now();
        LS.set('pomo_running', { sessionType: sessionTypeRef.current, timeLeft, isRunning: true, startedAt });
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev > 0 ? prev - 1 : 0;
                LS.set('pomo_running', { sessionType: sessionTypeRef.current, timeLeft: next, isRunning: true, startedAt });
                return next;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            LS.del('pomo_running');
            handleSessionCompleteRef.current();
        }
    }, [timeLeft, isRunning]);

    /* ── session complete ── */
    const handleSessionComplete = () => {
        const type = sessionTypeRef.current;
        const cfg  = settingsRef.current;

        if (cfg.soundEnabled) {
            try {
                const ctx  = new (window.AudioContext || window.webkitAudioContext)();
                const osc  = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.frequency.value = 880; osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
            } catch {}
        }

        if (cfg.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(SESSION_TYPES[type]?.label + ' Complete!', {
                body: type === 'focus' ? 'Time for a break ☕' : 'Ready to focus again? 🍅',
            });
        }

        if (type === 'focus') {
            setSessionsCompleted(prev => {
                const next = prev + 1;
                if (next % cfg.sessionsBeforeLongBreak === 0) {
                    setSessionType('longBreak'); sessionTypeRef.current = 'longBreak';
                    setTimeLeft(cfg.longBreakDuration * 60);
                } else {
                    setSessionType('shortBreak'); sessionTypeRef.current = 'shortBreak';
                    setTimeLeft(cfg.shortBreakDuration * 60);
                }
                return next;
            });
        } else {
            setSessionType('focus'); sessionTypeRef.current = 'focus';
            setTimeLeft(cfg.focusDuration * 60);
        }
    };

    const handleSessionCompleteRef = useRef(handleSessionComplete);
    useEffect(() => { handleSessionCompleteRef.current = handleSessionComplete; });

    /* ── controls ── */
    const startTimer = () => {
        if (settings.notificationsEnabled && Notification.permission === 'default') Notification.requestPermission();
        LS.set('pomo_running', { sessionType, timeLeft, isRunning: true, startedAt: Date.now() });
        setIsRunning(true);
    };
    const pauseTimer = () => {
        setIsRunning(false);
        LS.set('pomo_running', { sessionType, timeLeft, isRunning: false, startedAt: null });
    };
    const resetTimer = () => {
        setIsRunning(false);
        LS.del('pomo_running');
        setTimeLeft((sessionType === 'focus' ? settings.focusDuration : sessionType === 'shortBreak' ? settings.shortBreakDuration : settings.longBreakDuration) * 60);
    };
    const changeSession = (type) => {
        setIsRunning(false);
        LS.del('pomo_running');
        setSessionType(type); sessionTypeRef.current = type;
        setTimeLeft((type === 'focus' ? settings.focusDuration : type === 'shortBreak' ? settings.shortBreakDuration : settings.longBreakDuration) * 60);
    };

    /* ── display helpers ── */
    const formatTime    = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
    const totalSecs     = (sessionType === 'focus' ? settings.focusDuration : sessionType === 'shortBreak' ? settings.shortBreakDuration : settings.longBreakDuration) * 60;
    const pct           = ((totalSecs - timeLeft) / totalSecs) * 100;
    const circumference = 2 * Math.PI * 28;
    const dashoffset    = circumference - (pct / 100) * circumference;
    const sessionColor  = SESSION_TYPES[sessionType].color;

    /* Popup position: computed from current bubble DOM rect */
    const getPopupStyle = () => {
        if (!bubbleRef.current) return {};
        const rect     = bubbleRef.current.getBoundingClientRect();
        const popupW   = 288;
        const popupH   = 300; // approx
        const spaceRight  = window.innerWidth  - rect.right;
        const spaceBottom = window.innerHeight - rect.bottom;

        const left = spaceRight >= popupW
            ? rect.left                        // enough room to the right → align left edge
            : Math.max(8, rect.right - popupW); // otherwise align right edge

        const top = spaceBottom >= popupH
            ? rect.bottom + 8
            : rect.top - popupH - 8;

        return { position: 'fixed', left, top, width: popupW, zIndex: 9998 };
    };

    return (
        <>
            {/* ── Draggable bubble ── */}
            <div
                ref={bubbleRef}
                onClick={handleClick}
                style={{
                    position:    'fixed',
                    width:        BUBBLE,
                    height:       BUBBLE,
                    zIndex:       9999,
                    cursor:       'grab',
                    touchAction:  'none',
                    userSelect:   'none',
                    /* initial position set in useEffect via applyPos */
                }}
                title="Drag to move · Click to open timer"
            >
                <div className={`w-full h-full rounded-full shadow-2xl bg-gradient-to-r ${sessionColor} flex items-center justify-center relative overflow-hidden`}>
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.25)" strokeWidth="4" fill="none" />
                        <circle cx="32" cy="32" r="28"
                            stroke="white" strokeWidth="4" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashoffset}
                            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                        />
                    </svg>
                    <span className="relative z-10 text-xl pointer-events-none select-none">
                        {isRunning ? '🍅' : '⏱️'}
                    </span>
                    {isRunning && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-white opacity-20 pointer-events-none" />
                    )}
                </div>
            </div>

            {/* ── Popup panel ── */}
            {open && (
                <div
                    style={getPopupStyle()}
                    className={`rounded-2xl shadow-2xl border overflow-hidden ${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>🍅 Focus Timer</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sessionsCompleted > 0 ? 'bg-orange-100 text-orange-600' : dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                {sessionsCompleted} 🍅
                            </span>
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                        </div>
                    </div>

                    {/* Session pills */}
                    <div className="flex gap-1.5 px-4 pt-3">
                        {Object.keys(SESSION_TYPES).map(type => (
                            <button key={type} onClick={() => changeSession(type)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    sessionType === type
                                        ? `bg-gradient-to-r ${SESSION_TYPES[type].color} text-white shadow`
                                        : dark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}>
                                {type === 'focus' ? '🍅' : type === 'shortBreak' ? '☕' : '🌴'}
                            </button>
                        ))}
                    </div>

                    {/* Time */}
                    <div className="flex flex-col items-center py-5 gap-1">
                        <span className={`text-5xl font-bold tabular-nums ${dark ? 'text-white' : 'text-gray-900'}`}>
                            {formatTime(timeLeft)}
                        </span>
                        <span className={`text-xs font-medium ${isRunning ? 'text-green-500 animate-pulse' : dark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {isRunning ? '● running' : SESSION_TYPES[sessionType].label}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className={`mx-4 h-1.5 rounded-full mb-4 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className={`h-full rounded-full bg-gradient-to-r ${sessionColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2 px-4 pb-4">
                        {!isRunning
                            ? <button onClick={startTimer} className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r ${sessionColor} shadow hover:opacity-90 transition`}>▶ Start</button>
                            : <button onClick={pauseTimer} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition">⏸ Pause</button>
                        }
                        <button onClick={resetTimer} className={`px-3 py-2.5 rounded-xl text-sm transition ${dark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`} title="Reset">🔄</button>
                    </div>
                </div>
            )}
        </>
    );
}