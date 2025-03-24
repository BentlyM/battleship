import z from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const statsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        accuracy: z.number(),
        sunkShips: z.number(),
        shots: z.number(),
        time: z.string(),
        gameOutcome: z.union([z.literal("win"), z.literal("lose")]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { accuracy, sunkShips, shots, time, gameOutcome } = input;

      await ctx.db.userStatistics.upsert({
        where: { userId: 123 },
        create: {
          userId: 123,
          totalGames: 1,
          accuracy,
          shipsSunk: sunkShips,
          totalShots: shots,
          wins: gameOutcome === "win" ? 1 : 0,
          losses: gameOutcome === "lose" ? 1 : 0,
        },
        update: {
          totalGames: { increment: 1 },
          accuracy: { increment: accuracy },
          shipsSunk: { increment: sunkShips },
          totalShots: { increment: shots },
          wins: { increment: gameOutcome === "win" ? 1 : 0 },
          losses: { increment: gameOutcome === "lose" ? 1 : 0 },
        },
      });
    }),
});
