import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug/_protected")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_protected"!</div>;
}
