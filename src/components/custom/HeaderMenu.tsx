// "use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Barcode,
  BookPlus,
  ClipboardPlusIcon,
  Library,
  MenuIcon,
  User,
  UserCheck,
  UserIcon,
  Users,
  Vault,
} from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
// import { getUserMeLoader } from "@/data/services/get-user-me-loader";

const HeaderMenu = async ({ currentRole }: { currentRole: string }) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="">
          <Link
            // className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            href="/dashboard/account"
          >
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              My Profile
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {currentRole !== "InventoryManager" ? (
              <Link
                // className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/dashboard/booking"
              >
                <DropdownMenuItem>
                  <BookPlus className="mr-2 h-4 w-4" />
                  Booking
                </DropdownMenuItem>
              </Link>
            ) : (
              ``
            )}

            {currentRole === "Admin" || currentRole === "Monitor" ? (
              <Link
                // className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/dashboard/checkout"
              >
                <DropdownMenuItem>
                  <Barcode className="mr-2 h-4 w-4" />
                  Checkout
                </DropdownMenuItem>
              </Link>
            ) : (
              ``
            )}

            {currentRole === "Admin" || currentRole === "Monitor" ? (
              <Link
                // className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/dashboard/users"
              >
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Users{" "}
                </DropdownMenuItem>
              </Link>
            ) : (
              ``
            )}

            {currentRole === "Admin" || currentRole === "Monitor" ? (
              <Link
                // className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/dashboard/roster"
              >
                <DropdownMenuItem>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Roster
                </DropdownMenuItem>
              </Link>
            ) : (
              ``
            )}

            {currentRole === "Admin" || currentRole === "InventoryManager" ? (
              <Link
                // className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/dashboard/master-inventory"
              >
                <DropdownMenuItem>
                  <Library className="mr-2 h-4 w-4" />
                  Master Inventory
                </DropdownMenuItem>
              </Link>
            ) : (
              ``
            )}

            {currentRole === "Admin" ? (
              <Link
                // className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="/dashboard/inventory-reports"
              >
                <DropdownMenuItem>
                  <ClipboardPlusIcon className="mr-2 h-4 w-4" />
                  Inventory Reports
                </DropdownMenuItem>
              </Link>
            ) : (
              ``
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HeaderMenu;
