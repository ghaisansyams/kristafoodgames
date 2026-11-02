import { useCallback, useState } from 'react';
import CosmicBackground from '@/Components/Kiosk/CosmicBackground';
import GameCard from '@/Components/Kiosk/GameCard';
import LanguageSwitcher from '@/Components/Kiosk/LanguageSwitcher';
import SponsorLogos from '@/Components/Kiosk/SponsorLogos';
import { ConveyorLogo, WheelLogo } from '@/Components/Kiosk/GameLogos';
import ConveyorBeltExperience from '@/Features/ConveyorBelt/ConveyorBeltExperience';
import WheelExperience from '@/Features/Wheel/WheelExperience';
import { LocaleProvider, useLocale } from '@/lib/i18n';

type Screen = 'choose' | 'wheel' | 'conveyor';

/**
 * A stand-alone, backend-free build of just Spin the Wheel and Conveyor Belt, deployed as a
 * static site so the client can try the two new games before they join the main booth hub.
 */
export default function PreviewHub() {
    return (
        <LocaleProvider>
            <PreviewScreen />
        </LocaleProvider>
    );
}

function PreviewScreen() {
    const { t } = useLocale();
    const [screen, setScreen] = useState<Screen>('choose');
    const goToChoose = useCallback(() => setScreen('choose'), []);

    return (
        <CosmicBackground hideHologram={screen !== 'choose'}>
            {screen === 'choose' && (
                <>
                    <div className="absolute left-6 top-6 z-20 rounded-full border border-citrus-300 bg-citrus-50 px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-citrus-700">
                        {t('previewBadge')}
                    </div>
                    <div className="absolute right-6 top-6 z-20">
                        <LanguageSwitcher />
                    </div>
                    <div className="flex min-h-screen flex-col items-center gap-6 px-6 py-10 text-center">
                        <SponsorLogos className="mt-10" />
                        <h1 className="pt-4 font-display text-3xl font-black uppercase text-ink-900 landscape:text-4xl">{t('chooseEyebrow')}</h1>
                        <div className="flex w-full max-w-xl flex-wrap justify-center gap-5 landscape:max-w-4xl landscape:flex-nowrap landscape:gap-8">
                            <GameCard title={t('gameWheelTitle')} tagline={t('gameWheelTagline')} Logo={WheelLogo} onClick={() => setScreen('wheel')} />
                            <GameCard
                                title={t('gameConveyorTitle')}
                                tagline={t('gameConveyorTagline')}
                                Logo={ConveyorLogo}
                                onClick={() => setScreen('conveyor')}
                            />
                        </div>
                    </div>
                </>
            )}
            {screen === 'wheel' && <WheelExperience onBack={goToChoose} />}
            {screen === 'conveyor' && <ConveyorBeltExperience onBack={goToChoose} />}
        </CosmicBackground>
    );
}
