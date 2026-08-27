import { getOrganizations } from "@vote/db/queries/user";
import z from "zod";
import { publicProcedure } from "../../index";

export const miscellaneousRouter = {
	getOrgs: publicProcedure
		.output(
			z.array(
				z.object({
					slug: z.string(),
					name: z.string(),
					id: z.string(),
					logo: z.string().nullable(),
				}),
			),
		)
		.handler(async () => {
			return await getOrganizations();
		}),
};
