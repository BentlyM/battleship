"use server";

import { Message, prologueMessages } from "../_components/ChatBox";

// ... existing code ...

export const getPlayerResponseMessage = async ({
  messages,
  gameStarted,
  activeBoard,
}: {
  messages: Message[];
  gameStarted: boolean;
  activeBoard: "player" | "bot";
}) => {
  if (!gameStarted) {
    return "Waiting for next instruction...";
  }
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return "Waiting for your move...";
  return lastMessage.sender === "player"
    ? "Alright captain take a shot"
    : "What could they be planning...";
};

export const getBotResponseMessage = async ({
  messages,
  gameStarted,
  activeBoard,
}: {
  messages: Message[];
  gameStarted: boolean;
  activeBoard: "player" | "bot";
}) => {
  if (!gameStarted) {
    return "Waiting for next instruction...";
  }
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return "Waiting for game to start...";
  return lastMessage.sender === "bot" ? "I'll show you!" : "...";
};
