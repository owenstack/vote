import createAuth from "@vote/auth";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const auth = createAuth();
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});
	return {
		auth,
		headers: context.req.raw.headers,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
