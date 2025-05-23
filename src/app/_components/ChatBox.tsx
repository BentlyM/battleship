"use client";
import {
  Bot,
  Send,
  User,
  Users,
  Menu,
  X,
  UserPlus,
  LogIn,
  LogOut,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect, memo, useCallback } from "react";
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
import { type ShipType } from "~/types/game";
import { Drawer } from "./ui/drawer";
import { toast } from "~/hooks/use-toast";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { type Session } from "~/server/auth";

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
  currentEvent: {
    player: string;
    bot: string;
    trigger: "hit" | "miss" | "turn" | "prologue";
  };
  sunkShips: Record<ShipType, boolean>;
  setFirstMove?: Dispatch<SetStateAction<"player" | "bot" | "random">>;
  session: Session | null;
}

export const useTypewriter = (text: string, speed = 50, disabled = false) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (disabled) return;
    let i = 0;
    setDisplayText("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, disabled]);

  return displayText;
};

const MessageBubble = memo(
  ({ message }: { message: { text: string; sender: "player" | "bot" } }) => {
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
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <motion.div
          className={`rounded-lg px-3 py-2 ${isPlayer ? "bg-muted" : "bg-muted text-foreground"}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0, 0.71, 0.2, 1.01] }}
        >
          {text}
        </motion.div>
      </div>
    );
  },
);

MessageBubble.displayName = "MessageBubble";

const GameControls = memo(
  ({
    gameStarted,
    isBotMode,
    setIsBotMode,
    isAuthMode,
    setIsAuthMode,
    firstMove,
    handleFirstMoveChange,
    difficulty,
    setDifficulty,
    isCompact = false,
    session,
  }: {
    gameStarted: boolean;
    isBotMode: boolean;
    setIsBotMode: (value: boolean) => void;
    isAuthMode: boolean;
    setIsAuthMode: (value: boolean) => void;
    firstMove: "player" | "bot" | "random";
    handleFirstMoveChange: (value: "player" | "bot" | "random") => void;
    difficulty: string;
    setDifficulty: (value: string) => void;
    isCompact?: boolean;
    session: Session | null;
  }) => {
    const router = useRouter();

    const handleLogout = async () => {
      try {
        await authClient.signOut();
        toast({
          title: "Logged out",
          description: "You have been logged out successfully",
        });
        router.refresh();
      } catch (error) {
        console.error("Logout error:", error);
        toast({
          title: "Logout failed",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      }
    };

    return (
      <div className={`space-y-${isCompact ? "3" : "4"}`}>
        <div className="flex flex-row gap-2">
          <Button
            variant={isBotMode && !isAuthMode ? "outline" : "default"}
            onClick={() => {
              if (!gameStarted) {
                setIsBotMode(true);
                setIsAuthMode(false);
              }
            }}
            disabled={gameStarted}
            className={`w-full ${isCompact ? "h-8 text-xs" : ""}`}
          >
            <Bot className={`mr-2 ${isCompact ? "h-3 w-3" : "h-4 w-4"}`} />
            vs Bot
          </Button>
          <Button
            variant={!isBotMode && !isAuthMode ? "outline" : "default"}
            onClick={() => {
              if (!gameStarted) {
                setIsBotMode(false);
                setIsAuthMode(false);
              }
            }}
            disabled={true}
            className={`w-full border dark:border-gray-600 dark:bg-[#080808] dark:text-white ${isCompact ? "h-8 text-xs" : ""}`}
            aria-label="coming soon"
          >
            <Users
              className={`mr-2 ${isCompact ? "h-3 w-3" : "h-4 w-4"} dark:text-white`}
            />
            vs Player
          </Button>
        </div>

        {session ? (
          // Show logout button when user is logged in
          <Button
            variant="default"
            onClick={handleLogout}
            className={`w-full ${isCompact ? "h-8 text-xs" : ""}`}
            disabled={gameStarted}
          >
            <LogOut className={`mr-2 ${isCompact ? "h-3 w-3" : "h-4 w-4"}`} />
            Logout ({session.user.email})
          </Button>
        ) : (
          // Show login button when no user is logged in
          <Button
            variant={isAuthMode ? "outline" : "default"}
            onClick={() => {
              if (!gameStarted) {
                setIsAuthMode(true);
                setIsBotMode(false);
              }
            }}
            disabled={gameStarted}
            className={`w-full ${isCompact ? "h-8 text-xs" : ""}`}
          >
            <LogIn className={`mr-2 ${isCompact ? "h-3 w-3" : "h-4 w-4"}`} />
            Login
          </Button>
        )}

        {!isAuthMode && (
          <div className="flex flex-col space-y-2">
            <Select
              value={firstMove}
              onValueChange={handleFirstMoveChange}
              disabled={gameStarted}
            >
              <SelectTrigger
                className={`w-full dark:border-gray-600 dark:bg-[#080808] dark:text-white ${isCompact ? "h-8 text-xs" : ""}`}
              >
                <SelectValue placeholder="First Move" />
              </SelectTrigger>
              <SelectContent className="dark:border-gray-600 dark:bg-[#080808] dark:text-white">
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
                <SelectTrigger
                  className={`w-full dark:border-gray-600 dark:bg-[#080808] dark:text-white ${isCompact ? "h-8 text-xs" : ""}`}
                >
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="dark:border-gray-600 dark:bg-[#080808] dark:text-white">
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
        )}
      </div>
    );
  },
);

GameControls.displayName = "GameControls";

// Auth component that will be displayed in the chat area
const AuthForm = memo(() => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await authClient.signIn.email(
          {
            email,
            password,
            rememberMe: true,
          },
          {
            onSuccess: () => {
              toast({
                title: "Logged in",
                description: "You have been logged in successfully",
              });
              router.refresh();
            },
            onError: (error) => {
              if (error instanceof Error) {
                setError(error.message || "Login failed");
              } else {
                setError("Login failed");
              }
            },
            onRequest: () => {
              setIsLoading(true);
            },
          },
        );
      } else {
        await authClient.signUp.email(
          {
            email,
            password,
            name: "test",
          },
          {
            onSuccess: () => {
              toast({
                title: "Signed up",
                description: "You have been signed up successfully",
              });
              router.refresh();
            },
            onError: (error) => {
              if (error instanceof Error) {
                setError(error.message || "Signup failed");
              } else {
                setError("Signup failed");
              }
            },
            onRequest: () => {
              setIsLoading(true);
            },
          },
        );
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full min-w-[298px] max-w-[298px] border-none shadow">
      <CardContent className="p-4 dark:bg-[#080808] dark:text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold">
            {isLogin ? "Login" : "Register"}
          </h2>
          <p className="text-sm text-gray-500">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="dark:border-gray-600 dark:bg-[#080808] dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="dark:border-gray-600 dark:bg-[#080808] dark:text-white"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              "Processing..."
            ) : isLogin ? (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              disabled={isLoading}
              className="text-sm dark:text-white"
            >
              {isLogin
                ? "Need an account? Register"
                : "Already have an account? Login"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

AuthForm.displayName = "AuthForm";

// Mobile version of the auth form specifically designed for the drawer
const MobileAuthForm = memo(() => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await authClient.signIn.email(
          {
            email,
            password,
            rememberMe: true,
          },
          {
            onSuccess: () => {
              toast({
                title: "Logged in",
                description: "You have been logged in successfully",
              });
              router.refresh();
            },
            onError: (error) => {
              if (error instanceof Error) {
                setError(error.message || "Login failed");
              } else {
                setError("Login failed");
              }
            },
            onRequest: () => {
              setIsLoading(true);
            },
          },
        );
      } else {
        await authClient.signUp.email(
          {
            email,
            password,
            name: email.split("@")[0] ?? "johnDoe",
          },
          {
            onSuccess: () => {
              toast({
                title: "Signed up",
                description: "You have been signed up successfully",
              });
              router.refresh();
            },
            onError: (error) => {
              if (error instanceof Error) {
                setError(error.message || "Signup failed");
              } else {
                setError("Signup failed");
              }
            },
          },
        );
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="mb-2 text-center">
        <h2 className="text-lg font-semibold dark:text-white">
          {isLogin ? "Login" : "Register"}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label
            htmlFor="mobile-email"
            className="text-xs font-medium dark:text-white"
          >
            Email
          </label>
          <Input
            id="mobile-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="text-xs dark:border-gray-600 dark:bg-[#080808] dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="mobile-password"
            className="text-xs font-medium dark:text-white"
          >
            Password
          </label>
          <Input
            id="mobile-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="text-xs dark:border-gray-600 dark:bg-[#080808] dark:text-white"
          />
        </div>

        <Button type="submit" className="w-full text-xs" disabled={isLoading}>
          {isLoading ? (
            "Processing..."
          ) : isLogin ? (
            <>
              <LogIn className="mr-2 h-3 w-3" />
              Login
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-3 w-3" />
              Register
            </>
          )}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading}
            className="h-6 text-xs dark:text-white"
          >
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Login"}
          </Button>
        </div>
      </form>
    </div>
  );
});

MobileAuthForm.displayName = "MobileAuthForm";

const ChatBox = ({
  gameStarted,
  activeBoard,
  setActiveBoard,
  currentEvent,
  sunkShips,
  setFirstMove,
  session,
}: ChatBoxProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isBotMode, setIsBotMode] = useState(true);
  const [isAuthMode, setIsAuthMode] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [firstMove, setInternalFirstMove] = useState<
    "player" | "bot" | "random"
  >("random");
  const [vsPlayerMessages, setVsPlayerMessages] = useState<
    { text: string; sender: "player" | "bot" }[]
  >([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  // Close drawer when game starts and switch to the appropriate mode
  useEffect(() => {
    if (gameStarted) {
      setDrawerOpen(false);
      // Ensure we exit auth mode when game starts
      setIsAuthMode(false);

      // If we're on the login page/auth mode when the game starts,
      // we need to ensure we switch to the current game mode
      if (isAuthMode) {
        // Default to bot mode when coming from auth mode
        setIsBotMode(true);
      }
      // Otherwise, keep the current mode (bot or player) that the user selected
    }
  }, [gameStarted, isAuthMode]);

  // Listen for the custom gameStarted event
  useEffect(() => {
    const handleGameStartEvent = (e: CustomEvent) => {
      if (e.detail) {
        // Game was started, ensure we're in the correct mode
        if (isAuthMode) {
          setIsAuthMode(false);
          // Default to bot mode when coming from auth mode
          setIsBotMode(true);
        }
        // Otherwise keep the current bot/player mode as that's what the user selected
      }
    };

    // Add event listener for custom gameStarted event
    window.addEventListener(
      "gameStarted",
      handleGameStartEvent as EventListener,
    );

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener(
        "gameStarted",
        handleGameStartEvent as EventListener,
      );
    };
  }, [isAuthMode]);

  // Automatically switch to Bot mode and disable Auth mode when user logs in
  useEffect(() => {
    if (session) {
      setIsAuthMode(false);
      setIsBotMode(true);
    }
  }, [session]);

  const handleFirstMoveChange = useCallback(
    (value: "player" | "bot" | "random") => {
      setInternalFirstMove(value);
      // Update parent component's firstMove state if provided
      if (setFirstMove) {
        setFirstMove(value);
      }

      if (value === "random") {
        setActiveBoard(Math.random() > 0.5 ? "player" : "bot");
      } else {
        setActiveBoard(value);
      }
    },
    [setActiveBoard, setFirstMove],
  );

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      setVsPlayerMessages((prev) => [
        ...prev,
        { text: inputValue, sender: "player" },
      ]);
      setInputValue("");
    },
    [inputValue],
  );

  return (
    <div className="flex w-full flex-col items-center gap-4 md:flex-row lg:flex-col">
      {/* Drawer toggle button - only visible on small screens when game hasn't started */}
      {!gameStarted && (
        <button
          onClick={toggleDrawer}
          className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white p-2 shadow-lg transition-colors md:hidden dark:bg-[#080808] dark:hover:bg-[#080808]"
          aria-label="Toggle game settings"
        >
          {drawerOpen ? (
            <X className="h-6 w-6 text-white dark:text-white" />
          ) : (
            <Menu className="h-6 w-6 text-white dark:text-white" />
          )}
        </button>
      )}

      {/* Mobile drawer - only visible on small screens */}
      <Drawer
        isVisible={drawerOpen && !gameStarted}
        onToggle={toggleDrawer}
        title="Game Settings"
      >
        <GameControls
          gameStarted={gameStarted}
          isBotMode={isBotMode}
          setIsBotMode={setIsBotMode}
          isAuthMode={isAuthMode}
          setIsAuthMode={setIsAuthMode}
          firstMove={firstMove}
          handleFirstMoveChange={handleFirstMoveChange}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          isCompact={true}
          session={session}
        />
        {/* Show auth form directly in drawer on mobile */}
        {isAuthMode && !session && <MobileAuthForm />}
      </Drawer>

      {/* Desktop controls - hidden on mobile, visible on medium and up */}
      <div className="hidden w-full space-y-4 md:block">
        <GameControls
          gameStarted={gameStarted}
          isBotMode={isBotMode}
          setIsBotMode={setIsBotMode}
          isAuthMode={isAuthMode}
          setIsAuthMode={setIsAuthMode}
          firstMove={firstMove}
          handleFirstMoveChange={handleFirstMoveChange}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          session={session}
        />
      </div>

      {/* Auth Form - only shown on desktop, mobile uses the drawer */}
      {isAuthMode && !session && (
        <div className="hidden md:block">
          <AuthForm />
        </div>
      )}

      {/* Player Chat */}
      {!isBotMode && !isAuthMode && (
        <Card className="h-[50vh] w-full shadow">
          <CardContent className="h-[40vh] overflow-y-auto p-4">
            <div className="space-y-4">
              {vsPlayerMessages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type message..."
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Bot Mode - displayed when not in auth mode and bot mode is selected */}
      {isBotMode && !isAuthMode && (
        <RecipientResponse
          currentEvent={currentEvent}
          activeBoard={activeBoard}
          gameStarted={gameStarted}
          sunkShips={sunkShips}
        />
      )}
    </div>
  );
};

export default memo(ChatBox);
