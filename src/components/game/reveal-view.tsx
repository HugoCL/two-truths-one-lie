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
      <Card className="animate-rise border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/80">
            The reveal
          </p>
          <CardTitle className="font-display text-3xl font-bold">
            The lie is out!
          </CardTitle>
          <p className="text-zinc-400">
            {correctVoters.length > 0
              ? `${correctVoters.map((v) => v.playerName).join(", ")} saw right through it.`
              : "Nobody guessed correctly — a flawless lie!"}
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
        <Card className="animate-rise stagger-2 border-white/10 bg-zinc-900/70 shadow-xl shadow-black/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-display text-lg font-bold">Votes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {votes.map((vote) => (
              <div
                key={vote.playerId}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm ${
                  vote.isCorrect
                    ? "border-emerald-400/30 bg-emerald-500/[0.07]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span className="font-medium">{vote.playerName}</span>
                <span
                  className={
                    vote.isCorrect
                      ? "font-semibold text-emerald-400"
                      : "text-zinc-500"
                  }
                >
                  Statement {vote.votedIndex + 1}
                  {vote.isCorrect ? " ✓" : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="animate-rise stagger-3 border-white/10 bg-zinc-900/70 shadow-xl shadow-black/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display text-lg font-bold">
            Scoreboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerList players={players} />
        </CardContent>
      </Card>

      {isHost ? (
        <Button
          size="lg"
          className="animate-rise stagger-4 h-12 w-full bg-amber-500 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.98]"
          onClick={() => void handleNextRound()}
          disabled={loading}
        >
          {loading ? "Loading..." : "Next round"}
        </Button>
      ) : (
        <p className="animate-pulse-soft text-center text-sm text-zinc-500">
          Waiting for host to start the next round...
        </p>
      )}

      {error && (
        <p className="animate-pop rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
