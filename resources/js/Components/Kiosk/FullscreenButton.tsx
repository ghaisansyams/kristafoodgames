import { useEffect, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

/**
 * A round button that puts the whole booth page into fullscreen (and back out), for a TV or
 * kiosk browser with its address bar and tabs in the way. Browsers only allow fullscreen from a
 * user tap, so it can't happen on its own at load. Hidden where the browser can't do it at all
 * (iPhone Safari), and it follows `fullscreenchange` so it stays correct when fullscreen is left
 * with Esc rather than with this button.
 */
export default function FullscreenButton({ className = '' }: { className?: string }) {
    const { t } = useLocale();
    const [active, setActive] = useState(() => !!document.fullscreenElement);
    const supported = typeof document.documentElement.requestFullscreen === 'function';

    useEffect(() => {
        const sync = () => setActive(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', sync);
        return () => document.removeEventListener('fullscreenchange', sync);
    }, []);

    if (!supported) return null;

    const label = active ? t('fullscreenExit') : t('fullscreen');

    return (
        <button
            type="button"
            onClick={() => (active ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {})}
            aria-label={label}
            title={label}
            className={`flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full border-2 border-leaf-300 bg-white text-leaf-700 shadow-[0_4px_0_0_#d9e79a] transition hover:border-leaf-400 hover:bg-leaf-50 hover:text-leaf-800 active:translate-y-0.5 active:shadow-[0_2px_0_0_#d9e79a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300 ${className}`}
        >
            {active ? <Minimize className="h-5 w-5" strokeWidth={2.4} /> : <Maximize className="h-5 w-5" strokeWidth={2.4} />}
        </button>
    );
}
