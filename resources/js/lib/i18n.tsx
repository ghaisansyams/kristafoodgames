import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

export type Locale = 'id' | 'en' | 'zh';

const STORAGE_KEY = 'allpack.locale';

const dict = {
    id: {
        heroEyebrow: 'ALLPACK 2026 · Hub Pengalaman Interaktif',
        heroLine1: 'BERMAIN DAN',
        heroLine2: 'DAPATKAN HADIAH',
        scanToPlay: 'Pindai untuk Bermain',
        scanInstructions: 'Arahkan kamera ponsel Anda ke kode QR, isi data Anda, lalu lihat kembali ke layar ini.',
        skipAndPlay: 'Sudah jadi pelanggan? Lewati dan mainkan',
        tapToStart: 'Ketuk untuk Mulai',
        chooseEyebrow: 'Pilih Permainan Anda',
        waysToPlay: '{n} Cara Bermain ALLPACK',
        imDoneNextGuest: 'Selesai — Tamu Berikutnya',
        gameDecisionLabTitle: 'Lab Keputusan',
        gameDecisionLabTagline: 'Bisakah Anda memilih kemasan yang tepat?',
        gameStopwatchTitle: 'Stop at 10.00',
        gameStopwatchTagline: 'Ketepatan memenangkan hadiah',

        back: 'Kembali',
        stepLabel: 'Langkah {step} dari {total}',
        stopwatchTitle: 'Stop at 10.00',
        stopwatchInstructions:
            'Ketuk Mulai (atau tekan Spasi) untuk jalan. Ketuk lagi untuk jeda, ketuk sekali lagi untuk lanjut dari waktu yang sama. Tahan tombol (atau tahan Spasi) selama 1 detik — hasil akan terkunci otomatis, tanpa perlu melepaskannya.',
        tapPauseHoldStop: 'Ketuk: Jeda / Lanjut · Tahan 1 Detik: Kunci Hasil',
        start: 'Mulai',
        pause: 'Jeda',
        resume: 'Lanjutkan',
        stop: 'Berhenti!',
        perfectTiming: 'Waktu sempurna!',
        tooEarly: 'Sedikit terlalu cepat',
        tooLate: 'Sedikit terlalu lambat',
        offTarget: 'meleset dari target.',
        playAgain: 'Main Lagi',
        pressSpaceToPlayAgain: 'atau tekan Spasi untuk langsung main lagi',

        loadingExperience: 'Memuat pengalaman…',
        decisionStartTitle: 'Tantangan Kemasan Seperti Apa yang Bisa Anda Selesaikan?',
        decisionStartSubtitle: 'Anda memiliki sekitar 2–3 menit untuk membuat keputusan.',
        startChallenge: '▶ Mulai Tantangan',
        stepBusinessCase: 'Pilih Kasus Bisnis Anda',
        stepMarket: 'Tentukan Pasar Anda',
        stepPriorities: 'Tetapkan 3 Prioritas Utama Anda',
        stepPrioritiesSubtitle: 'Ketuk sesuai urutan kepentingan — jangan pilih semua enam.',
        loadingOptions: 'Memuat pilihan…',
        continueLabel: 'Lanjutkan',
        stepDecision: 'Buat Keputusan Kemasan Anda',
        chooseThis: 'Pilih Ini',
        unableToLoadContent: 'Tidak dapat memuat konten. Periksa koneksi Anda.',
        unableToLoadOptions: 'Tidak dapat memuat pilihan kemasan. Silakan coba lagi.',
        unableToComputeResult: 'Tidak dapat menghitung hasil Anda. Silakan coba lagi.',

        yourDecisionEyebrow: 'Keputusan Kemasan Anda',
        resultTitle: 'Bisakah Anda Membuat Keputusan Kemasan yang Tepat?',
        outOf100: '/ 100',
        strongFit: 'Sangat Cocok',
        goodFit: 'Cocok',
        fairFit: 'Cukup Cocok',
        yourStrength: 'Kekuatan Anda',
        yourProfile: 'Profil Anda',
        yourTradeOff: 'Kompromi Anda',
        solutionLabel: 'Solusi ALLPACK',
        emailFormPrompt: 'Masukkan email Anda dan tim kami akan mengirimkan hasil ini.',
        sending: 'Mengirim…',
        send: 'Kirim',
        sendResultToEmail: 'Kirim Hasil ke Email',
        resultRequested: 'Hasil Diminta ✓',
        talkToExpert: 'Bicara dengan Ahli Kami',
        teamIsComing: 'Tim Kami Akan Datang ✓',
        chooseAnotherGame: 'Pilih Permainan Lain',
        couldNotSaveEmail: 'Tidak dapat menyimpan email Anda. Silakan coba lagi.',

        alreadyClaimedTitle: 'Kode QR ini sudah digunakan',
        alreadyClaimedBody: 'Minta kru booth untuk menampilkan kode QR baru di layar.',
        brandLine: 'ALLPACK 2026',
        joinTitle: 'Ayo Mulai!',
        joinSubtitle: 'Isi data Anda, lalu lihat kembali ke layar booth.',
        fullName: 'Nama Lengkap',
        phoneNumber: 'Nomor Telepon',
        emailOptional: 'Email (opsional)',
        submitting: 'Mengirim…',
        letsPlay: 'Ayo Main!',

        allSetTitle: 'Anda Sudah Siap!',
        allSetBody: 'Lihat kembali ke layar booth — pilihan permainan Anda sudah siap di sana.',

        topScores: 'Skor Teratas',
        showMore: 'Lihat Lebih Banyak',
        loadingLabel: 'Memuat…',
        noScoresYet: 'Belum ada skor — jadilah yang pertama!',

        timeRemaining: 'Sisa Waktu',
    },
    en: {
        heroEyebrow: 'ALLPACK 2026 · Interactive Experience Hub',
        heroLine1: 'PLAY AND',
        heroLine2: 'WIN PRIZES',
        scanToPlay: 'Scan to Play',
        scanInstructions: 'Point your phone camera at the QR code, fill in your details, then look back here.',
        skipAndPlay: 'Already a customer? Skip and play',
        tapToStart: 'Tap to Start',
        chooseEyebrow: 'Choose Your Game',
        waysToPlay: '{n} Ways to Play ALLPACK',
        imDoneNextGuest: "I'm Done — Next Guest",
        gameDecisionLabTitle: 'Decision Lab',
        gameDecisionLabTagline: 'Can you pick the right pack?',
        gameStopwatchTitle: 'Stop at 10.00',
        gameStopwatchTagline: 'Precision wins the prize',

        back: 'Back',
        stepLabel: 'Step {step} of {total}',
        stopwatchTitle: 'Stop at 10.00',
        stopwatchInstructions:
            'Tap Start (or press Space) to begin. Tap again to pause, tap once more to resume from the same time. Hold the button (or hold Space) for 1 second — the result locks in automatically, no need to let go.',
        tapPauseHoldStop: 'Tap: Pause / Resume · Hold 1s: Lock In Result',
        start: 'Start',
        pause: 'Pause',
        resume: 'Resume',
        stop: 'Stop!',
        perfectTiming: 'Perfect timing!',
        tooEarly: 'A little too early',
        tooLate: 'A little too late',
        offTarget: 'off target.',
        playAgain: 'Play Again',
        pressSpaceToPlayAgain: 'or press Space to jump straight back in',

        loadingExperience: 'Loading experience…',
        decisionStartTitle: 'What Kind of Packaging Challenge Can You Solve?',
        decisionStartSubtitle: 'You have approximately 2–3 minutes to make your decision.',
        startChallenge: '▶ Start Challenge',
        stepBusinessCase: 'Choose Your Business Case',
        stepMarket: 'Define Your Market',
        stepPriorities: 'Set Your Top 3 Priorities',
        stepPrioritiesSubtitle: 'Tap in order of importance — do not rank all six.',
        loadingOptions: 'Loading options…',
        continueLabel: 'Continue',
        stepDecision: 'Make Your Packaging Decision',
        chooseThis: 'Choose This',
        unableToLoadContent: 'Unable to load content. Please check the connection.',
        unableToLoadOptions: 'Unable to load packaging options. Please try again.',
        unableToComputeResult: 'Unable to compute your result. Please try again.',

        yourDecisionEyebrow: 'Your Packaging Decision',
        resultTitle: 'Can You Make the Right Packaging Decision?',
        outOf100: '/ 100',
        strongFit: 'Strong Fit',
        goodFit: 'Good Fit',
        fairFit: 'Fair Fit',
        yourStrength: 'Your Strength',
        yourProfile: 'Your Profile',
        yourTradeOff: 'Your Trade-off',
        solutionLabel: 'ALLPACK Solution',
        emailFormPrompt: 'Enter your email and our team will send you this result.',
        sending: 'Sending…',
        send: 'Send',
        sendResultToEmail: 'Send Result to Email',
        resultRequested: 'Result Requested ✓',
        talkToExpert: 'Talk to Our Expert',
        teamIsComing: 'Our Team Is Coming ✓',
        chooseAnotherGame: 'Choose Another Game',
        couldNotSaveEmail: 'Could not save your email. Please try again.',

        alreadyClaimedTitle: 'This QR code has already been used',
        alreadyClaimedBody: 'Ask the booth crew to show you a fresh QR code on the screen.',
        brandLine: 'ALLPACK 2026',
        joinTitle: "Let's Get Started!",
        joinSubtitle: 'Fill in your details, then look back at the booth screen.',
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        emailOptional: 'Email (optional)',
        submitting: 'Submitting…',
        letsPlay: "Let's Play!",

        allSetTitle: "You're All Set!",
        allSetBody: 'Look back at the booth screen — your game choices are ready for you there.',

        topScores: 'Top Scores',
        showMore: 'Show More',
        loadingLabel: 'Loading…',
        noScoresYet: 'No scores yet — be the first!',

        timeRemaining: 'Time Remaining',
    },
    zh: {
        heroEyebrow: 'ALLPACK 2026 · 互动体验中心',
        heroLine1: '畅玩游戏',
        heroLine2: '赢取好礼',
        scanToPlay: '扫码开始游戏',
        scanInstructions: '用手机摄像头扫描二维码，填写您的信息，然后返回查看此屏幕。',
        skipAndPlay: '已经是客户？跳过并开始游戏',
        tapToStart: '点击开始',
        chooseEyebrow: '选择您的游戏',
        waysToPlay: '{n} 种玩法 · ALLPACK',
        imDoneNextGuest: '完成 — 下一位客人',
        gameDecisionLabTitle: '决策实验室',
        gameDecisionLabTagline: '你能选对包装吗？',
        gameStopwatchTitle: 'Stop at 10.00',
        gameStopwatchTagline: '精准赢得奖品',

        back: '返回',
        stepLabel: '第 {step} 步，共 {total} 步',
        stopwatchTitle: 'Stop at 10.00',
        stopwatchInstructions: '点击开始（或按空格键）启动计时。再次点击可暂停，再点一次可从相同时间继续。按住按钮（或按住空格键）1秒——结果会自动锁定，无需松开。',
        tapPauseHoldStop: '点击：暂停/继续 · 长按1秒：锁定结果',
        start: '开始',
        pause: '暂停',
        resume: '继续',
        stop: '停止！',
        perfectTiming: '完美的时机！',
        tooEarly: '有点太早',
        tooLate: '有点太晚',
        offTarget: '偏离目标。',
        playAgain: '再玩一次',
        pressSpaceToPlayAgain: '或按空格键直接再玩一次',

        loadingExperience: '正在加载体验…',
        decisionStartTitle: '你能解决什么样的包装挑战？',
        decisionStartSubtitle: '您大约有 2-3 分钟的时间做出决定。',
        startChallenge: '▶ 开始挑战',
        stepBusinessCase: '选择您的商业案例',
        stepMarket: '确定您的市场',
        stepPriorities: '设定您的三大首要任务',
        stepPrioritiesSubtitle: '按重要性顺序点击——不要全部六项都排名。',
        loadingOptions: '正在加载选项…',
        continueLabel: '继续',
        stepDecision: '做出您的包装决定',
        chooseThis: '选择这个',
        unableToLoadContent: '无法加载内容。请检查网络连接。',
        unableToLoadOptions: '无法加载包装选项。请重试。',
        unableToComputeResult: '无法计算您的结果。请重试。',

        yourDecisionEyebrow: '您的包装决定',
        resultTitle: '你能做出正确的包装决定吗？',
        outOf100: '/ 100',
        strongFit: '非常匹配',
        goodFit: '匹配良好',
        fairFit: '基本匹配',
        yourStrength: '您的优势',
        yourProfile: '您的画像',
        yourTradeOff: '您的权衡',
        solutionLabel: 'ALLPACK 解决方案',
        emailFormPrompt: '输入您的电子邮件，我们的团队会将此结果发送给您。',
        sending: '发送中…',
        send: '发送',
        sendResultToEmail: '将结果发送到邮箱',
        resultRequested: '已请求结果 ✓',
        talkToExpert: '与我们的专家交谈',
        teamIsComing: '我们的团队即将到来 ✓',
        chooseAnotherGame: '选择其他游戏',
        couldNotSaveEmail: '无法保存您的电子邮件。请重试。',

        alreadyClaimedTitle: '此二维码已被使用',
        alreadyClaimedBody: '请booth工作人员在屏幕上显示新的二维码。',
        brandLine: 'ALLPACK 2026',
        joinTitle: '让我们开始吧！',
        joinSubtitle: '填写您的信息，然后返回查看展台屏幕。',
        fullName: '姓名',
        phoneNumber: '电话号码',
        emailOptional: '电子邮件（选填）',
        submitting: '提交中…',
        letsPlay: '开始游戏！',

        allSetTitle: '一切就绪！',
        allSetBody: '请返回展台屏幕——您的游戏选项已经为您准备好了。',

        topScores: '最高分',
        showMore: '查看更多',
        loadingLabel: '加载中…',
        noScoresYet: '暂无分数——成为第一人！',

        timeRemaining: '剩余时间',
    },
} as const;

type Key = keyof (typeof dict)['id'];

export const LOCALES: { code: Locale; label: string }[] = [
    { code: 'id', label: 'Indonesia' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
];

type LocaleContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: Key, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'id' || saved === 'en' || saved === 'zh') {
            return saved;
        }
    } catch {
        // localStorage unavailable (private browsing, blocked) — fall through to default.
    }
    return 'id';
}

export function LocaleProvider({ children }: PropsWithChildren) {
    const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    function setLocale(next: Locale) {
        setLocaleState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Non-fatal — the chosen language just won't persist across reloads.
        }
    }

    function t(key: Key, vars?: Record<string, string | number>): string {
        let value: string = dict[locale][key] ?? dict.id[key] ?? key;
        if (vars) {
            for (const [varKey, varValue] of Object.entries(vars)) {
                value = value.replace(`{${varKey}}`, String(varValue));
            }
        }
        return value;
    }

    return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
    const ctx = useContext(LocaleContext);
    if (!ctx) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return ctx;
}
