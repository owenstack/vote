import { sql } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { organization } from "./auth";

export const student = sqliteTable(
	"student",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id),
		matricNumber: text("matric_number").notNull(),
		name: text("name").notNull(),
		faculty: text("faculty"),
		department: text("department"),
		enrolledAt: integer("enrolled_at", { mode: "timestamp" }), // set once biometric capture completes
	},
	(t) => [uniqueIndex("uniq_org_matric").on(t.organizationId, t.matricNumber)],
);

export const studentBiometric = sqliteTable("student_biometric", {
	id: text("id").primaryKey(),
	studentId: text("student_id")
		.notNull()
		.unique()
		.references(() => student.id),
	embedding: text("embedding", { mode: "json" }).notNull().$type<number[]>(),
	capturedByMemberId: text("captured_by_member_id").notNull(), // enrollment_staff
	capturedAt: integer("captured_at", { mode: "timestamp" }).notNull(),
});

export const election = sqliteTable(
	"election",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id),
		title: text("title").notNull(),
		status: text("status", { enum: ["draft", "published", "ended"] })
			.notNull()
			.default("draft"),
		startAt: integer("start_at", { mode: "timestamp" }),
		endAt: integer("end_at", { mode: "timestamp" }),
	},
	(t) => [
		uniqueIndex("uniq_active_election")
			.on(t.organizationId)
			.where(sql`${t.status} = 'published'`),
	],
);

export const position = sqliteTable("position", {
	id: text("id").primaryKey(),
	electionId: text("election_id")
		.notNull()
		.references(() => election.id),
	title: text("title").notNull(),
	sortOrder: integer("sort_order").notNull().default(0),
});

export const candidate = sqliteTable("candidate", {
	id: text("id").primaryKey(),
	positionId: text("position_id")
		.notNull()
		.references(() => position.id),
	studentId: text("student_id").references(() => student.id), // nullable: candidate may not be in the student roll
	name: text("name").notNull(),
	photoUrl: text("photo_url"),
});

export const votingSession = sqliteTable("voting_session", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id),
	studentId: text("student_id")
		.notNull()
		.references(() => student.id),
	electionId: text("election_id")
		.notNull()
		.references(() => election.id),
	code: text("code").notNull(),
	status: text("status", {
		enum: ["generated", "verified", "used", "expired"],
	}).notNull(),
	generatedAt: integer("generated_at", { mode: "timestamp" }).notNull(),
	verifiedAt: integer("verified_at", { mode: "timestamp" }),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	verifiedByMemberId: text("verified_by_member_id"), // poll_officer
});

export const vote = sqliteTable(
	"vote",
	{
		id: text("id").primaryKey(),
		votingSessionId: text("voting_session_id")
			.notNull()
			.references(() => votingSession.id),
		studentId: text("student_id")
			.notNull()
			.references(() => student.id), // kept — you chose auditability over anonymity
		positionId: text("position_id")
			.notNull()
			.references(() => position.id),
		candidateId: text("candidate_id")
			.notNull()
			.references(() => candidate.id),
		castAt: integer("cast_at", { mode: "timestamp" }).notNull(),
	},
	(t) => [uniqueIndex("uniq_student_position").on(t.studentId, t.positionId)],
);

export const auditLog = sqliteTable("audit_log", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id),
	actorMemberId: text("actor_member_id"), // null for system/cron actions
	action: text("action").notNull(), // "student.enrolled", "session.generated", "vote.cast", ...
	targetType: text("target_type").notNull(),
	targetId: text("target_id").notNull(),
	metadata: text("metadata", { mode: "json" }),
	at: integer("at", { mode: "timestamp" }).notNull(),
});
