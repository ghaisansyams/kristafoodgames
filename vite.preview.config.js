import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// A static build of resources/js/preview (Spin the Wheel + Conveyor Belt only, no Laravel
// backend) for the client preview site. `npm run build:preview` writes it to dist-preview/,
// together with the fonts and logo images it needs from public/.
export default defineConfig({
    root: path.resolve(import.meta.dirname, 'preview'),
    publicDir: false,
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, 'resources/js'),
        },
    },
    css: {
        postcss: {
            plugins: [tailwindcss(path.resolve(import.meta.dirname, 'tailwind.config.js')), autoprefixer()],
        },
    },
    build: {
        outDir: path.resolve(import.meta.dirname, 'dist-preview'),
        emptyOutDir: true,
    },
});
