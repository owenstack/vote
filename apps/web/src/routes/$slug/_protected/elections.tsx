import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$slug/_protected/elections')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$slug/_protected/elections"!</div>
}
