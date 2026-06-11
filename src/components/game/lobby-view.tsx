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
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-2xl">Waiting in lobby</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-center">
            <p className="text-sm text-zinc-400">Invite code</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-[0.3em] text-amber-300">
              {inviteCode}
            </p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => void handleCopy()}
            >
              {copied ? "Copied!" : "Copy invite link"}
            </Button>
          </div>

          <div>
            <p className="mb-3 text-sm text-zinc-400">
              {players.length} player{players.length === 1 ? "" : "s"} joined
            </p>
            <PlayerList players={players} highlightId={myPlayerId} />
          </div>

          {isHost ? (
            <div className="space-y-2">
              <Button
                className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-400"
                onClick={() => void handleStart()}
                disabled={loading || players.length < 2}
              >
                {loading ? "Starting..." : "Start game"}
              </Button>
              {players.length < 2 && (
                <p className="text-center text-sm text-zinc-500">
                  Need at least 2 players to start
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500">
              Waiting for the host to start the game...
            </p>
          )}

          {error && (
            <p className="text-center text-sm text-rose-400">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
