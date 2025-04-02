import { HydrateClient } from "~/trpc/server";
import { BoardStack } from "./_components/BoardStack";

export default async function Home() {  
  return (
    <HydrateClient>
      <main className="flex items-center justify-center h-screen w-screen dark:bg-[#080808]">
        <BoardStack />
      </main>
    </HydrateClient>
  );
}