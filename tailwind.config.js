import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    // `display` is self-hosted (public/fonts/orbitron.woff2, see resources/css/app.css) rather
    // than pulled from a Google Fonts CDN, so it still works with no internet at the booth.
    // Body text keeps Tailwind's default system-font `font-sans` for readability.
    theme: {
        extend: {
            fontFamily: {
                display: ['Orbitron', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
        },
    },

    plugins: [forms],
};
