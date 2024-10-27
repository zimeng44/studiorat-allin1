import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getRosterPermissionById } from "@/data/loaders";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import EditRosterPermissionForm from "./EditRosterPermissionForm";

type ParamsProps = Promise<{
  permissionId: string;
}>;

export default async function EditRosterRoute({
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
  // console.log(params);
  const { data, error } = await getRosterPermissionById(
    (await params).permissionId,
  );

  // console.log(data);
  if (!data) return <p>Data not found</p>;

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
            <BreadcrumbLink href="/dashboard/roster">Roster</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/roster">
              Roster Permissions
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold md:px-2">Edit Permission</h1>
      <div className="flex items-center md:px-2">
        <EditRosterPermissionForm
          permission={data}
          permissionId={(await params).permissionId}
          userRole={thisUser?.user_role?.name ?? ""}
        />
      </div>
    </div>
  );
}
