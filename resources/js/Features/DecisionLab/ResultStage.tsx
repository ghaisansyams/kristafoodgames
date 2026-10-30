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
            <p className="mb-2 text-center font-display text-sm font-semibold uppercase tracking-widest text-leaf-800">
                {t('resultEyebrow')}
            </p>
            <h2 className="mb-8 text-center font-display text-3xl font-black uppercase text-ink-900">{t('resultProductTitle')}</h2>

            <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-ink-100 bg-white p-8 text-center shadow-card">
                <div className="flex w-full flex-wrap items-center justify-center gap-8">
                    {result.product.logos.map((logo) => (
                        <img key={logo} src={logo} alt={result.product.name} className={`max-h-44 object-contain ${result.product.logos.length === 1 ? 'max-w-[24rem]' : 'max-w-[14rem]'}`} />
                    ))}
                </div>
                <div>
                    <p className="font-display text-2xl font-black text-ink-900">{result.product.name}</p>
                    <p className="mt-1 text-lg text-ink-600">{result.product.description}</p>
                </div>
            </div>

            {result.reasons.length > 0 && (
                <ResultList title={t('whyMatches')} items={result.reasons} />
            )}

            {result.alternatives.length > 0 && (
                <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6">
                    <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-leaf-800">{t('alsoConsider')}</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {result.alternatives.map((alternative) => (
                            <div key={alternative.slug} className="flex items-center gap-4 rounded-xl bg-white p-4">
                                <img src={alternative.logos[0]} alt="" className="h-12 w-20 shrink-0 object-contain" />
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-ink-900">{alternative.name}</p>
                                    <p className="text-sm text-ink-600">{alternative.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showEmailForm && !emailSent ? (
                <form onSubmit={submitEmail} className="mt-8 rounded-2xl border border-ink-100 bg-white p-5">
                    <p className="mb-3 text-sm font-semibold text-ink-600">{t('emailFormPrompt')}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="email"
                            required
                            autoFocus
                            placeholder="you@company.com"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            className="min-h-[56px] flex-1 rounded-2xl border border-ink-100 bg-white px-5 text-base text-ink-900 placeholder:text-ink-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 focus:outline-none"
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

            {emailError && <p className="mt-3 text-center text-sm text-red-600">{emailError}</p>}

            <div className="mt-6 text-center">
                <button onClick={onBack} className="text-ink-500 underline hover:text-ink-800">
                    {t('chooseAnotherGame')}
                </button>
            </div>
        </div>
    );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6">
            <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-leaf-800">{title}</p>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <span key={item} className="rounded-full bg-leaf-100 px-4 py-2 text-sm font-semibold text-leaf-800">
                        ✓ {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
