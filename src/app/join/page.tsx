"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOrCreateSessionId } from "@/lib/session";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinGame = useMutation(api.games.join);

  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState(
    () => searchParams.get("code")?.toUpperCase() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await joinGame({
        sessionId: getOrCreateSessionId(),
        displayName: name.trim(),
        inviteCode: inviteCode.trim().toUpperCase(),
      });
      router.push(`/game/${result.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <Card className="animate-rise w-full max-w-md border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display text-3xl font-bold">
            Join a game
          </CardTitle>
          <p className="text-zinc-400">
            You&apos;ve been invited. Enter your name to jump in.
          </p>
        </CardHeader>
        <CardContent>
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
                autoFocus
                className="h-11 border-white/10 bg-white/5 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/30"
              />
            </div>

            <div className="space-y-2">
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

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full bg-amber-500 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Joining..." : "Join lobby"}
            </Button>

            {error && (
              <p className="animate-pop rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-300">
                {error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-zinc-400">
          Loading...
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
