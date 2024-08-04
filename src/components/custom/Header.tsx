import Link from "next/link";

import { getUserMeLoader } from "@/data/services/get-user-me-loader";

import { Logo } from "@/components/custom/Logo";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./LogoutButton";
import { SummaryForm } from "@/components/forms/SummaryForm";
import { CalendarPlus2, PlusCircle, User } from "lucide-react";
import HeaderMenu from "./HeaderMenu";
import { UserRole } from "@/data/definitions";

interface HeaderProps {
  data: {
    logoText: {
      id: number;
      text: string;
      url: string;
    };
    ctaButton: {
      id: number;
      text: string;
      url: string;
    };
  };
}

interface AuthUserProps {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export function LoggedInUser({
  userData,
}: {
  readonly userData: AuthUserProps;
}) {
  // console.log(userData);
  return (
    <div className="flex items-center gap-4">
      {(userData.role?.name ?? "") === "Monitor" ? (
        <Link href="/dashboard/inventory-reports/new">
          <Button
            variant="outline"
            className="h10 ml-2 flex whitespace-normal text-xs md:ml-5 md:text-sm"
          >
            <PlusCircle className="hide h-3 w-3 md:mr-2 md:h-4 md:w-4" />
            Inventory Reports
          </Button>
        </Link>
      ) : (
        ``
      )}
      <Link
        href="/dashboard/account"
        className="flex hover:text-primary md:gap-2 md:font-semibold"
      >
        <User className="h-6 w-6" />
        {/* {userData.username} */}
        {`${userData.firstName} ${userData.lastName}`}
      </Link>

      <HeaderMenu currentRole={userData.role?.name ?? ""} />
      {/* <LogoutButton /> */}
    </div>
  );
}

export async function Header({ data }: Readonly<HeaderProps>) {
  const user = await getUserMeLoader();
  // console.log(user);
  const { logoText, ctaButton } = data;
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 shadow-md dark:bg-gray-800">
      <Logo text={logoText.text} />
      {/* {user.ok && <SummaryForm />} */}
      <div className="flex items-center gap-4">
        {user.ok ? (
          <LoggedInUser userData={user.data} />
        ) : (
          <Link href={ctaButton.url}>
            <Button>{ctaButton.text}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
