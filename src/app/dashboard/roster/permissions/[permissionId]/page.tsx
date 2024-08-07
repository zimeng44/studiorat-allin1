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

interface ParamsProps {
  params: {
    permissionId: string;
  };
}

export default async function EditRosterRoute({
  params,
}: Readonly<ParamsProps>) {
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (thisUser.role.name !== "Admin" && thisUser.role.name !== "Monitor") {
    return <p>User Access Forbidden</p>;
  }
  // console.log(params);
  const data = await getRosterPermissionById(params.permissionId);

  // console.log(data);

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
          permissionId={params.permissionId}
          userRole={thisUser?.role?.name ?? ""}
        />
      </div>
    </div>
  );
}
