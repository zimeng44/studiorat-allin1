import Link from "next/link";
import {
  Barcode,
  BookPlus,
  ClipboardPlusIcon,
  Library,
  PlusCircle,
  UserCheck,
  UserIcon,
  Users,
} from "lucide-react";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

export default async function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  // const currentRole = "Admin";
  // console.log("here");

  const { data: thisUser } = await getUserMeLoader();
  const currentRole = thisUser?.user_role?.name;
  // console.log(thisUser);
  // if (
  //   thisUser?.user_role.name !== "Admin" &&
  //   thisUser?.user_role.name !== "Monitor"
  // ) {
  //   return <p>User Access Forbidden</p>;
  // }
  return (
    <div className="grid h-full md:grid-cols-[240px_1fr]">
      <nav className="hidden border-r bg-gray-100/40 dark:bg-gray-800/40 md:block">
        <div className="gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link
              className="flex items-center gap-2 font-semibold"
              href="/dashboard"
            >
              <LayoutDashboardIcon className="h-6 w-6" />
              <span className="">Dashboard</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/dashboard/account"
              >
                <UserIcon className="h-4 w-4" />
                My Profile
              </Link>

              {currentRole !== "InventoryManager" ? (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/dashboard/booking"
                >
                  <BookPlus className="h-4 w-4" />
                  Booking
                </Link>
              ) : (
                ``
              )}

              {currentRole === "Admin" || currentRole === "Monitor" ? (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/dashboard/checkout"
                >
                  <Barcode className="h-4 w-4" />
                  Checkout
                </Link>
              ) : (
                ``
              )}

              {currentRole === "Admin" || currentRole === "Monitor" ? (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/dashboard/users"
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>
              ) : (
                ``
              )}

              {currentRole === "Admin" || currentRole === "Monitor" ? (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/dashboard/roster"
                >
                  <UserCheck className="h-4 w-4" />
                  Roster
                </Link>
              ) : (
                ``
              )}

              {currentRole === "Admin" || currentRole === "InventoryManager" ? (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/dashboard/master-inventory"
                >
                  <Library className="h-4 w-4" />
                  Master Inventory
                </Link>
              ) : (
                ``
              )}

              {currentRole === "Admin" ? (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/dashboard/inventory-reports"
                >
                  <ClipboardPlusIcon className="h-4 w-4" />
                  Inventory Reports
                </Link>
              ) : (
                ``
              )}
              {currentRole === "Monitor" ? (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  href="/dashboard/inventory-reports/new"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Inventory Reports
                </Link>
              ) : (
                ``
              )}
            </nav>
          </div>
        </div>
      </nav>
      <main className="h-full overflow-scroll">{children}</main>
    </div>
  );
}

function LayoutDashboardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function PieChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ViewIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z" />
      <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
      <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" />
      <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
    </svg>
  );
}
