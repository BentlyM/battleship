import React from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { RadioGroup } from "radix-ui";

const mockData = {
  current: {
    accuracy: "0%",
    shipsSunk: 0,
    shots: 0,
    time: "0s",
    result: "undetermined",
  },
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

const DetailsBox = () => {
  const [selectedView, setSelectedView] = React.useState("overall");

  return (
    <div className="flex w-[18vw] flex-col gap-2">
      <RadioGroup.Root
        value={selectedView}
        onValueChange={setSelectedView}
        className="flex gap-1 overflow-x-auto"
      >
        <RadioGroup.Item value="current" asChild>
          <Button variant={selectedView === "current" ? "default" : "outline"}>
            Current
          </Button>
        </RadioGroup.Item>
        <RadioGroup.Item value="overall" asChild>
          <Button
            variant={selectedView === "overall" ? "default" : "outline"}
          >
            Overall
          </Button>
        </RadioGroup.Item>
        <RadioGroup.Item value="previous" asChild>
          <Button
            variant={selectedView === "previous" ? "default" : "outline"}
          >
            Previous
          </Button>
        </RadioGroup.Item>
        <RadioGroup.Item value="leaderboard" asChild>
          <Button
            variant={selectedView === "leaderboard" ? "default" : "outline"}
          >
            Leaderboard
          </Button>
        </RadioGroup.Item>
      </RadioGroup.Root>

      <Card className="h-[50vh] w-full overflow-y-auto p-4 shadow">
        {selectedView === "current" && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Current Match</h3>
            <StatItem label="Accuracy" value={mockData.current.accuracy} />
            <StatItem label="Ships Sunk" value={mockData.current.shipsSunk} />
            <StatItem label="Shots Fired" value={mockData.current.shots} />
            <StatItem label="Time Elapsed" value={mockData.current.time} />
            <span
              className={
                mockData.current.result === "Win"
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {mockData.current.result}
            </span>
          </div>
        )}

        {selectedView === "overall" && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Career Stats</h3>
            <StatItem label="Accuracy" value={mockData.overall.accuracy} />
            <StatItem label="Total Games" value={mockData.overall.totalGames} />
            <StatItem label="Ships Sunk" value={mockData.overall.shipsSunk} />
            <StatItem label="Fastest Win" value={mockData.overall.fastestWin} />
            <StatItem
              label="Avg. Shots/Win"
              value={mockData.overall.avgShotsPerWin}
            />
          </div>
        )}

        {selectedView === "previous" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Last 3 Matches</h3>
            {mockData.previousMatches.map((match, i) => (
              <div key={i} className="rounded-lg bg-muted p-3">
                <div className="flex justify-between">
                  <span className="font-medium">{match.date}</span>
                  <span
                    className={
                      match.result === "Win" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {match.result}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <StatItem label="Shots" value={match.shots} small />
                  <StatItem label="Accuracy" value={match.accuracy} small />
                  <StatItem label="Ships Sunk" value={match.sunk} small />
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedView === "leaderboard" && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Top Commanders</h3>
            {mockData.leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between rounded-lg bg-muted p-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">#{entry.rank}</span>
                  <span>{entry.name}</span>
                </div>
                <div className="text-right">
                  <div>{entry.wins} Wins</div>
                  <div className="text-sm">{entry.accuracy} Accuracy</div>
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
    <div className={`text-muted-foreground ${small ? "text-xs" : "text-sm"}`}>
      {label}
    </div>
    <div className={`font-medium ${small ? "text-base" : "text-xl"}`}>
      {value}
    </div>
  </div>
);

export default DetailsBox;
