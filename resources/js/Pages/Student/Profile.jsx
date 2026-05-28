import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';
import { useState, useRef, useEffect } from 'react';

export default function Profile({ auth, user, stats, completion }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';
    const { props } = usePage();
    const flash = props.flash || {};

    const [activeTab, setActiveTab] = useState('profile');
    const [form, setForm] = useState({
        name: user.name || '',
        username: user.username || '',
        student_id: user.student_id || '',
        degree_program: user.degree_program || '',
        semester: user.semester || '',
        bio: user.bio || '',
        phone: user.phone || '',
        interests: user.interests || [],
        is_profile_public: user.is_profile_public ?? true,
    });
    const [interestInput, setInterestInput] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(user.avatar);
    const [avatarFile, setAvatarFile] = useState(null);
    const [draggingAvatar, setDraggingAvatar] = useState(false);
    const [unsaved, setUnsaved] = useState(false);
    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [saving, setSaving] = useState(false);
    const avatarRef = useRef(null);

    useEffect(() => {
        if (flash.success) showToast(flash.success, 'success');
        if (flash.error) showToast(flash.error, 'error');
    }, [flash]);

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const card = 'rounded-xl p-6 ' + (dark ? 'bg-gray-800' : 'bg-white shadow-sm');
    const input = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-800');
    const label = 'block text-sm font-medium mb-1 ' + (dark ? 'text-gray-300' : 'text-gray-700');
    const tabClass = (t) => 'px-4 py-2.5 text-sm font-medium rounded-lg transition ' + (activeTab === t ? 'bg-blue-600 text-white' : (dark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'));

    const handleAvatarFile = (file) => {
        if (!file) return;
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) { showToast('Only JPG, PNG, WebP allowed.', 'error'); return; }
        if (file.size > 2 * 1024 * 1024) { showToast('Max file size is 2MB.', 'error'); return; }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarDrop = (e) => {
        e.preventDefault();
        setDraggingAvatar(false);
        handleAvatarFile(e.dataTransfer.files[0]);
    };

    const handleSaveAvatar = () => {
        if (!avatarFile) return;
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        router.post('/student/profile/avatar', formData, {
            onSuccess: () => { setAvatarFile(null); showToast('Profile picture updated!', 'success'); },
        });
    };

    const handleRemoveAvatar = () => {
        if (confirm('Remove profile picture?')) {
            router.delete('/student/profile/avatar', {
                onSuccess: () => { setAvatarPreview(null); setAvatarFile(null); },
            });
        }
    };

    const handleAddInterest = (e) => {
        if (e.key === 'Enter' && interestInput.trim()) {
            e.preventDefault();
            if (!form.interests.includes(interestInput.trim())) {
                setForm({ ...form, interests: [...form.interests, interestInput.trim()] });
                setUnsaved(true);
            }
            setInterestInput('');
        }
    };

    const handleRemoveInterest = (interest) => {
        setForm({ ...form, interests: form.interests.filter(i => i !== interest) });
        setUnsaved(true);
    };

    const handleUpdate = () => {
        setSaving(true);
        router.put('/student/profile', form, {
            onSuccess: () => { setUnsaved(false); setSaving(false); },
            onError: () => setSaving(false),
        });
    };

    const handlePasswordUpdate = () => {
        router.put('/student/profile/password', passwordForm, {
            onSuccess: () => setPasswordForm({ current_password: '', password: '', password_confirmation: '' }),
        });
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you sure? This will permanently delete your account and all your data. This cannot be undone.')) {
            router.delete('/student/profile/account');
        }
    };

    const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <MainLayout auth={auth}>
            <Head title="My Profile" />

            {toast && (
                <div className={'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ' + (toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}

            {unsaved && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3">
                    ⚠️ You have unsaved changes
                    <button onClick={handleUpdate} className="bg-white text-yellow-600 px-3 py-1 rounded-lg text-xs font-bold">Save Now</button>
                    <button onClick={() => { setForm({ name: user.name || '', username: user.username || '', student_id: user.student_id || '', degree_program: user.degree_program || '', semester: user.semester || '', bio: user.bio || '', phone: user.phone || '', interests: user.interests || [], is_profile_public: user.is_profile_public ?? true }); setUnsaved(false); }} className="text-white underline text-xs">Discard</button>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className={'text-2xl font-bold ' + (dark ? 'text-white' : 'text-gray-800')}>My Profile</h1>
                    <p className={dark ? 'text-gray-400' : 'text-gray-500'}>Manage your personal information and preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Avatar */}
                    <div className={card + ' flex flex-col items-center text-center'}>
                        <div
                            onDragOver={e => { e.preventDefault(); setDraggingAvatar(true); }}
                            onDragLeave={() => setDraggingAvatar(false)}
                            onDrop={handleAvatarDrop}
                            onClick={() => avatarRef.current?.click()}
                            className={'relative cursor-pointer w-24 h-24 rounded-full flex items-center justify-center mb-3 border-4 transition ' + (draggingAvatar ? 'border-blue-500' : (dark ? 'border-gray-600' : 'border-gray-200'))}
                        >
                            <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleAvatarFile(e.target.files[0])} />
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                    {initials}
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">📷</div>
                        </div>

                        <h3 className={'font-semibold ' + (dark ? 'text-white' : 'text-gray-800')}>{user.name}</h3>
                        {user.username && <p className={'text-sm ' + (dark ? 'text-gray-400' : 'text-gray-500')}>@{user.username}</p>}

                        <div className="flex gap-1 mt-2 flex-wrap justify-center">
                            {user.roles?.map(role => (
                                <span key={role} className={'text-xs px-2 py-0.5 rounded-full capitalize ' + (role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>{role}</span>
                            ))}
                            {user.email_verified && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Verified</span>}
                        </div>

                        {avatarFile && (
                            <button onClick={handleSaveAvatar} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-lg transition">
                                Save Photo
                            </button>
                        )}
                        {avatarPreview && !avatarFile && (
                            <button onClick={handleRemoveAvatar} className={'mt-2 text-xs ' + (dark ? 'text-red-400' : 'text-red-500')}>Remove photo</button>
                        )}

                        <p className={'text-xs mt-3 ' + (dark ? 'text-gray-500' : 'text-gray-400')}>Joined {user.joined_at}</p>
                        {user.last_login && <p className={'text-xs ' + (dark ? 'text-gray-500' : 'text-gray-400')}>Last active {user.last_login}</p>}
                    </div>

                    {/* Profile Completion */}
                    <div className={card}>
                        <h3 className={'text-sm font-semibold mb-2 ' + (dark ? 'text-white' : 'text-gray-800')}>Profile Completion</h3>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={'flex-1 h-2 rounded-full ' + (dark ? 'bg-gray-700' : 'bg-gray-200')}>
                                <div className="h-2 rounded-full bg-blue-600 transition-all" style={{width: completion + '%'}}></div>
                            </div>
                            <span className={'text-sm font-bold ' + (dark ? 'text-white' : 'text-gray-800')}>{completion}%</span>
                        </div>
                        <p className={'text-xs ' + (dark ? 'text-gray-400' : 'text-gray-500')}>
                            {completion < 100 ? 'Complete your profile to stand out!' : '🎉 Profile complete!'}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className={card}>
                        <h3 className={'text-sm font-semibold mb-3 ' + (dark ? 'text-white' : 'text-gray-800')}>Activity Stats</h3>
                        <div className="flex flex-col gap-2">
                            {[
                                { label: 'Uploaded', value: stats.uploaded_resources, icon: '📁' },
                                { label: 'Public', value: stats.public_resources, icon: '🌍' },
                                { label: 'Groups', value: stats.groups_joined, icon: '👥' },
                                { label: 'Avg Rating', value: stats.average_rating ? parseFloat(stats.average_rating).toFixed(1) : 'N/A', icon: '⭐' },
                            ].map(stat => (
                                <div key={stat.label} className={'flex items-center justify-between p-2 rounded-lg ' + (dark ? 'bg-gray-700' : 'bg-gray-50')}>
                                    <span className="text-sm">{stat.icon} {stat.label}</span>
                                    <span className={'text-sm font-bold ' + (dark ? 'text-white' : 'text-gray-800')}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nav Tabs */}
                    <div className={card + ' flex flex-col gap-1'}>
                        {[
                            { id: 'profile', label: '👤 Personal Info' },
                            { id: 'password', label: '🔒 Password' },
                            { id: 'preferences', label: '⚙️ Preferences' },
                            { id: 'danger', label: '⚠️ Danger Zone' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabClass(tab.id) + ' text-left'}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 flex flex-col gap-5">

                    {activeTab === 'profile' && (
                        <>
                            <div className={card}>
                                <h2 className={'text-lg font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>Personal Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={label}>Full Name</label>
                                        <input type="text" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setUnsaved(true); }} className={input} />
                                    </div>
                                    <div>
                                        <label className={label}>Username</label>
                                        <div className="relative">
                                            <span className={'absolute left-3 top-2 text-sm ' + (dark ? 'text-gray-400' : 'text-gray-500')}>@</span>
                                            <input type="text" value={form.username} onChange={e => { setForm({ ...form, username: e.target.value }); setUnsaved(true); }} className={input + ' pl-7'} placeholder="username" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={label}>Email</label>
                                        <div className="relative">
                                            <input type="email" value={user.email} disabled className={input + ' opacity-60 cursor-not-allowed'} />
                                            {user.email_verified && <span className="absolute right-3 top-2 text-green-500 text-xs">✓ Verified</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={label}>Phone (optional)</label>
                                        <input type="tel" value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setUnsaved(true); }} className={input} placeholder="+94 77 123 4567" />
                                    </div>
                                </div>
                            </div>

                            <div className={card}>
                                <h2 className={'text-lg font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>Academic Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={label}>Student ID</label>
                                        <input type="text" value={form.student_id} onChange={e => { setForm({ ...form, student_id: e.target.value }); setUnsaved(true); }} className={input} placeholder="e.g. IT21234567" />
                                    </div>
                                    <div>
                                        <label className={label}>Degree Program</label>
                                        <input type="text" value={form.degree_program} onChange={e => { setForm({ ...form, degree_program: e.target.value }); setUnsaved(true); }} className={input} placeholder="e.g. BSc in Computer Science" />
                                    </div>
                                    <div>
                                        <label className={label}>Current Semester</label>
                                        <select value={form.semester} onChange={e => { setForm({ ...form, semester: e.target.value }); setUnsaved(true); }} className={input}>
                                            <option value="">Select semester</option>
                                            {['Semester 1','Semester 2','Semester 3','Semester 4','Semester 5','Semester 6','Semester 7','Semester 8'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={card}>
                                <h2 className={'text-lg font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>About Me</h2>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className={label}>Bio</label>
                                        <textarea value={form.bio} onChange={e => { setForm({ ...form, bio: e.target.value }); setUnsaved(true); }} rows={3} maxLength={500} className={input} placeholder="Tell others about yourself..." />
                                        <p className={'text-xs mt-1 ' + (dark ? 'text-gray-500' : 'text-gray-400')}>{form.bio?.length || 0}/500</p>
                                    </div>
                                    <div>
                                        <label className={label}>Interests & Skills (press Enter to add)</label>
                                        <input
                                            type="text"
                                            value={interestInput}
                                            onChange={e => setInterestInput(e.target.value)}
                                            onKeyDown={handleAddInterest}
                                            className={input}
                                            placeholder="e.g. Machine Learning, Web Dev, Data Science..."
                                        />
                                        {form.interests?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {form.interests.map(interest => (
                                                    <span key={interest} className={'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ' + (dark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700')}>
                                                        {interest}
                                                        <button onClick={() => handleRemoveInterest(interest)} className="hover:text-red-500 ml-1">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => { setForm({ name: user.name || '', username: user.username || '', student_id: user.student_id || '', degree_program: user.degree_program || '', semester: user.semester || '', bio: user.bio || '', phone: user.phone || '', interests: user.interests || [], is_profile_public: user.is_profile_public ?? true }); setUnsaved(false); }}
                                    className={'px-6 py-2 rounded-lg text-sm font-medium transition ' + (dark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}

                    {activeTab === 'password' && (
                        <div className={card}>
                            <h2 className={'text-lg font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>Change Password</h2>
                            {user.google_id && (
                                <div className={'p-3 rounded-lg mb-4 ' + (dark ? 'bg-blue-900' : 'bg-blue-50')}>
                                    <p className={'text-sm ' + (dark ? 'text-blue-300' : 'text-blue-700')}>ℹ️ You signed in with Google. You can set a password to also log in with email.</p>
                                </div>
                            )}
                            <div className="flex flex-col gap-4">
                                {!user.google_id && (
                                    <div>
                                        <label className={label}>Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.current ? 'text' : 'password'}
                                                value={passwordForm.current_password}
                                                onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                                className={input}
                                                placeholder="Enter current password"
                                            />
                                            <button type="button" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} className={'absolute right-3 top-2 text-xs ' + (dark ? 'text-gray-400' : 'text-gray-500')}>
                                                {showPassword.current ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className={label}>New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? 'text' : 'password'}
                                            value={passwordForm.password}
                                            onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                            className={input}
                                            placeholder="Min 8 characters"
                                        />
                                        <button type="button" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className={'absolute right-3 top-2 text-xs ' + (dark ? 'text-gray-400' : 'text-gray-500')}>
                                            {showPassword.new ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={label}>Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? 'text' : 'password'}
                                            value={passwordForm.password_confirmation}
                                            onChange={e => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                                            className={input}
                                            placeholder="Repeat new password"
                                        />
                                        <button type="button" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className={'absolute right-3 top-2 text-xs ' + (dark ? 'text-gray-400' : 'text-gray-500')}>
                                            {showPassword.confirm ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                                <button onClick={handlePasswordUpdate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition w-fit">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className={card}>
                            <h2 className={'text-lg font-semibold mb-4 ' + (dark ? 'text-white' : 'text-gray-800')}>Preferences</h2>
                            <div className="flex flex-col gap-4">
                                <div className={'flex items-center justify-between p-4 rounded-lg ' + (dark ? 'bg-gray-700' : 'bg-gray-50')}>
                                    <div>
                                        <p className={'font-medium text-sm ' + (dark ? 'text-white' : 'text-gray-800')}>Public Profile</p>
                                        <p className={'text-xs ' + (dark ? 'text-gray-400' : 'text-gray-500')}>Allow other students to view your profile</p>
                                    </div>
                                    <button
                                        onClick={() => { setForm({ ...form, is_profile_public: !form.is_profile_public }); setUnsaved(true); }}
                                        className={'w-12 h-6 rounded-full transition ' + (form.is_profile_public ? 'bg-blue-600' : (dark ? 'bg-gray-600' : 'bg-gray-300'))}
                                    >
                                        <div className={'w-5 h-5 bg-white rounded-full shadow transition-transform ' + (form.is_profile_public ? 'translate-x-6' : 'translate-x-1')}></div>
                                    </button>
                                </div>
                                <button onClick={handleUpdate} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition w-fit">
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div className={'rounded-xl p-6 border-2 border-red-200 ' + (dark ? 'bg-gray-800' : 'bg-white')}>
                            <h2 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h2>
                            <p className={'text-sm mb-6 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>These actions are permanent and cannot be undone.</p>
                            <div className={'p-4 rounded-lg border ' + (dark ? 'border-red-900 bg-red-900/20' : 'border-red-200 bg-red-50')}>
                                <h3 className="font-medium text-red-600 mb-1">Delete Account</h3>
                                <p className={'text-xs mb-3 ' + (dark ? 'text-gray-400' : 'text-gray-500')}>Permanently delete your account and all associated data including uploads, groups, and messages.</p>
                                <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition">
                                    Delete My Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
