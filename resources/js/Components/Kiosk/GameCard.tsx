export type LogoComponent = (props: { className?: string }) => JSX.Element;

/** One big tappable tile on the "choose your game" screen. */
export default function GameCard({
    title,
    tagline,
    Logo,
    onClick,
}: {
    title: string;
    tagline: string;
    Logo: LogoComponent;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group flex min-h-[250px] w-[47%] min-w-[150px] flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-transparent bg-white p-6 text-center shadow-card-lg transition hover:border-leaf-300 hover:bg-leaf-50 active:scale-95 landscape:min-h-[340px] landscape:w-1/2"
        >
            <span className="mb-1 flex h-24 w-24 items-center justify-center rounded-3xl border border-leaf-200 bg-leaf-100 transition group-hover:bg-white landscape:h-32 landscape:w-32">
                <Logo className="h-16 w-16 landscape:h-20 landscape:w-20" />
            </span>
            <span className="font-display text-xl font-black uppercase leading-tight text-ink-900 landscape:text-3xl">{title}</span>
            <span className="text-sm text-ink-600 landscape:text-lg">{tagline}</span>
        </button>
    );
}
