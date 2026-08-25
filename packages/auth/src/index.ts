import { createDb } from "@vote/db";
import * as schema from "@vote/db/schema/auth";
import { env } from "@vote/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export function createAuth() {
	const db = createDb();
	const isDev = env.NODE_ENV === "development";
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema: schema,
		}),
		trustedOrigins: [
			"https://*.vote.efobi.dev",
			"https://vote.efobi.dev",
			...(isDev
				? [
						"http://localhost:3001",
						"http://localhost:3002",
						"https://localhost:3003",
					]
				: []),
		],
		emailAndPassword: {
			enabled: true,
		},
		session: !isDev
			? {
					cookieCache: {
						enabled: true,
						maxAge: 60,
					},
				}
			: undefined,
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			defaultCookieAttributes: {
				sameSite: isDev ? "lax" : "none",
				secure: !isDev,
				httpOnly: true,
			},
			crossSubDomainCookies: {
				enabled: !isDev,
				domain: "vote.efobi.dev",
			},
		},
	});
}
