'use client';
import { Bot, Send, User, Users } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { motion } from "framer-motion";
import RecipientResponse from "./RecipientResponse";
import {
  getBotResponseMessage,
  getPlayerResponseMessage,
} from "../helpers/ChatHelpers";
export interface Message {
  id: number;
  text: string;
  sender: "player" | "bot";
  timestamp: Date;
}

interface ChatBoxProps {
  gameStarted: boolean;
  activeBoard: "player" | "bot";
  setActiveBoard: Dispatch<SetStateAction<"player" | "bot">>;
}

const useTypewriter = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayText("");

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1)); // Fix: Use slice instead of charAt
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return displayText;
};

const MessageBubble = memo(({ message }: { message: Message }) => {
  const text = useTypewriter(message.text);
  const isPlayer = message.sender === "player";

  return (
    <div
      className={`flex items-start space-x-2 ${isPlayer ? "flex-row-reverse space-x-reverse" : ""}`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${!isPlayer ? "bg-muted" : ""}`}
      >
        {isPlayer ? (
          <User imageRendering={"test"} className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <motion.div
        className={`rounded-lg px-3 py-2 ${
          isPlayer ? "bg-muted" : "bg-muted text-foreground"
        }`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0, 0.71, 0.2, 1.01],
          scale: {
            type: "spring",
            damping: 5,
            stiffness: 100,
            restDelta: 0.001,
          },
        }}
      >
        {text}
      </motion.div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export const prologueMessages = [
  {
    text: "Welcome to Battleship! Are you ready to sink some ships?",
    sender: "player",
  },
  {
    text: "Plan our formation by selecting the axis and dragging and dropping ships on the map.",
    sender: "player",
  },
  { text: "Let's start placing ships...", sender: "bot" },
  {
    text: "Remember, you can rotate ships by clicking on them.",
    sender: "bot",
  },
  {
    text: "Once all ships are placed, we'll begin the battle!",
    sender: "player",
  },
];

const ChatBox = ({
  gameStarted,
  activeBoard,
  setActiveBoard,
}: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isBotMode, setIsBotMode] = useState(true);
  const [difficulty, setDifficulty] = useState("easy");
  const [firstMove, setFirstMove] = useState<"player" | "bot" | "random">(
    "random",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [playerMessage, setPlayerMessage] = useState(
    "Waiting for your move...",
  );
  const [botMessage, setBotMessage] = useState("Waiting for game to start...");

  useEffect(() => {
    if (isBotMode) {
      if (!gameStarted) {
        const initialMessages = prologueMessages
          .slice(0, 3)
          .map((msg, index) => ({
            id: index + 1,
            sender: msg.sender as "player" | "bot",
            text: msg.text,
            timestamp: new Date(),
          }));
        setMessages(initialMessages);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [isBotMode, gameStarted]);

  useEffect(() => {
    const updateMessages = async () => {
      const newPlayerMessage = await getPlayerResponseMessage({
        messages,
        gameStarted,
        activeBoard,
      });
      const newBotMessage = await getBotResponseMessage({
        messages,
        gameStarted,
        activeBoard,
      });
      setPlayerMessage(newPlayerMessage);
      setBotMessage(newBotMessage);
    };

    updateMessages();
  }, [messages, gameStarted, activeBoard]);

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      const newMessage: Message = {
        id: Date.now(),
        text: inputValue,
        sender: "player",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputValue("");
    },
    [inputValue],
  );

  const handleFirstMoveChange = useCallback(
    (value: "player" | "bot" | "random") => {
      setFirstMove(value);
      if (value === "random") {
        setActiveBoard(Math.random() > 0.5 ? "player" : "bot");
      } else {
        setActiveBoard(value);
      }
    },
    [setActiveBoard],
  );

  return (
    <div className="flex w-[18vw] flex-col gap-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={isBotMode ? "outline" : "default"}
            onClick={() => !gameStarted && setIsBotMode(false)}
            disabled={gameStarted}
            className="w-full"
          >
            <Users className="mr-2 h-4 w-4" />
            vs Player
          </Button>
          <Button
            variant={isBotMode ? "default" : "outline"}
            onClick={() => !gameStarted && setIsBotMode(true)}
            disabled={gameStarted}
            className="w-full"
          >
            <Bot className="mr-2 h-4 w-4" />
            vs Bot
          </Button>
        </div>

        <div className="space-y-2">
          <Select
            value={firstMove}
            onValueChange={handleFirstMoveChange}
            disabled={gameStarted}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="First Move" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="bot">
                {isBotMode ? "Player First" : "Player 1"}
              </SelectItem>
              <SelectItem value="player">
                {isBotMode ? "Bot First" : "Player 2"}
              </SelectItem>
            </SelectContent>
          </Select>

          {isBotMode && (
            <Select
              value={difficulty}
              onValueChange={setDifficulty}
              disabled={gameStarted}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy (brute force)</SelectItem>
                <SelectItem value="medium">
                  Medium (simply knows where some are)
                </SelectItem>
                <SelectItem value="hard">
                  Hard (actually intelligent)
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      {!isBotMode && (
        <Card className="h-[50vh] w-full shadow">
          <CardContent className="h-[40vh] overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                value={inputValue}
                onChange={(e) => {
                  console.log("something is changing");
                  setInputValue(e.target.value);
                }}
                placeholder="Type message..."
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {isBotMode && (
        <RecipientResponse
          playerMessage={playerMessage}
          botMessage={botMessage}
          gameStarted={gameStarted}
          activeBoard={activeBoard}
        />
      )}
    </div>
  );
};

export default memo(ChatBox);
