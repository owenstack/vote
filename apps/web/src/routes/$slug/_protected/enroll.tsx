import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$slug/_protected/enroll')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$slug/_protected/enroll"!</div>
}
