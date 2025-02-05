'use client';
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const user = await api.user.create({
        username: "test",
        email: "test@test.com",
        passwordHash: "test",
      });
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <HydrateClient>
      <main>
        <h1>Hello World</h1>
        <p>{user?.username}</p>
      </main>
    </HydrateClient>
  );
}
