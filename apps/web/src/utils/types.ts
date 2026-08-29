import type { LucideIcon } from "lucide-react";

export interface Link {
	to: `/${string}`;
	label: string;
	icon: LucideIcon;
}
