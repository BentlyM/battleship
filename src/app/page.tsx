import { HydrateClient } from "~/trpc/server";
import { BoardStack } from "./_components/BoardStack";

export default async function Home() {  
  return (
    <HydrateClient>
      <main className="flex items-center justify-center h-screen w-screen bg-[#f7f7f7]">
        <BoardStack />
      </main>
    </HydrateClient>
  );
}