<?php

Route::get('/', function () {
    return 'PHP is working!';
});

Route::get('/test', function () {
    return 'Test route works!';
});