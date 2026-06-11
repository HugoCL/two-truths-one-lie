import { GameShell } from "@/components/game/game-shell";
import type { Id } from "../../../../convex/_generated/dataModel";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <GameShell gameId={gameId as Id<"games">} />
    </main>
  );
}
