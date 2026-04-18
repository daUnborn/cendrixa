import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <main
          style={{
            flex: 1,
            padding: "1.5rem",
            backgroundColor: "var(--color-bg-primary)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
