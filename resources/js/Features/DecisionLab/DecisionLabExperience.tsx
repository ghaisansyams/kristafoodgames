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
import { OPTION_ICONS, optionLabel } from '@/lib/optionContent';
import { clearPersistedState, loadPersistedState, savePersistedState } from '@/lib/sessionPersistence';
import ResultStage from './ResultStage';
import type { DecisionLabContent, DecisionResult, JourneyAnswers, JourneyStep, Role } from '@/types/content';

type Stage = 'loading' | 'role' | 'journey' | 'requirements' | 'result';

const STORAGE_KEY = 'krista-food.decision-lab.v2';

// Both journeys are four steps plus the optional "specific requirements" step.
const TOTAL_STEPS = 5;

interface PersistedState {
    stage: Stage;
    sessionId: number | null;
    role: Role | null;
    stepIndex: number;
    answers: JourneyAnswers;
    notes: Record<string, string>;
    requirements: string[];
    result: DecisionResult | null;
}

const asList = (value: string | string[] | null | undefined): string[] =>
    Array.isArray(value) ? value : value ? [value] : [];

/**
 * The option slugs a step offers given the earlier answers. Mirrors DecisionLabCatalog::optionsFor
 * on the server, which re-validates every submitted answer against the same rules.
 */
function optionsForStep(step: JourneyStep, answers: JourneyAnswers): string[] {
    if (step.options) {
        return step.options;
    }

    const dependencies = asList(step.depends_on ? answers[step.depends_on] : null);

    if (step.derive && dependencies.some((slug) => step.derive!.for.includes(slug))) {
        const derived = [...step.derive.base];
        for (const [sourceStep, rules] of Object.entries(step.derive.rules)) {
            for (const picked of asList(answers[sourceStep])) {
                derived.push(...(rules[picked] ?? []));
            }
        }
        return [...new Set(derived)];
    }

    return [...new Set(dependencies.flatMap((slug) => step.options_by?.[slug] ?? []))];
}

export default function DecisionLabExperience({
    visitorId,
    onBack,
    onResult,
}: {
    visitorId: number | null;
    onBack: () => void;
    onResult?: (result: DecisionResult) => void;
}) {
    const { t, locale } = useLocale();
    const [stage, setStage] = useState<Stage>('loading');
    const [content, setContent] = useState<DecisionLabContent | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [sessionId, setSessionId] = useState<number | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState<JourneyAnswers>({});
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [requirements, setRequirements] = useState<string[]>([]);
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
                    setRole(persisted.role);
                    setStepIndex(persisted.stepIndex);
                    setAnswers(persisted.answers);
                    setNotes(persisted.notes);
                    setRequirements(persisted.requirements);
                    setResult(persisted.result);
                } else {
                    setSessionId(session.id);
                    setStage('role');
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
            role,
            stepIndex,
            answers,
            notes,
            requirements,
            result,
        });
    }, [stage, sessionId, role, stepIndex, answers, notes, requirements, result]);

    // A deliberate exit (back button, finishing the flow, idle timeout unmounting this
    // component) clears the saved progress so the next visitor never resumes a stranger's
    // half-finished form. An accidental page refresh never runs this — only a React unmount
    // does — so refreshing mid-flow is exactly the case that still gets restored above.
    useEffect(() => {
        return () => clearPersistedState(STORAGE_KEY);
    }, []);

    const journey = content && role ? content.journeys[role] : null;
    const step = journey?.steps[stepIndex] ?? null;

    /** Answers as sent to the server: free text is only included for options that are picked. */
    function payload(current: JourneyAnswers, withRequirements: boolean, picked: string[] = requirements): Record<string, unknown> {
        const selected = new Set([...Object.values(current).flatMap(asList), ...(withRequirements ? picked : [])]);
        const text = Object.fromEntries(Object.entries(notes).filter(([slug, value]) => selected.has(slug) && value.trim() !== ''));

        return { ...current, notes: text, ...(withRequirements ? { requirements: picked } : {}) };
    }

    function saveProgress(current: JourneyAnswers) {
        if (sessionId && role) {
            // Best-effort: leaving partial answers with the booth team must never block the visitor.
            DecisionSessionApi.update(sessionId, role, payload(current, false)).catch(() => undefined);
        }
    }

    function chooseRole(next: Role) {
        if (next !== role) {
            setAnswers({});
            setNotes({});
            setRequirements([]);
        }
        setRole(next);
        setStepIndex(0);
        setStage('journey');
    }

    function selectOption(currentStep: JourneyStep, slug: string) {
        if (!content || submitting) return;

        const current = answers[currentStep.key];
        let next: string | string[] | null;

        if (currentStep.mode === 'single') {
            next = slug;
        } else {
            const list = asList(current);
            if (list.includes(slug)) {
                next = list.filter((picked) => picked !== slug);
            } else if (content.options[slug]?.exclusive) {
                next = [slug];
            } else if (currentStep.max && list.length >= currentStep.max) {
                next = list;
            } else {
                next = [...list.filter((picked) => !content.options[picked]?.exclusive), slug];
            }
        }

        const updated: JourneyAnswers = { ...answers, [currentStep.key]: next };
        if (JSON.stringify(next) !== JSON.stringify(current)) {
            // Later steps offer options that depend on this answer, so their picks no longer apply.
            for (const later of journey!.steps.slice(stepIndex + 1)) {
                delete updated[later.key];
            }
            setRequirements([]);
        }
        setAnswers(updated);

        // A single pick moves straight on, unless the option asks for free text first.
        if (currentStep.mode === 'single' && next && !content.options[slug]?.text) {
            advance(updated);
        }
    }

    function advance(current: JourneyAnswers) {
        if (!journey) return;
        if (stepIndex < journey.steps.length - 1) {
            saveProgress(current);
            setStepIndex(stepIndex + 1);
        } else {
            requestRecommendation(false, current);
        }
    }

    function pickRequirement(slug: string) {
        if (!content || submitting) return;

        setRequirements([slug]);
        if (!content.options[slug]?.text) {
            requestRecommendation(true, answers, [slug]);
        }
    }

    async function requestRecommendation(withRequirements: boolean, current: JourneyAnswers = answers, picked: string[] = requirements) {
        if (!sessionId || !role) return;
        setSubmitting(true);
        setError(null);
        try {
            const response = await DecisionSessionApi.recommend(sessionId, role, payload(current, withRequirements, picked));
            if (response.status === 'needs_more_info') {
                setStage('requirements');
            } else {
                setResult(response.result);
                setStage('result');
                onResult?.(response.result);
            }
        } catch {
            setError(t('unableToComputeResult'));
        } finally {
            setSubmitting(false);
        }
    }

    function handleContinue() {
        advance(answers);
    }

    function handlePreviousStep() {
        setError(null);
        if (stage === 'requirements') {
            setStage('journey');
        } else if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
        } else {
            setStage('role');
        }
    }

    function renderOptionCards(slugs: string[], selectedSlugs: string[], onPick: (slug: string) => void, ranked: boolean) {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slugs.map((slug) => {
                    const option = content!.options[slug];
                    const rank = selectedSlugs.indexOf(slug);
                    const label = optionLabel(slug, locale, option.label);
                    const iconName = OPTION_ICONS[slug] ?? option.icon;
                    return (
                        <SelectCard
                            key={slug}
                            title={label}
                            // The client's original English term stays visible under a translation.
                            subtitle={label !== option.label ? option.label : undefined}
                            icon={iconName ? <Icon name={iconName} className="h-6 w-6" /> : undefined}
                            badge={ranked && rank !== -1 ? rank + 1 : undefined}
                            selected={rank !== -1}
                            onClick={() => onPick(slug)}
                        />
                    );
                })}
            </div>
        );
    }

    /** Free-text fields for any picked option that asks the visitor to specify (e.g. "Other"). */
    function renderTextFields(selectedSlugs: string[]) {
        const withText = selectedSlugs.filter((slug) => content!.options[slug]?.text);

        return withText.map((slug) => (
            <div key={slug} className="mt-4">
                <p className="mb-2 text-sm font-semibold text-ink-600">{optionLabel(slug, locale, content!.options[slug].label)}</p>
                <textarea
                    rows={2}
                    maxLength={300}
                    value={notes[slug] ?? ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [slug]: e.target.value }))}
                    placeholder={t('textFieldPlaceholder')}
                    className="w-full rounded-2xl border border-ink-100 bg-white px-5 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 focus:outline-none"
                />
            </div>
        ));
    }

    if (stage === 'loading' || !content) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <DecisionLogo className="h-24 w-24" />
                <p className="text-xl text-ink-600">{error ?? t('loadingExperience')}</p>
            </div>
        );
    }

    const stepOptions = step ? optionsForStep(step, answers) : [];
    const stepSelection = step ? asList(answers[step.key]) : [];
    const stepKey = (key: string, suffix = '') => `journey_${role}_${key}${suffix}` as Parameters<typeof t>[0];

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10">
            {stage !== 'result' && (
                <button
                    onClick={onBack}
                    className="mb-4 flex w-fit items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
                >
                    <ArrowLeft className="h-4 w-4" /> {t('back')}
                </button>
            )}

            {error && (
                <p className="mb-4 rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3 text-center text-red-600">
                    {error}
                </p>
            )}

            {(stage === 'journey' || stage === 'requirements') && <CountdownBar totalSeconds={180} dangerSeconds={25} />}

            {stage === 'role' && (
                <div className="mx-auto w-full max-w-3xl rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-card">
                    <DecisionLogo className="mx-auto mb-4 h-24 w-24" />
                    <h2 className="font-display text-3xl font-black uppercase text-ink-900">{t('roleTitle')}</h2>
                    <p className="mt-2 text-ink-600">{t('roleSubtitle')}</p>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <SelectCard
                            title={t('roleBrandOwner')}
                            description={t('roleBrandOwnerDesc')}
                            icon={<Icon name="store" className="h-6 w-6" />}
                            selected={role === 'brand_owner'}
                            onClick={() => chooseRole('brand_owner')}
                        />
                        <SelectCard
                            title={t('roleConverter')}
                            description={t('roleConverterDesc')}
                            icon={<Icon name="factory" className="h-6 w-6" />}
                            selected={role === 'converter'}
                            onClick={() => chooseRole('converter')}
                        />
                    </div>
                </div>
            )}

            {stage === 'journey' && step && role && (
                <div>
                    <StepHeader
                        step={stepIndex + 1}
                        total={TOTAL_STEPS}
                        title={t(stepKey(step.key))}
                        subtitle={t(stepKey(step.key, '_q'))}
                    />
                    {renderOptionCards(stepOptions, stepSelection, (slug) => selectOption(step, slug), step.max !== undefined)}
                    {renderTextFields(stepSelection)}
                    {submitting && <p className="mt-6 text-center font-semibold text-leaf-800">{t('findingProduct')}</p>}
                    <div className="mt-8 flex items-center justify-between gap-4">
                        <TouchButton variant="ghost" onClick={handlePreviousStep}>
                            {t('previousStep')}
                        </TouchButton>
                        {(step.mode === 'multi' || stepSelection.some((slug) => content.options[slug]?.text)) && (
                            <TouchButton disabled={stepSelection.length === 0 || submitting} onClick={handleContinue}>
                                {submitting
                                    ? t('findingProduct')
                                    : stepIndex === journey!.steps.length - 1
                                      ? t('seeRecommendation')
                                      : t('continueLabel')}
                            </TouchButton>
                        )}
                    </div>
                </div>
            )}

            {stage === 'requirements' && journey && role && (
                <div>
                    <StepHeader
                        step={TOTAL_STEPS}
                        total={TOTAL_STEPS}
                        title={t(stepKey('requirements'))}
                        subtitle={t(stepKey('requirements', '_q'))}
                    />
                    <p className="mb-4 text-sm text-ink-500">{t('requirementsNote')}</p>
                    {renderOptionCards(journey.requirements, requirements, pickRequirement, false)}
                    {renderTextFields(requirements)}
                    {submitting && <p className="mt-6 text-center font-semibold text-leaf-800">{t('findingProduct')}</p>}
                    <div className="mt-8 flex items-center justify-between gap-4">
                        <TouchButton variant="ghost" onClick={handlePreviousStep}>
                            {t('previousStep')}
                        </TouchButton>
                        {requirements.some((slug) => content.options[slug]?.text) && (
                            <TouchButton disabled={submitting} onClick={() => requestRecommendation(true)}>
                                {submitting ? t('findingProduct') : t('seeRecommendation')}
                            </TouchButton>
                        )}
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
