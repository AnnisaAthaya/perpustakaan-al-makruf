import '../css/app.css';

import { Toaster } from '@/components/ui/sonner';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = 'Perpustakaan Al-Maruf';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster position="top-center" richColors closeButton />
            </>,
        );
    },
    defaults: {
        visitOptions(_, options) {
            return {
                preserveScroll: true,
                preserveState: true,
                ...options,
            };
        },
    },
    progress: {
        color: '#10b981', // Primary emerald-500 sesuai styles.json
    },
});
