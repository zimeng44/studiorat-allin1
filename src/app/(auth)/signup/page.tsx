import { SignupForm } from "@/components/forms/SignupForm";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

type SearchParamsProps = Promise<{
  stuId?: string;
}>;

export default async function SignUpRoute({
  searchParams,
}: {
  searchParams: SearchParamsProps;
}) {
  const { ok, data: currentUser } = await getUserMeLoader();
  const stuId = (await searchParams)?.stuId ?? "";

  if (!ok)
    return <p>Only Admin and Monitor Allowed to sign up for new user.</p>;

  if (
    currentUser?.user_role.name !== "Admin" &&
    currentUser?.user_role.name !== "Monitor"
  )
    return <p>Only Admin and Monitor Allowed to sign up for new user.</p>;

  return (
    <SignupForm userRole={`${currentUser?.user_role.name}`} stuId={stuId} />
  );
}
