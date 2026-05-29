import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: ['resources/js/**'],
        }),
        react(),
    ],
    build: {
        outDir: 'public/build',
        rollupOptions: {
            input: 'resources/js/app.jsx',
        },
    },
});