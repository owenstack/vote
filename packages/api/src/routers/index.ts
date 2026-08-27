import type { RouterClient } from "@orpc/server";
import { protectedProcedure } from "../index";
import { userRouter } from "./user";

export const appRouter = {
	user: userRouter,
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
