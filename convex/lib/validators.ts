import { v } from "convex/values";
import { gameStatusValidator, roundPhaseValidator } from "../schema";

export const playerValidator = v.object({
  _id: v.id("players"),
  displayName: v.string(),
  isHost: v.boolean(),
  score: v.number(),
  joinedAt: v.number(),
});

export const roundValidator = v.object({
  _id: v.id("rounds"),
  roundNumber: v.number(),
  submitterPlayerId: v.id("players"),
  submitterName: v.string(),
  statements: v.union(v.array(v.string()), v.null()),
  lieIndex: v.union(v.number(), v.null()),
  phase: roundPhaseValidator,
  voteCountdownEndsAt: v.union(v.number(), v.null()),
  voteCounts: v.union(v.array(v.number()), v.null()),
  votes: v.union(
    v.array(
      v.object({
        playerId: v.id("players"),
        playerName: v.string(),
        votedIndex: v.number(),
        isCorrect: v.boolean(),
      }),
    ),
    v.null(),
  ),
});

export const gameStateValidator = v.object({
  gameId: v.id("games"),
  inviteCode: v.string(),
  status: gameStatusValidator,
  currentRoundIndex: v.number(),
  myPlayerId: v.union(v.id("players"), v.null()),
  players: v.array(playerValidator),
  currentRound: v.union(roundValidator, v.null()),
});
