import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            buildDirectory: 'build',
            refresh: true,
        }),
        react(),
    ],
    build: {
        target: 'esnext',
        minify: false,
    },
});