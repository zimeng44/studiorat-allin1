import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { ProfileImageForm } from "@/components/forms/ProfileImageForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function AccountRoute() {
  const user = await getUserMeLoader();
  const userData = user.data;
  const userImage = userData?.image ?? null;

  // console.log(userImage);

  if (!userData) return <p>No user found</p>;

  return (
    <>
      <Breadcrumb className="p-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex content-center gap-4 px-5 py-2 md:grid-cols-3">
        <ProfileForm
          data={userData}
          className="flex flex-col md:col-span-3 md:grid-cols-3"
        />
        {/* <ProfileImageForm
          data={userImage}
          className="col-span-1 md:col-span-2"
        /> */}
      </div>
    </>
  );
}
