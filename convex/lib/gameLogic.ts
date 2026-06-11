import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)];
  }
  return code;
}

export async function generateUniqueInviteCode(
  ctx: MutationCtx,
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const inviteCode = generateInviteCode();
    const existing = await ctx.db
      .query("games")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
      .unique();
    if (!existing) {
      return inviteCode;
    }
  }
  throw new Error("Failed to generate invite code");
}

export async function getPlayersInGame(
  ctx: QueryCtx | MutationCtx,
  gameId: Id<"games">,
): Promise<Array<Doc<"players">>> {
  const players = await ctx.db
    .query("players")
    .withIndex("by_game", (q) => q.eq("gameId", gameId))
    .collect();
  return players.sort((a, b) => a.joinedAt - b.joinedAt);
}

export async function getCurrentRound(
  ctx: QueryCtx | MutationCtx,
  gameId: Id<"games">,
  roundNumber: number,
): Promise<Doc<"rounds"> | null> {
  return await ctx.db
    .query("rounds")
    .withIndex("by_game_and_round", (q) =>
      q.eq("gameId", gameId).eq("roundNumber", roundNumber),
    )
    .unique();
}

export function getSubmitterForRound(
  players: Array<Doc<"players">>,
  roundNumber: number,
): Doc<"players"> {
  if (players.length === 0) {
    throw new Error("No players in game");
  }
  return players[roundNumber % players.length]!;
}

export async function createRound(
  ctx: MutationCtx,
  gameId: Id<"games">,
  roundNumber: number,
  submitterPlayerId: Id<"players">,
): Promise<Id<"rounds">> {
  return await ctx.db.insert("rounds", {
    gameId,
    roundNumber,
    submitterPlayerId,
    phase: "submitting",
  });
}

export function validateStatements(statements: Array<string>): Array<string> {
  if (statements.length !== 3) {
    throw new Error("You must provide exactly 3 statements");
  }
  const trimmed = statements.map((s) => s.trim());
  if (trimmed.some((s) => s.length === 0)) {
    throw new Error("Statements cannot be empty");
  }
  if (trimmed.some((s) => s.length > 200)) {
    throw new Error("Statements must be 200 characters or fewer");
  }
  return trimmed;
}

export function validateLieIndex(lieIndex: number): void {
  if (!Number.isInteger(lieIndex) || lieIndex < 0 || lieIndex > 2) {
    throw new Error("Lie index must be 0, 1, or 2");
  }
}
