import { Bot, Send, User, Users } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
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

interface Message {
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
        setDisplayText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return displayText;
};

const ChatBox = ({
  gameStarted,
  activeBoard,
  setActiveBoard,
}: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isBotMode, setIsBotMode] = useState(true);
  const [difficulty, setDifficulty] = useState("medium");
  const [firstMove, setFirstMove] = useState<"player" | "bot" | "random">(
    "random",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    setMessages([]);
  }, [isBotMode]);

  const handleSendMessage = (e: React.FormEvent) => {
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
  };

  const handleFirstMoveChange = (value: "player" | "bot" | "random") => {
    setFirstMove(value);
    if (value === "random") {
      setActiveBoard(Math.random() > 0.5 ? "player" : "bot");
    } else {
      setActiveBoard(value);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const text = useTypewriter(message.text);
    const isPlayer = message.sender === "player";

    return (
      <div
        className={`flex items-start space-x-2 ${isPlayer ? "flex-row-reverse space-x-reverse" : ""}`}
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${isPlayer ? "bg-primary" : "bg-muted"}`}
        >
          {isPlayer ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div
          className={`rounded-lg px-3 py-2 ${
            isPlayer
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {text}
        </div>
      </div>
    );
  };

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
                <SelectItem value="medium">Medium (simply knows where some are)</SelectItem>
                <SelectItem value="hard">Hard (actually intelligent)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Card className="h-[50vh] w-full shadow">
        <CardContent className="h-[40vh] overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {!isBotMode && (
          <CardFooter>
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type message..."
                disabled={gameStarted}
              />
              <Button type="submit" size="icon" disabled={gameStarted}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ChatBox;
