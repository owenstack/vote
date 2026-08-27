import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Header from "@/components/header";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: async () => {
		const session = await getSession();
		if (!session.data) {
			const slug = localStorage.getItem("org:slug");
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
		return { session };
	},
});

function AuthLayout() {
	return (
		<div className="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			<Outlet />
		</div>
	);
}
