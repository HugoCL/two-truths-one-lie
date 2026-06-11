"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getOrCreateSessionId } from "@/lib/session";

export function SubmitView({ gameId }: { gameId: Id<"games"> }) {
  const submitStatements = useMutation(api.rounds.submitStatements);
  const [statements, setStatements] = useState(["", "", ""]);
  const [lieIndex, setLieIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (lieIndex === null) {
      setError("Pick which statement is the lie");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await submitStatements({
        gameId,
        sessionId: getOrCreateSessionId(),
        statements,
        lieIndex,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <Card className="animate-rise border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
            Your turn
          </p>
          <CardTitle className="font-display text-3xl font-bold">
            Write your three statements
          </CardTitle>
          <p className="text-zinc-400">
            Two truths and one lie. Make the lie believable!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {statements.map((statement, index) => (
            <div
              key={index}
              style={{ animationDelay: `${index * 80}ms` }}
              className={cn(
                "animate-rise space-y-2 rounded-2xl border p-4 transition-colors",
                lieIndex === index
                  ? "border-rose-400/50 bg-rose-500/[0.08]"
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">
                  Statement {index + 1}
                </label>
                <button
                  type="button"
                  onClick={() => setLieIndex(index)}
                  aria-pressed={lieIndex === index}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                    lieIndex === index
                      ? "border-rose-400/60 bg-rose-500/20 text-rose-300"
                      : "border-white/10 bg-white/5 text-zinc-500 hover:border-rose-400/40 hover:text-rose-300",
                  )}
                >
                  {lieIndex === index ? "✓ The lie" : "Mark as lie"}
                </button>
              </div>
              <Input
                value={statement}
                onChange={(e) => {
                  const next = [...statements];
                  next[index] = e.target.value;
                  setStatements(next);
                }}
                placeholder={
                  index === 0
                    ? "e.g. I once met a celebrity at the airport"
                    : `Enter statement ${index + 1}`
                }
                maxLength={200}
                className="h-11 border-white/10 bg-white/5 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/30"
              />
            </div>
          ))}

          <Button
            size="lg"
            className="h-12 w-full bg-amber-500 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.98]"
            onClick={() => void handleSubmit()}
            disabled={loading}
          >
            {loading ? "Locking in..." : "Lock in statements"}
          </Button>

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
