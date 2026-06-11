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
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Game over!</CardTitle>
          {winner && (
            <p className="text-lg text-amber-300">
              {winner.displayName} wins with {winner.score} point
              {winner.score === 1 ? "" : "s"}!
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <PlayerList players={sorted} />
          <Link
            href="/"
            className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-amber-500 px-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-400"
          >
            Play again
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
