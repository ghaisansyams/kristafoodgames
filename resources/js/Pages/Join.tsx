import { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { StopwatchLogo } from '@/Components/Kiosk/GameLogos';

export default function Join({ token, alreadyClaimed }: { token: string; alreadyClaimed: boolean }) {
    const form = useForm({
        name: '',
        contact: '',
        email: '',
    });

    const isValid = form.data.name.trim().length > 0 && form.data.contact.trim().length > 0;

    function submit(e: FormEvent) {
        e.preventDefault();
        if (isValid) {
            form.post(`/join/${token}`);
        }
    }

    if (alreadyClaimed) {
        return (
            <CosmicBackground>
                <Head title="ALLPACK — Join" />
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
                    <AlertTriangle className="h-16 w-16 text-amber-400" strokeWidth={1.5} />
                    <h1 className="font-display text-xl font-black uppercase text-white">This QR code has already been used</h1>
                    <p className="text-slate-300">Ask the booth crew to show you a fresh QR code on the screen.</p>
                </div>
            </CosmicBackground>
        );
    }

    return (
        <CosmicBackground>
            <Head title="ALLPACK 2026 — Join" />

            <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
                <StopwatchLogo className="mb-4 h-20 w-20" />
                <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">ALLPACK 2026</p>
                <h1 className="mb-2 text-center font-display text-3xl font-black uppercase text-white">Let's Get Started!</h1>
                <p className="mb-8 max-w-xs text-center text-sm text-slate-300">
                    Fill in your details, then look back at the booth screen.
                </p>

                <form onSubmit={submit} className="w-full max-w-sm space-y-4">
                    <Field
                        placeholder="Full Name"
                        value={form.data.name}
                        onChange={(v) => form.setData('name', v)}
                        error={form.errors.name}
                    />
                    <Field
                        placeholder="Phone Number"
                        type="tel"
                        value={form.data.contact}
                        onChange={(v) => form.setData('contact', v)}
                        error={form.errors.contact}
                    />
                    <Field
                        placeholder="Email (optional)"
                        type="email"
                        value={form.data.email}
                        onChange={(v) => form.setData('email', v)}
                        error={form.errors.email}
                    />

                    <TouchButton type="submit" disabled={!isValid || form.processing} className="mt-2 w-full">
                        {form.processing ? 'Submitting…' : "Let's Play!"}
                    </TouchButton>
                </form>
            </div>
        </CosmicBackground>
    );
}

function Field({
    placeholder,
    value,
    onChange,
    error,
    type = 'text',
}: {
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    type?: string;
}) {
    return (
        <div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[56px] w-full rounded-2xl border border-amber-400/30 bg-white/[0.06] px-5 text-base text-white placeholder:text-slate-400 shadow-xl backdrop-blur-xl focus:border-amber-400/70 focus:outline-none"
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}
