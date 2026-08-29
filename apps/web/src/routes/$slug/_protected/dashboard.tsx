import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug/_protected/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/$slug/_protected/dashboard"!</div>;
}
