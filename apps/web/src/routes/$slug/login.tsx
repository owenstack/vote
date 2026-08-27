import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/$slug/login"!</div>;
}
