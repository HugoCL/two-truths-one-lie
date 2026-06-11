import { Badge } from "@/components/ui/badge";
import type { Id } from "../../../convex/_generated/dataModel";

type Player = {
  _id: Id<"players">;
  displayName: string;
  isHost: boolean;
  score: number;
};

export function PlayerList({
  players,
  highlightId,
}: {
  players: Array<Player>;
  highlightId?: Id<"players"> | null;
}) {
  return (
    <ul className="space-y-2">
      {players.map((player) => (
        <li
          key={player._id}
          className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
            player._id === highlightId
              ? "border-amber-400/60 bg-amber-400/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{player.displayName}</span>
            {player.isHost && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-200">
                Host
              </Badge>
            )}
          </div>
          <span className="text-sm text-zinc-400">{player.score} pts</span>
        </li>
      ))}
    </ul>
  );
}
