import { createDb } from "@vote/db";
import * as schema from "@vote/db/schema/auth";
import { env } from "@vote/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";

const statement = {
	election: ["create", "publish", "delete"],
	student: ["enroll"],
	session: ["verify", "generate"],
} as const;

const ac = createAccessControl(statement);
const electionAdmin = ac.newRole({ election: ["create", "publish", "delete"] });
const enrollmentStaff = ac.newRole({ student: ["enroll"] });
const pollOfficer = ac.newRole({ session: ["verify", "generate"] });

export default function createAuth() {
	const db = createDb();
	const isDev = env.NODE_ENV === "development";
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema,
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
		plugins: [
			organization({
				ac,
				roles: { electionAdmin, enrollmentStaff, pollOfficer },
			}),
			admin(),
		],
	});
}
