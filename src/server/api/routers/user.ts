import { z } from "zod";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await auth.api.signInEmail({
          body: {
            email: input.email,
            password: input.password,
          },
        });
        revalidatePath("/");
        return {
          success: true,
          message: "User logged in successfully",
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            success: false,
            message: error.message,
          };
        }
        return {
          success: false,
          message: "Something went wrong",
        };
      }
    }),
  signup: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await auth.api.signUpEmail({
          body: {
            name: input.name,
            email: input.email,
            password: input.password,
          },
        });
        revalidatePath("/");
        return {
          success: true,
          message: "User created successfully",
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            success: false,
            message: error.message,
          };
        }
        return {
          success: false,
          message: "Something went wrong",
        };
      }
    }),
});
