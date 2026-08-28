import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@vote/ui/components/logo";
import { Login } from "@/components/login";

export const Route = createFileRoute("/admin/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Logo />
				<Login to="/admin" />
			</div>
		</div>
	);
}
