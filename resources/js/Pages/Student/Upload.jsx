import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';

export default function Upload({ auth, categories }) {
    const { theme } = useTheme();
    const dark = theme === 'dark';

    const [form, setForm] = useState({
        title: '', subject: '', semester: '', description: '', category_id: '', file: null,
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!form.title) newErrors.title = 'Title is required.';
        else if (!/^[a-zA-Z0-9\s\-_]+$/.test(form.title)) newErrors.title = 'Title can only contain letters, numbers, spaces, hyphens and underscores.';
        if (!form.subject) newErrors.subject = 'Subject is required.';
        if (!form.semester) newErrors.semester = 'Semester is required.';
        if (!form.file) newErrors.file = 'Please select a file.';
        else if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(form.file.type)) {
            newErrors.file = 'Only PDF, DOCX, and PPTX files are allowed.';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setUploading(true);
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
        router.post('/student/upload', data, {
            onSuccess: () => { setSuccess(true); setForm({ title: '', subject: '', semester: '', description: '', category_id: '', file: null }); setErrors({}); },
            onError: (e) => setErrors(e),
            onFinish: () => setUploading(false),
        });
    };

    const inputClass = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
    }`;
    const labelClass = `block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`;
    const cardClass = `rounded-xl shadow-sm p-6 ${dark ? 'bg-gray-800' : 'bg-white'}`;

    return (
        <MainLayout auth={auth}>
            <Head title="Upload Resource" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Upload a Resource</h1>
                    <p className={dark ? 'text-gray-400 mt-1' : 'text-gray-500 mt-1'}>Share your notes or study materials with other students</p>
                </div>

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 flex items-center gap-2">
                        ✅ <span>File uploaded successfully! It will be visible after admin approval.</span>
                    </div>
                )}

                <div className={cardClass}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className={labelClass}>Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Data Structures Lecture Notes"
                                className={inputClass}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Subject</label>
                            <input
                                type="text"
                                value={form.subject}
                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                placeholder="e.g. Computer Science"
                                className={inputClass}
                            />
                            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Semester</label>
                            <select
                                value={form.semester}
                                onChange={e => setForm({ ...form, semester: e.target.value })}
                                className={inputClass}
                            >
                                <option value="">Select semester</option>
                                {['Semester 1','Semester 2','Semester 3','Semester 4','Semester 5','Semester 6'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
                        </div>

                        {categories.length > 0 && (
                            <div>
                                <label className={labelClass}>Category (optional)</label>
                                <select
                                    value={form.category_id}
                                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">Select category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Description (optional)</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Briefly describe what this resource covers..."
                                rows={3}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>File</label>
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                                dark ? 'border-gray-600 hover:border-blue-500' : 'border-gray-200 hover:border-blue-400'
                            }`}>
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.pptx"
                                    onChange={e => setForm({ ...form, file: e.target.files[0] })}
                                    className="hidden"
                                    id="file-input"
                                />
                                <label htmlFor="file-input" className="cursor-pointer">
                                    <p className="text-3xl mb-2">📂</p>
                                    <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {form.file ? form.file.name : 'Click to select a file'}
                                    </p>
                                    <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>PDF, DOCX, PPTX up to 10MB</p>
                                </label>
                            </div>
                            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg transition"
                        >
                            {uploading ? 'Uploading...' : 'Upload Resource'}
                        </button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}