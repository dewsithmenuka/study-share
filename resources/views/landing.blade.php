<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudyShare - Share Knowledge, Grow Together</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        dark: {
                            bg: '#111827',
                            card: '#1f2937',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        html { scroll-behavior: smooth; }
    </style>
</head>
<body class="bg-white text-gray-900">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="text-2xl">📚</span>
                <span class="font-bold text-xl text-gray-800">StudyShare</span>
            </div>
            <div class="flex items-center gap-4">
                <a href="/login" class="font-medium text-gray-600 hover:text-gray-900 transition">Login</a>
                <a href="/register" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Get Started</a>
            </div>
        </div>
    </nav>

    <!-- Hero -->
    <section class="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 bg-blue-400"></div>
            <div class="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 bg-purple-400"></div>
            <div class="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 bg-teal-400"></div>
        </div>

        <div class="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 bg-blue-100 text-blue-700">
                <span>✨</span>
                <span>The smart way to study together</span>
            </div>

            <h1 class="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-gray-900">
                Share Knowledge,
                <span class="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Grow Together
                </span>
            </h1>

            <p class="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-gray-600">
                A platform where students upload notes, share resources, form study groups, and chat — all in one place.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/register" class="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition shadow-lg hover:shadow-blue-500/25">
                    Get Started Free →
                </a>
                <a href="/login" class="border-2 border-gray-300 text-gray-700 hover:border-gray-400 text-lg px-8 py-4 rounded-xl font-semibold transition">
                    Sign In
                </a>
            </div>

            <div class="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto text-gray-500">
                <div class="text-center">
                    <p class="text-3xl font-bold text-gray-900">500+</p>
                    <p class="text-sm">Resources</p>
                </div>
                <div class="text-center">
                    <p class="text-3xl font-bold text-gray-900">50+</p>
                    <p class="text-sm">Study Groups</p>
                </div>
                <div class="text-center">
                    <p class="text-3xl font-bold text-gray-900">100%</p>
                    <p class="text-sm">Free</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold mb-4 text-gray-900">Everything you need to study smarter</h2>
                <p class="text-xl text-gray-600">Built for students, by students</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="bg-white rounded-2xl p-6 hover:shadow-xl transition">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl mb-4">📁</div>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Resource Sharing</h3>
                    <p class="text-gray-600">Upload and discover notes, past papers, and study materials from your peers.</p>
                </div>
                <div class="bg-white rounded-2xl p-6 hover:shadow-xl transition">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl mb-4">👥</div>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Study Groups</h3>
                    <p class="text-gray-600">Create or join study groups, add friends, and collaborate on shared resources.</p>
                </div>
                <div class="bg-white rounded-2xl p-6 hover:shadow-xl transition">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl mb-4">💬</div>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Group Chat</h3>
                    <p class="text-gray-600">Real-time messaging within your study groups.</p>
                </div>
                <div class="bg-white rounded-2xl p-6 hover:shadow-xl transition">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-2xl mb-4">⭐</div>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Smart Ratings</h3>
                    <p class="text-gray-600">Rate resources to help the best content rise to the top.</p>
                </div>
                <div class="bg-white rounded-2xl p-6 hover:shadow-xl transition">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl mb-4">🔍</div>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Smart Search</h3>
                    <p class="text-gray-600">Filter by subject, semester, or keyword to find exactly what you need.</p>
                </div>
                <div class="bg-white rounded-2xl p-6 hover:shadow-xl transition">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-2xl mb-4">🛡️</div>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Admin Control</h3>
                    <p class="text-gray-600">All resources are reviewed and approved by admins.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How it works -->
    <section class="py-24 bg-white">
        <div class="max-w-5xl mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold mb-4 text-gray-900">How it works</h2>
                <p class="text-xl text-gray-600">Get started in 3 simple steps</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center relative">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 bg-blue-50">👤</div>
                    <span class="text-blue-600 font-bold text-sm">01</span>
                    <h3 class="text-xl font-semibold mt-1 mb-2 text-gray-900">Create an account</h3>
                    <p class="text-gray-600">Sign up for free and set up your student profile in under a minute.</p>
                </div>
                <div class="text-center relative">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 bg-blue-50">📤</div>
                    <span class="text-blue-600 font-bold text-sm">02</span>
                    <h3 class="text-xl font-semibold mt-1 mb-2 text-gray-900">Upload or browse</h3>
                    <p class="text-gray-600">Share your notes or discover resources uploaded by your classmates.</p>
                </div>
                <div class="text-center relative">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 bg-blue-50">🎓</div>
                    <span class="text-blue-600 font-bold text-sm">03</span>
                    <h3 class="text-xl font-semibold mt-1 mb-2 text-gray-900">Study together</h3>
                    <p class="text-gray-600">Join study groups, chat with friends, and ace your exams together.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <h2 class="text-4xl font-bold text-white mb-4">Ready to study smarter?</h2>
            <p class="text-blue-100 text-xl mb-8">Join thousands of students already using StudyShare</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/register" class="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-xl font-semibold transition shadow-lg">Create Free Account</a>
                <a href="/login" class="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 rounded-xl font-semibold transition">Sign In</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 bg-gray-50 text-center text-gray-400">
        <div class="flex items-center justify-center gap-2 mb-2">
            <span class="text-xl">📚</span>
            <span class="font-bold">StudyShare</span>
        </div>
        <p class="text-sm">Built for students. Made with ❤️</p>
    </footer>
</body>
</html>