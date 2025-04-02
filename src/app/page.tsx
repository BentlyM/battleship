import { HydrateClient } from "~/trpc/server";
import { BoardStack } from "./_components/BoardStack";

export default async function Home() {  
  return (
    <HydrateClient>
      <main className="flex h-screen w-screen items-center justify-center dark:bg-[#080808]">
        <BoardStack />
      </main>
    </HydrateClient>
  );
}