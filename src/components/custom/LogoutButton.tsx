import { logoutAction } from "@/data/actions/auth-actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        className="flex content-center items-center justify-start"
        type="submit"
      >
        <LogOut className="h-5 w-5 hover:text-primary" />
        <p className="ml-2">Log Out</p>
      </button>
    </form>
  );
}
