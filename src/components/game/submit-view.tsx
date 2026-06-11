"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-2xl">Your turn!</CardTitle>
          <p className="text-zinc-400">
            Share two truths and one lie. Other players will try to spot the lie.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {statements.map((statement, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">
                Statement {index + 1}
              </label>
              <Input
                value={statement}
                onChange={(e) => {
                  const next = [...statements];
                  next[index] = e.target.value;
                  setStatements(next);
                }}
                placeholder={`Enter statement ${index + 1}`}
                maxLength={200}
                className="border-white/10 bg-white/5"
              />
              <button
                type="button"
                onClick={() => setLieIndex(index)}
                className={`text-sm font-medium ${
                  lieIndex === index
                    ? "text-rose-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {lieIndex === index ? "✓ This is the lie" : "Mark as the lie"}
              </button>
            </div>
          ))}

          <Button
            className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
            onClick={() => void handleSubmit()}
            disabled={loading}
          >
            {loading ? "Locking in..." : "Lock in statements"}
          </Button>

          {error && (
            <p className="text-center text-sm text-rose-400">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
