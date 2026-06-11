"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatementCard } from "./statement-card";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/use-now";
import { getOrCreateSessionId } from "@/lib/session";

export function VotingView({
  gameId,
  submitterName,
  statements,
  voteCountdownEndsAt,
  canVote,
  voteCounts,
}: {
  gameId: Id<"games">;
  submitterName: string;
  statements: Array<string>;
  voteCountdownEndsAt: number | null;
  canVote: boolean;
  voteCounts: Array<number> | null;
}) {
  const now = useNow();
  const countdownSeconds =
    voteCountdownEndsAt === null
      ? 0
      : Math.max(0, Math.ceil((voteCountdownEndsAt - now) / 1000));
  const castVote = useMutation(api.rounds.castVote);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const urgent = countdownSeconds <= 5;
  const totalVotes = voteCounts?.reduce((a, b) => a + b, 0) ?? 0;

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
      <div
        className={cn(
          "animate-rise rounded-2xl border py-6 text-center backdrop-blur-sm transition-colors",
          urgent
            ? "border-rose-400/50 bg-rose-500/10"
            : "border-amber-400/40 bg-amber-400/[0.08]",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.25em]",
            urgent ? "text-rose-300/90" : "text-amber-200/80",
          )}
        >
          Vote ends in
        </p>
        <p
          key={countdownSeconds}
          className={cn(
            "animate-tick mt-1 font-mono text-6xl font-bold tabular-nums",
            urgent
              ? "text-rose-300 [text-shadow:0_0_30px_rgb(251_113_133_/_0.4)]"
              : "text-amber-300 [text-shadow:0_0_30px_rgb(251_191_36_/_0.35)]",
          )}
        >
          {countdownSeconds}
        </p>
      </div>

      <Card className="animate-rise stagger-1 border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display text-2xl font-bold">
            Which is the lie?
          </CardTitle>
          <p className="text-zinc-400">
            {canVote
              ? `Pick the lie about ${submitterName}.`
              : `Watch the votes roll in for ${submitterName}.`}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {statements.map((statement, index) => {
            const count = voteCounts?.[index] ?? 0;
            const share = totalVotes > 0 ? count / totalVotes : 0;
            return (
              <div key={index} className="space-y-1.5">
                <StatementCard
                  index={index}
                  text={statement}
                  selected={selectedIndex === index}
                  onClick={canVote ? () => void handleVote(index) : undefined}
                  disabled={!canVote}
                />
                {voteCounts && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-amber-400/70 transition-all duration-500"
                        style={{ width: `${share * 100}%` }}
                      />
                    </div>
                    <p className="w-14 text-right font-mono text-xs tabular-nums text-zinc-500">
                      {count} vote{count === 1 ? "" : "s"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

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
