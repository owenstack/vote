import { useQuery } from "@tanstack/react-query";
import {
	Item,
	ItemContent,
	ItemMedia,
	ItemTitle,
} from "@vote/ui/components/item";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@vote/ui/components/sidebar";
import { Vote } from "lucide-react";
import { organization, useSession } from "@/lib/auth";
import type { Link } from "@/utils/types";

export function AppSidebar({ links }: { links: Link[] }) {
	const { data } = useSession();
	const { data: activeOrgData } = useQuery({
		queryFn: () =>
			organization.getOrganization({
				query: { organizationId: data?.session.activeOrganizationId ?? "" },
			}),
		enabled: !!data?.session.activeOrganizationId,
		queryKey: ["org:active", data?.session.activeOrganizationId],
	});

	const activeOrg = activeOrgData?.data;
	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						{activeOrg ? (
							<Item>
								<ItemMedia variant="image">
									<img
										className="aspect-square size-6"
										src={activeOrg?.logo ?? "/logo.png"}
										alt={activeOrg?.name}
									/>
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{activeOrg?.name}</ItemTitle>
								</ItemContent>
							</Item>
						) : (
							<Item>
								<ItemMedia variant="icon">
									<Vote />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>Elections</ItemTitle>
								</ItemContent>
							</Item>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu>
					{links.map((link) => (
						<SidebarMenuItem key={link.to}>
							<SidebarMenuButton
								render={
									<a href={link.to}>
										<link.icon className="size-4" />
										<span>{link.label}</span>
									</a>
								}
							/>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
