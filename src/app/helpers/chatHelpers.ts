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

export const gameEventMessages: GameEventMessage[][] = [
  [
    {
      player: "Ready for your command",
      bot: "...",
      trigger: "turn",
      active: "player",
    },
    {
      player: "...",
      bot: "Scanning for targets",
      trigger: "turn",
      active: "bot",
    },
    {
      player: "Direct hit! Your turn, Captain",
      bot: "Damage sustained!",
      trigger: "hit",
      active: "player",
    },
    {
      player: "Missed! Enemy's turn",
      bot: "Target acquisition...",
      trigger: "miss",
      active: "player",
    },
    {
      player: "We're hit!",
      bot: "Direct hit! Scanning for targets",
      trigger: "hit",
      active: "bot",
    },
    {
      player: "They missed! Your turn",
      bot: "Missed! Your move, human",
      trigger: "miss",
      active: "bot",
    },
  ],
];

export const getGameMessage = (
  trigger: GameEventMessage["trigger"],
  isPlayer: boolean,
  messageSetIndex = 0,
) => {
  const defaultMessages = {
    player: "Awaiting orders",
    bot: "Processing strategy",
  };

  const messageSet = gameEventMessages[messageSetIndex];

  const message =
    messageSet?.find((m) => m.trigger === trigger) ?? defaultMessages;

  return isPlayer ? message.player : message.bot;
};
