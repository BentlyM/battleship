// src/helpers/ChatHelpers.ts
import type { GameEventMessage } from "~/types/game";

export const prologueMessages: GameEventMessage[] = [
  {
    player: "Welcome Captain!",
    bot: "AI opponent ready",
    trigger: "prologue",
  },
  {
    player: "Place your ships by dragging them",
    bot: "I've already positioned my fleet",
    trigger: "prologue",
  },
  {
    player: "Attack by clicking enemy grid",
    bot: "I'll be watching your every move.",
    trigger: "prologue",
  },
];

export const gameEventMessages: GameEventMessage[] = [
  {
    player: "Ready for your command",
    bot: "Scanning for targets...",
    trigger: "turn",
  },
  {
    player: "Direct hit! Your turn",
    bot: "Damage sustained!",
    trigger: "hit",
  },
  {
    player: "Missed! Enemy's turn",
    bot: "Target acquisition...",
    trigger: "miss",
  },
];

export const getGameMessage = (
  trigger: GameEventMessage["trigger"],
  isPlayer: boolean,
) => {
  const defaultMessages = {
    player: "Awaiting orders",
    bot: "Processing strategy",
  };

  const message =
    gameEventMessages.find((m) => m.trigger === trigger) || defaultMessages;
  return isPlayer ? message.player : message.bot;
};
