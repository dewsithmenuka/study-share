<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'Welcome to Study Share! This is a simple test.';
});

Route::get('/test', function () {
    return 'Test route works!';
});

Route::get('/error-test', function () {
    try {
        return 'Inertia test: ' . Inertia::getVersion();
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});