import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCodeImage({ value, className = 'h-56 w-56' }: { value: string; className?: string }) {
    const [dataUrl, setDataUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        QRCode.toDataURL(value, { margin: 1, width: 512, color: { dark: '#1f2a12', light: '#ffffff' } })
            .then((url) => {
                if (!cancelled) setDataUrl(url);
            })
            .catch(() => {
                if (!cancelled) setDataUrl(null);
            });
        return () => {
            cancelled = true;
        };
    }, [value]);

    if (!dataUrl) {
        return <div className={`animate-pulse rounded-2xl bg-ink-100 ${className}`} />;
    }

    return <img src={dataUrl} alt="Scan to join" className={`rounded-2xl bg-white p-3 ${className}`} />;
}
