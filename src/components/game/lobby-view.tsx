"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerList } from "./player-list";
import { getOrCreateSessionId } from "@/lib/session";

type Player = {
  _id: Id<"players">;
  displayName: string;
  isHost: boolean;
  score: number;
};

export function LobbyView({
  gameId,
  inviteCode,
  players,
  myPlayerId,
}: {
  gameId: Id<"games">;
  inviteCode: string;
  players: Array<Player>;
  myPlayerId: Id<"players"> | null;
}) {
  const startGame = useMutation(api.games.start);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const me = players.find((p) => p._id === myPlayerId);
  const isHost = me?.isHost ?? false;

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join?code=${inviteCode}`
      : `/join?code=${inviteCode}`;

  async function handleStart() {
    setError(null);
    setLoading(true);
    try {
      await startGame({ gameId, sessionId: getOrCreateSessionId() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start game");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card className="animate-rise border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
            Lobby
          </p>
          <CardTitle className="font-display text-3xl font-bold">
            Gather your players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/[0.07] p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Invite code
            </p>
            <p className="mt-2 font-mono text-4xl font-bold tracking-[0.35em] text-amber-300 [text-shadow:0_0_24px_rgb(251_191_36_/_0.35)]">
              {inviteCode}
            </p>
            <Button
              variant="secondary"
              className="mt-4 border border-white/10 bg-white/10 hover:bg-white/15"
              onClick={() => void handleCopy()}
            >
              {copied ? "✓ Copied!" : "Copy invite link"}
            </Button>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between text-sm">
              <p className="font-medium text-zinc-300">Players</p>
              <p className="text-zinc-500">
                {players.length} joined
                {players.length < 2 && " · need 2+"}
              </p>
            </div>
            <PlayerList players={players} highlightId={myPlayerId} />
          </div>

          {isHost ? (
            <div className="space-y-2">
              <Button
                size="lg"
                className="h-12 w-full bg-amber-500 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.98]"
                onClick={() => void handleStart()}
                disabled={loading || players.length < 2}
              >
                {loading ? "Starting..." : "Start game"}
              </Button>
              {players.length < 2 && (
                <p className="text-center text-sm text-zinc-500">
                  Waiting for at least one more player...
                </p>
              )}
            </div>
          ) : (
            <p className="animate-pulse-soft text-center text-sm text-zinc-500">
              Waiting for the host to start the game...
            </p>
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
