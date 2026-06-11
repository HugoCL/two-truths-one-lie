"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOrCreateSessionId } from "@/lib/session";

export default function HomePage() {
  const router = useRouter();
  const createGame = useMutation(api.games.create);
  const joinGame = useMutation(api.games.join);

  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const sessionId = getOrCreateSessionId();
    const displayName = name.trim();

    try {
      if (mode === "create") {
        const result = await createGame({ sessionId, displayName });
        router.push(`/game/${result.gameId}`);
      } else {
        const result = await joinGame({
          sessionId,
          displayName,
          inviteCode: inviteCode.trim().toUpperCase(),
        });
        router.push(`/game/${result.gameId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="animate-rise mb-10 text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-amber-300">
          <span className="animate-pulse-soft inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          Real-time party game
        </p>
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-zinc-50 sm:text-6xl">
          Two Truths,
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400 bg-clip-text text-transparent">
            One Lie
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-balance text-zinc-400">
          Share two truths and one lie — can your friends spot the fib?
        </p>
      </div>

      <Card className="animate-rise stagger-2 w-full max-w-md border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div
            role="tablist"
            aria-label="Game mode"
            className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-zinc-950/60 p-1"
          >
            {(["create", "join"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  mode === m
                    ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {m === "create" ? "Create game" : "Join game"}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                Your name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={30}
                required
                className="h-11 border-white/10 bg-white/5 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/30"
              />
            </div>

            {mode === "join" && (
              <div className="animate-pop space-y-2">
                <label htmlFor="code" className="text-sm font-medium text-zinc-300">
                  Invite code
                </label>
                <Input
                  id="code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="ABCDEF"
                  maxLength={6}
                  required
                  className="h-11 border-white/10 bg-white/5 text-center font-mono text-lg tracking-[0.4em] uppercase focus-visible:border-amber-400/60 focus-visible:ring-amber-400/30"
                />
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full bg-amber-500 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.98]"
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : mode === "create"
                  ? "Create & enter lobby"
                  : "Join lobby"}
            </Button>

            {error && (
              <p className="animate-pop rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-300">
                {error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <p className="animate-rise stagger-4 mt-8 text-center text-sm text-zinc-600">
        No accounts. No downloads. Just lies between friends.
      </p>
    </main>
  );
}
