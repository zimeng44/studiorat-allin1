import Link from "next/link";

import { getUserMeLoader } from "@/data/services/get-user-me-loader";

import { Logo } from "@/components/custom/Logo";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./LogoutButton";
import { SummaryForm } from "@/components/forms/SummaryForm";
import { CalendarPlus2, PlusCircle, User } from "lucide-react";
import HeaderMenu from "./HeaderMenu";
import { UserRole } from "@/data/definitions";
// import { notFound } from "next/navigation";

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
  net_id?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  user_role?: UserRole | null;
}

export function LoggedInUser({
  userData,
}: {
  readonly userData: AuthUserProps | null;
}) {
  // console.log(userData);
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/dashboard/account"
        className="flex hover:text-primary md:gap-2 md:font-semibold"
      >
        <User className="h-6 w-6" />
        {/* {userData.username} */}
        {`${userData?.first_name} ${userData?.last_name}`}
      </Link>

      <HeaderMenu currentRole={userData?.user_role?.name ?? ""} />
      {/* <LogoutButton /> */}
    </div>
  );
}

export async function Header({ data }: Readonly<HeaderProps>) {
  const user = await getUserMeLoader();
  // console.log(user);
  const { logoText, ctaButton } = data;

  if (!logoText)
    return (
      <p>
        There was an error fetching homepage header. please try clearing cookies
        in your browser or contact admin
      </p>
    );

  return (
    <div className="flex-non z-40 flex h-16 items-center justify-between bg-white px-4 py-3 shadow-md dark:bg-gray-800">
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
