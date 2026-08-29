import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Separator } from "@vote/ui/components/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@vote/ui/components/sidebar";
import { BrickWallShield, LayoutDashboard } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { getSession } from "@/lib/auth";
import type { Link } from "@/utils/types";

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
	const links: Link[] = [
		{
			to: "/admin",
			label: "Dashboard",
			icon: LayoutDashboard,
		},
		{
			to: "/admin/audit",
			label: "Audit",
			icon: BrickWallShield,
		},
	];

	return (
		<SidebarProvider>
			<AppSidebar links={links} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
				</header>
				<main className="flex-1">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
