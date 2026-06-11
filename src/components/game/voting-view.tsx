"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatementCard } from "./statement-card";
import { getOrCreateSessionId } from "@/lib/session";

export function VotingView({
  gameId,
  submitterName,
  statements,
  countdownSeconds,
  canVote,
  voteCounts,
}: {
  gameId: Id<"games">;
  submitterName: string;
  statements: Array<string>;
  countdownSeconds: number;
  canVote: boolean;
  voteCounts: Array<number> | null;
}) {
  const castVote = useMutation(api.rounds.castVote);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVote(index: number) {
    if (!canVote) return;
    setSelectedIndex(index);
    setError(null);
    try {
      await castVote({
        gameId,
        sessionId: getOrCreateSessionId(),
        votedIndex: index,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to vote");
      setSelectedIndex(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 py-8 text-center">
        <p className="text-sm uppercase tracking-widest text-amber-200/80">
          Vote ends in
        </p>
        <p className="mt-2 font-mono text-6xl font-bold text-amber-300">
          {countdownSeconds}
        </p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-2xl">Which is the lie?</CardTitle>
          <p className="text-zinc-400">
            {canVote
              ? `Pick the lie about ${submitterName}.`
              : `Watch the votes roll in for ${submitterName}.`}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {statements.map((statement, index) => (
            <div key={index} className="space-y-1">
              <StatementCard
                index={index}
                text={statement}
                selected={selectedIndex === index}
                onClick={canVote ? () => void handleVote(index) : undefined}
                disabled={!canVote}
              />
              {voteCounts && (
                <p className="text-right text-xs text-zinc-500">
                  {voteCounts[index]} vote{voteCounts[index] === 1 ? "" : "s"}
                </p>
              )}
            </div>
          ))}

          {error && (
            <p className="text-center text-sm text-rose-400">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
