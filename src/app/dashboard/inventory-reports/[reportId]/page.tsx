// import EditItemForm from "@/components/forms/EditItemForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCheckoutSessionById, getInventoryReportById } from "@/data/loaders";
import EditCheckoutSessionForm from "./EditInventoryReportForm";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import EditInventoryReportForm from "./EditInventoryReportForm";

interface ParamsProps {
  params: {
    reportId: string;
  };
}

export default async function SingleInventoryReportDetails({
  params,
}: Readonly<ParamsProps>) {
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

  const { data, error } = await getInventoryReportById(params.reportId);

  if (!data) {
    return <p>No data</p>;
  }

  const jwtCookie = cookies().get("jwt");

  if (!jwtCookie) console.error("JWT cookie not found");

  // console.log("checkout session by ID \n", data);

  return (
    <div className="p-2 md:p-5">
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
        <h1 className="px-2 py-4 text-lg font-bold">Edit Inventory Report</h1>
        {data.is_finished ? (
          <Badge variant="secondary">Finished</Badge>
        ) : (
          <Badge variant="default">In Progress</Badge>
        )}
      </div>
      <div className="flex items-center px-2">
        <EditInventoryReportForm
          report={data}
          reportId={params.reportId}
          thisMonitor={thisUser}
          authToken={jwtCookie?.value ?? ""}
        />
      </div>
    </div>
  );
}
