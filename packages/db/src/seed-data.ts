import { sql } from "drizzle-orm";
import { db } from "./index";
import { account, member, organization, user } from "./schema/auth";
import { candidate, election, position, student } from "./schema/vote";

const passwordHash =
	"e08665871b33c375af7cff2a9cc47858:205e816ac8f982e81bcd811888326420f6f41c2e371cd2aedb6576a39570ea537b03e39a24cdf2ee5a326e13fa90ab3c162918aed24f96810ba4951fde35e537";
export async function seedDevelopmentData() {
	const now = new Date();

	await db
		.insert(organization)
		.values({
			id: "org_predev",
			name: "Predev University",
			slug: "predev-university",
			createdAt: now,
		})
		.onConflictDoNothing();

	await db
		.insert(user)
		.values([
			{
				id: "user_predev_admin",
				name: "Predev Admin",
				email: "admin@predev.test",
				emailVerified: true,
				role: "admin",
			},
			{
				id: "user_predev_staff",
				name: "Enrollment Staff",
				email: "staff@predev.test",
				emailVerified: true,
				role: "user",
			},
			{
				id: "user_predev_officer",
				name: "Poll Officer",
				email: "officer@predev.test",
				emailVerified: true,
				role: "user",
			},
		])
		.onConflictDoNothing();

	await db
		.insert(account)
		.values(
			["admin", "staff", "officer"].map((role) => ({
				id: `account_predev_${role}`,
				issuer: "local:credential",
				accountId: `user_predev_${role}`,
				providerId: "credential",
				userId: `user_predev_${role}`,
				password: passwordHash,
				createdAt: now,
				updatedAt: now,
			})),
		)
		.onConflictDoUpdate({
			target: account.id,
			set: {
				issuer: "local:credential",
				providerId: "credential",
				password: passwordHash,
				updatedAt: now,
			},
		});

	await db
		.insert(member)
		.values(
			[
				["admin", "electionAdmin"],
				["staff", "enrollmentStaff"],
				["officer", "pollOfficer"],
			].map(([role, memberRole]) => ({
				id: `member_predev_${role}`,
				organizationId: "org_predev",
				userId: `user_predev_${role}`,
				role: memberRole,
				createdAt: now,
			})),
		)
		.onConflictDoUpdate({
			target: member.id,
			set: {
				role: sql`excluded.role`,
			},
		});

	await db
		.insert(student)
		.values([
			{
				id: "student_predev_ada",
				organizationId: "org_predev",
				matricNumber: "PRE/001",
				name: "Ada Okafor",
				faculty: "Engineering",
				department: "Computer Engineering",
				enrolledAt: now,
			},
			{
				id: "student_predev_bola",
				organizationId: "org_predev",
				matricNumber: "PRE/002",
				name: "Bola Adeyemi",
				faculty: "Sciences",
				department: "Computer Science",
				enrolledAt: now,
			},
			{
				id: "student_predev_chidi",
				organizationId: "org_predev",
				matricNumber: "PRE/003",
				name: "Chidi Nwosu",
				faculty: "Arts",
				department: "Political Science",
				enrolledAt: now,
			},
		])
		.onConflictDoNothing();

	await db
		.insert(election)
		.values({
			id: "election_predev",
			organizationId: "org_predev",
			title: "2026 Student Union Election",
			status: "draft",
		})
		.onConflictDoNothing();

	await db
		.insert(position)
		.values([
			{
				id: "position_predev_president",
				electionId: "election_predev",
				title: "President",
				sortOrder: 1,
			},
			{
				id: "position_predev_secretary",
				electionId: "election_predev",
				title: "General Secretary",
				sortOrder: 2,
			},
		])
		.onConflictDoNothing();

	await db
		.insert(candidate)
		.values([
			{
				id: "candidate_predev_ada",
				positionId: "position_predev_president",
				studentId: "student_predev_ada",
				name: "Ada Okafor",
			},
			{
				id: "candidate_predev_bola",
				positionId: "position_predev_president",
				studentId: "student_predev_bola",
				name: "Bola Adeyemi",
			},
			{
				id: "candidate_predev_chidi",
				positionId: "position_predev_secretary",
				studentId: "student_predev_chidi",
				name: "Chidi Nwosu",
			},
		])
		.onConflictDoNothing();
}
