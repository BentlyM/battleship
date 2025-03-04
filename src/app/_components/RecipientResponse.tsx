// src/components/RecipientResponse.tsx
import React from "react";
import { Card } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import type { GameEventMessage } from "~/types/game";
import { useTypewriter } from "./ChatBox";

interface ResponseType {
  currentEvent: GameEventMessage;
  activeBoard: "player" | "bot";
  gameStarted: boolean;
}

const PlayerResponse = ({
  message,
  isActive,
}: {
  message: string;
  isActive: boolean;
}) => (
  <Card
    className={`flex items-center gap-4 p-4 ${isActive ? "border-primary" : ""}`}
  >
    <Avatar>
      <AvatarImage src="/idle.jpg" className="w-12 rounded" />
      <AvatarFallback>P</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="text-sm">{message}</p>
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
    className={`flex items-center gap-4 p-4 ${isActive ? "border-primary" : ""}`}
  >
    <div className="flex-1">
      <p className="text-right text-sm">{message}</p>
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
}: ResponseType) => {
  const showPrologue = !gameStarted;

  return (
    <>
      <PlayerResponse
        message={useTypewriter(
          showPrologue ? currentEvent.player : currentEvent.player,
        )}
        isActive={activeBoard === "bot" && gameStarted}
      />
      <OpponentResponse
        message={useTypewriter(
          showPrologue ? currentEvent.bot : currentEvent.bot,
        )}
        isActive={activeBoard === "player" && gameStarted}
      />
    </>
  );
};

export default RecipientResponse;
