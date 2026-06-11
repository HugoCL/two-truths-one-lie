import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation } from "./_generated/server";
import {
  createRound,
  getCurrentRound,
  getPlayersInGame,
  getSubmitterForRound,
  validateLieIndex,
  validateStatements,
} from "./lib/gameLogic";
import { requireHost, requirePlayer } from "./lib/sessions";

const VOTE_COUNTDOWN_MS = 10_000;

export const submitStatements = mutation({
  args: {
    gameId: v.id("games"),
    sessionId: v.string(),
    statements: v.array(v.string()),
    lieIndex: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const player = await requirePlayer(ctx, args.gameId, args.sessionId);
    const game = await ctx.db.get("games", args.gameId);
    if (!game || game.status !== "playing") {
      throw new Error("Game is not in progress");
    }

    const round = await getCurrentRound(
      ctx,
      args.gameId,
      game.currentRoundIndex,
    );
    if (!round || round.phase !== "submitting") {
      throw new Error("Not accepting statements right now");
    }
    if (round.submitterPlayerId !== player._id) {
      throw new Error("Only the current player can submit statements");
    }

    const statements = validateStatements(args.statements);
    validateLieIndex(args.lieIndex);

    await ctx.db.patch(round._id, {
      statements,
      lieIndex: args.lieIndex,
      phase: "awaiting_vote_start",
    });

    return null;
  },
});

export const startVoteCountdown = mutation({
  args: {
    gameId: v.id("games"),
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const player = await requirePlayer(ctx, args.gameId, args.sessionId);
    const game = await ctx.db.get("games", args.gameId);
    if (!game || game.status !== "playing") {
      throw new Error("Game is not in progress");
    }

    const round = await getCurrentRound(
      ctx,
      args.gameId,
      game.currentRoundIndex,
    );
    if (!round || round.phase !== "awaiting_vote_start") {
      throw new Error("Cannot start voting right now");
    }

    const isHost = player.isHost;
    const isSubmitter = round.submitterPlayerId === player._id;
    if (!isHost && !isSubmitter) {
      throw new Error("Only the host or submitter can start the vote");
    }

    const voteCountdownEndsAt = Date.now() + VOTE_COUNTDOWN_MS;

    await ctx.db.patch(round._id, {
      phase: "voting",
      voteCountdownEndsAt,
    });

    await ctx.scheduler.runAfter(
      VOTE_COUNTDOWN_MS,
      internal.rounds.closeVoting,
      { roundId: round._id },
    );

    return null;
  },
});

export const castVote = mutation({
  args: {
    gameId: v.id("games"),
    sessionId: v.string(),
    votedIndex: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const player = await requirePlayer(ctx, args.gameId, args.sessionId);
    const game = await ctx.db.get("games", args.gameId);
    if (!game || game.status !== "playing") {
      throw new Error("Game is not in progress");
    }

    const round = await getCurrentRound(
      ctx,
      args.gameId,
      game.currentRoundIndex,
    );
    if (!round || round.phase !== "voting") {
      throw new Error("Voting is not open");
    }
    if (round.submitterPlayerId === player._id) {
      throw new Error("You cannot vote on your own round");
    }
    if (
      round.voteCountdownEndsAt !== undefined &&
      Date.now() > round.voteCountdownEndsAt
    ) {
      throw new Error("Voting has ended");
    }

    validateLieIndex(args.votedIndex);

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_round_and_player", (q) =>
        q.eq("roundId", round._id).eq("playerId", player._id),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { votedIndex: args.votedIndex });
    } else {
      await ctx.db.insert("votes", {
        roundId: round._id,
        playerId: player._id,
        votedIndex: args.votedIndex,
      });
    }

    return null;
  },
});

export const advanceRound = mutation({
  args: {
    gameId: v.id("games"),
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireHost(ctx, args.gameId, args.sessionId);

    const game = await ctx.db.get("games", args.gameId);
    if (!game || game.status !== "playing") {
      throw new Error("Game is not in progress");
    }

    const round = await getCurrentRound(
      ctx,
      args.gameId,
      game.currentRoundIndex,
    );
    if (!round || round.phase !== "revealed") {
      throw new Error("Wait for the round to be revealed first");
    }

    const players = await getPlayersInGame(ctx, args.gameId);
    const nextRoundIndex = game.currentRoundIndex + 1;

    if (nextRoundIndex >= players.length) {
      await ctx.db.patch(args.gameId, { status: "finished" });
      return null;
    }

    const submitter = getSubmitterForRound(players, nextRoundIndex);
    await createRound(ctx, args.gameId, nextRoundIndex, submitter._id);

    await ctx.db.patch(args.gameId, {
      currentRoundIndex: nextRoundIndex,
    });

    return null;
  },
});

export const closeVoting = internalMutation({
  args: {
    roundId: v.id("rounds"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const round = await ctx.db.get("rounds", args.roundId);
    if (!round || round.phase !== "voting") {
      return null;
    }

    const lieIndex = round.lieIndex;
    if (lieIndex === undefined) {
      throw new Error("Round is missing lie index");
    }

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_round", (q) => q.eq("roundId", round._id))
      .collect();

    for (const vote of votes) {
      if (vote.votedIndex === lieIndex) {
        const player = await ctx.db.get("players", vote.playerId);
        if (player) {
          await ctx.db.patch(vote.playerId, { score: player.score + 1 });
        }
      }
    }

    await ctx.db.patch(round._id, { phase: "revealed" });

    return null;
  },
});
