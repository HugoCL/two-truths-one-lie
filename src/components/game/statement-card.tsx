import { cn } from "@/lib/utils";

export function StatementCard({
  index,
  text,
  selected,
  revealedLie,
  onClick,
  disabled,
}: {
  index: number;
  text: string;
  selected?: boolean;
  revealedLie?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={disabled}
      style={{ animationDelay: `${index * 80}ms` }}
      className={cn(
        "animate-rise group relative w-full rounded-2xl border p-4 text-left transition-all",
        revealedLie &&
          "animate-pop border-rose-400/70 bg-rose-500/15 shadow-lg shadow-rose-500/10 ring-2 ring-rose-400/40",
        selected &&
          !revealedLie &&
          "border-amber-400/70 bg-amber-400/10 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40",
        !selected &&
          !revealedLie &&
          "border-white/10 bg-white/[0.04] hover:border-amber-400/40 hover:bg-white/[0.07]",
        onClick && !disabled && "cursor-pointer active:scale-[0.99]",
        disabled && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-bold",
            revealedLie
              ? "border-rose-400/50 bg-rose-500/20 text-rose-300"
              : selected
                ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
                : "border-white/15 bg-white/5 text-zinc-400 transition-colors group-hover:border-amber-400/40 group-hover:text-amber-300",
          )}
        >
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-base leading-relaxed text-zinc-100">{text}</p>
          {revealedLie && (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-300">
              The lie
            </span>
          )}
        </div>
      </div>
    </Component>
  );
}
