import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import EditItemForm from "./EditRosterForm";
import { getRosterById } from "@/data/loaders";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import EditRosterForm from "./EditRosterForm";

interface ParamsProps {
  params: {
    rosterId: string;
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
  const data = await getRosterById(params.rosterId);

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
            <BreadcrumbLink href="/dashboard/master-inventory">
              Roster
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold md:px-2">Edit Roster</h1>
      <div className="flex items-center md:px-2">
        <EditRosterForm roster={data} rosterId={params.rosterId} />
      </div>
    </div>
  );
}
