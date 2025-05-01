import React, { useEffect, type Dispatch, type SetStateAction } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { RadioGroup } from "radix-ui";
import type { Stats } from "~/types/game";
import { Session } from "~/server/auth";
import { api } from "~/trpc/react";
import { GameMatch, GameStats } from "@prisma/client";
import { toast } from "~/hooks/use-toast";

const mockData = {
  overall: {
    accuracy: "78%",
    totalGames: 45,
    shipsSunk: 112,
    fastestWin: "3m 24s",
    avgShotsPerWin: 28.4,
  },
  previousMatches: [
    { date: "2024-02-15", result: "Win", shots: 24, accuracy: "82%", sunk: 4 },
    { date: "2024-02-14", result: "Loss", shots: 18, accuracy: "65%", sunk: 2 },
    { date: "2024-02-13", result: "Win", shots: 30, accuracy: "79%", sunk: 5 },
  ],
  leaderboard: [
    { rank: 1, name: "Admiral_Alex", wins: 89, accuracy: "92%" },
    { rank: 2, name: "Captain_Sara", wins: 85, accuracy: "89%" },
    { rank: 3, name: "Commander_Jay", wins: 82, accuracy: "88%" },
  ],
};

interface StatsProps {
  gameStarted: boolean;
  isGameOver: boolean;
  currentStats: Stats;
  setCurrentStats: Dispatch<SetStateAction<Stats>>;
  session: Session | null;
}

const DetailsBox = ({ props }: { props: StatsProps }) => {
  const { gameStarted, isGameOver, currentStats, setCurrentStats, session } =
    props;

  const [selectedView, setSelectedView] = React.useState<
    "current" | "overall" | "previous" | "leaderboard"
  >("overall");

  const [startTime, setStartTime] = React.useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState<string>("0s");

  const [userStats, setUserStats] = React.useState<GameStats | null>(null);
  const [recentMatches, setRecentMatches] = React.useState<GameMatch[] | null>(
    null,
  );

  const { data: gameStats } = api.gameStats.getUserStats.useQuery(undefined, {
    enabled: !!session?.user.id,
  });

  const saveGameStats = api.gameStats.saveGame.useMutation({
    onSuccess: () => {
      toast({
        title: "Game saved",
        description: "Your game stats have been updated!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving game",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (gameStats) {
      setUserStats(gameStats.stats);
      setRecentMatches(gameStats.recentMatches);
    }
  }, [gameStats]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameStarted) {
      if (selectedView !== "current") setSelectedView("current");
      const start = performance.now();
      setStartTime(start);

      interval = setInterval(() => {
        const now = performance.now();
        const elapsedSeconds = (now - start) / 1000;

        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = (elapsedSeconds % 60).toFixed(0);
        setElapsedTime(`${minutes}m ${seconds}s`);
      }, 100);
    }

    if (isGameOver && interval && startTime !== null) {
      clearInterval(interval);
      setCurrentStats((prev) => ({
        ...prev,
        time: elapsedTime,
      }));
    }  

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameStarted, isGameOver, startTime]);

  return (
    <div className="flex flex-col items-center">
      <RadioGroup.Root
        value={selectedView}
        onValueChange={(value) =>
          setSelectedView(
            value as "current" | "overall" | "previous" | "leaderboard",
          )
        }
        className="flex gap-1 overflow-x-auto dark:text-white"
      >
        <RadioGroup.Item value="current" asChild>
          <Button
            variant={selectedView === "current" ? "default" : "outline"}
            className="dark:border-gray-600 dark:bg-[#080808]"
            onClick={() => setSelectedView("current")}
          >
            Current
          </Button>
        </RadioGroup.Item>
        <RadioGroup.Item value="overall" asChild>
          <Button
            variant={selectedView === "overall" ? "default" : "outline"}
            className="dark:border-gray-600 dark:bg-[#080808]"
            onClick={() => setSelectedView("overall")}
          >
            Overall
          </Button>
        </RadioGroup.Item>
        <RadioGroup.Item value="previous" asChild>
          <Button
            variant={selectedView === "previous" ? "default" : "outline"}
            className="dark:border-gray-600 dark:bg-[#080808]"
            onClick={() => setSelectedView("previous")}
          >
            Previous
          </Button>
        </RadioGroup.Item>
        <RadioGroup.Item value="leaderboard" asChild>
          <Button
            variant={selectedView === "leaderboard" ? "default" : "outline"}
            className="dark:border-gray-600 dark:bg-[#080808]"
            onClick={() => setSelectedView("leaderboard")}
          >
            Leaderboard
          </Button>
        </RadioGroup.Item>
      </RadioGroup.Root>

      <Card className="w-full overflow-y-auto border-none p-1 shadow dark:bg-[#080808]">
        {selectedView === "current" && (
          <div className="flex flex-row justify-between space-y-3 lg:flex-col">
            <h3 className="hidden text-lg font-bold lg:block dark:text-white">
              Current Match
            </h3>
            <StatItem label="Accuracy" value={currentStats.accuracy} />
            <StatItem label="Sunk" value={currentStats.sunkShips} />
            <StatItem label="Fired" value={currentStats.shots} />
            <StatItem label="Time" value={elapsedTime} />
            <span
              className={
                currentStats.gameOutcome === "win"
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {currentStats.gameOutcome}
            </span>
          </div>
        )}

        {selectedView === "overall" && (
          <div className="flex flex-row justify-between space-y-3 lg:flex-col">
            <h3 className="hidden text-lg font-bold lg:block dark:text-white">
              Career Stats
            </h3>
            {session ? (
              <>
                <StatItem
                  label="Accuracy"
                  value={
                    userStats
                      ? `${Math.round((userStats.hits / Math.max(userStats.totalShots, 1)) * 100)}%`
                      : "-"
                  }
                />
                <StatItem
                  label="Games"
                  value={userStats ? userStats.totalGames : "-"}
                />
                <StatItem
                  label="Wins"
                  value={userStats ? userStats.wins : "-"}
                />
                <StatItem
                  label="Ships"
                  value={userStats ? userStats.shipsSunk : "-"}
                />
                <StatItem
                  label="Fastest Win"
                  value={
                    userStats && userStats.fastestWinTime
                      ? `${Math.floor(userStats.fastestWinTime / 60)}m ${userStats.fastestWinTime % 60}s`
                      : "-"
                  }
                />
              </>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Login to track your stats
              </div>
            )}
          </div>
        )}

        {selectedView === "previous" && (
          <div className="flex flex-row justify-between space-y-3 overflow-scroll lg:flex-col">
            <h3 className="hidden text-lg font-bold lg:block dark:text-white">
              Previous Matches
            </h3>
            {session ? (
              recentMatches && recentMatches.length > 0 ? (
                recentMatches.map((match, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-muted p-3 dark:border dark:border-gray-600 dark:bg-[#080808]"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium dark:text-white">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={
                          match.result === "win"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {match.result === "win" ? "Win" : "Loss"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <StatItem label="Shots" value={match.shots} small />
                      <StatItem
                        label="Accuracy"
                        value={`${match.accuracy}%`}
                        small
                      />
                      <StatItem
                        label="Ships Sunk"
                        value={match.shipsSunk}
                        small
                      />
                      <StatItem
                        label="Time"
                        value={`${Math.floor(match.timeElapsed / 60)}m ${match.timeElapsed % 60}s`}
                        small
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No previous matches
                </div>
              )
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Login to view match history
              </div>
            )}
          </div>
        )}

        {selectedView === "leaderboard" && (
          <div className="flex flex-row justify-between space-y-3 overflow-x-scroll lg:flex-col">
            <h3 className="hidden text-lg font-bold lg:block dark:text-white">
              Top Commanders
            </h3>
            {mockData.leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between rounded-lg bg-muted p-2 dark:border dark:border-gray-600 dark:bg-[#080808]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium dark:text-white">
                    #{entry.rank}
                  </span>
                  <span className="dark:text-white">{entry.name}</span>
                </div>
                <div className="text-right">
                  <div className="dark:text-white">{entry.wins} Wins</div>
                  <div className="text-sm dark:text-white">
                    {entry.accuracy} Accuracy
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const StatItem = ({
  label,
  value,
  small,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) => (
  <div className={`${small ? "space-y-0" : "space-y-1"}`}>
    <div
      className={`dark:text-muted-foreground ${small ? "text-xs" : "text-sm"}`}
    >
      {label}
    </div>
    <div
      className={`flex items-center justify-center font-medium lg:justify-start dark:text-white ${small ? "text-base" : "text-xl"}`}
    >
      {value}
    </div>
  </div>
);

export default DetailsBox;
