import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerList } from "./player-list";
import type { Id } from "../../../convex/_generated/dataModel";

type Player = {
  _id: Id<"players">;
  displayName: string;
  isHost: boolean;
  score: number;
};

export function WaitingView({
  submitterName,
  players,
  submitterId,
}: {
  submitterName: string;
  players: Array<Player>;
  submitterId: Id<"players">;
}) {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Card className="animate-rise border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div
            aria-hidden
            className="mx-auto mb-2 flex items-end gap-1.5 pb-1"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 200}ms` }}
                className="animate-pulse-soft inline-block h-2.5 w-2.5 rounded-full bg-amber-400"
              />
            ))}
          </div>
          <CardTitle className="font-display text-2xl font-bold">
            {submitterName} is writing their facts...
          </CardTitle>
          <p className="text-zinc-400">
            Hang tight while they cook up a convincing lie.
          </p>
        </CardHeader>
        <CardContent>
          <PlayerList players={players} highlightId={submitterId} />
        </CardContent>
      </Card>
    </div>
  );
}
