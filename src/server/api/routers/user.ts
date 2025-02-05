import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    create: publicProcedure.input(z.object({
        username: z.string(),
        email: z.string(),
        passwordHash: z.string(),
    })).mutation(async ({ ctx, input }) => {
        return ctx.db.user.create({ data: input });
    }),
    get: publicProcedure.input(z.object({
        id: z.string(),
    })).query(async ({ ctx, input }) => {
        return ctx.db.user.findUnique({ where: { id: parseInt(input.id) } });
    }),
});
