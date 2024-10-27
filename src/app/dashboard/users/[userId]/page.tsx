import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getUserById } from "@/data/loaders";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import EditUserForm from "./EditUserForm";

type ParamsProps = Promise<{
  userId: string;
}>;

export default async function EditUserRoute({
  params,
}: {
  params: ParamsProps;
}) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }
  // console.log(params.userId);
  const data = await getUserById((await params).userId);

  if (!data) return <p>No User Found</p>;

  return (
    <div className="flex-col p-0 md:p-5">
      <Breadcrumb>
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
            <BreadcrumbLink href="/dashboard/users">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold">Edit User</h1>
      <div className="flex items-center md:px-2">
        <EditUserForm
          user={data}
          userId={(await params).userId}
          currentUserRole={thisUser.user_role}
        />
      </div>
    </div>
  );
}
