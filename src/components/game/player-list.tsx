import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";

type Player = {
  _id: Id<"players">;
  displayName: string;
  isHost: boolean;
  score: number;
};

const AVATAR_COLORS = [
  "bg-amber-500/20 text-amber-300 border-amber-400/30",
  "bg-rose-500/20 text-rose-300 border-rose-400/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  "bg-sky-500/20 text-sky-300 border-sky-400/30",
  "bg-violet-500/20 text-violet-300 border-violet-400/30",
  "bg-orange-500/20 text-orange-300 border-orange-400/30",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function PlayerList({
  players,
  highlightId,
}: {
  players: Array<Player>;
  highlightId?: Id<"players"> | null;
}) {
  return (
    <ul className="space-y-2">
      {players.map((player, i) => (
        <li
          key={player._id}
          style={{ animationDelay: `${i * 50}ms` }}
          className={cn(
            "animate-rise flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors",
            player._id === highlightId
              ? "border-amber-400/50 bg-amber-400/10"
              : "border-white/10 bg-white/[0.04]",
          )}
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold uppercase",
                avatarColor(player.displayName),
              )}
            >
              {player.displayName.charAt(0)}
            </span>
            <span className="font-medium">{player.displayName}</span>
            {player.isHost && (
              <Badge
                variant="secondary"
                className="border border-amber-400/30 bg-amber-500/15 text-amber-300"
              >
                Host
              </Badge>
            )}
          </div>
          <span className="font-mono text-sm tabular-nums text-zinc-400">
            {player.score} pts
          </span>
        </li>
      ))}
    </ul>
  );
}
