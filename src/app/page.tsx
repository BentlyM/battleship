import { HydrateClient } from "~/trpc/server";
import { BoardStack } from "./_components/BoardStack";
import { getSession } from "~/server/auth";

export default async function Home() {
  const session = await getSession();
  return (
    <HydrateClient>
      <main className="flex h-screen w-screen items-center justify-center overflow-hidden dark:bg-[#080808]">
        <BoardStack session={session} />
        {session?.user && (
          <div className="absolute right-2 top-2 rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
            {session.user.email}
          </div>
        )}
      </main>
    </HydrateClient>
  );
}
