/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `hit` on the `Move` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Move` table. All the data in the column will be lost.
  - You are about to drop the column `averageDuration` on the `UserStatistics` table. All the data in the column will be lost.
  - You are about to drop the column `draws` on the `UserStatistics` table. All the data in the column will be lost.
  - You are about to drop the `_GameToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `currentTurn` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `averageAccuracy` to the `LeaderboardEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSunk` to the `LeaderboardEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalWins` to the `LeaderboardEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winRate` to the `LeaderboardEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `result` to the `Move` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `Move` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_GameToUser" DROP CONSTRAINT "_GameToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GameToUser" DROP CONSTRAINT "_GameToUser_B_fkey";

-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "createdAt",
ADD COLUMN     "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "currentTurn" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LeaderboardEntry" DROP COLUMN "createdAt",
DROP COLUMN "rank",
DROP COLUMN "score",
ADD COLUMN     "averageAccuracy" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalSunk" INTEGER NOT NULL,
ADD COLUMN     "totalWins" INTEGER NOT NULL,
ADD COLUMN     "winRate" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Move" DROP COLUMN "hit",
DROP COLUMN "position",
ADD COLUMN     "result" TEXT NOT NULL,
ADD COLUMN     "shipType" TEXT,
ADD COLUMN     "target" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserStatistics" DROP COLUMN "averageDuration",
DROP COLUMN "draws",
ADD COLUMN     "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shipsSunk" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalHits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalShots" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "_GameToUser";

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "ships" JSONB NOT NULL,
    "hits" TEXT[],
    "misses" TEXT[],

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
