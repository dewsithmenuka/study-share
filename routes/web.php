<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ResourceController as AdminResourceController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\ContactController as AdminContactController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\ResourceController as StudentResourceController;
use App\Http\Controllers\Student\GroupController;
use App\Http\Controllers\Student\ContactController;
use App\Http\Controllers\Student\GroupChatController;
use App\Http\Controllers\Student\AiAnalyzerController;
use App\Http\Controllers\Student\MemberProfileController;
use App\Http\Controllers\Student\PomodoroController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Student\ProfileController;
use Inertia\Inertia;

Route::get('/db-test', function () {
    try {
        DB::connection()->getPDO();
        return 'Database connected!';
    } catch (\Exception $e) {
        return 'Database error: ' . $e->getMessage();
    }
});

Route::get('/', function () {
    return view('landing');
});

Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('student.dashboard');
    }
    // Use simple Blade instead of Inertia
    return view('welcome');
});

Route::get('/test', function () {
    return 'Laravel is working!';
});
// 
// Student routes
Route::middleware(['auth', 'role:student|admin'])->prefix('student')->name('student.')->group(function () {
    // Dashboard & Resources
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
    Route::get('/browse', [StudentResourceController::class, 'index'])->name('browse');
    Route::get('/upload', [StudentResourceController::class, 'upload'])->name('upload');
    Route::post('/upload', [StudentResourceController::class, 'store'])->name('upload.store');
    Route::get('/download/{resourceFile}', [StudentResourceController::class, 'download'])->name('download');
    
    // Favorites & Ratings
    Route::post('/favorite/{resourceFile}', [StudentResourceController::class, 'toggleFavorite'])->name('favorite');
    Route::get('/favorites', [StudentResourceController::class, 'favorites'])->name('favorites');
    Route::post('/rate/{resourceFile}', [StudentResourceController::class, 'rate'])->name('rate');
    
    // Library
    Route::get('/library', [StudentResourceController::class, 'library'])->name('library');
    Route::post('/share/{resourceFile}', [StudentResourceController::class, 'shareToPublic'])->name('share');
    Route::delete('/library/{resourceFile}', [StudentResourceController::class, 'deleteOwn'])->name('library.delete');
    
    // AI Analyzer
    Route::post('/ai-analyzer/chat', [AiAnalyzerController::class, 'chat'])->name('ai.chat');
    Route::post('/ai-analyzer/analyze-file', [AiAnalyzerController::class, 'analyzeFile'])->name('ai.analyze.file');
    Route::post('/ai-analyzer/chat-document', [AiAnalyzerController::class, 'chatWithDocument'])->name('ai.chat.document');
    Route::get('/ai-analyzer', [AiAnalyzerController::class, 'index'])->name('ai.analyzer');
    Route::get('/ai-analyzer/resources', [AiAnalyzerController::class, 'getResources'])->name('ai.resources');
    Route::post('/ai-analyzer/analyze', [AiAnalyzerController::class, 'analyze'])->name('ai.analyze');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::delete('/profile/avatar', [ProfileController::class, 'removeAvatar'])->name('profile.avatar.remove');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile/account', [ProfileController::class, 'deleteAccount'])->name('profile.delete');
    
    // Notifications
    Route::get('/notifications', [ProfileController::class, 'getNotifications'])->name('notifications');
    Route::post('/notifications/read', [ProfileController::class, 'markNotificationsRead'])->name('notifications.read');
    Route::delete('/notifications/clear', [ProfileController::class, 'clearReadNotifications'])->name('notifications.clear');
    
    // Members
    Route::get('/members/{user}', [MemberProfileController::class, 'show'])->name('members.show');
    
    // Pomodoro Timer
    Route::get('/pomodoro', [PomodoroController::class, 'index'])->name('pomodoro');
    
    // Contact
    Route::get('/contact', [ContactController::class, 'index'])->name('contact');
    Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
    
    // Groups
    Route::get('/groups', [GroupController::class, 'index'])->name('groups.index');
    Route::get('/groups/create', [GroupController::class, 'create'])->name('groups.create');
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('/groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::post('/groups/{group}/members/search', [GroupController::class, 'addMember'])->name('groups.members.search');
    Route::post('/groups/{group}/members/invite', [GroupController::class, 'inviteMember'])->name('groups.members.invite');
    Route::post('/groups/{group}/resources', [GroupController::class, 'shareResource'])->name('groups.resources.share');
    Route::delete('/groups/{group}/leave', [GroupController::class, 'leave'])->name('groups.leave');
    Route::delete('/groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
    Route::get('/groups/{group}/messages', [GroupChatController::class, 'getMessages'])->name('groups.messages.get');
    Route::post('/groups/{group}/messages', [GroupChatController::class, 'sendMessage'])->name('groups.messages.send');
});

// Admin routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/resources', [AdminResourceController::class, 'index'])->name('resources');
    Route::patch('/resources/{resourceFile}/approve', [AdminResourceController::class, 'approve'])->name('resources.approve');
    Route::patch('/resources/{resourceFile}/reject', [AdminResourceController::class, 'reject'])->name('resources.reject');
    Route::delete('/resources/{resourceFile}', [AdminResourceController::class, 'destroy'])->name('resources.destroy');
    Route::get('/users', [AdminUserController::class, 'index'])->name('users');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    Route::patch('/resources/{resourceFile}/approve-public', [AdminResourceController::class, 'approvePublic'])->name('resources.approve.public');
    Route::patch('/resources/{resourceFile}/reject-public', [AdminResourceController::class, 'rejectPublic'])->name('resources.reject.public');

    // Contact routes
    Route::get('/contact', [AdminContactController::class, 'index'])->name('contact');
    Route::patch('/contact/{contactMessage}/read', [AdminContactController::class, 'markRead'])->name('contact.read');
    Route::delete('/contact/{contactMessage}', [AdminContactController::class, 'destroy'])->name('contact.destroy');
    Route::post('/contact/{contactMessage}/reply', [AdminContactController::class, 'reply'])->name('contact.reply');
});

// Auth routes
Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

require __DIR__ . '/auth.php';
