"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatementCard } from "./statement-card";
import { getOrCreateSessionId } from "@/lib/session";

export function AwaitingVoteView({
  gameId,
  submitterName,
  statements,
  canStartVote,
}: {
  gameId: Id<"games">;
  submitterName: string;
  statements: Array<string>;
  canStartVote: boolean;
}) {
  const startVoteCountdown = useMutation(api.rounds.startVoteCountdown);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleStartVote() {
    setError(null);
    setLoading(true);
    try {
      await startVoteCountdown({
        gameId,
        sessionId: getOrCreateSessionId(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start vote");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <Card className="animate-rise border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
            Read carefully
          </p>
          <CardTitle className="font-display text-2xl font-bold">
            {submitterName}&apos;s statements
          </CardTitle>
          <p className="text-zinc-400">
            {canStartVote
              ? "Ready when you are — start the vote countdown."
              : "Waiting for the host or submitter to start voting..."}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {statements.map((statement, index) => (
            <StatementCard key={index} index={index} text={statement} />
          ))}

          {canStartVote && (
            <Button
              size="lg"
              className="mt-2 h-12 w-full bg-amber-500 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.98]"
              onClick={() => void handleStartVote()}
              disabled={loading}
            >
              {loading ? "Starting..." : "Start vote countdown"}
            </Button>
          )}

          {error && (
            <p className="animate-pop rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-300">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
