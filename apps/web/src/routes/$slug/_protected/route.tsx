import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Separator } from "@vote/ui/components/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@vote/ui/components/sidebar";
import { LayoutDashboard, ScanFace, Vote } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { getSession, organization } from "@/lib/auth";
import { client } from "@/lib/orpc";
import type { Link } from "@/utils/types";

export const Route = createFileRoute("/$slug/_protected")({
	beforeLoad: async (context) => {
		const [session, orgs] = await Promise.all([
			getSession(),
			client.user.misc.getOrgs(),
		]);
		if (!session.data) {
			throw redirect({
				to: "/$slug/login",
				params: {
					slug: context.params.slug,
				},
			});
		}

		const sessionData = session.data?.session;
		if (!sessionData?.activeOrganizationId) {
			throw redirect({
				to: "/$slug/login",
				params: {
					slug: context.params.slug,
				},
			});
		}
		const org = orgs?.find(
			(org) =>
				org.slug === context.params.slug &&
				org.id === sessionData.activeOrganizationId,
		);
		if (!org) {
			throw redirect({
				to: "/$slug/login",
				params: {
					slug: context.params.slug,
				},
			});
		}

		const { data: activeMember, error: activeMemberError } =
			await organization.getActiveMember();
		if (
			activeMemberError ||
			!activeMember ||
			activeMember.organizationId !== sessionData.activeOrganizationId
		) {
			throw redirect({
				to: "/$slug/login",
				params: {
					slug: context.params.slug,
				},
			});
		}

		const userRole: string =
			session.data.user.role === "admin" ? "admin" : activeMember.role;
		const path = context.location.pathname;
		const isDashboard =
			path === `/${context.params.slug}` ||
			path === `/${context.params.slug}/dashboard`;
		const isEnrollment = path === `/${context.params.slug}/enroll`;
		const isVoting = path === `/${context.params.slug}/elections`;
		const canAccess =
			userRole === "admin" ||
			(userRole === "electionAdmin" && (isDashboard || isVoting)) ||
			(userRole === "enrollmentStaff" && (isDashboard || isEnrollment)) ||
			(userRole === "pollOfficer" && isVoting);

		if (!canAccess) {
			const fallback =
				userRole === "pollOfficer"
					? "/$slug/elections"
					: userRole === "enrollmentStaff" ||
							userRole === "electionAdmin" ||
							userRole === "admin"
						? "/$slug/dashboard"
						: "/$slug/login";
			throw redirect({
				to: fallback as string,
				params: {
					slug: context.params.slug,
				},
			});
		}

		return { session, userRole };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { userRole } = Route.useRouteContext();
	const dashboardLink: Link = {
		to: `/${slug}/dashboard`,
		label: "Dashboard",
		icon: LayoutDashboard,
	};
	const links: Link[] =
		userRole === "pollOfficer"
			? [{ to: `/${slug}/elections`, label: "Elections", icon: Vote }]
			: userRole === "enrollmentStaff"
				? [
						dashboardLink,
						{ to: `/${slug}/enroll`, label: "Enroll", icon: ScanFace },
					]
				: userRole === "electionAdmin"
					? [
							dashboardLink,
							{ to: `/${slug}/elections`, label: "Elections", icon: Vote },
						]
					: [
							dashboardLink,
							{ to: `/${slug}/enroll`, label: "Enroll", icon: ScanFace },
							{ to: `/${slug}/elections`, label: "Elections", icon: Vote },
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
