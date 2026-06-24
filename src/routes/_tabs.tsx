import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TabBar } from "@/components/TabBar";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar pb-28">
        <Outlet />
      </div>
      <TabBar />
    </PhoneFrame>
  );
}