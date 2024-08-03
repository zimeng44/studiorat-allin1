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
  if (thisUser.role.name !== "Admin" && thisUser.role.name !== "Monitor") {
    return <p>User Access Forbidden</p>;
  }

  const jwtCookie = cookies().get("jwt");

  if (!jwtCookie) console.error("JWT cookie not found");
  // console.log(thisMonitor);
  const pageIndex = "1";
  const pageSize = "10";
  const sort = "createdAt:desc";
  const filter = {};

  const { data, meta } = await getInventoryReports(
    sort,
    pageIndex.toString(),
    pageSize.toString(),
    filter,
  );

  if (!data[0].isFinished && thisUser.role.name === "Monitor") {
    redirect(`/dashboard/inventory-reports/${data[0].id}?draft=yes`);
  }

  const { meta: inventoryMeta } = await getInventoryItems(
    "",
    pageIndex.toString(),
    pageSize.toString(),
    {
      mTechBarcode: "",
      make: "",
      model: "",
      category: "",
      description: "",
      accessories: "",
      storageLocation: "",
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
          inventorySize={inventoryMeta.pagination.total}
        />
      </div>
    </div>
  );
};

export default NewInventoryReportPage;
