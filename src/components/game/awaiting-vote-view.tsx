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
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-2xl">{submitterName}&apos;s statements</CardTitle>
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
              className="mt-2 w-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
              onClick={() => void handleStartVote()}
              disabled={loading}
            >
              {loading ? "Starting..." : "Start vote countdown"}
            </Button>
          )}

          {error && (
            <p className="text-center text-sm text-rose-400">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
