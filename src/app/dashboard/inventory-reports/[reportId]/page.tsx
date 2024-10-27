// import EditItemForm from "@/components/forms/EditItemForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getInventoryReportById } from "@/data/loaders";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import EditInventoryReportForm from "./EditInventoryReportForm";

type ParamsProps = Promise<{
  reportId: string;
}>;

export default async function SingleInventoryReportDetails({
  params,
}: {
  params: ParamsProps;
}) {
  // console.log(params);
  // const { value: authToken } = cookies().get("jwt");
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const { data, error } = await getInventoryReportById((await params).reportId);

  if (!data) {
    return <p>No data</p>;
  }

  const jwtCookie = (await cookies()).get("jwt");

  if (!jwtCookie) console.error("JWT cookie not found");

  // console.log("checkout session by ID \n", data);

  return (
    <div className="p-0 md:p-5">
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
            <BreadcrumbLink href="/dashboard/inventory-reports">
              Inventory Reports
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center">
        <h1 className="px-1 py-4 text-lg font-bold md:px-2">
          Edit Inventory Report
        </h1>
        {data.is_finished ? (
          <Badge variant="secondary">Finished</Badge>
        ) : (
          <Badge variant="default">In Progress</Badge>
        )}
      </div>
      <div className="flex items-center md:px-2">
        <EditInventoryReportForm
          report={data}
          reportId={(await params).reportId}
          thisMonitor={thisUser}
          authToken={jwtCookie?.value ?? ""}
        />
      </div>
    </div>
  );
}
