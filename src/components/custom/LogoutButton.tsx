import { logoutAction } from "@/data/actions/auth-actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="mt-1 items-center" type="submit">
        <LogOut className="h-5 w-5 items-center hover:text-primary" />
      </button>
    </form>
  );
}
