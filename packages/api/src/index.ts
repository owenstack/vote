import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});

export type OrganizationRole = "admin" | "orgAdmin" | "orgMember" | "voter";

const organizationRoles = new Set<OrganizationRole>([
	"admin",
	"orgAdmin",
	"orgMember",
	"voter",
]);

const requireOrg = o.middleware(async ({ context, next }) => {
	const session = context.session;
	const organizationId = session?.session.activeOrganizationId;
	let activeMember;

	try {
		activeMember = await context.auth.api.getActiveMember({
			headers: context.headers,
		});
	} catch (error) {
		if (error instanceof ORPCError) throw error;
		throw new ORPCError("FORBIDDEN");
	}

	const role = activeMember?.role;
	if (
		!organizationId ||
		!activeMember ||
		activeMember.organizationId !== organizationId ||
		!role ||
		!organizationRoles.has(role as OrganizationRole)
	) {
		throw new ORPCError("FORBIDDEN");
	}

	return next({
		context: {
			session,
			organizationId,
			role: role as OrganizationRole,
		},
	});
});

export const publicProcedure = o;
export const protectedProcedure = publicProcedure.use(requireAuth);
export const orgProcedure = protectedProcedure.use(requireOrg);
