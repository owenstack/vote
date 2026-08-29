import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const session = await getSession();
		const slug = localStorage.getItem("org:slug");
		if (!session.data) {
			if (slug) {
				throw redirect({
					to: "/$slug/login",
					params: {
						slug,
					},
				});
			}
			throw redirect({
				to: "/login",
			});
		}
		throw redirect({
			to: slug ? "/$slug" : "/login",
			params: {
				slug,
			},
		});
	},
});
