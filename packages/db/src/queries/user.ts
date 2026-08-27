import { db } from "..";

export async function getOrganizations() {
	return await db.query.organization.findMany({
		columns: {
			slug: true,
			name: true,
			id: true,
			logo: true,
		},
	});
}
