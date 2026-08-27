import { buttonVariants } from "@vote/ui/components/button";
import { cn } from "@vote/ui/lib/utils";
import { Vote } from "lucide-react";

export function Logo({ className }: { className?: string }) {
	return (
		<a
			href="/"
			className={cn(
				buttonVariants({ variant: "ghost" }),
				"font-medium",
				className,
			)}
		>
			<Vote className="size-6" />
			Elections
		</a>
	);
}
