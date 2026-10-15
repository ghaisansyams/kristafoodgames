import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TouchButton from '@/Components/Kiosk/TouchButton';
import StepHeader from '@/Components/Kiosk/StepHeader';
import SelectCard from '@/Components/Kiosk/SelectCard';
import CountdownBar from '@/Components/Kiosk/CountdownBar';
import { DecisionLogo } from '@/Components/Kiosk/GameLogos';
import Icon from '@/lib/icons';
import { ContentApi, DecisionSessionApi } from '@/lib/api';
import { useLocale } from '@/lib/i18n';
import { clearPersistedState, loadPersistedState, savePersistedState } from '@/lib/sessionPersistence';
import ResultStage from './ResultStage';
import type {
    BusinessCase,
    DecisionLabContent,
    DecisionResult,
    Market,
    PackagingOptionChoice,
    Priority,
    PrioritySlug,
} from '@/types/content';

type Stage = 'loading' | 'start' | 'business_case' | 'market' | 'priorities' | 'decision' | 'result';

// Generic packaging product cutouts, assigned by option position (A/B/C) rather than by
// business case content — a placeholder visual treatment until case-specific photography exists.
const OPTION_IMAGES = ['/images/packaging/option-a.png', '/images/packaging/option-b.png', '/images/packaging/option-c.png'];

const STORAGE_KEY = 'allpack.decision-lab.v1';

interface PersistedState {
    stage: Stage;
    sessionId: number | null;
    businessCase: BusinessCase | null;
    market: Market | null;
    priorities: PrioritySlug[];
    options: PackagingOptionChoice[] | null;
    result: DecisionResult | null;
}

export default function DecisionLabExperience({
    visitorId,
    onBack,
}: {
    visitorId: number | null;
    onBack: () => void;
}) {
    const { t } = useLocale();
    const [stage, setStage] = useState<Stage>('loading');
    const [content, setContent] = useState<DecisionLabContent | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [sessionId, setSessionId] = useState<number | null>(null);
    const [businessCase, setBusinessCase] = useState<BusinessCase | null>(null);
    const [market, setMarket] = useState<Market | null>(null);
    const [priorities, setPriorities] = useState<PrioritySlug[]>([]);
    const [options, setOptions] = useState<PackagingOptionChoice[] | null>(null);
    const [result, setResult] = useState<DecisionResult | null>(null);

    // Guards the persistence effect so it doesn't immediately overwrite the just-restored
    // state with itself (or with the pre-restore defaults) before restoration has run.
    const restoredRef = useRef(false);

    useEffect(() => {
        Promise.all([ContentApi.decisionLab(), DecisionSessionApi.create(visitorId ?? undefined)])
            .then(([data, session]) => {
                setContent(data);

                const persisted = loadPersistedState<PersistedState>(STORAGE_KEY);
                if (persisted && persisted.stage !== 'loading') {
                    setStage(persisted.stage);
                    setSessionId(persisted.sessionId ?? session.id);
                    setBusinessCase(persisted.businessCase);
                    setMarket(persisted.market);
                    setPriorities(persisted.priorities);
                    setOptions(persisted.options);
                    setResult(persisted.result);
                } else {
                    setSessionId(session.id);
                    setStage('start');
                }
                restoredRef.current = true;
            })
            .catch(() => setError(t('unableToLoadContent')));
    }, []);

    useEffect(() => {
        if (!restoredRef.current || stage === 'loading') {
            return;
        }
        savePersistedState<PersistedState>(STORAGE_KEY, {
            stage,
            sessionId,
            businessCase,
            market,
            priorities,
            options,
            result,
        });
    }, [stage, sessionId, businessCase, market, priorities, options, result]);

    // A deliberate exit (back button, finishing the flow, idle timeout unmounting this
    // component) clears the saved progress so the next visitor never resumes a stranger's
    // half-finished form. An accidental page refresh never runs this — only a React unmount
    // does — so refreshing mid-flow is exactly the case that still gets restored above.
    useEffect(() => {
        return () => clearPersistedState(STORAGE_KEY);
    }, []);

    async function handleBusinessCaseSelect(bc: BusinessCase) {
        if (!sessionId) return;
        setBusinessCase(bc);
        await DecisionSessionApi.update(sessionId, { business_case_id: bc.id });
        setStage('market');
    }

    async function handleMarketSelect(m: Market) {
        if (!sessionId) return;
        setMarket(m);
        await DecisionSessionApi.update(sessionId, { market_slug: m.slug });
        setStage('priorities');
    }

    function togglePriority(slug: PrioritySlug) {
        setPriorities((prev) => {
            if (prev.includes(slug)) {
                return prev.filter((p) => p !== slug);
            }
            if (prev.length >= 3) {
                return prev;
            }
            return [...prev, slug];
        });
    }

    async function handlePrioritiesConfirm() {
        if (!sessionId || priorities.length !== 3) return;
        setSubmitting(true);
        try {
            await DecisionSessionApi.update(sessionId, {
                priority_1_slug: priorities[0],
                priority_2_slug: priorities[1],
                priority_3_slug: priorities[2],
            });
            const fetchedOptions = await DecisionSessionApi.options(sessionId);
            setOptions(fetchedOptions);
            setStage('decision');
        } catch {
            setError(t('unableToLoadOptions'));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDecide(optionId: number) {
        if (!sessionId) return;
        setSubmitting(true);
        try {
            const { result: decisionResult } = await DecisionSessionApi.decide(sessionId, optionId);
            setResult(decisionResult);
            setStage('result');
        } catch {
            setError(t('unableToComputeResult'));
        } finally {
            setSubmitting(false);
        }
    }


    if (stage === 'loading' || !content) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <DecisionLogo className="h-24 w-24" />
                <p className="text-xl text-slate-600">{error ?? t('loadingExperience')}</p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10">
            {stage !== 'result' && (
                <button
                    onClick={onBack}
                    className="mb-4 flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" /> {t('back')}
                </button>
            )}

            {error && (
                <p className="mb-4 rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3 text-center text-red-600 backdrop-blur-xl">
                    {error}
                </p>
            )}

            {stage !== 'result' && <CountdownBar totalSeconds={180} dangerSeconds={25} />}

            {stage === 'start' && (
                <div className="mx-auto max-w-2xl rounded-3xl border border-white/70 bg-white/50 p-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_40px_rgba(99,102,241,0.2)] backdrop-blur-xl">
                    <DecisionLogo className="mx-auto mb-4 h-28 w-28" />
                    <h2 className="font-display text-3xl font-black uppercase text-slate-900">{t('decisionStartTitle')}</h2>
                    <p className="mt-3 text-slate-600">{t('decisionStartSubtitle')}</p>
                    <TouchButton className="mt-8" onClick={() => setStage('business_case')}>
                        {t('startChallenge')}
                    </TouchButton>
                </div>
            )}

            {stage === 'business_case' && (
                <div>
                    <StepHeader step={1} total={5} title={t('stepBusinessCase')} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {content.business_cases.map((bc) => (
                            <SelectCard
                                key={bc.id}
                                title={bc.title}
                                description={bc.description}
                                selected={businessCase?.id === bc.id}
                                onClick={() => handleBusinessCaseSelect(bc)}
                            >
                                <Icon name={bc.icon} className="h-9 w-9 text-indigo-500" />
                            </SelectCard>
                        ))}
                    </div>
                </div>
            )}

            {stage === 'market' && (
                <div>
                    <StepHeader step={2} total={5} title={t('stepMarket')} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {content.markets.map((m) => (
                            <SelectCard
                                key={m.id}
                                title={m.title}
                                description={m.description}
                                selected={market?.id === m.id}
                                onClick={() => handleMarketSelect(m)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {stage === 'priorities' && (
                <div>
                    <StepHeader step={3} total={5} title={t('stepPriorities')} subtitle={t('stepPrioritiesSubtitle')} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {content.priorities.map((p: Priority) => {
                            const rank = priorities.indexOf(p.slug);
                            return (
                                <SelectCard
                                    key={p.id}
                                    title={p.title}
                                    description={p.description}
                                    selected={rank !== -1}
                                    onClick={() => togglePriority(p.slug)}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <Icon name={p.icon} className="h-9 w-9 text-indigo-500" />
                                        {rank !== -1 && (
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-indigo-400 to-violet-600 text-sm font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.6)]">
                                                {rank + 1}
                                            </span>
                                        )}
                                    </div>
                                </SelectCard>
                            );
                        })}
                    </div>
                    <div className="mt-8 flex justify-end">
                        <TouchButton disabled={priorities.length !== 3 || submitting} onClick={handlePrioritiesConfirm}>
                            {submitting ? t('loadingOptions') : t('continueLabel')}
                        </TouchButton>
                    </div>
                </div>
            )}

            {stage === 'decision' && options && (
                <div>
                    <StepHeader step={4} total={5} title={t('stepDecision')} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {options.map((option, i) => (
                            <div
                                key={option.id}
                                className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_30px_rgba(99,102,241,0.15)] backdrop-blur-xl"
                            >
                                <div className="rounded-xl bg-white/90 p-3">
                                    <img
                                        src={OPTION_IMAGES[i % OPTION_IMAGES.length]}
                                        alt=""
                                        className="h-36 w-full object-contain"
                                    />
                                </div>
                                <div>
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-indigo-400 to-violet-600 font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <p className="mt-2 font-display font-bold text-slate-900">{option.label}</p>
                                    <p className="text-sm text-slate-600">{option.description}</p>
                                </div>
                                <TouchButton
                                    variant="secondary"
                                    className="mt-auto"
                                    disabled={submitting}
                                    onClick={() => handleDecide(option.id)}
                                >
                                    {t('chooseThis')}
                                </TouchButton>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stage === 'result' && result && sessionId && (
                <ResultStage
                    result={result}
                    onSendEmail={(email) => DecisionSessionApi.handoff(sessionId, 'email', email)}
                    onTalkToExpert={() => DecisionSessionApi.handoff(sessionId, 'expert')}
                    onBack={onBack}
                />
            )}
        </div>
    );
}
