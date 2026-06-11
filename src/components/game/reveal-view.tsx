"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatementCard } from "./statement-card";
import { PlayerList } from "./player-list";
import { getOrCreateSessionId } from "@/lib/session";

type Player = {
  _id: Id<"players">;
  displayName: string;
  isHost: boolean;
  score: number;
};

type VoteResult = {
  playerId: Id<"players">;
  playerName: string;
  votedIndex: number;
  isCorrect: boolean;
};

export function RevealView({
  gameId,
  statements,
  lieIndex,
  votes,
  players,
  isHost,
}: {
  gameId: Id<"games">;
  statements: Array<string>;
  lieIndex: number;
  votes: Array<VoteResult> | null;
  players: Array<Player>;
  isHost: boolean;
}) {
  const advanceRound = useMutation(api.rounds.advanceRound);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleNextRound() {
    setError(null);
    setLoading(true);
    try {
      await advanceRound({ gameId, sessionId: getOrCreateSessionId() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to advance");
    } finally {
      setLoading(false);
    }
  }

  const correctVoters = votes?.filter((v) => v.isCorrect) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-2xl">The lie is revealed!</CardTitle>
          <p className="text-zinc-400">
            {correctVoters.length > 0
              ? `${correctVoters.map((v) => v.playerName).join(", ")} got it right!`
              : "Nobody guessed correctly!"}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {statements.map((statement, index) => (
            <StatementCard
              key={index}
              index={index}
              text={statement}
              revealedLie={index === lieIndex}
            />
          ))}
        </CardContent>
      </Card>

      {votes && votes.length > 0 && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Votes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {votes.map((vote) => (
              <div
                key={vote.playerId}
                className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm"
              >
                <span>{vote.playerName}</span>
                <span className={vote.isCorrect ? "text-emerald-400" : "text-zinc-500"}>
                  Statement {vote.votedIndex + 1}
                  {vote.isCorrect ? " ✓" : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Scoreboard</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerList players={players} />
        </CardContent>
      </Card>

      {isHost && (
        <Button
          className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
          onClick={() => void handleNextRound()}
          disabled={loading}
        >
          {loading ? "Loading..." : "Next round"}
        </Button>
      )}

      {!isHost && (
        <p className="text-center text-sm text-zinc-500">
          Waiting for host to start the next round...
        </p>
      )}

      {error && <p className="text-center text-sm text-rose-400">{error}</p>}
    </div>
  );
}
