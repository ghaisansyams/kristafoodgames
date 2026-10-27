import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    // Both fonts are self-hosted (public/fonts, see resources/css/app.css) rather than pulled
    // from a Google Fonts CDN, so they still work with no internet at the booth.
    // `sans` (body) is Fredoka; `display` (headings, timers) is Garet Heavy.
    theme: {
        extend: {
            fontFamily: {
                sans: ['Fredoka', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['Garet', 'Fredoka', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
        },
    },

    plugins: [forms],
};
