import { FormEvent, useState } from 'react';
import TouchButton from '@/Components/Kiosk/TouchButton';
import { useLocale } from '@/lib/i18n';
import type { DecisionResult } from '@/types/content';

export default function ResultStage({
    result,
    onSendEmail,
    onTalkToExpert,
    onBack,
}: {
    result: DecisionResult;
    onSendEmail: (email: string) => Promise<{ ok: boolean; message?: string }>;
    onTalkToExpert: () => Promise<{ ok: boolean; message?: string }>;
    onBack: () => void;
}) {
    const { t } = useLocale();
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [emailValue, setEmailValue] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [expertRequested, setExpertRequested] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [sendingEmail, setSendingEmail] = useState(false);

    const fitLabel = result.fit_score >= 85 ? t('strongFit') : result.fit_score >= 65 ? t('goodFit') : t('fairFit');

    async function submitEmail(e: FormEvent) {
        e.preventDefault();
        setSendingEmail(true);
        setEmailError(null);
        const { ok, message } = await onSendEmail(emailValue);
        setSendingEmail(false);
        if (ok) {
            setEmailSent(true);
        } else {
            setEmailError(message ?? t('couldNotSaveEmail'));
        }
    }

    return (
        <div className="mx-auto w-full max-w-4xl">
            <p className="mb-2 text-center font-display text-sm font-semibold uppercase tracking-widest text-indigo-600">
                {t('yourDecisionEyebrow')}
            </p>
            <h2 className="mb-8 text-center font-display text-3xl font-black uppercase text-slate-900">{t('resultTitle')}</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-3xl border border-white/70 bg-white/50 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_40px_rgba(99,102,241,0.2)] backdrop-blur-xl">
                    <span className="text-sm uppercase tracking-widest text-slate-500">{t('yourDecisionEyebrow')}</span>
                    <span className="my-2 font-display text-7xl font-black text-indigo-600 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                        {result.fit_score}
                    </span>
                    <span className="text-slate-500">{t('outOf100')}</span>
                    <span className="mt-4 rounded-full bg-gradient-to-b from-indigo-400 to-violet-600 px-6 py-2 font-display font-bold text-white shadow-[0_0_14px_rgba(99,102,241,0.4)]">
                        {fitLabel}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <ResultTile label={t('yourStrength')} value={result.strength} icon="✓" />
                    <ResultTile label={t('yourProfile')} value={result.profile} icon="●" />
                    <ResultTile label={t('yourTradeOff')} value={result.trade_off} icon="!" />
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/70 bg-white/50 p-6 backdrop-blur-xl">
                <p className="font-display text-sm font-semibold uppercase tracking-widest text-indigo-600">{t('solutionLabel')}</p>
                <p className="text-xl font-bold text-slate-900">{result.solution_label}</p>
            </div>

            {showEmailForm && !emailSent ? (
                <form onSubmit={submitEmail} className="mt-8 rounded-2xl border border-white/70 bg-white/50 p-5 backdrop-blur-xl">
                    <p className="mb-3 text-sm font-semibold text-slate-600">{t('emailFormPrompt')}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="email"
                            required
                            autoFocus
                            placeholder="you@company.com"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            className="min-h-[56px] flex-1 rounded-2xl border border-white/70 bg-white/60 px-5 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
                        />
                        <TouchButton type="submit" variant="secondary" disabled={sendingEmail} className="sm:w-auto">
                            {sendingEmail ? t('sending') : t('send')}
                        </TouchButton>
                    </div>
                </form>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TouchButton variant="secondary" disabled={emailSent} onClick={() => setShowEmailForm(true)}>
                        {emailSent ? t('resultRequested') : t('sendResultToEmail')}
                    </TouchButton>
                    <TouchButton
                        disabled={expertRequested}
                        onClick={async () => {
                            await onTalkToExpert();
                            setExpertRequested(true);
                        }}
                    >
                        {expertRequested ? t('teamIsComing') : t('talkToExpert')}
                    </TouchButton>
                </div>
            )}

            {emailError && <p className="mt-3 text-center text-sm text-red-500">{emailError}</p>}

            <div className="mt-6 text-center">
                <button onClick={onBack} className="text-slate-500 underline hover:text-slate-800">
                    {t('chooseAnotherGame')}
                </button>
            </div>
        </div>
    );
}

function ResultTile({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/50 p-5 backdrop-blur-xl">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-indigo-400 to-violet-600 font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                {icon}
            </span>
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                <p className="text-lg font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}
