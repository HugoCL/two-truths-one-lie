import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  createRound,
  generateUniqueInviteCode,
  getCurrentRound,
  getPlayersInGame,
  getSubmitterForRound,
} from "./lib/gameLogic";
import { getPlayerBySession, requireHost } from "./lib/sessions";
import { gameStateValidator } from "./lib/validators";

export const create = mutation({
  args: {
    sessionId: v.string(),
    displayName: v.string(),
  },
  returns: v.object({
    gameId: v.id("games"),
    inviteCode: v.string(),
  }),
  handler: async (ctx, args) => {
    const displayName = args.displayName.trim();
    if (displayName.length < 1 || displayName.length > 30) {
      throw new Error("Name must be 1-30 characters");
    }
    if (args.sessionId.length < 8) {
      throw new Error("Invalid session");
    }

    const inviteCode = await generateUniqueInviteCode(ctx);
    const now = Date.now();

    const gameId = await ctx.db.insert("games", {
      inviteCode,
      status: "lobby",
      currentRoundIndex: 0,
      createdAt: now,
    });

    const playerId = await ctx.db.insert("players", {
      gameId,
      sessionId: args.sessionId,
      displayName,
      isHost: true,
      joinedAt: now,
      score: 0,
    });

    await ctx.db.patch(gameId, { hostPlayerId: playerId });

    return { gameId, inviteCode };
  },
});

export const join = mutation({
  args: {
    sessionId: v.string(),
    displayName: v.string(),
    inviteCode: v.string(),
  },
  returns: v.object({
    gameId: v.id("games"),
  }),
  handler: async (ctx, args) => {
    const displayName = args.displayName.trim();
    if (displayName.length < 1 || displayName.length > 30) {
      throw new Error("Name must be 1-30 characters");
    }
    if (args.sessionId.length < 8) {
      throw new Error("Invalid session");
    }

    const inviteCode = args.inviteCode.trim().toUpperCase();
    const game = await ctx.db
      .query("games")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
      .unique();

    if (!game) {
      throw new Error("Invalid invite code");
    }
    if (game.status !== "lobby") {
      throw new Error("This game has already started");
    }

    const existing = await getPlayerBySession(ctx, game._id, args.sessionId);
    if (existing) {
      return { gameId: game._id };
    }

    const players = await getPlayersInGame(ctx, game._id);
    if (players.length >= 12) {
      throw new Error("This game is full");
    }

    await ctx.db.insert("players", {
      gameId: game._id,
      sessionId: args.sessionId,
      displayName,
      isHost: false,
      joinedAt: Date.now(),
      score: 0,
    });

    return { gameId: game._id };
  },
});

export const start = mutation({
  args: {
    gameId: v.id("games"),
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireHost(ctx, args.gameId, args.sessionId);

    const game = await ctx.db.get("games", args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    if (game.status !== "lobby") {
      throw new Error("Game has already started");
    }

    const players = await getPlayersInGame(ctx, args.gameId);
    if (players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }

    const submitter = getSubmitterForRound(players, 0);
    await createRound(ctx, args.gameId, 0, submitter._id);

    await ctx.db.patch(args.gameId, {
      status: "playing",
      currentRoundIndex: 0,
    });

    return null;
  },
});

export const getGameState = query({
  args: {
    gameId: v.id("games"),
    sessionId: v.string(),
    now: v.number(),
  },
  returns: v.union(gameStateValidator, v.null()),
  handler: async (ctx, args) => {
    const game = await ctx.db.get("games", args.gameId);
    if (!game) {
      return null;
    }

    const myPlayer = await getPlayerBySession(ctx, args.gameId, args.sessionId);
    const players = await getPlayersInGame(ctx, args.gameId);
    const playerNameById = new Map(players.map((p) => [p._id, p.displayName]));

    let currentRound = null;
    let countdownSecondsRemaining: number | null = null;

    if (game.status === "playing") {
      const round = await getCurrentRound(
        ctx,
        args.gameId,
        game.currentRoundIndex,
      );

      if (round) {
        const submitterName =
          playerNameById.get(round.submitterPlayerId) ?? "Unknown";
        const isRevealed = round.phase === "revealed";
        const isSubmitter = myPlayer?._id === round.submitterPlayerId;

        let lieIndex: number | null = null;
        if (isRevealed) {
          lieIndex = round.lieIndex ?? null;
        } else if (isSubmitter) {
          lieIndex = round.lieIndex ?? null;
        }

        let voteCounts: Array<number> | null = null;
        let votes:
          | Array<{
              playerId: (typeof players)[0]["_id"];
              playerName: string;
              votedIndex: number;
              isCorrect: boolean;
            }>
          | null = null;

        const roundVotes = await ctx.db
          .query("votes")
          .withIndex("by_round", (q) => q.eq("roundId", round._id))
          .collect();

        if (round.phase === "voting" || round.phase === "revealed") {
          voteCounts = [0, 0, 0];
          for (const vote of roundVotes) {
            if (vote.votedIndex >= 0 && vote.votedIndex <= 2) {
              voteCounts[vote.votedIndex]! += 1;
            }
          }
        }

        if (isRevealed) {
          const correctIndex = round.lieIndex ?? -1;
          votes = roundVotes.map((vote) => ({
            playerId: vote.playerId,
            playerName: playerNameById.get(vote.playerId) ?? "Unknown",
            votedIndex: vote.votedIndex,
            isCorrect: vote.votedIndex === correctIndex,
          }));
        }

        if (
          round.phase === "voting" &&
          round.voteCountdownEndsAt !== undefined
        ) {
          countdownSecondsRemaining = Math.max(
            0,
            Math.ceil((round.voteCountdownEndsAt - args.now) / 1000),
          );
        }

        currentRound = {
          _id: round._id,
          roundNumber: round.roundNumber,
          submitterPlayerId: round.submitterPlayerId,
          submitterName,
          statements: round.statements ?? null,
          lieIndex,
          phase: round.phase,
          voteCountdownEndsAt: round.voteCountdownEndsAt ?? null,
          voteCounts,
          votes,
        };
      }
    }

    return {
      gameId: game._id,
      inviteCode: game.inviteCode,
      status: game.status,
      currentRoundIndex: game.currentRoundIndex,
      myPlayerId: myPlayer?._id ?? null,
      players: players.map((p) => ({
        _id: p._id,
        displayName: p.displayName,
        isHost: p.isHost,
        score: p.score,
        joinedAt: p.joinedAt,
      })),
      currentRound,
      countdownSecondsRemaining,
    };
  },
});
