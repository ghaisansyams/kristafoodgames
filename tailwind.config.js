import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    // Foopak brand kit: Garet Heavy for headings, Fredoka for everything else, leaf green
    // #a3c226 and orange #f39308. Both fonts are self-hosted (public/fonts, see
    // resources/css/app.css) so the booth still works with no internet.
    //
    // The two brand colors are too light to carry small text on white (2.0:1 and 2.3:1), so
    // they are used as fills with `ink-900` text on top (7.4:1 and 6.4:1). Colored text uses
    // the darker steps: leaf-800 / citrus-700 for small text, leaf-700 / citrus-600 only for
    // large display text.
    theme: {
        extend: {
            colors: {
                leaf: {
                    50: '#f6f9e7',
                    100: '#ebf2c9',
                    200: '#d9e79a',
                    300: '#c4d965',
                    400: '#b2cd3f',
                    500: '#a3c226',
                    600: '#87a31a',
                    700: '#6a8113',
                    800: '#4f600f',
                    900: '#36420b',
                },
                citrus: {
                    50: '#fef7ec',
                    100: '#fdedd3',
                    200: '#fcdaa6',
                    300: '#fac373',
                    400: '#f7ab3c',
                    500: '#f39308',
                    600: '#d47a04',
                    700: '#a95f04',
                    800: '#7e4706',
                    900: '#553005',
                },
                // Warm olive-tinted neutrals so grey text sits with the green rather than the
                // cool blue-grey of Tailwind's slate.
                ink: {
                    50: '#f7f8f4',
                    100: '#eef0ea',
                    200: '#dadfd2',
                    300: '#b8beaf',
                    400: '#8e9683',
                    500: '#6c7660',
                    600: '#556048',
                    700: '#3f4a33',
                    800: '#2d3820',
                    900: '#1f2a12',
                },
            },
            fontFamily: {
                sans: ['Fredoka', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['Garet', 'Fredoka', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                card: '0 10px 30px rgba(54, 66, 11, 0.10)',
                'card-lg': '0 16px 40px rgba(54, 66, 11, 0.14)',
            },
        },
    },

    plugins: [forms],
};
