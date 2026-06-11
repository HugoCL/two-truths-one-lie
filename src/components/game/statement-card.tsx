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
      className={cn(
        "w-full rounded-2xl border p-5 text-left transition-all",
        revealedLie && "border-rose-400 bg-rose-500/20 ring-2 ring-rose-400/50",
        selected && !revealedLie && "border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/40",
        !selected && !revealedLie && "border-white/10 bg-white/5 hover:border-white/20",
        onClick && !disabled && "cursor-pointer",
        disabled && "opacity-60",
      )}
    >
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Statement {index + 1}
      </span>
      <p className="text-lg leading-relaxed text-zinc-100">{text}</p>
      {revealedLie && (
        <span className="mt-3 inline-block text-sm font-semibold text-rose-300">
          The lie
        </span>
      )}
    </Component>
  );
}
