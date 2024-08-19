// import React from "react";
import { cookies } from "next/headers";
import NewCheckoutForm from "./NewInventoryReportForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import NewInventoryReportForm from "./NewInventoryReportForm";
import { getInventoryItems, getInventoryReports } from "@/data/loaders";
import { redirect } from "next/navigation";

const NewInventoryReportPage = async () => {
  // const { value: authToken } = cookies().get("jwt");
  const { data: thisUser } = await getUserMeLoader();
  // console.log(thisUser);
  if (
    thisUser?.user_role.name !== "Admin" &&
    thisUser?.user_role.name !== "Monitor"
  ) {
    return <p>User Access Forbidden</p>;
  }

  const jwtCookie = cookies().get("jwt");

  if (!jwtCookie) console.error("JWT cookie not found");
  // console.log(thisMonitor);
  const pageIndex = "1";
  const pageSize = "10";
  const sort = "created_at:desc";
  const filter = {};

  const { data, count } = await getInventoryReports(
    sort,
    pageIndex.toString(),
    pageSize.toString(),
    filter,
  );

  if (
    !(data[0]?.is_finished) &&
    thisUser?.user_role.name === "Monitor"
  ) {
    redirect(`/dashboard/inventory-reports/${data[0].id}?draft=yes`);
  }

  const { count: totalEntries } = await getInventoryItems(
    "created_at:desc",
    pageIndex.toString(),
    pageSize.toString(),
    {
      m_tech_barcode: "MT",
      make: "",
      model: "",
      category: "",
      description: "",
      accessories: "",
      storage_location: "Floor 8",
      comments: "",
      out: false,
      broken: false,
    },
  );

  return (
    <div className="p-5">
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
            <BreadcrumbPage>Add</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="px-2 py-4 text-lg font-bold">New Inventory Report</h1>
      <div className="flex items-center px-4">
        <NewInventoryReportForm
          thisMonitor={thisUser}
          authToken={jwtCookie?.value ?? ""}
          inventory_size={totalEntries}
        />
      </div>
    </div>
  );
};

export default NewInventoryReportPage;
