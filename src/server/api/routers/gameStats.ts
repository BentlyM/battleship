import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const gameStatsRouter = createTRPCRouter({
  // Get user's game stats
  getUserStats: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }
    
    try {
      // Get user's game stats or create if doesn't exist
      let gameStats = await prisma.gameStats.findUnique({
        where: { userId },
      });

      if (!gameStats) {
        gameStats = await prisma.gameStats.create({
          data: {
            userId,
            totalGames: 0,
            wins: 0,
            losses: 0,
            totalShots: 0,
            hits: 0,
            shipsSunk: 0,
          },
        });
      }

      // Get the last few matches
      const recentMatches = await prisma.gameMatch.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // Get leaderboard position
      const leaderboard = await prisma.leaderboard.findUnique({
        where: { userId },
      });

      return {
        stats: gameStats,
        recentMatches,
        leaderboardPosition: leaderboard?.rank ?? null,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch game stats',
        cause: error,
      });
    }
  }),

  // Save a completed game
  saveGame: publicProcedure
    .input(
      z.object({
        result: z.enum(['win', 'loss']),
        shots: z.number(),
        hits: z.number(),
        shipsSunk: z.number(),
        timeElapsed: z.number(), // in seconds
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      const userName = ctx.session?.user.name ?? '';

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }
      try {
        // Start a transaction to ensure all DB operations succeed or fail together
        return await prisma.$transaction(async (tx) => {
          // Calculate accuracy
          const accuracy = input.shots > 0 ? input.hits / input.shots : 0;
          
          // 1. Create the game match record
          const gameMatch = await tx.gameMatch.create({
            data: {
              userId,
              result: input.result,
              shots: input.shots,
              hits: input.hits,
              accuracy,
              shipsSunk: input.shipsSunk,
              timeElapsed: input.timeElapsed,
            },
          });

          // 2. Update the user's game stats
          let gameStats = await tx.gameStats.findUnique({
            where: { userId },
          });

          if (gameStats) {
            // Update existing stats
            gameStats = await tx.gameStats.update({
              where: { userId },
              data: {
                totalGames: gameStats.totalGames + 1,
                wins: input.result === 'win' ? gameStats.wins + 1 : gameStats.wins,
                losses: input.result === 'loss' ? gameStats.losses + 1 : gameStats.losses,
                totalShots: gameStats.totalShots + input.shots,
                hits: gameStats.hits + input.hits,
                shipsSunk: gameStats.shipsSunk + input.shipsSunk,
                fastestWinTime: 
                  input.result === 'win' && 
                  (gameStats.fastestWinTime === null || input.timeElapsed < gameStats.fastestWinTime)
                    ? input.timeElapsed
                    : gameStats.fastestWinTime,
              },
            });
          } else {
            // Create new stats if they don't exist
            gameStats = await tx.gameStats.create({
              data: {
                userId,
                totalGames: 1,
                wins: input.result === 'win' ? 1 : 0,
                losses: input.result === 'loss' ? 1 : 0,
                totalShots: input.shots,
                hits: input.hits,
                shipsSunk: input.shipsSunk,
                fastestWinTime: input.result === 'win' ? input.timeElapsed : null,
              },
            });
          }

          // 3. Update leaderboard
          const existingLeaderboardEntry = await tx.leaderboard.findUnique({
            where: { userId },
          });

          if (existingLeaderboardEntry) {
            await tx.leaderboard.update({
              where: { userId },
              data: {
                wins: gameStats.wins,
                accuracy: gameStats.totalShots > 0 
                  ? gameStats.hits / gameStats.totalShots 
                  : 0,
              },
            });
          } else {
            await tx.leaderboard.create({
              data: {
                userId,
                userName,
                wins: gameStats.wins,
                accuracy: gameStats.totalShots > 0 
                  ? gameStats.hits / gameStats.totalShots 
                  : 0,
              },
            });
          }

          // 4. Recalculate ranks in leaderboard
          const allEntries = await tx.leaderboard.findMany({
            orderBy: [
              { wins: 'desc' },
              { accuracy: 'desc' },
            ],
          });

          // Update ranks for all entries
          for (let i = 0; i < allEntries.length; i++) {
            await tx.leaderboard.update({
              where: { userId: allEntries[i]!.userId },
              data: { rank: i + 1 },
            });
          }

          return {
            success: true,
            gameMatch,
            gameStats,
          };
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save game stats',
          cause: error,
        });
      }
    }),

  // Get leaderboard
  getLeaderboard: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ input }) => {
      try {
        const leaderboard = await prisma.leaderboard.findMany({
          orderBy: [
            { wins: 'desc' },
            { accuracy: 'desc' },
          ],
          take: input.limit,
        });

        return leaderboard;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch leaderboard',
          cause: error,
        });
      }
    }),
});