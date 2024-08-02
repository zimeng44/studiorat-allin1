import { SignupForm } from "@/components/forms/SignupForm";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

export default async function SignUpRoute() {
  const { ok: ok, data: currentUser } = await getUserMeLoader();

  if (!ok)
    return <p>Only Admin and Monitor Allowed to sign up for new user.</p>;

  if (currentUser.role.name !== "Admin" && currentUser.role.name !== "Monitor")
    return <p>Only Admin and Monitor Allowed to sign up for new user.</p>;

  return <SignupForm userRole={`${currentUser.role.name}`} />;
}
