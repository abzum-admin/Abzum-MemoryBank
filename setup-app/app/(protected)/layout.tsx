import { Sidebar } from "@/components/shell/sidebar";

/**
 * Protected app shell — sidebar + scrollable content area.
 * Auth middleware (Step 13) will guard this route group.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-base bg-gradient-brand">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
