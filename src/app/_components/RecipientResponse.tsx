import React from "react";
import { Card } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

interface ResponseProps {
  type: "player" | "bot";
  isActive: boolean;
  message: string;
}

type ResponseType = {
  playerMessage: string;
  botMessage: string;
  gameStarted: boolean;
  activeBoard: "player" | "bot";
};

const PlayerResponse = ({ type, isActive, message }: ResponseProps) => {
  return (
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
};

const OpponentResponse = ({ type, isActive, message }: ResponseProps) => {
  return (
    <Card
      className={`flex items-center gap-4 p-4 ${isActive ? "border-primary" : ""}`}
    >
      <div className="flex-1">
        <p className="text-right text-sm">{message}</p>
      </div>
      <Avatar>
        <AvatarImage
          src={type === "bot" ? "/bot.png" : "/opponent-avatar.png"}
          className="w-12 rounded"
        />
        <AvatarFallback>{type === "bot" ? "B" : "O"}</AvatarFallback>
      </Avatar>
    </Card>
  );
};

const RecipientResponse = ({
  playerMessage,
  botMessage,
  activeBoard,
  gameStarted,
}: ResponseType) => {
  return (
    <>
      <PlayerResponse
        type="player"
        isActive={activeBoard === "bot" && gameStarted}
        message={playerMessage}
      />
      <OpponentResponse
        type="bot"
        isActive={activeBoard === "player" && gameStarted}
        message={botMessage}
      />
    </>
  );
};

export default RecipientResponse;
