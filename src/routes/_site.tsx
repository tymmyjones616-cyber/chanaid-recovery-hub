import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
