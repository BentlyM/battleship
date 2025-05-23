// src/components/RecipientResponse.tsx
import React, { useEffect } from "react";
import { Card } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import type { GameEventMessage, ShipType } from "~/types/game";
import { useTypewriter } from "./ChatBox";

interface ResponseType {
  currentEvent: GameEventMessage;
  activeBoard: "player" | "bot";
  gameStarted: boolean;
  sunkShips: Record<ShipType, boolean>;
}

const PlayerResponse = ({
  message,
  isActive,
}: {
  message: string;
  isActive: boolean;
}) => (
  <Card
    className={`flex items-center gap-4 p-4 ${isActive ? "border-primary dark:border-[3px]" : ""} dark:border-gray-600 dark:bg-[#080808] dark:text-white`}
  >
    <Avatar>
      <AvatarImage src="/idle.jpg" className="w-12 rounded" />
      <AvatarFallback>P</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="min-w-[200px] max-w-[200px] text-sm">{message}</p>
    </div>
  </Card>
);

const OpponentResponse = ({
  message,
  isActive,
}: {
  message: string;
  isActive: boolean;
}) => (
  <Card
    className={`flex items-center gap-4 p-4 ${isActive ? "border-[3px] border-primary dark:border-white" : ""} dark:border-gray-600 dark:bg-[#080808] dark:text-white`}
  >
    <div className="flex-1">
      <p className="min-w-[200px] max-w-[200px] text-right text-sm">{message}</p>
    </div>
    <Avatar>
      <AvatarImage src="/bot.png" className="w-12 rounded" />
      <AvatarFallback>B</AvatarFallback>
    </Avatar>
  </Card>
);

const RecipientResponse = ({
  currentEvent,
  activeBoard,
  gameStarted,
  sunkShips,
}: ResponseType) => {
  const showPrologue = !gameStarted;

  useEffect(() => {
    const shipNames: Record<ShipType, string> = {
      carrier: "Carrier",
      battleship: "Battleship",
      cruiser: "Cruiser",
      submarine: "Submarine",
      destroyer: "Destroyer",
    };

    Object.entries(sunkShips).forEach(([shipType, isSunk]) => {
      if (isSunk) {
        console.log(`${shipNames[shipType as ShipType]} has been sunk!`);
      }
    });
  }, [sunkShips]);

  return (
    <div className="flex flex-col gap-4">
      <PlayerResponse
        message={useTypewriter(
          showPrologue ? currentEvent.player : currentEvent.player,
          50,
        )}
        isActive={activeBoard === "bot" && gameStarted}
      />
      <OpponentResponse
        message={useTypewriter(
          showPrologue ? currentEvent.bot : currentEvent.bot,
          50,
        )}
        isActive={activeBoard === "player" && gameStarted}
      />
    </div>
  );
};

export default RecipientResponse;
