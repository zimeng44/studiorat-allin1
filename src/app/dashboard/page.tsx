import { LogoutButton } from "@/components/custom/LogoutButton";

export default function DashboardRoute() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <h1>Dashboard</h1>
      <LogoutButton />
    </div>
  );
}
