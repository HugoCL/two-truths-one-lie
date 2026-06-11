import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getPlayerBySession(
  ctx: QueryCtx | MutationCtx,
  gameId: Id<"games">,
  sessionId: string,
): Promise<Doc<"players"> | null> {
  return await ctx.db
    .query("players")
    .withIndex("by_game_and_session", (q) =>
      q.eq("gameId", gameId).eq("sessionId", sessionId),
    )
    .unique();
}

export async function requirePlayer(
  ctx: QueryCtx | MutationCtx,
  gameId: Id<"games">,
  sessionId: string,
): Promise<Doc<"players">> {
  const player = await getPlayerBySession(ctx, gameId, sessionId);
  if (!player) {
    throw new Error("You are not in this game");
  }
  return player;
}

export async function requireHost(
  ctx: MutationCtx,
  gameId: Id<"games">,
  sessionId: string,
): Promise<Doc<"players">> {
  const player = await requirePlayer(ctx, gameId, sessionId);
  if (!player.isHost) {
    throw new Error("Only the host can do that");
  }
  return player;
}
