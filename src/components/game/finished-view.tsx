import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerList } from "./player-list";
import type { Id } from "../../../convex/_generated/dataModel";

type Player = {
  _id: Id<"players">;
  displayName: string;
  isHost: boolean;
  score: number;
};

export function FinishedView({ players }: { players: Array<Player> }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="mx-auto w-full max-w-lg">
      <Card className="animate-rise border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader className="text-center">
          <p
            aria-hidden
            className="animate-pop mx-auto text-5xl [text-shadow:0_0_40px_rgb(251_191_36_/_0.45)]"
          >
            🏆
          </p>
          <CardTitle className="font-display text-4xl font-extrabold">
            Game over!
          </CardTitle>
          {winner && (
            <p className="text-lg">
              <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text font-bold text-transparent">
                {winner.displayName}
              </span>{" "}
              <span className="text-zinc-300">
                wins with {winner.score} point{winner.score === 1 ? "" : "s"}!
              </span>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <PlayerList players={sorted} highlightId={winner?._id} />
          <Link
            href="/"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-amber-500 px-4 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.98]"
          >
            Play again
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
