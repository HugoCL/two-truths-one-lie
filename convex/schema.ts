import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const gameStatusValidator = v.union(
  v.literal("lobby"),
  v.literal("playing"),
  v.literal("finished"),
);

export const roundPhaseValidator = v.union(
  v.literal("submitting"),
  v.literal("awaiting_vote_start"),
  v.literal("voting"),
  v.literal("revealed"),
);

export default defineSchema({
  games: defineTable({
    inviteCode: v.string(),
    hostPlayerId: v.optional(v.id("players")),
    status: gameStatusValidator,
    currentRoundIndex: v.number(),
    createdAt: v.number(),
  }).index("by_invite_code", ["inviteCode"]),

  players: defineTable({
    gameId: v.id("games"),
    sessionId: v.string(),
    displayName: v.string(),
    isHost: v.boolean(),
    joinedAt: v.number(),
    score: v.number(),
  })
    .index("by_game", ["gameId"])
    .index("by_game_and_session", ["gameId", "sessionId"]),

  rounds: defineTable({
    gameId: v.id("games"),
    roundNumber: v.number(),
    submitterPlayerId: v.id("players"),
    statements: v.optional(v.array(v.string())),
    lieIndex: v.optional(v.number()),
    phase: roundPhaseValidator,
    voteCountdownEndsAt: v.optional(v.number()),
  })
    .index("by_game", ["gameId"])
    .index("by_game_and_round", ["gameId", "roundNumber"]),

  votes: defineTable({
    roundId: v.id("rounds"),
    playerId: v.id("players"),
    votedIndex: v.number(),
  })
    .index("by_round", ["roundId"])
    .index("by_round_and_player", ["roundId", "playerId"]),
});
