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
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {submitterName} is writing their facts...
          </CardTitle>
          <p className="text-zinc-400">Hang tight while they lock in their statements.</p>
        </CardHeader>
        <CardContent>
          <PlayerList players={players} highlightId={submitterId} />
        </CardContent>
      </Card>
    </div>
  );
}
