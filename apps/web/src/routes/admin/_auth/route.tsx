import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin/_auth")({
	beforeLoad: async () => {
		const session = await getSession();
		if (session.data?.user.role !== "admin") {
			throw redirect({ to: "/admin/login" });
		}
		return { session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Outlet />
		</div>
	);
}
