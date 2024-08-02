import { logoutAction } from "@/data/actions/auth-actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form className="flex items-center" action={logoutAction}>
      <button type="submit">
        <LogOut className="h-6 w-6 hover:text-primary" />
      </button>
    </form>
  );
}
