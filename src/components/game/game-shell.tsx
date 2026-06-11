"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getOrCreateSessionId } from "@/lib/session";
import { LobbyView } from "./lobby-view";
import { SubmitView } from "./submit-view";
import { WaitingView } from "./waiting-view";
import { AwaitingVoteView } from "./awaiting-vote-view";
import { VotingView } from "./voting-view";
import { RevealView } from "./reveal-view";
import { FinishedView } from "./finished-view";

export function GameShell({ gameId }: { gameId: Id<"games"> }) {
  const sessionId = getOrCreateSessionId();
  const gameState = useQuery(api.games.getGameState, {
    gameId,
    sessionId,
  });

  if (gameState === undefined) {
    return (
      <div className="animate-pulse-soft flex min-h-[50vh] items-center justify-center text-zinc-400">
        Loading game...
      </div>
    );
  }

  if (gameState === null) {
    return (
      <div className="animate-rise flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-display text-2xl font-bold text-zinc-200">
          Game not found
        </p>
        <p className="text-zinc-500">This game may have ended or never existed.</p>
        <Link
          href="/"
          className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-5 py-2.5 font-medium text-amber-300 transition-colors hover:bg-amber-400/20"
        >
          Back to home
        </Link>
      </div>
    );
  }

  if (gameState.status === "lobby") {
    return (
      <LobbyView
        gameId={gameState.gameId}
        inviteCode={gameState.inviteCode}
        players={gameState.players}
        myPlayerId={gameState.myPlayerId}
      />
    );
  }

  if (gameState.status === "finished") {
    return <FinishedView players={gameState.players} />;
  }

  const round = gameState.currentRound;
  if (!round) {
    return (
      <div className="text-center text-zinc-400">Waiting for round to start...</div>
    );
  }

  const me = gameState.players.find((p) => p._id === gameState.myPlayerId);
  const isHost = me?.isHost ?? false;
  const isSubmitter = gameState.myPlayerId === round.submitterPlayerId;
  const canStartVote = isHost || isSubmitter;

  switch (round.phase) {
    case "submitting":
      if (isSubmitter) {
        return <SubmitView gameId={gameState.gameId} />;
      }
      return (
        <WaitingView
          submitterName={round.submitterName}
          players={gameState.players}
          submitterId={round.submitterPlayerId}
        />
      );

    case "awaiting_vote_start":
      if (!round.statements) {
        return <div className="text-center text-zinc-400">Loading statements...</div>;
      }
      return (
        <AwaitingVoteView
          gameId={gameState.gameId}
          submitterName={round.submitterName}
          statements={round.statements}
          canStartVote={canStartVote}
        />
      );

    case "voting":
      if (!round.statements) {
        return <div className="text-center text-zinc-400">Loading statements...</div>;
      }
      return (
        <VotingView
          gameId={gameState.gameId}
          submitterName={round.submitterName}
          statements={round.statements}
          voteCountdownEndsAt={round.voteCountdownEndsAt}
          canVote={!isSubmitter}
          voteCounts={round.voteCounts}
        />
      );

    case "revealed":
      if (!round.statements || round.lieIndex === null) {
        return <div className="text-center text-zinc-400">Loading results...</div>;
      }
      return (
        <RevealView
          gameId={gameState.gameId}
          statements={round.statements}
          lieIndex={round.lieIndex}
          votes={round.votes}
          players={gameState.players}
          isHost={isHost}
        />
      );

    default: {
      const _exhaustive: never = round.phase;
      return _exhaustive;
    }
  }
}
