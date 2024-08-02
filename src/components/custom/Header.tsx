import Link from "next/link";

import { getUserMeLoader } from "@/data/services/get-user-me-loader";

import { Logo } from "@/components/custom/Logo";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./LogoutButton";
import { SummaryForm } from "@/components/forms/SummaryForm";
import { CalendarPlus2, User } from "lucide-react";

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
}

export function LoggedInUser({
  userData,
}: {
  readonly userData: AuthUserProps;
}) {
  return (
    <div className="flex gap-4 items-center">
      <Link
        href="/dashboard/account"
        className=" flex gap-2 font-semibold hover:text-primary"
      >
        <User className="h-6 w-6" />
        {/* {userData.username} */}
        {`${userData.firstName} ${userData.lastName}`}
      </Link>
      <Link href="/dashboard/booking">
        <CalendarPlus2 />
        {/* Booking */}
      </Link>
      <LogoutButton />
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
